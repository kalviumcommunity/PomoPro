import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
		type: { type: String, enum: ["focus", "break"], required: true },
		duration: { type: Number, required: true },
		completedAt: { type: Date, default: Date.now },
	},
	{ timestamps: false }
);

export default mongoose.model("Session", sessionSchema);


