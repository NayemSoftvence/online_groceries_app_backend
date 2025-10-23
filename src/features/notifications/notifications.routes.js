const express = require('express');
const notificationsController = require('./notifications.controller');
const { authenticate } = require('../../middleware/authMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/:id/read', notificationsController.markAsRead);
router.patch('/mark-all-read', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;