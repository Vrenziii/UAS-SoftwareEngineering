import "./globals.css";

export const metadata = {
	title: "Car Wash App",
	description: "Car Wash Management System",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="antialiased bg-slate-950 text-slate-50 min-h-screen">
				{children}
			</body>
		</html>
	);
}
