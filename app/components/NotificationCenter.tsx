import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Linking } from 'react-native';
import { Bell, X, ExternalLink, Calendar, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { EventDetectionService } from '../utils/eventDetection';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  source_app: string;
  created_at: string;
  is_read: boolean;
  data?: any;
}

interface NotificationCenterProps {
  onNotificationPress?: (notification: Notification) => void;
}

export default function NotificationCenter({ onNotificationPress }: NotificationCenterProps) {
  const { user, isGuest } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isGuest && user?.id) {
      loadNotifications();
    }
  }, [user?.id, isGuest]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const notificationsData = await EventDetectionService.getRecentNotifications(user.id, 20);
      // Map the data to match our interface
      const mappedNotifications: Notification[] = notificationsData.map(item => ({
        id: item.id,
        title: item.title,
        message: item.message,
        notification_type: item.notification_type,
        source_app: item.source_app,
        created_at: item.created_at || new Date().toISOString(),
        is_read: item.is_read || false,
        data: item.data,
      }));
      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await EventDetectionService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle different types of notifications
    if (notification.data?.calcreno_link) {
      // Handle CalcReno deep link
      onNotificationPress?.(notification);
    } else if (notification.data?.renotimeline_suggestion === 'create_timeline') {
      // Open RenoTimeline for timeline creation
      Linking.openURL('https://renotimeline.app');
    }

    onNotificationPress?.(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_updated':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'project_milestone':
        return <CheckCircle size={20} color="#10B981" />;
      case 'cost_alert':
        return <AlertTriangle size={20} color="#EF4444" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'budget_updated':
        return '#F59E0B';
      case 'project_milestone':
        return '#10B981';
      case 'cost_alert':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min temu`;
    } else if (diffHours < 24) {
      return `${diffHours} godz. temu`;
    } else if (diffDays < 7) {
      return `${diffDays} dni temu`;
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={`p-4 border-b border-gray-600 ${!item.is_read ? 'bg-gray-700/50' : 'bg-transparent'}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="mr-3 mt-1">
          {getNotificationIcon(item.notification_type)}
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {item.title}
            </Text>
            {!item.is_read && (
              <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
            )}
          </View>
          
          <Text className="text-gray-300 text-sm mb-2" numberOfLines={2}>
            {item.message}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs">
              z {item.source_app === 'renotimeline' ? 'RenoTimeline' : 'CalcReno'}
            </Text>
            <Text className="text-gray-400 text-xs">
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Don't show for guest users
  if (isGuest || !user) {
    return null;
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="relative p-2"
      >
        <Bell size={24} color="#FFFFFF" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <LinearGradient
          colors={["#1E2139", "#2A2D4A"]}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 pt-12 border-b border-gray-600">
            <Text className="text-white text-xl font-bold">Powiadomienia</Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="p-2"
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Bell size={48} color="#6B7280" />
              <Text className="text-gray-400 text-lg mt-4">
                Brak powiadomień
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center mx-4">
                Tutaj pojawią się powiadomienia z RenoTimeline o postępach w Twoich projektach
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              refreshing={loading}
              onRefresh={loadNotifications}
              showsVerticalScrollIndicator={false}
            />
          )}
        </LinearGradient>
      </Modal>
    </>
  );
} 