import Notification from '../models/Notification.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: { notifications }
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) return next(new AppError('Notification not found', 404));

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({ success: true, data: { notification } });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) return next(new AppError('Notification not found', 404));

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  await notification.deleteOne();

  res.status(200).json({ success: true, message: 'Notification deleted' });
});
