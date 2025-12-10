
import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const updateProgress = async (req, res) => {
    try {
        const {id} = req.params;
        const {delta, userId, note} = req.body;

        
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "ID Tidak valid"});
        }

        const numericDelta = Number(delta ?? value ?? 0);

        const filter = req.user?.user_id ? { _id: id, createdBy: req.user.user_id} : {_id: id};
        
        const goal = await Goal.findOne(filter).exec();

        if(!goal){
            return res.status(404).json({message: " Goal Tidak Ditemukan"});
        }

        if (!goal.actions || !Array.isArray(goal.actions)) {
            goal.actions= [];
        }

        
        goal.currentValue = (Number(goal.currentValue) || 0) + numericDelta;
        goal.progress = Math.min(100, Math.max(0, Number(goal.progress) + numericDelta));

        goal.actions.push({
            userId: userId || req.user?.user_id,
            note: note || "",
            value: numericDelta,
            createdAt: new Date()
        });

        await goal.save();

        return res.json({ message: "Progress Berhasil Diupate", data: goal});
    }catch(err) {
        console.error("[updateProgress] ERROR:", err);
        return res.status(500).json({message : " Server error", error: err.message});

    }
};

       