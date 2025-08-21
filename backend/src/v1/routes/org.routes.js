import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { createOrg, joinOrg, listUserOrgs } from "../controllers/org.controller.js";

const router = Router();

router.post("/create", authRequired, createOrg);
router.post("/join", authRequired, joinOrg);
router.get("/:userId", authRequired, listUserOrgs);

export default router;


