import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { startSharedSession } from "../controllers/sharedSessions.controller.js";

const router = Router();

router.post("/shared/start", authRequired, startSharedSession);

export default router;


