// routes/users.js
const express = require("express");
const db = require("../config/db");
const verifyRole = require("../middleware/roleCheck");
const router = express.Router();

// 1. READ: Get all users (Admin only)
router.get("/", verifyRole(["admin"]), async (req, res) => {
	try {
		// We do NOT select the password_hash for security reasons
		const [users] = await db.query(
			"SELECT id, username, role, created_at FROM users ORDER BY created_at DESC",
		);
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// 2. DELETE: Remove a user (Admin only)
router.delete("/:id", verifyRole(["admin"]), async (req, res) => {
	const userId = req.params.id;

	try {
		// Prevent the admin from deleting themselves
		if (req.user.id == userId) {
			return res
				.status(400)
				.json({ message: "You cannot delete your own admin account." });
		}

		await db.query("DELETE FROM users WHERE id = ?", [userId]);
		res.json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});

// 3. UPDATE: Change a user's role (Admin only)
router.put('/:id/role', verifyRole(['admin']), async (req, res) => {
    const userId = req.params.id;
    const { newRole } = req.body;

    // Security check: Only allow valid roles
    if (!['worker', 'customer'].includes(newRole)) {
        return res.status(400).json({ message: 'Invalid role provided.' });
    }

    try {
        // Find the user to ensure we aren't modifying another Admin
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
        
        if (users[0].role === 'admin') {
            return res.status(403).json({ message: 'You cannot change the role of an Admin.' });
        }

        // Apply the update
        await db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);
        res.json({ message: `Success! User role updated to ${newRole}.` });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
