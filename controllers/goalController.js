import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const listGoals = async (req, res) => {
    try{
        const filter = req.user?.userId ? { createdBy: req.user.userId } : {};
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
        res.status(500).json({ message: "Server Error !", error: err.message});
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
   
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message});
    }
    
};

export const detailGoal = async (req, res) => {
    try{
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "ID Tidak Valid"});
        const goal = await Goal.findOne({
            _id: id,
            createdBy: req.user.userId
        });

        if(!goal)
            return res.status(404).json({message: "Goal Tidak Ditemukan"});
        
        res.json({ message: "Detail Goal", data:goal});
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message});
    }
};

export const updateGoal = async (req, res) => {
    try{
        const {id} = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({message: "ID Tidak Valid"});

        const updated = await Goal.findOneAndUpdate(
            { _id: id, createdBy: req.user.userId},
            updates,
            { new : true}
        );

        if (!updated)
            return res.status(404).json({ message: "Goal Tidak Ditemukan"});
        res.json({
            message: "Goal berhasil Diupdate",
            data:updated
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message});
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

