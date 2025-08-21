import { randomBytes } from "crypto";
import Organization from "../models/Organization.js";

function generateInviteCode() {
	return randomBytes(3).toString("hex").toUpperCase();
}

export async function createOrg(req, res) {
	const { name, userId } = req.body;
	if (!name || !userId) return res.status(400).json({ message: "name and userId are required" });
	let code = generateInviteCode();
	// ensure uniqueness
	// retry small number of times
	for (let i = 0; i < 5; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		const exists = await Organization.findOne({ code });
		if (!exists) break;
		code = generateInviteCode();
	}
	const org = await Organization.create({ name, code, members: [userId] });
	return res.status(201).json({ orgId: org.id, code: org.code, organization: org });
}

export async function joinOrg(req, res) {
	const { userId, code } = req.body;
	if (!userId || !code) return res.status(400).json({ message: "userId and code are required" });
	const org = await Organization.findOne({ code: code.toUpperCase() });
	if (!org) return res.status(404).json({ message: "Invalid invite code" });
	if (!org.members.find((m) => m.toString() === userId)) {
		org.members.push(userId);
		await org.save();
	}
	return res.json({ organization: org });
}

export async function listUserOrgs(req, res) {
	const { userId } = req.params;
	const orgs = await Organization.find({ members: userId });
	return res.json({ organizations: orgs });
}


