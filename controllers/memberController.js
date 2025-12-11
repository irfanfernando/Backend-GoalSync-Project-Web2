import Goal from "../models/goalModels.js";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const {userId, role} = req.body;

        

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Goal ID Tidak valid !"});
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const goal = await Goal.findById(id).exec();

        if(!goal){
            return res.status(404).json({ message: "Goal Tidak Ditemuka !"});
        }

        if (!goal.members || !Array.isArray(goal.members)){
            goal.members = [];
        }

        if (goal.members.some(m => String(m.userId) === String(userId))){
            return res.status(400).json({message: "User sudah menjadi member !"});
        }

        const u = await userModel.findById(userId).select("Username email").lean().exec();
        const displayName = u?.username ?? u?.email ?? "Unknown";


        goal.members.push({
            userId: userId,
            name: displayName,
            avatar: null,
            role: role ?? "member",
            joinedAt: new Date(),
        });
        await goal.save();

        return res.json({ message: "Member telah ditambahkan", data: goal });
        } catch (err) {
            console.error("[addMember] ERROR:", err);
            return res.status(500).json({ message: "Server Error", error: err.message });
        }
    };