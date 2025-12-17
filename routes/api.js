import express from "express";

import * as goalController from "../controllers/goalController.js"
import * as memberController from "../controllers/memberController.js"
import * as taskController from "../controllers/taskController.js";
import upload from "../middleware/uploadAvatar.js";
import * as userController from "../controllers/userController.js"
import { authenticateTokenMiddleware } from "../middleware/authMiddleware.js"

const api = express.Router();


//Cari users
api.get("/users", authenticateTokenMiddleware, userController.listUsers);

//goals
api.get("/goals", authenticateTokenMiddleware, goalController.listGoals);
api.post("/goals", authenticateTokenMiddleware, goalController.addGoal);
api.put("/goals/:id", authenticateTokenMiddleware, goalController.updateGoal);
api.patch("/goals/:id", authenticateTokenMiddleware, goalController.updateGoal);
api.delete("/goals/:id", authenticateTokenMiddleware, goalController.deleteGoal);
api.get("/goals/:id", authenticateTokenMiddleware, goalController.detailGoal);

//timeline
api.patch("/goals/:id/timeline",authenticateTokenMiddleware,goalController.updateTimeline);

//Members
api.post("/goals/:id/members", authenticateTokenMiddleware, memberController.addMember);
api.delete("/goals/:id/members", authenticateTokenMiddleware, memberController.removeMember);

// task
api.post(
  "/goals/:id/tasks",
  authenticateTokenMiddleware,
  taskController.addTask
);

api.patch(
  "/goals/:goalId/tasks/:taskId/toggle",
  authenticateTokenMiddleware,
  taskController.toggleTask
);

// subtask routes
api.post(
  "/goals/:goalId/tasks/:taskId/subtasks",
  authenticateTokenMiddleware,
  taskController.addSubtask
);

api.patch(
  "/goals/:goalId/tasks/:taskId/subtasks/:subtaskId/toggle",
  authenticateTokenMiddleware,
  taskController.toggleSubtask
);

api.patch(
  "/goals/:goalId/tasks/:taskId/subtasks/:subtaskId/assign",
  authenticateTokenMiddleware,
  taskController.assignSubtask
);

// Edit task/subtask routes
api.patch(
  "/goals/:goalId/tasks/:taskId/edit",
  authenticateTokenMiddleware,
  taskController.editTask
);

api.patch(
  "/goals/:goalId/tasks/:taskId/subtasks/:subtaskId/edit",
  authenticateTokenMiddleware,
  taskController.editSubtask
);

//Auth
api.post("/signin", userController.signIn);
api.post("/signup", userController.signUp);

//profile
api.get("/me", authenticateTokenMiddleware, userController.getMe);
api.put("/me", authenticateTokenMiddleware, upload.single("avatar"), userController.updateMe);

export default api;
