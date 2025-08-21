import SharedSession from "../models/SharedSession.js";

export async function startSharedSession(req, res) {
	const { orgId, sessionType, duration, participants, startedBy } = req.body;
	if (!orgId || !sessionType || !duration || !participants || participants.length === 0) {
		return res.status(400).json({ message: "orgId, sessionType, duration and participants are required" });
	}
	const doc = await SharedSession.create({
		organizationId: orgId,
		sessionType,
		duration,
		participants,
		startedBy: startedBy || req.user?.id || participants[0].userId,
	});
	// Emit socket event (room by org)
	req.app.get("io")?.to(`org:${orgId}`).emit("shared-session:start", {
		id: doc.id,
		organizationId: doc.organizationId,
		sessionType: doc.sessionType,
		duration: doc.duration,
		participants: doc.participants,
		startedAt: doc.startedAt,
	});
	return res.status(201).json({ sharedSession: doc });
}


