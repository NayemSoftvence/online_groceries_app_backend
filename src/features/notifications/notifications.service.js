const Notification = require('./notifications.model');

class NotificationsService {
  async createNotification(notificationData) {
    const notification = await Notification.create(notificationData);
    return notification;
  }

  async getUserNotifications(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
      raw: true
    });

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async markAsRead(notificationId, userId) {
    const [affectedCount] = await Notification.update(
      { isRead: true },
      { 
        where: { 
          id: notificationId, 
          userId 
        } 
      }
    );

    if (affectedCount === 0) {
      throw new Error('Notification not found');
    }

    return await Notification.findByPk(notificationId);
  }

  async markAllAsRead(userId) {
    const [affectedCount] = await Notification.update(
      { isRead: true },
      { 
        where: { 
          userId, 
          isRead: false 
        } 
      }
    );

    return { updatedCount: affectedCount };
  }

  async getUnreadCount(userId) {
    const count = await Notification.count({ 
      where: { 
        userId, 
        isRead: false 
      } 
    });
    
    return count;
  }

  async deleteNotification(notificationId, userId) {
    const affectedCount = await Notification.destroy({
      where: {
        id: notificationId,
        userId
      }
    });

    if (affectedCount === 0) {
      throw new Error('Notification not found');
    }

    return { deletedCount: affectedCount };
  }
}

module.exports = new NotificationsService();