const express = require("express");
const db = require("../config/db");
const verifyRole = require("../middleware/roleCheck");
const midtransClient = require("midtrans-client");
const router = express.Router();

// Initialize Midtrans Snap client
let snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.MIDTRANS_SERVER_KEY, // Get this from Sandbox Dashboard
});

// 1. CREATE CHECKOUT SESSION
router.post("/checkout", verifyRole(["customer"]), async (req, res) => {
	const { vehicle_details, schedule_datetime, amount } = req.body;
	const customer_id = req.user.id;
	const orderId = `WASH-${Date.now()}`; // Unique order identifier

	try {
		// Prepare parameter object for the gateway
		let parameter = {
			transaction_details: {
				order_id: orderId,
				gross_amount: amount,
			},
			credit_card: { secure: true },
		};

		// Request Token from Payment Gateway
		const transaction = await snap.createTransaction(parameter);
		const snapToken = transaction.token;

		// Save booking to DB with 'Unpaid' status and the token
		// Save booking to DB with 'Unpaid' status, the token, AND the order_id
		await db.query(
			`INSERT INTO bookings (customer_id, vehicle_details, schedule_datetime, amount, payment_status, snap_token, order_id) 
             VALUES (?, ?, ?, ?, 'Unpaid', ?, ?)`,
			[
				customer_id,
				vehicle_details,
				schedule_datetime,
				amount,
				snapToken,
				orderId,
			],
		);

		// Send token back to Next.js
		res.status(201).json({
			token: snapToken,
			orderId: orderId,
			message: "Checkout initialized",
		});
	} catch (error) {
		res.status(500).json({ message: "Payment initiation failed" });
	}
});

// 2. WEBHOOK NOTIFICATION (Public Endpoint)
router.post("/webhook", async (req, res) => {
	const notification = req.body;

	try {
		const statusResponse = await snap.transaction.notification(notification);
		const orderId = statusResponse.order_id;
		const transactionStatus = statusResponse.transaction_status;
		const fraudStatus = statusResponse.fraud_status;

		let finalPaymentStatus = "Pending";

		if (transactionStatus === "capture" || transactionStatus === "settlement") {
			if (fraudStatus === "challenge") {
				finalPaymentStatus = "Pending";
			} else {
				finalPaymentStatus = "Paid"; // Payment Secured!
			}
		} else if (
			transactionStatus === "cancel" ||
			transactionStatus === "deny" ||
			transactionStatus === "expire"
		) {
			finalPaymentStatus = "Failed";
		}

		// Update database asynchronously
		// We use the snap_token or look up via parsing transaction data to match records
		// Update database exactly matching the order_id sent by Midtrans
		await db.query(
			"UPDATE bookings SET payment_status = ? WHERE order_id = ?",
			[finalPaymentStatus, orderId],
		);

		res.status(200).send("OK");
	} catch (error) {
		res.status(500).send("Webhook Error");
	}
});

module.exports = router;
