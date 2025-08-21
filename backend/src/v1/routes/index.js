import { Router } from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./tasks.routes.js";
import sessionsRoutes from "./sessions.routes.js";
import sessionRoutes from "./session.routes.js";
import orgRoutes from "./org.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/session", sessionRoutes);
router.use("/org", orgRoutes);

export default router;


