"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
	const [bookings, setBookings] = useState([]);
	const [stats, setStats] = useState([]);
	const [incomeStats, setIncomeStats] = useState([]);
	const [workers, setWorkers] = useState([]); // NEW STATE: Store worker list
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	const COLORS = {
		Pending: "#FBBF24",
		"On Work": "#60A5FA",
		Finished: "#34D399",
	};

	useEffect(() => {
		fetchBookings();
		fetchStats();
		fetchIncome();
		fetchWorkers(); // NEW: Fetch workers on load
	}, []);

	// NEW: Fetch all users and filter for workers only
	const fetchWorkers = async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await axios.get("http://localhost:5000/api/users", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const workerList = response.data.filter((user) => user.role === "worker");
			setWorkers(workerList);
		} catch (err) {
			console.error("Failed to fetch workers", err);
		}
	};

	const fetchBookings = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");
		try {
			const response = await axios.get("http://localhost:5000/api/bookings", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setBookings(response.data);
		} catch (err) {
			setError("Failed to fetch bookings.");
		}
	};

	const fetchStats = async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await axios.get(
				"http://localhost:5000/api/bookings/stats",
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setStats(response.data);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchIncome = async () => {
		const token = localStorage.getItem("token");
		try {
			const response = await axios.get(
				"http://localhost:5000/api/bookings/income",
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setIncomeStats(response.data);
		} catch (err) {
			console.error(err);
		}
	};

	// UPDATED: Now receives the exact workerId from the dropdown
	const handleAssignWorker = async (bookingId, workerId) => {
		if (!workerId) return;

		// Find worker name for confirmation
		const workerName = workers.find(
			(w) => w.id.toString() === workerId.toString(),
		)?.username;
		if (!window.confirm(`Assign ${workerName} to this vehicle?`)) return;

		setError("");
		setSuccess("");
		const token = localStorage.getItem("token");

		try {
			const response = await axios.put(
				`http://localhost:5000/api/bookings/assign/${bookingId}`,
				{ worker_id: workerId },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setSuccess(response.data.message);
			fetchBookings();
			fetchStats();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to assign worker.");
			window.scrollTo(0, 0);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		router.push("/login");
	};

	return (
		<div className="p-8 font-sans">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
					<div>
						<h1 className="text-4xl font-extrabold text-white tracking-tight">
							Admin Control
						</h1>
						<p className="text-slate-400 mt-1 text-sm">
							System Overview & Diagnostics
						</p>
					</div>
					<div className="space-x-3">
						<button
							onClick={() => router.push("/admin/users")}
							className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
						>
							Manage Users
						</button>
						<button
							onClick={handleLogout}
							className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
						>
							Logout
						</button>
					</div>
				</div>

				{error && (
					<div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl mb-6">
						{error}
					</div>
				)}
				{success && (
					<div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6">
						{success}
					</div>
				)}

				{/* VISUALIZATIONS SECTION (Unchanged) */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					<div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl col-span-1 flex flex-col">
						<h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
							Operational Status
						</h2>
						{stats.length > 0 ? (
							<div className="w-full h-60">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={stats}
											cx="50%"
											cy="50%"
											innerRadius={65}
											outerRadius={85}
											paddingAngle={5}
											dataKey="value"
											stroke="none"
										>
											{stats.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[entry.name] || "#8884d8"}
												/>
											))}
										</Pie>
										<Tooltip
											contentStyle={{
												backgroundColor: "#0f172a",
												borderColor: "#1e293b",
												color: "#f8fafc",
												borderRadius: "8px",
											}}
											itemStyle={{ color: "#f8fafc" }}
										/>
										<Legend
											wrapperStyle={{ fontSize: "14px", color: "#cbd5e1" }}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						) : (
							<p className="text-slate-600 italic m-auto">No data available</p>
						)}
					</div>

					<div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
						<div className="grid grid-cols-2 gap-6">
							<div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
								<p className="text-xs font-bold text-slate-400 uppercase tracking-wider z-10">
									Active Jobs
								</p>
								<p className="text-4xl font-extrabold text-white mt-2 z-10">
									{stats.find((s) => s.name === "On Work")?.value || 0}
								</p>
							</div>
							<div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
								<p className="text-xs font-bold text-slate-400 uppercase tracking-wider z-10">
									Awaiting Assignment
								</p>
								<p className="text-4xl font-extrabold text-white mt-2 z-10">
									{stats.find((s) => s.name === "Pending")?.value || 0}
								</p>
							</div>
						</div>

						<div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex-1">
							<h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
								Monthly Revenue
							</h2>
							{incomeStats.length > 0 ? (
								<div className="w-full h-48">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={incomeStats}
											margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												vertical={false}
												stroke="#1e293b"
											/>
											<XAxis
												dataKey="month"
												tick={{ fill: "#64748b", fontSize: 12 }}
												axisLine={false}
												tickLine={false}
											/>
											<YAxis
												tickFormatter={(value) => `Rp ${value / 1000}k`}
												tick={{ fill: "#64748b", fontSize: 12 }}
												axisLine={false}
												tickLine={false}
											/>
											<Tooltip
												formatter={(value) =>
													`Rp ${Number(value).toLocaleString()}`
												}
												cursor={{ fill: "#1e293b" }}
												contentStyle={{
													backgroundColor: "#0f172a",
													borderColor: "#1e293b",
													color: "#f8fafc",
													borderRadius: "8px",
												}}
											/>
											<Bar
												dataKey="total"
												fill="#34D399"
												radius={[4, 4, 0, 0]}
												name="Gross Income"
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="h-full flex items-center justify-center">
									<p className="text-slate-600 italic">No revenue data.</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* MAIN TABLE SECTION */}
				<div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
					<div className="p-6 border-b border-slate-800">
						<h2 className="text-lg font-bold text-white">Recent Bookings</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm text-left text-slate-300">
							<thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
								<tr>
									<th className="py-4 px-6">ID</th>
									<th className="py-4 px-6">Vehicle Details</th>
									<th className="py-4 px-6">Status</th>
									<th className="py-4 px-6">Payment</th>
									<th className="py-4 px-6">Assigned Worker</th>{" "}
									{/* UPDATED HEADER */}
									<th className="py-4 px-6 text-center">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800/50">
								{bookings.map((booking) => (
									<tr
										key={booking.id}
										className="hover:bg-slate-800/20 transition-colors"
									>
										<td className="py-4 px-6 text-slate-500 font-mono">
											{booking.id}
										</td>
										<td className="py-4 px-6 font-medium text-slate-200">
											{booking.vehicle_details}
										</td>
										<td className="py-4 px-6">
											<span
												className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${
																									booking.status === "Pending"
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

										{/* NEW: DYNAMIC USERNAME LOOKUP */}
										<td className="py-4 px-6">
											{booking.worker_id ? (
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
														{workers
															.find((w) => w.id === booking.worker_id)
															?.username?.charAt(0)
															.toUpperCase() || "W"}
													</div>
													<span className="font-medium">
														{workers.find((w) => w.id === booking.worker_id)
															?.username || `ID: ${booking.worker_id}`}
													</span>
												</div>
											) : (
												<span className="text-slate-600 italic">
													Unassigned
												</span>
											)}
										</td>

										{/* NEW: DROPDOWN SELECTOR */}
										<td className="py-4 px-6 text-center">
											{booking.status === "Pending" ? (
												<select
													className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none text-center appearance-none"
													value=""
													onChange={(e) =>
														handleAssignWorker(booking.id, e.target.value)
													}
												>
													<option value="" disabled>
														Assign Worker ▾
													</option>
													{workers.map((w) => (
														<option
															key={w.id}
															value={w.id}
															className="bg-slate-900 text-slate-200"
														>
															{w.username}
														</option>
													))}
												</select>
											) : (
												<span className="text-slate-600 text-xs font-medium">
													Locked
												</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
