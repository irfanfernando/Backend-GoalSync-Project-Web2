import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const {userId, name, role} = req.body;

        

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "ID Tidak valid"});
        }

        const filter = req.user?.user_id ? { _id: id, createdBy: req.user.user_id} : {_id: id};

        const goal = await Goal.findOne(filter).exec();

        console.log("[addMember] found goal:", !!goal);

        if(!goal){
            return res.status(404).json({ message: "Goal Tidak Ditemukan"});
        }

        if (!goal.members || !Array.isArray(goal.members)){
            goal.members = [];
        }

        if (userId && goal.members.some(m => String(m.userId) === String(userId))){
            return res.status(400).json({message: "User sudah menjadi member !"});
        }


        goal.members.push({userId, name, role: role || "member"});
        await goal.save();

        res.json({ message: "Member ditambahkan", data: goal});
    } catch (err) {
        res.status (500).json({ message: "Server Error", error: err.message});
    }
};