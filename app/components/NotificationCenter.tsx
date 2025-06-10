import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Linking, Pressable, ScrollView, RefreshControl, Alert } from 'react-native';
import { Bell, X, ExternalLink, Calendar, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { EventDetectionService } from '../utils/eventDetection';
import { supabase } from '../utils/supabase';
import { PushNotificationService } from '../utils/pushNotifications';
import { Ionicons } from '@expo/vector-icons';

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

interface RenoTimelineNotification {
  id: string;
  project_id?: string;
  project_name?: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: {
    task_name?: string;
    completion_percentage?: number;
    budget_impact?: number;
    timeline_impact?: string;
    suggested_action?: string;
    potential_savings?: number;
    material_type?: string;
    delivery_date?: string;
  };
  created_at: string;
  read_at?: string;
}

interface NotificationCenterProps {
  onNotificationPress?: (notification: Notification) => void;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<RenoTimelineNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time subscription dla nowych powiadomień
      const subscription = supabase
        .channel('renotimeline_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'cross_app_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as RenoTimelineNotification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Update badge count
            PushNotificationService.updateBadgeCount(unreadCount + 1);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cross_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_app', 'renotimeline')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read_at).length || 0;
      setUnreadCount(unread);
      
      // Update badge count
      await PushNotificationService.updateBadgeCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać powiadomień');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('cross_app_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      
      // Update badge count
      await PushNotificationService.updateBadgeCount(newUnreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      const ids = unreadNotifications.map(n => n.id);
      
      if (ids.length === 0) return;

      await supabase
        .from('cross_app_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids);

      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      await PushNotificationService.updateBadgeCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationAction = async (notification: RenoTimelineNotification) => {
    // Mark as read when action is taken
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      try {
        await Linking.openURL(notification.action_url);
      } catch (error) {
        console.error('Error opening action URL:', error);
        Alert.alert('Błąd', 'Nie udało się otworzyć linku');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress_update': return '✅';
      case 'budget_alert': return '💰';
      case 'milestone': return '🎯';
      case 'delay_warning': return '⚠️';
      case 'material_ready': return '📦';
      case 'cost_savings_opportunity': return '💡';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Teraz';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} godz. temu`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} dni temu`;
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  if (!user) return null;

  return (
    <>
      <Pressable
        className="relative p-2"
        onPress={() => setVisible(true)}
      >
        <Ionicons name="notifications" size={24} color="#666" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 flex items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Powiadomienia z RenoTimeline</Text>
            <View className="flex-row items-center space-x-2">
              {unreadCount > 0 && (
                <Pressable 
                  onPress={markAllAsRead}
                  className="px-3 py-1 bg-blue-100 rounded-full"
                >
                  <Text className="text-blue-600 text-sm font-medium">
                    Oznacz wszystkie
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading ? (
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500">Ładowanie...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View className="flex-1 justify-center items-center p-8">
                <Ionicons name="notifications-off" size={64} color="#ccc" />
                <Text className="text-gray-500 text-center mt-4">
                  Brak powiadomień z RenoTimeline
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Gdy Twoje projekty będą realizowane w RenoTimeline, tutaj pojawią się aktualizacje
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  className={`m-3 p-4 rounded-lg border ${getPriorityColor(notification.priority)} ${
                    !notification.read_at ? 'opacity-100' : 'opacity-70'
                  }`}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View className="flex-row items-start">
                    <Text className="text-2xl mr-3">
                      {getNotificationIcon(notification.notification_type)}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 mb-1">
                        {notification.title}
                      </Text>
                      <Text className="text-gray-600 mb-2">
                        {notification.message}
                      </Text>
                      {notification.project_name && (
                        <Text className="text-xs text-gray-500">
                          Projekt: {notification.project_name}
                        </Text>
                      )}
                      <Text className="text-xs text-gray-400">
                        {formatTimeAgo(notification.created_at)}
                      </Text>

                      {notification.metadata?.suggested_action && (
                        <View className="mt-3 p-2 bg-blue-50 rounded">
                          <Text className="text-sm text-blue-800">
                            💡 Sugerowane działanie: {notification.metadata.suggested_action}
                          </Text>
                        </View>
                      )}

                      {notification.metadata?.budget_impact && (
                        <View className="mt-2 p-2 bg-yellow-50 rounded">
                          <Text className="text-sm text-yellow-800">
                            💰 Wpływ na budżet: {notification.metadata.budget_impact > 0 ? '+' : ''}{notification.metadata.budget_impact} PLN
                          </Text>
                        </View>
                      )}

                      {notification.action_url && (
                        <Pressable 
                          className="mt-3 bg-blue-500 rounded px-3 py-2 self-start"
                          onPress={() => handleNotificationAction(notification)}
                        >
                          <Text className="text-white text-sm font-medium">
                            Zobacz w RenoTimeline
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    {!notification.read_at && (
                      <View className="w-3 h-3 bg-blue-500 rounded-full ml-2" />
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
} 