"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function UserManagement() {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const router = useRouter();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");
		try {
			const response = await axios.get("http://localhost:5000/api/users", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUsers(response.data);
		} catch (err) {
			setError("Failed to fetch users.");
		}
	};

	const handleRoleChange = async (userId, newRole) => {
		setError("");
		setSuccess("");
		const token = localStorage.getItem("token");
		try {
			const response = await axios.put(
				`http://localhost:5000/api/users/${userId}/role`,
				{ newRole },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setSuccess(response.data.message);
			fetchUsers();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update role.");
		}
	};

	const handleDeleteUser = async (userId, username) => {
		if (!window.confirm(`Delete user: ${username}?`)) return;
		setError("");
		setSuccess("");
		const token = localStorage.getItem("token");
		try {
			const response = await axios.delete(
				`http://localhost:5000/api/users/${userId}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setSuccess(response.data.message);
			fetchUsers();
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete user.");
		}
	};

	return (
		<div className="p-8 font-sans min-h-screen">
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-10">
					<div>
						<h1 className="text-4xl font-extrabold text-white tracking-tight">
							User Directory
						</h1>
						<p className="text-slate-400 mt-1 text-sm">
							Manage roles and access permissions
						</p>
					</div>
					<Link
						href="/admin/dashboard"
						className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
					>
						&larr; Back to Dashboard
					</Link>
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

				<div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm text-left text-slate-300">
							<thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
								<tr>
									<th className="py-4 px-6">ID</th>
									<th className="py-4 px-6">Username</th>
									<th className="py-4 px-6">Role</th>
									<th className="py-4 px-6">Joined Date</th>
									<th className="py-4 px-6 text-center">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800/50">
								{users.map((user) => (
									<tr
										key={user.id}
										className="hover:bg-slate-800/20 transition-colors"
									>
										<td className="py-4 px-6 text-slate-500 font-mono">
											{user.id}
										</td>
										<td className="py-4 px-6 font-medium text-slate-200">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold border border-slate-700">
													{user.username.charAt(0).toUpperCase()}
												</div>
												{user.username}
											</div>
										</td>
										<td className="py-4 px-6">
											{user.role === "admin" ? (
												<span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
													Admin
												</span>
											) : (
												<select
													value={user.role}
													onChange={(e) =>
														handleRoleChange(user.id, e.target.value)
													}
													className={`px-2 py-1 bg-slate-950 border rounded-lg text-xs font-bold uppercase cursor-pointer outline-none transition-colors appearance-none text-center
                                                        ${user.role === "worker" ? "border-indigo-500/50 text-indigo-400" : "border-slate-700 text-slate-400"}
                                                    `}
												>
													<option value="customer">CUSTOMER</option>
													<option value="worker">WORKER</option>
												</select>
											)}
										</td>
										<td className="py-4 px-6 text-slate-400">
											{new Date(user.created_at).toLocaleDateString()}
										</td>
										<td className="py-4 px-6 text-center">
											{user.role !== "admin" ? (
												<button
													onClick={() =>
														handleDeleteUser(user.id, user.username)
													}
													className="bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
												>
													Delete
												</button>
											) : (
												<span className="text-slate-600 text-xs italic">
													Protected
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
