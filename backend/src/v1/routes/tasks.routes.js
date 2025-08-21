import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { createTask, deleteTask, incrementPomodoro, listTasks, updateTask } from "../controllers/tasks.controller.js";

const router = Router();

router.get("/:userId", authRequired, listTasks);
router.post("/create", authRequired, createTask);
router.patch("/:taskId", authRequired, updateTask);
router.delete("/:taskId", authRequired, deleteTask);
router.post("/:taskId/increment-pomodoro", authRequired, incrementPomodoro);

export default router;


