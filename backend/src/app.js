import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./v1/routes/index.js";

export function createApp() {
	const app = express();
	app.use(helmet());
	app.use(cors());
	app.use(express.json());
	app.use(morgan("dev"));

	app.get("/", (_req, res) => {
		res.json({ status: "ok", service: "pomopro-backend" });
	});

	app.use("/api", apiRouter);

	// eslint-disable-next-line no-unused-vars
	app.use((err, _req, res, _next) => {
		const status = err.status || 500;
		const message = err.message || "Internal Server Error";
		res.status(status).json({ message });
	});

	return app;
}

export default createApp;


