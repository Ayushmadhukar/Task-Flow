const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();


router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('name email createdAt').sort({ createdAt: -1 });
    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
