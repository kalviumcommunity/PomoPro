import Task from "../models/Task.js";

export async function listTasks(req, res) {
	const { userId } = req.params;
	const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
	return res.json({ tasks });
}

export async function createTask(req, res) {
	const { title, description, status, deadline, userId, pomodoroCount } = req.body;
	if (!title || !userId) return res.status(400).json({ message: "title and userId are required" });
	const task = await Task.create({
		title,
		description: description || "",
		status: status || "pending",
		deadline: deadline || null,
		userId,
		pomodoroCount: pomodoroCount || 0,
	});
	return res.status(201).json({ task });
}

export async function updateTask(req, res) {
	const { taskId } = req.params;
	const updates = req.body;
	const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
	if (!task) return res.status(404).json({ message: "Task not found" });
	return res.json({ task });
}

export async function deleteTask(req, res) {
	const { taskId } = req.params;
	const task = await Task.findByIdAndDelete(taskId);
	if (!task) return res.status(404).json({ message: "Task not found" });
	return res.json({ success: true });
}

export async function incrementPomodoro(req, res) {
	const { taskId } = req.params;
	const task = await Task.findByIdAndUpdate(
		taskId,
		{ $inc: { pomodoroCount: 1 } },
		{ new: true }
	);
	if (!task) return res.status(404).json({ message: "Task not found" });
	return res.json({ task });
}


