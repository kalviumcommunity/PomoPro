import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		title: { type: String, required: true },
		description: { type: String },
		status: { type: String, enum: ["pending", "completed"], default: "pending" },
		deadline: { type: Date, default: null },
		pomodoroCount: { type: Number, default: 0 },
	},
	{ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Task", taskSchema);


