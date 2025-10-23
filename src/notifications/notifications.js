const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { dbAll, dbRun } = require('../config/database');
const router = express.Router();

// Get all notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await dbAll(`
      SELECT * FROM notifications 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at DESC
    `);

    const unreadCount = await dbAll('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    
    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        total: notifications.length,
        unread: unreadCount[0].count
      }
    });

  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get unread notifications
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const notifications = await dbAll(`
      SELECT * FROM notifications 
      WHERE is_read = 0 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      message: 'Unread notifications retrieved successfully',
      data: {
        notifications,
        count: notifications.length
      }
    });

  } catch (error) {
    console.error('Unread notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark notifications as read
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'Notification IDs array is required'
      });
    }

    // Convert array to SQL placeholders
    const placeholders = notificationIds.map(() => '?').join(',');
    
    await dbRun(
      `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`,
      notificationIds
    );

    const unreadCount = await dbAll('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');

    res.json({
      success: true,
      message: `${notificationIds.length} notification(s) marked as read`,
      data: {
        markedCount: notificationIds.length,
        totalUnread: unreadCount[0].count
      }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;