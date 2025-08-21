import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
	const authHeader = req.headers.authorization || "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: "Unauthorized" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
		req.user = { id: decoded.id };
		return next();
	} catch (_e) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

export function optionalAuth(req, _res, next) {
	const authHeader = req.headers.authorization || "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
			req.user = { id: decoded.id };
		} catch (_e) {
			// ignore
		}
	}
	return next();
}


