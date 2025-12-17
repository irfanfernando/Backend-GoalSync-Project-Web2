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

    goal.actions.push({
      userId: req.user?.userId,
      note: `Added task "${newTask.title}"`,
    });

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

    // If task has subtasks, ignore manual toggle (derived from subtasks)
    if (task.subtasks && task.subtasks.length > 0) {
      return res.status(400).json({ 
        message: "Cannot toggle task with subtasks. Complete subtasks instead." 
      });
    }

    task.completed = !task.completed;
    goal.actions.push({
      userId: req.user?.userId,
      note: task.completed
        ? `Completed task "${task.title}"`
        : `Reopened task "${task.title}"`,
    });
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

// Add subtask to a task
export const addSubtask = async (req, res) => {
  try {
    const { goalId, taskId } = req.params;
    const { title, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newSubtask = {
      title: title.trim(),
      completed: false,
      assignedTo: assignedTo || null,
      createdAt: new Date(),
    };

    task.subtasks.push(newSubtask);

    // Activity log
    let activityNote = `Added subtask "${newSubtask.title}" to task "${task.title}"`;
    if (assignedTo) {
      const assignedUser = await goal.model('User').findById(assignedTo);
      if (assignedUser) {
        activityNote += ` and assigned to ${assignedUser.username}`;
      }
    }

    goal.actions.push({
      userId: req.user?.userId,
      note: activityNote,
    });

    await goal.save();

    res.status(201).json({
      message: "Subtask added",
      data: newSubtask,
    });
  } catch (err) {
    console.error("addSubtask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle subtask completion
export const toggleSubtask = async (req, res) => {
  try {
    const { goalId, taskId, subtaskId } = req.params;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.completed = !subtask.completed;

    // Update parent task completion based on subtasks
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    task.completed = completedSubtasks === task.subtasks.length;

    // Activity log
    goal.actions.push({
      userId: req.user?.userId,
      note: subtask.completed
        ? `completed subtask "${subtask.title}"`
        : `reopened subtask "${subtask.title}"`,
    });

    await goal.save();

    res.json({
      message: "Subtask updated",
      data: { task, subtask },
    });
  } catch (err) {
    console.error("toggleSubtask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update subtask assignment
export const assignSubtask = async (req, res) => {
  try {
    const { goalId, taskId, subtaskId } = req.params;
    const { assignedTo } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.assignedTo = assignedTo || null;

    // Activity log
    if (assignedTo) {
      const assignedUser = await goal.model('User').findById(assignedTo);
      if (assignedUser) {
        goal.actions.push({
          userId: req.user?.userId,
          note: `Assigned subtask "${subtask.title}" to ${assignedUser.username}`,
        });
      }
    } else {
      goal.actions.push({
        userId: req.user?.userId,
        note: `Unassigned subtask "${subtask.title}"`,
      });
    }

    await goal.save();

    res.json({
      message: "Subtask assignment updated",
      data: subtask,
    });
  } catch (err) {
    console.error("assignSubtask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit task title
export const editTask = async (req, res) => {
  try {
    const { goalId, taskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldTitle = task.title;
    task.title = title.trim();

    // Activity log
    goal.actions.push({
      userId: req.user?.userId,
      note: `edited task "${oldTitle}"`,
    });

    await goal.save();

    res.json({
      message: "Task updated",
      data: task,
    });
  } catch (err) {
    console.error("editTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit subtask title
export const editSubtask = async (req, res) => {
  try {
    const { goalId, taskId, subtaskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    const oldTitle = subtask.title;
    subtask.title = title.trim();

    // Activity log
    goal.actions.push({
      userId: req.user?.userId,
      note: `edited subtask "${oldTitle}"`,
    });

    await goal.save();

    res.json({
      message: "Subtask updated",
      data: subtask,
    });
  } catch (err) {
    console.error("editSubtask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
