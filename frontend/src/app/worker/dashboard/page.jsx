"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function WorkerDashboard() {
	const [tasks, setTasks] = useState([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	useEffect(() => {
		fetchTasks();
	}, []);

	const fetchTasks = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");
		try {
			const response = await axios.get("http://localhost:5000/api/bookings", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setTasks(response.data);
		} catch (err) {
			setError("Failed to fetch assigned tasks.");
		}
	};

	const handleFileUpload = async (bookingId, type, file) => {
		if (!file) return;
		setError("");
		setSuccess("");

		const token = localStorage.getItem("token");
		const formData = new FormData();

		// CRITICAL FIX: Append the text data BEFORE the file!
		formData.append("type", type);
		formData.append("image", file);

		try {
			await axios.post(
				`http://localhost:5000/api/bookings/${bookingId}/upload-photo`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				},
			);
			setSuccess(`Success! ${type} photo saved.`);
			fetchTasks();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to upload photo.");
		}
	};
    
	const handleFinishTask = async (bookingId) => {
		setError("");
		setSuccess("");
		const token = localStorage.getItem("token");
		try {
			await axios.put(
				`http://localhost:5000/api/bookings/status/${bookingId}`,
				{ status: "Finished" },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setSuccess("Great job! The car is marked as Finished.");
			fetchTasks();
		} catch (err) {
			setError("Failed to update task status.");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		router.push("/login");
	};

	const activeTasks = tasks.filter((task) => task.status === "On Work").length;

	return (
		<div className="p-8 font-sans min-h-screen bg-slate-950 text-white">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
					<div>
						<h1 className="text-4xl font-extrabold text-white tracking-tight">
							Worker Portal
						</h1>
						<p className="text-slate-400 mt-1 text-sm">
							Active Tasks:{" "}
							<span className="text-indigo-400 font-bold ml-1">
								{activeTasks}
							</span>
						</p>
					</div>
					<button
						onClick={handleLogout}
						className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
					>
						Logout
					</button>
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

				<div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
					<h2 className="text-xl font-bold text-white mb-6">Your Queue</h2>

					{tasks.length === 0 ? (
						<div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
							<p className="text-slate-500 italic">
								No assigned cars right now. Take a break!
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{tasks.map((task) => (
								<div
									key={task.id}
									className={`relative p-6 rounded-2xl shadow-lg transition-all overflow-hidden border
                                    ${task.status === "On Work" ? "bg-slate-900 border-indigo-500/50 shadow-indigo-500/10" : "bg-slate-950 border-slate-800"}
                                `}
								>
									{task.status === "On Work" && (
										<div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
									)}

									<div className="flex justify-between items-start mb-4 relative z-10">
										<span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
											#{task.id}
										</span>
										<span
											className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                            ${task.status === "On Work" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}
                                        `}
										>
											{task.status}
										</span>
									</div>

									<h3 className="text-lg font-bold text-white mb-1 relative z-10">
										{task.vehicle_details}
									</h3>
									<p className="text-xs text-slate-400 mb-6 relative z-10">
										Scheduled:{" "}
										{new Date(task.schedule_datetime).toLocaleString()}
									</p>

									<div className="relative z-10 space-y-3">
										{task.status === "On Work" ? (
											<>
												{/* 1. Before Photo Logic */}
												{!task.photo_before ? (
													<div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
														<label className="block text-xs font-bold text-slate-400 mb-2">
															1. Upload "Before" Photo
														</label>
														<input
															type="file"
															accept="image/*"
															onChange={(e) =>
																handleFileUpload(
																	task.id,
																	"before",
																	e.target.files[0],
																)
															}
															className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer w-full"
														/>
													</div>
												) : (
													<div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center">
														✓ Before Photo Saved
													</div>
												)}

												{/* 2. After Photo Logic */}
												{task.photo_before && !task.photo_after ? (
													<div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
														<label className="block text-xs font-bold text-slate-400 mb-2">
															2. Upload "After" Photo
														</label>
														<input
															type="file"
															accept="image/*"
															onChange={(e) =>
																handleFileUpload(
																	task.id,
																	"after",
																	e.target.files[0],
																)
															}
															className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer w-full"
														/>
													</div>
												) : (
													task.photo_after && (
														<div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center">
															✓ After Photo Saved
														</div>
													)
												)}

												{/* 3. Strict Finish Button Logic */}
												{task.photo_before && task.photo_after ? (
													<button
														onClick={() => handleFinishTask(task.id)}
														className="w-full bg-emerald-600/20 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2"
													>
														Mark as Finished
													</button>
												) : (
													<button
														disabled
														className="w-full bg-slate-800/30 text-slate-500 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed border border-slate-700 mt-2"
														title="You must upload both Before and After photos to complete this job."
													>
														Requires Photos to Finish
													</button>
												)}
											</>
										) : (
											<button
												disabled
												className="w-full bg-slate-800/50 text-slate-500 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed border border-slate-800"
											>
												Completed
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
