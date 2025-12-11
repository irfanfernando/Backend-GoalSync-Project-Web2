import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const listGoals = async (req, res) => {
    try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter = {
      $or: [
        { createdBy: userId },
        { "members.userId": userId },
      ],
    };
        const docs = await Goal.find(filter).lean().exec(); 

        const results = docs.map((goal) => {
            const current = Number(goal.currentValue ?? 0);
            const target = Number(goal.targetValue ?? 100); 
            const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      return {
        ...goal,
        progress,
      };
    });

    return res.json({ data: results });

    } catch(error) {
        console.error("[listGoals] ERROR:", error);
        res.status(500).json({ message: "Server Error !", error: error.message});
    }
}

export const addGoal = async (req, res)=> {
    try{
        const { title, description, targetValue} = req.body;

    
        if (!title){
            return res.status(400).json({
                message: "Title Wajib diisi"
            });
        }

        const newGoal = await Goal.create({
            title,
            description,
            targetValue,
            createdBy: req.user.userId
        });

        res.status(201).json({
            message: "Goal Berhasil dibuat",
            data: newGoal
        });
   
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message});
    }
    
};

export const detailGoal = async (req, res) => {
    try{
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "ID Tidak Valid"});
        const doc = await Goal.findById(id)
            .populate("actions.userId", "username avatar")
            .populate("members.userId", "username avatar")
            .lean()
            .exec();
        if (!doc) return res.status(404).json({ message: "Goal Tidak Ditemukan" });

        // hitung progress fallback
        const current = Number(doc.currentValue ?? 0);
        const target = Number(doc.targetValue ?? 100);
        const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

        return res.json({ data: { ...doc, progress } });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message});
    }
};

export const updateGoal = async (req, res) => {
    try{
        const {id} = req.params;
        const { title, description, targetValue } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

        // optional: ensure owner only can update
        const userId = req.user?.userId;
        const filter = userId ? { _id: id, createdBy: mongoose.Types.ObjectId(userId) } : { _id: id };

        const update = {};
        if (title !== undefined) update.title = title;
        if (description !== undefined) update.description = description;
        if (targetValue !== undefined) update.targetValue = targetValue;

        const updated = await Goal.findOneAndUpdate(filter, update, { new: true }).lean().exec();
        if (!updated) return res.status(404).json({ message: "Goal not found or permission denied" });

        // recompute progress
        const current = Number(updated.currentValue ?? 0);
        const target = Number(updated.targetValue ?? 100);
        updated.progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

        return res.json({ message: "Goal updated", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message});
    }
};

export const deleteGoal = async (req, res) => {
    try{
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({message: "ID Tidak Valid"});

        const deleted = await Goal.findOneAndDelete({
            _id: id,
            createdBy: req.user.userId
        });

        if(!deleted)
            return res.status(404).json({ message: "Goal Tidak Ditemukan"});

        res.json({ message: "Goal Berhasil Dihapus"});
    } catch (err) {
        res.status(500).json({message: "Server Error", error: err.message});
    }
};

