require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const verifyRole = require("./middleware/roleCheck");

const app = express();
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(cors());
app.use(express.json());
// Konfigurasi Helmet agar mengizinkan frontend meload gambar (Cross-Origin)
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: {
		message:
			"Too many requests from this IP, please try again after 15 minutes.",
	},
});

// Public Route
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// This allows the frontend to access images via http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Protected Route Example (Only Admin can access)
app.get("/api/admin/dashboard", verifyRole(["admin"]), (req, res) => {
	res.json({ message: "Welcome to the Admin Dashboard" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
