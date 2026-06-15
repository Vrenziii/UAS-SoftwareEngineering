const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();
const { body, validationResult } = require("express-validator");

router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
			username,
		]);
		if (users.length === 0)
			return res.status(404).json({ message: "User not found" });

		const user = users[0];
		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword)
			return res.status(401).json({ message: "Invalid credentials" });

		// Generate JWT with user ID and Role
		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET || "supersecretkey",
			{ expiresIn: "8h" },
		);

		res.json({ token, role: user.role, message: "Login successful" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
});



// REGISTER ROUTE (Dengan Keamanan Extra)
router.post(
	"/register",
	[
		body("username")
			.trim()
			.isLength({ min: 3 })
			.escape()
			.withMessage("Username must be at least 3 characters."),
		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters."),
		body("role")
			.isIn(["customer", "worker", "admin"])
			.withMessage("Invalid role."),
	],
	async (req, res) => {
		// 1. Cek apakah ada error dari validasi input
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array()[0].msg });
		}

		// 2. AMBIL DATA DARI FRONTEND (Ini yang tadi hilang!)
		const { username, password, role } = req.body;

		try {
			// 3. Cek apakah username sudah dipakai
			const [existingUser] = await db.query(
				"SELECT * FROM users WHERE username = ?",
				[username],
			);
			if (existingUser.length > 0) {
				return res.status(400).json({ message: "Username sudah digunakan." });
			}

			// 4. Hash (Enkripsi) Password
			const hashedPassword = await bcrypt.hash(password, 10);

			// 5. Simpan ke Database
			await db.query(
				"INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
				[username, hashedPassword, role],
			);

			res.status(201).json({ message: "Registrasi berhasil!" });
		} catch (error) {
			console.error("🚨 ERROR SAAT REGISTER:", error);
			res.status(500).json({ message: "Server error saat registrasi." });
		}
	},
);

module.exports = router;
