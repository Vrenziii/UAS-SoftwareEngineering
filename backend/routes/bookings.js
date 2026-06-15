const express = require("express");
const db = require("../config/db");
const verifyRole = require("../middleware/roleCheck");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure Multer Storage (Where and how to save the files)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure you create an empty 'uploads' folder in your backend root!
    },
    filename: function (req, file, cb) {
        // Create a unique filename: bookingId-type-timestamp.jpg
        cb(null, `${req.params.id}-${req.body.type}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// 1. CREATE BOOKING (Only Customers)
router.post("/", verifyRole(["customer"]), async (req, res) => {
	const { vehicle_details, schedule_datetime } = req.body;
	const customer_id = req.user.id; // Extracted from JWT token

	try {
		await db.query(
			"INSERT INTO bookings (customer_id, vehicle_details, schedule_datetime) VALUES (?, ?, ?)",
			[customer_id, vehicle_details, schedule_datetime],
		);
		res.status(201).json({ message: "Booking created successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// 2. VIEW BOOKINGS (Dynamic based on Role)
router.get(
	"/",
	verifyRole(["admin", "worker", "customer"]),
	async (req, res) => {
		try {
			let query = "";
			let params = [];

			if (req.user.role === "admin") {
				// Admin sees EVERYTHING
				query = "SELECT * FROM bookings ORDER BY schedule_datetime DESC";
			} else if (req.user.role === "worker") {
				// Worker sees only their assigned tasks
				query =
					"SELECT * FROM bookings WHERE worker_id = ? ORDER BY schedule_datetime DESC";
				params = [req.user.id];
			} else {
				// Customer sees only their own history
				query =
					"SELECT * FROM bookings WHERE customer_id = ? ORDER BY schedule_datetime DESC";
				params = [req.user.id];
			}

			const [bookings] = await db.query(query, params);
			res.json(bookings);
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
);

// 3. ADMIN ASSIGNS WORKER (The "1 Worker = 1 Car" Logic)
router.put("/assign/:id", verifyRole(["admin"]), async (req, res) => {
	const bookingId = req.params.id;
	const { worker_id } = req.body;

	try {
		// RULE CHECK: Does this worker already have a car "On Work"?
		const [activeTasks] = await db.query(
			'SELECT id FROM bookings WHERE worker_id = ? AND status = "On Work"',
			[worker_id],
		);

		if (activeTasks.length > 0) {
			return res.status(400).json({
				message:
					"Assignment failed. This worker is currently washing another car.",
			});
		}

		// If worker is free, assign them and update status
		await db.query(
			'UPDATE bookings SET worker_id = ?, status = "On Work" WHERE id = ?',
			[worker_id, bookingId],
		);
		res.json({
			message: "Worker assigned successfully and status updated to On Work",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// 4. UPDATE STATUS (Worker or Admin)
router.put("/status/:id", verifyRole(["admin", "worker"]), async (req, res) => {
	const bookingId = req.params.id;
	const { status } = req.body; // e.g., 'Finished'

	try {
		// A worker should only be able to update their own assigned car
		if (req.user.role === "worker") {
			const [booking] = await db.query(
				"SELECT worker_id FROM bookings WHERE id = ?",
				[bookingId],
			);
			if (booking.length === 0 || booking[0].worker_id !== req.user.id) {
				return res
					.status(403)
					.json({ message: "You can only update your assigned tasks." });
			}
		}

		await db.query("UPDATE bookings SET status = ? WHERE id = ?", [
			status,
			bookingId,
		]);
		res.json({ message: `Status updated to ${status}` });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// GET: Booking Statistics for Admin Chart
router.get('/stats', verifyRole(['admin']), async (req, res) => {
    try {
        const [stats] = await db.query('SELECT status as name, COUNT(*) as value FROM bookings GROUP BY status');
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics.' });
    }
});

// GET: Monthly Income Statistics for Admin Chart
router.get('/income', verifyRole(['admin']), async (req, res) => {
    try {
        // This MySQL query groups paid bookings by month (e.g., 'Jan', 'Feb') and sums the amount
        const query = `
            SELECT 
                DATE_FORMAT(schedule_datetime, '%b') as month, 
                SUM(amount) as total 
            FROM bookings 
            WHERE payment_status = 'Paid' 
            GROUP BY YEAR(schedule_datetime), MONTH(schedule_datetime), month
            ORDER BY YEAR(schedule_datetime), MONTH(schedule_datetime)
            LIMIT 6
        `;
        const [incomeStats] = await db.query(query);
        res.json(incomeStats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch income stats.' });
    }
});

// NEW ROUTE: Upload Photo (Worker Only)
router.post('/:id/upload-photo', verifyRole(['worker']), upload.single('image'), async (req, res) => {
    const bookingId = req.params.id;
    const workerId = req.user.id;
    const type = req.body.type; // Should be 'before' or 'after'

    if (!req.file) return res.status(400).json({ message: 'No image provided.' });
    if (!['before', 'after'].includes(type)) return res.status(400).json({ message: 'Invalid photo type.' });

    try {
        // SECURITY: Verify this worker is actually assigned to this booking
        const [booking] = await db.query('SELECT worker_id FROM bookings WHERE id = ?', [bookingId]);
        if (booking.length === 0) return res.status(404).json({ message: 'Booking not found.' });
        if (booking[0].worker_id !== workerId) {
            return res.status(403).json({ message: 'You are not assigned to this car.' });
        }

        // Save the file path to the database
        const filePath = `/uploads/${req.file.filename}`;
        const columnToUpdate = type === 'before' ? 'photo_before' : 'photo_after';
        
        await db.query(`UPDATE bookings SET ${columnToUpdate} = ? WHERE id = ?`, [filePath, bookingId]);
        
        res.json({ message: `${type} photo uploaded successfully!`, filePath });
    } catch (error) {
        res.status(500).json({ message: 'Server error during upload.' });
    }
});

module.exports = router;
