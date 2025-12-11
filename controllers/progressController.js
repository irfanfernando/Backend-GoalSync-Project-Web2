
import Goal from "../models/goalModels.js";
import mongoose from "mongoose";

export const updateProgress = async (req, res) => {
    try {
        console.log("[updateProgress] params:", req.params, "body:", req.body, "user:", req.user);
        const {id} = req.params;
        const { delta: rawDelta, note } = req.body;
        const isAbsolute = Boolean(req.body.isAbsolute);

        
        
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Id Goal Tidak valid"});
        }

        const numericDelta = Number(rawDelta);
            if (Number.isNaN(numericDelta)) {
            return res.status(400).json({ message: "Delta harus berupa angka" });
        }

        const goal = await Goal.findById(id).exec();
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // permission: cuma owner atau member yang boleh update
    const actorId = req.user?.userId;
    if (!actorId) return res.status(401).json({ message: "Unauthorized" });

    const isOwner = String(goal.createdBy) === String(actorId);
    const isMember = (goal.members || []).some((m) => String(m.userId) === String(actorId));
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: hanya owner atau member yang boleh mengupdate progress" });
    }

    // current & target
    const current = Number(goal.currentValue ?? 0);
    const target = Number(goal.targetValue ?? 100); // fallback target 100

    // hitung newCurrentValue:
    let newCurrentValue;
    if (isAbsolute) {
      // treat numericDelta as the absolute desired value
      newCurrentValue = numericDelta;
    } else {
      // treat numericDelta as delta to add (delta can be negative)
      newCurrentValue = current + numericDelta;
    }

    // clamp antara 0 .. target (atau 100)
    const maxVal = Number.isFinite(target) && target > 0 ? target : 100;
    if (newCurrentValue < 0) newCurrentValue = 0;
    if (newCurrentValue > maxVal) newCurrentValue = maxVal;

    // update goal: simpan action dan update currentValue
    const actionEntry = {
      userId: actorId,
      note: note ?? "",
      value: numericDelta,
      createdAt: new Date(),
      resultingValue: newCurrentValue,
    };

    // push ke actions (atau action) sesuai schema
    if (!Array.isArray(goal.actions) && Array.isArray(goal.action)) {
      // fallback jika schema field beda nama
      goal.action.push(actionEntry);
    } else {
      goal.actions = goal.actions ?? goal.action ?? [];
      goal.actions.push(actionEntry);
    }

    goal.currentValue = newCurrentValue;

    try {
      await goal.save();
    } catch (saveErr) {
      console.error("[updateProgress] save error:", saveErr);
      return res.status(500).json({ message: "Gagal menyimpan progress", error: saveErr.message });
    }

    // return fresh document (lean)
    const updated = await Goal.findById(id)
      .populate("actions.userId", "username avatar")
      .populate("members.userId", "username avatar")
      .lean()
      .exec();

    return res.json({ message: "Progress updated", data: updated });
    }catch(err) {
        console.error("[updateProgress] ERROR:", err);
        return res.status(500).json({message : " Server error", error: err.message});

    }
};

       