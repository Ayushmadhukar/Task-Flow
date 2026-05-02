const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
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
    body('name').trim().notEmpty().withMessage('Project name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
    body('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status'),
    body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      const project = await Project.create({
        ...req.body,
        createdBy: req.user._id,
      });
      res.status(201).json({ message: 'Project created', project });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });


    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'done').length;
        return {
          ...project.toObject(),
          taskStats: { total, done, progress: total ? Math.round((done / total) * 100) : 0 },
        };
      })
    );

    res.json({ projects: projectsWithStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
    body('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status'),
    body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req, res) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      res.json({ message: 'Project updated', project });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete associated tasks
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
