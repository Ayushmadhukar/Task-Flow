const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return null;
};


router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 2, max: 150 }).withMessage('Title must be 2-150 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
    body('project').notEmpty().withMessage('Project is required').isMongoId().withMessage('Invalid project ID'),
    body('assignedTo').notEmpty().withMessage('Assignee is required').isMongoId().withMessage('Invalid user ID'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      // Validate project exists
      const project = await Project.findById(req.body.project);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      // Validate assignee exists and is a member
      const assignee = await User.findById(req.body.assignedTo);
      if (!assignee) return res.status(404).json({ message: 'Assignee not found' });

      const task = await Task.create(req.body);
      await task.populate(['project', { path: 'assignedTo', select: 'name email role' }]);

      res.status(201).json({ message: 'Task created', task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/my', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name status deadline')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only view their own tasks
    if (req.user.role === 'member' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Title must be 2-150 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
    body('project').optional().isMongoId().withMessage('Invalid project ID'),
    body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate('project', 'name status')
        .populate('assignedTo', 'name email');

      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task updated', task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.patch(
  '/:id/status',
  protect,
  [body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')],
  async (req, res) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      
      if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }

      task.status = req.body.status;
      await task.save();

      await task.populate(['project', { path: 'assignedTo', select: 'name email' }]);
      res.json({ message: 'Status updated', task });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
