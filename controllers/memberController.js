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

        const u = await userModel.findById(userId).select("username email avatar").lean().exec();
        const displayName = u?.username ?? u?.email ?? "Unknown";


        goal.members.push({
            userId: userId,
            name: displayName,
            avatar: u?.avatar ?? null,
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

export const removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Goal ID tidak valid!" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const goal = await Goal.findById(id).exec();

        if (!goal) {
            return res.status(404).json({ message: "Goal tidak ditemukan!" });
        }

        // Find the member to get their name for activity log
        const memberToRemove = goal.members?.find(m => String(m.userId) === String(userId));
        if (!memberToRemove) {
            return res.status(400).json({ message: "Member tidak ditemukan di goal ini!" });
        }

        // Remove the member
        goal.members = goal.members?.filter(m => String(m.userId) !== String(userId)) || [];

        // Log activity
        if (!goal.actions) goal.actions = [];
        goal.actions.push({
            userId: req.user.userId,
            note: `Removed member ${memberToRemove.name}`,
        });

        await goal.save();

        return res.json({ message: "Member telah dihapus", data: goal });
    } catch (err) {
        console.error("[removeMember] ERROR:", err);
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};