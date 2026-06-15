"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const response = await axios.post(
				"http://localhost:5000/api/auth/login",
				{ username, password },
			);
			const { token, role } = response.data;
			localStorage.setItem("token", token);
			localStorage.setItem("role", role);

			if (role === "admin") router.push("/admin/dashboard");
			else if (role === "worker") router.push("/worker/dashboard");
			else if (role === "customer") router.push("/customer/dashboard");
		} catch (err) {
			setError(
				err.response?.data?.message || "Login failed. Check credentials.",
			);
		}
	};

	return (
		<div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans bg-slate-950 text-white">
			{/* LEFT SIDE: BRANDING & VISUALS */}
			<div className="relative bg-slate-900 flex flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
				{/* Background bubble pattern (SVG) */}
				<svg
					className="absolute inset-0 w-full h-full text-slate-800 opacity-30"
					xmlns="http://www.w3.org/2000/svg"
					width="100%"
					height="100%"
				>
					<defs>
						<pattern
							id="bubbly"
							x="0"
							y="0"
							width="100"
							height="100"
							patternUnits="userSpaceOnUse"
						>
							<circle cx="50" cy="50" r="10" fill="currentColor" />
							<circle cx="10" cy="10" r="3" fill="currentColor" />
							<circle cx="80" cy="20" r="5" fill="currentColor" />
							<circle cx="30" cy="80" r="7" fill="currentColor" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#bubbly)" />
				</svg>

				{/* Indigo ambient glow */}
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -z-10"></div>

				<div className="relative z-10">
					<div className="flex items-center gap-3">
						{/* Stylized Car Icon (SVG) */}
						<svg
							className="w-10 h-10 text-indigo-400"
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
						<span className="text-2xl font-black text-white tracking-tighter">
							CAR<span className="text-indigo-400">WASH</span>
						</span>
					</div>
				</div>

				<div className="relative z-10">
					<h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
						Keep your ride <span className="text-indigo-400">spotless</span>.
						<br /> Anytime, anywhere.
					</h1>
					<p className="text-slate-400 mt-6 max-w-lg">
						Manage your bookings, track service status, and handle payments in a
						sleek, modern platform designed for car enthusiasts.
					</p>
				</div>

				<div className="relative z-10 text-slate-600 text-sm">
					© 2026 AquaShine Pro. All rights reserved. Premium Car Care Solutions.
				</div>
			</div>

			{/* RIGHT SIDE: LOGIN FORM */}
			<div className="flex flex-col items-center justify-center p-8 relative">
				<div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

					<div className="mb-10 text-center relative z-10">
						<h2 className="text-3xl font-extrabold text-white tracking-tight">
							Welcome Back
						</h2>
						<p className="text-slate-400 mt-2 text-sm">
							Sign in to manage your bookings
						</p>
					</div>

					{error && (
						<div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm mb-6 text-center">
							{error}
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-6 relative z-10">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Username
							</label>
							<input
								type="text"
								placeholder="your_username"
								required
								className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-600 outline-none transition-all"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">
								Password
							</label>
							<input
								type="password"
								placeholder="••••••••"
								required
								className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-600 outline-none transition-all"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 mt-6 flex items-center justify-center gap-2"
						>
							Secure Sign In
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
									d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
								/>
							</svg>
						</button>
					</form>

					<div className="mt-10 text-center text-sm text-slate-500 relative z-10">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors"
						>
							Register here
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
