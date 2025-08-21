import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import mongoose from "mongoose";
import createApp from "./app.js";
import { attachSocketHandlers } from "./sockets/sharedSessions.js";

dotenv.config();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CORS_ORIGIN?.split(",") || ["*"],
		methods: ["GET", "POST", "PATCH", "DELETE"],
	},
});

// expose io to routes/controllers
app.set("io", io);

// DB connect and start
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pomopro";
const PORT = process.env.PORT || 4000;

async function start() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("Connected to MongoDB");
		attachSocketHandlers(io);
		server.listen(PORT, () => console.log(`API listening on :${PORT}`));
	} catch (e) {
		console.error("Failed to start server", e);
		process.exit(1);
	}
}

start();


