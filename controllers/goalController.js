import Goal from "../models/goalModels.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

const calculateProgress = (tasks = []) => {
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.completed).length;
  return Math.round((done / tasks.length) * 100);
};


export const listGoals = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const filter = {
      $or: [
        { createdBy: userId },
        { "members.userId": userId },
      ],
    };

    const docs = await Goal.find(filter).lean().exec();

    const results = docs.map(goal => ({
      ...goal,
      progress: calculateProgress(goal.tasks),
    }));

    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const addGoal = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title)
      return res.status(400).json({ message: "Title wajib diisi" });

    const newGoal = await Goal.create({
      title,
      description,
      createdBy: req.user.userId,
      tasks: [],
      members: [],
    });

    res.status(201).json({
      message: "Goal berhasil dibuat",
      data: newGoal,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const detailGoal = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID tidak valid" });

    const doc = await Goal.findById(id)
      .populate("createdBy", "username avatar email")
      .populate("members.userId", "username avatar")
      .populate("actions.userId", "username avatar")
      .populate("tasks.subtasks.assignedTo", "username avatar")
      .lean()
      .exec();

    if (!doc)
      return res.status(404).json({ message: "Goal tidak ditemukan" });

    res.json({
      data: {
        ...doc,
        progress: calculateProgress(doc.tasks),
        isOwner: doc.createdBy._id.toString() === req.user.userId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    // Get user info for activity log
    const user = await User.findById(req.user.userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await Goal.findOneAndUpdate(
      { _id: id, createdBy: req.user.userId },
      { 
        title, 
        description,
        $push: {
          actions: {
            note: `${user.username} edited the goal title`,
            userId: req.user.userId
          }
        }
      },
      { new: true }
    ).lean();

    if (!updated)
      return res.status(404).json({ message: "Goal not found" });

    res.json({
      message: "Goal updated",
      data: {
        ...updated,
        progress: calculateProgress(updated.tasks),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
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

// Tambahan controller untuk mengupdate Timeline (Fitur Baru)
export const updateTimeline = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Get user info for activity log
    const user = await User.findById(req.user.userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { 
        startDate: startDate || null, 
        endDate: endDate || null,
        $push: {
          actions: {
            note: `${user.username} updated the project timeline`,
            userId: req.user.userId
          }
        }
      },
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    res.json({
      message: "Timeline updated",
      data: goal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


