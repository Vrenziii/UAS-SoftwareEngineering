const jwt = require("jsonwebtoken");

const verifyRole = (allowedRoles) => {
	return (req, res, next) => {
		const token = req.headers["authorization"];
		if (!token) return res.status(403).json({ message: "No token provided" });

		jwt.verify(
			token.split(" ")[1],
			process.env.JWT_SECRET || "supersecretkey",
			(err, decoded) => {
				if (err) return res.status(401).json({ message: "Unauthorized" });

				if (!allowedRoles.includes(decoded.role)) {
					return res
						.status(403)
						.json({ message: "Access denied: Insufficient permissions" });
				}

				req.user = decoded; // Attach user info to the request
				next();
			},
		);
	};
};

module.exports = verifyRole;
