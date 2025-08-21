import Session from "../models/Session.js";
import mongoose from "mongoose";

export async function logSession(req, res) {
	const { userId, taskId, type, duration, completedAt } = req.body;
	if (!userId || !type || !duration) {
		return res.status(400).json({ message: "userId, type and duration are required" });
	}
	const session = await Session.create({
		userId,
		taskId: taskId || null,
		type,
		duration,
		completedAt: completedAt ? new Date(completedAt) : new Date(),
	});
	return res.status(201).json({ session });
}

export async function listUserSessions(req, res) {
	const { userId } = req.params;
	const { limit = 20, offset = 0, type } = req.query;
	const filter = { userId };
	if (type) filter.type = type;
	const sessions = await Session.find(filter)
		.sort({ completedAt: -1 })
		.skip(Number(offset))
		.limit(Number(limit));
	return res.json({ sessions });
}

export async function sessionStats(req, res) {
	const { userId } = req.params;
	const { period = "week" } = req.query; // week | month
	const now = new Date();
	const start = new Date(now);
	if (period === "month") {
		start.setDate(now.getDate() - 30);
	} else {
		start.setDate(now.getDate() - 7);
	}
	const pipeline = [
		{ $match: { userId: new mongoose.Types.ObjectId(userId), completedAt: { $gte: start } } },
		{
			$group: {
				_id: "$type",
				totalDuration: { $sum: "$duration" },
				count: { $sum: 1 },
			},
		},
	];
	const agg = await Session.aggregate(pipeline);
	const stats = agg.reduce((acc, cur) => {
		acc[cur._id] = { totalDuration: cur.totalDuration, count: cur.count };
		return acc;
	}, {});
	return res.json({ stats, period });
}


