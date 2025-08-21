import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		code: { type: String, required: true, unique: true, index: true },
		members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Organization", organizationSchema);


