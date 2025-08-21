import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { listUserSessions, logSession, sessionStats } from "../controllers/sessions.controller.js";
import { startSharedSession } from "../controllers/sharedSessions.controller.js";

const router = Router();

router.post("/log", authRequired, logSession);
router.get("/:userId", authRequired, listUserSessions);
router.get("/:userId/stats", authRequired, sessionStats);
router.post("/shared/start", authRequired, startSharedSession);

export default router;


