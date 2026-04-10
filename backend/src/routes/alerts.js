const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');

// @route GET /api/alerts
router.get('/', protect, async (req, res) => {
  try {
    const { unread } = req.query;
    const query = { userId: req.user._id, isDismissed: false };
    if (unread === 'true') query.isRead = false;

    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Alert.countDocuments({ userId: req.user._id, isRead: false, isDismissed: false });
    res.json({ alerts, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/alerts/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { alertId: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/alerts/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/alerts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Alert.findOneAndUpdate({ alertId: req.params.id, userId: req.user._id }, { isDismissed: true });
    res.json({ message: 'Alert dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
