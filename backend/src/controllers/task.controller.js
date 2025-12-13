import taskService from "../service/task.service.js";

class TaskController {
  async createTask(req, res) {
    try {
      const {
        title,
        description,
        ticketId,
        priority,
        status,
        deadline,
        tags,
        estimatedHours,
        assignedTo,
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Task title is required" });
      }

      const task = await taskService.createTask({
        title,
        description,
        ticketId,
        priority,
        status,
        deadline,
        tags,
        estimatedHours,
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
      });


      return res
        .status(201)
        .json({ message: "Task created successfully", data: task });
    } catch (error) {
      console.error("Create task error:", error);
      return res
        .status(500)
        .json({ message: error.message || "Failed to create task" });
    }
  }

  async getTasks(req, res) {
    try {
      const {
        status,
        priority,
        assignedTo,
        createdBy,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        isDeleted = isDeleted === undefined ? "false" : isDeleted,
      } = req.query;

      const filters = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (createdBy) filters.createdBy = createdBy;

      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const result = await taskService.getTasks(filters, {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get tasks error:", error);
      return res
        .status(500)
        .json({ message: error.message || "Failed to fetch tasks" });
    }
  }

  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      return res.status(200).json({ data: task });
    } catch (error) {
      const statusCode = error.message === "Task not found" ? 404 : 500;
      return res
        .status(statusCode)
        .json({ message: error.message || "Failed to fetch task" });
    }
  }

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      delete updates._id;
      delete updates.createdBy;
      delete updates.isDeleted;

      const task = await taskService.updateTask(id, updates);


      return res
        .status(200)
        .json({ message: "Task updated successfully", data: task });
    } catch (error) {
      const statusCode = error.message === "Task not found" ? 404 : 500;
      return res
        .status(statusCode)
        .json({ message: error.message || "Failed to update task" });
    }
  }
  // Delete (soft delete) a task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const result = await taskService.deleteTask(id);
      return res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message === "Task not found" ? 404 : 500;
      return res
        .status(statusCode)
        .json({ message: error.message || "Failed to delete task" });
    }
  }
  // Assign task to a user
  async assignTask(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const task = await taskService.assignTask(id, userId);

      return res
        .status(200)
        .json({ message: "Task assigned successfully", data: task });
    } catch (error) {
      const statusCode = error.message === "Task not found" ? 404 : 500;
      return res
        .status(statusCode)
        .json({ message: error.message || "Failed to assign task" });
    }
  }
}

export default new TaskController();
