
import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const updateProgress = async (req, res) => {
    try {
        const {id} = req.params;
        const {delta, userId, note} = req.body;

        
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "ID Tidak valid"});
        }

        const filter = req.user?.user_id ? { _id: id, createdBy: req.user.user_id} : {_id: id};
        
        const goal = await Goal.findOne(filter).exec();

        if(!goal){
            return res.status(404).json({message: " Goal Tidak Ditemukan"});
        }

        if (!goal.actions || !Array.isArray(goal.actions)) {
            goal.actions= [];
        }

        const numericDelta = Number(delta || 0);
        goal.currentValue = (Number(goal.currentValue) || 0) + numericDelta;

        goal.actions.push({
            userId,
            delta: numericDelta,
            note
        });

        await goal.save();

        return res.json({ message: "Progress Berhasil Diupate", data: goal});
    }catch(err) {
        console.error("[updateProgress] ERROR:", err);
        return res.status(500).json({message : " Server error", error: err.message});

    }
};

       