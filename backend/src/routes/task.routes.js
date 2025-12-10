import express from 'express';
import taskController from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', taskController.createTask.bind(taskController));
router.get('/', taskController.getTasks.bind(taskController));
router.get('/:id', taskController.getTaskById.bind(taskController));
router.put('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

router.post(
  '/:id/assign',
  authorize(['admin', 'manager']),
  taskController.assignTask.bind(taskController)
);

export default router;