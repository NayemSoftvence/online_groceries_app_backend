// src/notifications/notifications.js
const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Sample notifications data (in production, this would be in a database)
let notifications = [
  {
    id: 1,
    title: "Welcome to FoodFlow! 🛒",
    message: "Thank you for joining FoodFlow. Start exploring fresh groceries now!",
    type: "welcome",
    isRead: false,
    createdAt: new Date('2024-10-20').toISOString(),
    priority: "high"
  },
  {
    id: 2,
    title: "Special Offer 🎉",
    message: "Get 20% off on your first order. Use code: WELCOME20",
    type: "promotion",
    isRead: false,
    createdAt: new Date('2024-10-21').toISOString(),
    priority: "medium"
  },
  {
    id: 3,
    title: "New Features Added ✨",
    message: "We've added express delivery and recipe suggestions. Check them out!",
    type: "update",
    isRead: true,
    createdAt: new Date('2024-10-19').toISOString(),
    priority: "low"
  },
  {
    id: 4,
    title: "Delivery Update 🚚",
    message: "Your order #12345 will arrive between 2-4 PM today.",
    type: "delivery",
    isRead: false,
    createdAt: new Date().toISOString(),
    priority: "high"
  },
  {
    id: 5,
    title: "Seasonal Fruits Available 🍓",
    message: "Fresh strawberries and mangoes are now in stock!",
    type: "product",
    isRead: false,
    createdAt: new Date('2024-10-18').toISOString(),
    priority: "medium"
  }
];

let nextNotificationId = 6;

// ==================== NOTIFICATION ROUTES ====================

// @route   GET /api/notifications
// @desc    Get all notifications for the user
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Sort by creation date (newest first) and priority
    const sortedNotifications = [...notifications].sort((a, b) => {
      // High priority first, then by date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: sortedNotifications,
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length
      }
    });

  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    });
  }
});

// @route   GET /api/notifications/unread
// @desc    Get only unread notifications
// @access  Private
router.get('/unread', authenticateToken, (req, res) => {
  try {
    const unreadNotifications = notifications
      .filter(notification => !notification.isRead)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      message: 'Unread notifications retrieved successfully',
      data: {
        notifications: unreadNotifications,
        count: unreadNotifications.length
      }
    });

  } catch (error) {
    console.error('Unread notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unread notifications'
    });
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.post('/mark-read', authenticateToken, (req, res) => {
  try {
    const { notificationIds } = req.body; // Array of notification IDs

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'Notification IDs array is required'
      });
    }

    let markedCount = 0;
    
    notificationIds.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        markedCount++;
      }
    });

    res.json({
      success: true,
      message: `${markedCount} notification(s) marked as read`,
      data: {
        markedCount,
        totalUnread: notifications.filter(n => !n.isRead).length
      }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

// @route   POST /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.post('/mark-all-read', authenticateToken, (req, res) => {
  try {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    notifications.forEach(notification => {
      notification.isRead = true;
    });

    res.json({
      success: true,
      message: `All ${unreadCount} notifications marked as read`,
      data: {
        markedCount: unreadCount
      }
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const read = total - unread;

    // Count by type
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    // Count by priority
    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Notification statistics retrieved',
      data: {
        total,
        unread,
        read,
        byType,
        byPriority
      }
    });

  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notification statistics'
    });
  }
});

module.exports = router;