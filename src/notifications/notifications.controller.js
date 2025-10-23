const notificationsService = require('./notifications.service');
const { asyncHandler } = require('../../utils/asyncHandler');

const notificationsController = {
  getNotifications: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const result = await notificationsService.getUserNotifications(
      userId, 
      parseInt(page), 
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  createNotification: asyncHandler(async (req, res) => {
    const notificationData = {
      ...req.body,
      userId: req.user.id
    };

    const notification = await notificationsService.createNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationsService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  }),

  markAllAsRead: asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await notificationsService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  }),

  getUnreadCount: asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const count = await notificationsService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  }),

  deleteNotification: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationsService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  })
};

module.exports = notificationsController;