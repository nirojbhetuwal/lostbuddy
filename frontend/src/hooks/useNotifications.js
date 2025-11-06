import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString()
      });

      const response = await api.get(`/notifications?${params}`);
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast.success('Notification marked as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date()
          }))
        );
        
        // Reset unread count
        setUnreadCount(0);
        
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        // Remove from local state
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        
        // Update unread count if notification was unread
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success('Notification deleted');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  // Get notification type icon and color
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case 'match_found':
        return {
          icon: '🔍',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'new_claim':
        return {
          icon: '🏷️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'claim_approved':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'claim_rejected':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'item_status_update':
        return {
          icon: '📦',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      case 'system':
        return {
          icon: '⚙️',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      default:
        return {
          icon: '🔔',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  // Get notification action text
  const getNotificationAction = (type) => {
    switch (type) {
      case 'match_found':
        return 'View Matches';
      case 'new_claim':
        return 'Review Claims';
      case 'claim_approved':
        return 'Contact Owner';
      case 'claim_rejected':
        return 'View Details';
      case 'item_status_update':
        return 'View Item';
      default:
        return 'View Details';
    }
  };

  // Get notification route
  const getNotificationRoute = (notification) => {
    switch (notification.type) {
      case 'match_found':
        return '/dashboard';
      case 'new_claim':
        return '/manage-claims';
      case 'claim_approved':
      case 'claim_rejected':
        return '/my-claims';
      case 'item_status_update':
        return notification.relatedItem ? `/item/${notification.relatedItem}` : '/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Poll for new notifications (for real-time updates)
  const startPolling = useCallback((interval = 30000) => {
    const poll = () => {
      fetchUnreadCount();
    };

    const intervalId = setInterval(poll, interval);
    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationTypeInfo,
    getNotificationAction,
    getNotificationRoute,
    startPolling
  };
};

export default useNotifications;