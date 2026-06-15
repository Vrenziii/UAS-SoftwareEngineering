"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CustomerDashboard() {
	const [vehicle, setVehicle] = useState("");
	const [schedule, setSchedule] = useState("");
	const [bookings, setBookings] = useState([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");
		try {
			const response = await axios.get("http://localhost:5000/api/bookings", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setBookings(response.data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreateBooking = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		const token = localStorage.getItem("token");
		try {
			const response = await axios.post(
				"http://localhost:5000/api/payments/checkout",
				{
					vehicle_details: vehicle,
					schedule_datetime: schedule,
					amount: 50000,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			const snapToken = response.data.token;
			if (!snapToken) return setError("Failed to get payment token.");

			setVehicle("");
			setSchedule("");

			window.snap.pay(snapToken, {
				onSuccess: () => {
					setSuccess("Payment successful!");
					fetchBookings();
				},
				onPending: () => {
					setSuccess("Waiting for payment...");
					fetchBookings();
				},
				onError: () => {
					setError("Payment failed!");
					fetchBookings();
				},
				onClose: () => {
					setError("Payment window closed.");
					fetchBookings();
				},
			});
		} catch (err) {
			setError("Checkout failed. Please try again.");
		}
	};

	const handlePayNow = (snapToken) => {
		if (!snapToken) return setError("Token not found.");
		setError("");
		setSuccess("");
		window.snap.pay(snapToken, {
			onSuccess: () => {
				setSuccess("Payment successful!");
				fetchBookings();
			},
			onPending: () => {
				setSuccess("Waiting for payment...");
				fetchBookings();
			},
			onError: () => {
				setError("Payment failed!");
				fetchBookings();
			},
			onClose: () => {
				setError("Payment window closed.");
				fetchBookings();
			},
		});
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		router.push("/login");
	};

	return (
		<div className="p-8 font-sans min-h-screen bg-slate-950 text-white">
			<Script
				src="https://app.sandbox.midtrans.com/snap/snap.js"
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
				strategy="lazyOnload"
			/>

			<div className="max-w-7xl mx-auto">
				{/* MODERN HEADER WITH LOGO */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-800 pb-8">
					<div className="flex items-center gap-3">
						<svg
							className="w-9 h-9 text-indigo-400"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M19 17V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V17M19 17H5M19 17C20.1046 17 21 16.1046 21 15V11.5C21 10.9477 20.5523 10.5 20 10.5H18.5M5 17C3.89543 17 3 16.1046 3 15V11.5C3 10.9477 3.44772 10.5 4 10.5H5.5"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
							<path
								d="M5.5 10.5L8.06213 4.52169C8.35821 3.83083 9.03477 3.375 9.78901 3.375H14.211C14.9652 3.375 15.6418 3.83083 15.9379 4.52169L18.5 10.5"
								stroke="currentColor"
								strokeWidth="2"
							/>
							<path
								d="M16 14C16 15.1046 15.1046 16 14 16H10C8.89543 16 8 15.1046 8 14C8 12.8954 8.89543 12 10 12H14C15.1046 12 16 12.8954 16 14Z"
								fill="#312e81"
								stroke="currentColor"
								strokeWidth="1.5"
							/>
						</svg>
						<div>
							<h1 className="text-3xl font-extrabold text-white tracking-tight">
								CARWASH <span className="text-slate-600"></span>
							</h1>
							<p className="text-slate-400 text-sm">
								Customer Service Dashboard
							</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
					>
						Logout
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* BOOKING FORM - GLASSMORPHISM STYLE */}
					<div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl col-span-1 h-fit relative overflow-hidden">
						<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

						<div className="flex items-center gap-3 mb-6 relative z-10 border-b border-slate-800 pb-4">
							<svg
								className="w-6 h-6 text-indigo-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<h2 className="text-xl font-bold text-white">Book New Wash</h2>
						</div>

						<p className="text-sm text-slate-400 mb-6 relative z-10">
							Standard Wash & Shine Rate:{" "}
							<span className="text-emerald-400 font-bold">Rp 50.000</span>
						</p>

						{error && (
							<div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm mb-6">
								{error}
							</div>
						)}
						{success && (
							<div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-sm mb-6">
								{success}
							</div>
						)}

						<form
							onSubmit={handleCreateBooking}
							className="space-y-5 relative z-10"
						>
							<div>
								<label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
									<svg
										className="w-4 h-4 text-slate-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
									Vehicle Details
								</label>
								<input
									type="text"
									placeholder="e.g., Honda Civic Black (B 1234 XYZ)"
									required
									className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-600 outline-none transition-all"
									value={vehicle}
									onChange={(e) => setVehicle(e.target.value)}
								/>
							</div>
							<div>
								<label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
									<svg
										className="w-4 h-4 text-slate-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Preferred Schedule
								</label>
								<input
									type="datetime-local"
									required
									className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all [color-scheme:dark]"
									value={schedule}
									onChange={(e) => setSchedule(e.target.value)}
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 mt-6 flex items-center justify-center gap-2"
							>
								Pay & Secure Booking
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 9h10m-6-6l6 6-6 6"
									/>
								</svg>
							</button>
						</form>
					</div>

					{/* BOOKING HISTORY TABLE - UPDATED Header Detail */}
					<div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl col-span-2 overflow-hidden flex flex-col">
						<div className="relative p-6 border-b border-slate-800 overflow-hidden bg-slate-950">
							{/* Visual background element (SVG) */}
							<svg
								className="absolute inset-0 w-full h-full text-indigo-950 opacity-50"
								preserveAspectRatio="none"
								viewBox="0 0 100 100"
							>
								<path
									d="M0,0 L100,0 L100,80 C50,100 0,80 0,80 Z"
									fill="currentColor"
								/>
							</svg>

							<div className="relative z-10 flex items-center gap-3">
								<svg
									className="w-6 h-6 text-slate-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
									/>
								</svg>
								<h2 className="text-lg font-bold text-white">
									Your History & Status
								</h2>
							</div>
						</div>

						{bookings.length === 0 ? (
							<div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
								<svg
									className="w-16 h-16 text-slate-800 mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 012-2V7a2 2 0 01-2-2H5a2 2 0 01-2 2v12a2 2 0 012 2v-6a2 2 0 012-2h14z"
									/>
								</svg>
								<p className="text-slate-500 italic">
									Your washing queue is empty. Use the form to make your first
									booking!
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm text-left text-slate-300">
									<thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
										<tr>
											<th className="py-4 px-6">Vehicle</th>
											<th className="py-4 px-6">Date</th>
											<th className="py-4 px-6">Status</th>
											<th className="py-4 px-6">Payment</th>
											<th className="py-4 px-6">Gallery</th>
											<th className="py-4 px-6 text-center">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-800/50">
										{bookings.map((booking) => (
											<tr
												key={booking.id}
												className="hover:bg-slate-800/20 transition-colors"
											>
												<td className="py-4 px-6 font-medium text-slate-200">
													{booking.vehicle_details}
												</td>
												<td className="py-4 px-6 text-slate-400">
													{new Date(booking.schedule_datetime).toLocaleString()}
												</td>
												<td className="py-4 px-6">
													<span
														className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                        ${
																													booking.status ===
																													"Pending"
																														? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
																														: booking.status ===
																															  "On Work"
																															? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
																															: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
																												}`}
													>
														{booking.status}
													</span>
												</td>
												<td className="py-4 px-6">
													<span
														className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                        ${
																													!booking.payment_status ||
																													booking.payment_status ===
																														"Unpaid"
																														? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
																														: booking.payment_status ===
																															  "Pending"
																															? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
																															: booking.payment_status ===
																																  "Failed"
																																? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
																																: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
																												}`}
													>
														{booking.payment_status || "Unpaid"}
													</span>
												</td>
												<td className="py-4 px-6">
													<div className="flex gap-2">
														{booking.photo_before ? (
															<a
																href={`http://localhost:5000${encodeURI(booking.photo_before.replace(/\\/g, "/"))}`}
																target="_blank"
																rel="noreferrer"
															>
																<img
																	src={`http://localhost:5000${encodeURI(booking.photo_before.replace(/\\/g, "/"))}`}
																	alt="Before"
																	className="w-12 h-12 object-cover rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer bg-slate-800"
																	title="Before Wash"
																/>
															</a>
														) : (
															<span className="text-slate-600 text-xs italic">
																No before
															</span>
														)}

														{booking.photo_after ? (
															<a
																href={`http://localhost:5000${encodeURI(booking.photo_after.replace(/\\/g, "/"))}`}
																target="_blank"
																rel="noreferrer"
															>
																<img
																	src={`http://localhost:5000${encodeURI(booking.photo_after.replace(/\\/g, "/"))}`}
																	alt="After"
																	className="w-12 h-12 object-cover rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer bg-slate-800"
																	title="After Wash"
																/>
															</a>
														) : (
															<span className="text-slate-600 text-xs italic">
																No after
															</span>
														)}
													</div>
												</td>
												<td className="py-4 px-6 text-center">
													{(booking.payment_status === "Unpaid" ||
														booking.payment_status === "Failed") &&
													booking.snap_token ? (
														<button
															onClick={() => handlePayNow(booking.snap_token)}
															className="bg-emerald-600/20 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 font-bold py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5 mx-auto"
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 9h10m-6-6l6 6-6 6"
																/>
															</svg>
															Retry
														</button>
													) : (
														<span className="text-slate-600 text-xs italic">
															-
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
