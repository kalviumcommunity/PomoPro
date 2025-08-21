import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
	},
	{ _id: false }
);

const sharedSessionSchema = new mongoose.Schema(
	{
		organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
		sessionType: { type: String, enum: ["focus", "break"], required: true },
		duration: { type: Number, required: true },
		startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		participants: [participantSchema],
		startedAt: { type: Date, default: Date.now },
		endedAt: { type: Date, default: null },
	},
	{ timestamps: false }
);

export default mongoose.model("SharedSession", sharedSessionSchema);


