import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { login, me, signup } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authRequired, me);

export default router;


