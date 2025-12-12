import express from "express";

import * as goalController from "../controllers/goalController.js"
import * as memberController from "../controllers/memberController.js"
import * as progressController from "../controllers/progressController.js"
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
api.delete("/goals/:id", authenticateTokenMiddleware, goalController.deleteGoal);
api.get("/goals/:id", authenticateTokenMiddleware, goalController.detailGoal);

//Members
api.post("/goals/:id/members", authenticateTokenMiddleware, memberController.addMember);

//Progress
api.post("/goals/:id/progress", authenticateTokenMiddleware, progressController.updateProgress);

//Auth
api.post("/signin", userController.signIn);
api.post("/signup", userController.signUp);

api.get("/me", authenticateTokenMiddleware, userController.getMe);
api.put("/me", authenticateTokenMiddleware, upload.single("avatar"), userController.updateMe);

export default api;
