import Goal from "../models/goalModels.js";

//add new task checklist
export const addTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const newTask = {
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };

    goal.tasks.push(newTask);
    await goal.save();

    res.status(201).json({
      message: "Task added",
      data: newTask,
    });
  } catch (err) {
    console.error("addTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//task toggle completed
export const toggleTask = async (req, res) => {
  try {
    const { goalId, taskId } = req.params;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await goal.save();

    res.json({
      message: "Task updated",
      data: task,
    });
  } catch (err) {
    console.error("toggleTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
