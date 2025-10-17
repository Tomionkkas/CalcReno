import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Linking, Pressable, ScrollView, RefreshControl, Alert, Dimensions, Platform } from 'react-native';
import { Bell, X, ExternalLink, Calendar, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { EventDetectionService } from '../utils/eventDetection';
import { supabase, sharedSupabase } from '../utils/supabase';
import { PushNotificationService } from '../utils/pushNotifications';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, typography, spacing, borderRadius, shadows, animations } from '../utils/theme';
import { useAccessibility } from '../hooks/useAccessibility';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;
const isShortScreen = screenHeight < 700;
const isLargeScreen = screenWidth > 500;

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
  user_id: string | null;
  project_id: string;
  calcreno_project_id: string | null;
  source_app: string;
  target_app: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  data: any; // JSON data containing project_name, action_url, etc.
  is_read: boolean | null;
  expires_at: string | null;
  created_at: string | null;
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
  const { getAccessibilityProps } = useAccessibility();

  useEffect(() => {
    fetchNotifications();

    if (user) {
      // Create a unique channel name for this user session
      const channelName = `user_notifications_${user.id}`;
      
      // Real-time subscription for new notifications
      const subscription = sharedSupabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'shared_schema',
            table: 'cross_app_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time notification received:', payload);
            const newNotification = payload.new as RenoTimelineNotification;
            
            // Only add if it's from renotimeline to calcreno and unread
            if (newNotification.from_app === 'renotimeline' && newNotification.to_app === 'calcreno' && !newNotification.is_read) {
              console.log('Adding new notification to state');
              setNotifications(prev => {
                // Avoid duplicates
                const exists = prev.some(n => n.id === newNotification.id);
                if (exists) return prev;
                return [newNotification, ...prev];
              });
              setUnreadCount(prev => {
                const newCount = prev + 1;
                // Update badge count with new count
                PushNotificationService.updateBadgeCount(newCount);
                // Send local push notification
                PushNotificationService.sendLocalNotification(newNotification);
                return newCount;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'shared_schema',
            table: 'cross_app_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time notification updated:', payload);
            const updatedNotification = payload.new as RenoTimelineNotification;
            
            // If notification was marked as read, remove it from display
            if (updatedNotification.is_read) {
              setNotifications(prev => prev.filter(n => n.id !== updatedNotification.id));
              setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
              // Update existing notification if it's still unread
              setNotifications(prev => 
                prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      // Fallback: Polling every 30 seconds as backup (reduced frequency)
      const pollingInterval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('cross_app_notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('source_app', 'renotimeline')
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(50);

          if (!error && data) {
            setNotifications(prev => {
              // Only update if there's actually new data
              const prevIds = new Set(prev.map(n => n.id));
              const newNotifications = data.filter(n => !prevIds.has(n.id));
              
              if (newNotifications.length > 0) {
                const combined = [...newNotifications, ...prev];
                const unread = combined.filter(n => !n.is_read).length;
                setUnreadCount(unread);
                PushNotificationService.updateBadgeCount(unread);
                return combined;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error polling notifications:', error);
        }
      }, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(pollingInterval);
      };
    }
  }, [user]);

  // Clear system notifications when modal is opened
  useEffect(() => {
    if (visible && user) {
      PushNotificationService.clearRenoTimelineNotifications();
    }
  }, [visible, user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await sharedSupabase
        .from('cross_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('from_app', 'renotimeline')
        .eq('to_app', 'calcreno')
        .eq('is_read', false)  // Only fetch unread notifications
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      setNotifications(data || []);
      const unread = data?.length || 0;  // All fetched notifications are unread
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
      await sharedSupabase
        .from('cross_app_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      // Remove the notification from display since we only show unread ones
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
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
      await sharedSupabase
        .from('cross_app_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('from_app', 'renotimeline')
        .eq('to_app', 'calcreno')
        .eq('is_read', false);

      setNotifications([]);
      setUnreadCount(0);
      
      // Update badge count
      await PushNotificationService.updateBadgeCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationAction = async (notification: RenoTimelineNotification) => {
    // Mark as read when action is taken
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const actionUrl = notification.data?.action_url;
    if (actionUrl) {
      try {
        await Linking.openURL(actionUrl);
      } catch (error) {
        console.error('Error opening action URL:', error);
        Alert.alert('Błąd', 'Nie udało się otworzyć linku');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress_update': return 'checkmark-circle';
      case 'budget_alert': return 'card';
      case 'milestone': return 'flag';
      case 'delay_warning': return 'warning';
      case 'material_ready': return 'cube';
      case 'cost_savings_opportunity': return 'bulb';
      default: return 'notifications';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'progress_update': return colors.status.success.start;
      case 'budget_alert': return colors.status.warning.start;
      case 'milestone': return colors.accent.purple;
      case 'delay_warning': return colors.status.error.start;
      case 'material_ready': return colors.primary.start;
      case 'cost_savings_opportunity': return colors.accent.pink;
      default: return colors.text.muted;
    }
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'high': return { color: colors.status.error.start, label: 'Wysoki' };
      case 'medium': return { color: colors.status.warning.start, label: 'Średni' };
      case 'low': return { color: colors.status.success.start, label: 'Niski' };
      default: return { color: colors.text.muted, label: 'Normalny' };
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Nieznana data';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Przed chwilą';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} godz. temu`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} dni temu`;
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  // Responsive styling values using theme constants
  const responsiveStyles = {
    headerPadding: isSmallScreen ? spacing.sm : isLargeScreen ? spacing.lg : spacing.md,
    notificationMargin: isSmallScreen ? spacing.xs : isLargeScreen ? spacing.md : spacing.sm,
    notificationPadding: isSmallScreen ? spacing.sm : isLargeScreen ? spacing.lg : spacing.md,
    iconSize: isSmallScreen ? 16 : isLargeScreen ? 24 : 20,
    headerIconSize: isSmallScreen ? 20 : isLargeScreen ? 28 : 24,
    titleFontSize: isSmallScreen ? typography.sizes.lg : isLargeScreen ? typography.sizes.xl + 2 : typography.sizes.xl,
    bodyFontSize: isSmallScreen ? typography.sizes.sm : isLargeScreen ? typography.sizes.lg : typography.sizes.base,
    smallFontSize: isSmallScreen ? typography.sizes.xs : isLargeScreen ? typography.sizes.base : typography.sizes.sm,
    buttonPadding: isSmallScreen ? spacing.xs : isLargeScreen ? spacing.md : spacing.sm,
    emptyStatePadding: isSmallScreen ? spacing.lg : isLargeScreen ? spacing.xl + 8 : spacing.xl,
    emptyStateIconSize: isSmallScreen ? 40 : isLargeScreen ? 56 : 48,
    maxCardWidth: isLargeScreen ? 600 : screenWidth - (spacing.md * 2),
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell - Premium Glassmorphic Design */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: colors.glass.background,
          borderWidth: 1,
          borderColor: colors.glass.border,
          borderRadius: borderRadius.md,
          padding: spacing.xs,
          position: 'relative',
          minHeight: 44,
          minWidth: 44,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadows.md,
        }}
        activeOpacity={0.7}
        {...getAccessibilityProps(
          `Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytane)` : ''}`,
          'Otwórz centrum powiadomień'
        )}
      >
        <Bell size={16} color={colors.text.secondary} />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: colors.status.error.start,
            borderRadius: borderRadius.sm,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.background.primary,
            shadowColor: colors.status.error.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
            elevation: 4,
          }}>
            <Text style={{
              color: colors.text.inverse,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              fontFamily: typography.fonts.primary,
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification Modal - full responsive design */}
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={gradients.background.colors}
            start={gradients.background.start}
            end={gradients.background.end}
            style={{ flex: 1 }}
          >
            {/* Header with Glassmorphic Design */}
            <LinearGradient
              colors={gradients.background.colors}
              start={gradients.background.start}
              end={gradients.background.end}
              style={{
                paddingHorizontal: responsiveStyles.headerPadding,
                paddingVertical: isShortScreen ? spacing.md : spacing.lg,
                paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.background.card,
                minHeight: 110,
                justifyContent: 'center',
              }}
            >
              {/* Main Header Content */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Left Section - Title with Icon */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  flex: 1,
                  marginRight: spacing.sm,
                }}>
                  <View style={{
                    backgroundColor: colors.primary.start + '20',
                    borderRadius: borderRadius.md,
                    padding: spacing.xs,
                    marginRight: spacing.sm,
                    borderWidth: 1,
                    borderColor: colors.primary.start + '30',
                  }}>
                    <Ionicons 
                      name="notifications" 
                      size={responsiveStyles.headerIconSize} 
                      color={colors.primary.start} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: colors.text.primary,
                      fontSize: responsiveStyles.titleFontSize,
                      fontWeight: typography.weights.bold,
                      fontFamily: typography.fonts.primary,
                    }} numberOfLines={1}>
                      Powiadomienia
                    </Text>
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: responsiveStyles.smallFontSize,
                      fontFamily: typography.fonts.primary,
                      marginTop: spacing.xs / 2,
                    }}>
                      {unreadCount > 0 ? `${unreadCount} nieprzeczytane` : 'Wszystkie przeczytane'}
                    </Text>
                  </View>
                </View>

                {/* Right Section - Action Buttons */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <Pressable 
                      onPress={markAllAsRead}
                      style={{
                        backgroundColor: colors.glass.background,
                        borderWidth: 1,
                        borderColor: colors.glass.border,
                        borderRadius: borderRadius.md,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        marginRight: spacing.sm,
                        ...shadows.md,
                      }}
                    >
                      <Text style={{
                        color: colors.text.secondary,
                        fontSize: responsiveStyles.smallFontSize,
                        fontWeight: typography.weights.medium,
                        fontFamily: typography.fonts.primary,
                      }}>
                        {isSmallScreen ? 'Oznacz' : 'Oznacz wszystkie'}
                      </Text>
                    </Pressable>
                  )}
                  
                  <Pressable 
                    onPress={fetchNotifications}
                    style={{
                      backgroundColor: colors.glass.background,
                      borderWidth: 1,
                      borderColor: colors.glass.border,
                      borderRadius: borderRadius.md,
                      padding: responsiveStyles.buttonPadding,
                      marginRight: spacing.sm,
                      ...shadows.md,
                    }}
                  >
                    <Ionicons name="refresh" size={responsiveStyles.iconSize} color={colors.text.secondary} />
                  </Pressable>
                  
                  <Pressable
                    onPress={() => setVisible(false)}
                    style={{
                      backgroundColor: colors.glass.background,
                      borderWidth: 1,
                      borderColor: colors.glass.border,
                      borderRadius: borderRadius.md,
                      padding: responsiveStyles.buttonPadding,
                      ...shadows.md,
                    }}
                  >
                    <Ionicons name="close" size={responsiveStyles.iconSize} color={colors.text.secondary} />
                  </Pressable>
                </View>
              </View>
              
              {/* Source indicator with enhanced styling */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: spacing.sm,
                paddingHorizontal: spacing.xs,
              }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.status.info.start,
                  marginRight: spacing.xs,
                }} />
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: responsiveStyles.smallFontSize,
                  fontFamily: typography.fonts.primary,
                  opacity: 0.8,
                }}>
                  Z aplikacji RenoTimeline
                </Text>
              </View>
            </LinearGradient>

            {/* Notifications List with responsive ScrollView */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                paddingBottom: isSmallScreen ? spacing.xl : isLargeScreen ? spacing.xl + 8 : spacing.xl + 2,
                paddingTop: spacing.sm,
                minHeight: isShortScreen ? '100%' : undefined,
                alignItems: isLargeScreen ? 'center' : 'stretch',
              }}
              showsVerticalScrollIndicator={false}
              contentInsetAdjustmentBehavior="automatic"
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  tintColor={colors.primary.start}
                  colors={[colors.primary.start]}
                />
              }
            >
              {loading ? (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: isShortScreen ? spacing.xl : spacing.xl + 4,
                  minHeight: screenHeight * 0.4,
                }}>
                  <Ionicons name="reload" size={responsiveStyles.emptyStateIconSize * 0.7} color={colors.text.muted} />
                  <Text style={{
                    color: colors.text.muted,
                    marginTop: spacing.sm,
                    fontSize: responsiveStyles.bodyFontSize,
                    fontFamily: typography.fonts.primary,
                  }}>
                    Ładowanie powiadomień...
                  </Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: isShortScreen ? spacing.xl : spacing.xl + 4,
                  paddingHorizontal: responsiveStyles.headerPadding + spacing.md,
                  minHeight: screenHeight * 0.4,
                }}>
                  <View style={{
                    backgroundColor: colors.background.tertiary,
                    borderRadius: borderRadius.lg,
                    padding: responsiveStyles.emptyStatePadding,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.background.card,
                    maxWidth: responsiveStyles.maxCardWidth,
                  }}>
                    <Ionicons name="notifications-off" size={responsiveStyles.emptyStateIconSize} color={colors.text.muted} />
                    <Text style={{
                      color: colors.text.tertiary,
                      fontSize: responsiveStyles.titleFontSize - 2,
                      fontWeight: typography.weights.semibold,
                      fontFamily: typography.fonts.primary,
                      textAlign: 'center',
                      marginTop: spacing.md,
                    }}>
                      Brak powiadomień
                    </Text>
                    <Text style={{
                      color: colors.text.muted,
                      fontSize: responsiveStyles.bodyFontSize,
                      fontFamily: typography.fonts.primary,
                      textAlign: 'center',
                      marginTop: spacing.sm,
                      lineHeight: 20,
                    }}>
                      Gdy Twoje projekty będą realizowane w RenoTimeline, tutaj pojawią się aktualizacje postępów
                    </Text>
                  </View>
                </View>
              ) : (
                notifications.map((notification) => {
                  const priority = getPriorityIndicator(notification.priority);
                  const iconName = getNotificationIcon(notification.notification_type);
                  const iconColor = getNotificationIconColor(notification.notification_type);
                  const projectName = notification.data?.project_name;
                  const suggestedAction = notification.data?.metadata?.suggested_action;
                  const budgetImpact = notification.data?.metadata?.budget_impact;
                  const actionUrl = notification.data?.action_url;
                  
                  return (
                    <View
                      key={notification.id}
                      style={{
                        marginHorizontal: responsiveStyles.notificationMargin,
                        marginVertical: responsiveStyles.notificationMargin / 2,
                        maxWidth: responsiveStyles.maxCardWidth,
                        alignSelf: isLargeScreen ? 'center' : 'stretch',
                      }}
                    >
                      <LinearGradient
                        colors={gradients.card.colors}
                        start={gradients.card.start}
                        end={gradients.card.end}
                        style={{
                          borderRadius: borderRadius.lg,
                          overflow: 'hidden',
                          ...shadows.lg,
                        }}
                      >
                        <Pressable
                          onPress={() => markAsRead(notification.id)}
                          style={{
                            padding: responsiveStyles.notificationPadding,
                            opacity: notification.is_read ? 0.7 : 1,
                            borderWidth: 1,
                            borderColor: notification.is_read ? colors.background.card : colors.primary.start,
                            borderRadius: borderRadius.lg,
                          }}
                        >
                                              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          {/* Icon - responsive sizing with enhanced styling */}
                          <View style={{
                            width: isSmallScreen ? 36 : 40,
                            height: isSmallScreen ? 36 : 40,
                            borderRadius: isSmallScreen ? 18 : 20,
                            backgroundColor: `${iconColor}15`,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: isSmallScreen ? spacing.sm : spacing.sm,
                            borderWidth: 1,
                            borderColor: `${iconColor}25`,
                            shadowColor: iconColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                          }}>
                            <Ionicons name={iconName as any} size={responsiveStyles.iconSize} color={iconColor} />
                          </View>
                        
                                                  {/* Content - responsive layout */}
                          <View style={{ flex: 1 }}>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              marginBottom: spacing.xs,
                            }}>
                              <Text style={{
                                color: colors.text.primary,
                                fontSize: responsiveStyles.bodyFontSize + 1,
                                fontWeight: typography.weights.semibold,
                                fontFamily: typography.fonts.primary,
                                flex: 1,
                                marginRight: spacing.sm,
                              }} numberOfLines={isSmallScreen ? 2 : 3}>
                                {notification.title}
                              </Text>
                              {!notification.is_read && (
                                <View style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: colors.primary.start,
                                  marginTop: 2,
                                  shadowColor: colors.primary.glow,
                                  shadowOffset: { width: 0, height: 0 },
                                  shadowOpacity: 0.6,
                                  shadowRadius: 3,
                                  elevation: 3,
                                }} />
                              )}
                            </View>
                          
                          <Text style={{
                            color: colors.text.tertiary,
                            fontSize: responsiveStyles.bodyFontSize,
                            lineHeight: responsiveStyles.bodyFontSize + 6,
                            marginBottom: spacing.sm,
                            fontFamily: typography.fonts.primary,
                          }} numberOfLines={isSmallScreen ? 3 : 4}>
                            {notification.message}
                          </Text>
                          
                          {/* Project name - responsive with enhanced styling */}
                          {projectName && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: spacing.xs,
                              backgroundColor: colors.background.card + '40',
                              borderRadius: borderRadius.sm,
                              paddingHorizontal: spacing.xs,
                              paddingVertical: spacing.xs / 2,
                              alignSelf: 'flex-start',
                            }}>
                              <Ionicons name="folder" size={responsiveStyles.smallFontSize} color={colors.text.muted} />
                              <Text style={{
                                color: colors.text.muted,
                                fontSize: responsiveStyles.smallFontSize,
                                fontFamily: typography.fonts.primary,
                                marginLeft: spacing.xs,
                                fontWeight: typography.weights.medium,
                              }} numberOfLines={1}>
                                {projectName}
                              </Text>
                            </View>
                          )}
                          
                          {/* Time and priority - responsive layout */}
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: spacing.sm,
                            flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
                          }}>
                            <Text style={{
                              color: colors.text.muted,
                              fontSize: responsiveStyles.smallFontSize,
                              fontFamily: typography.fonts.primary,
                            }}>
                              {formatTimeAgo(notification.created_at)}
                            </Text>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: isSmallScreen ? 0 : spacing.sm,
                              marginTop: isSmallScreen ? spacing.xs : 0,
                              backgroundColor: priority.color + '20',
                              borderRadius: borderRadius.sm,
                              paddingHorizontal: spacing.xs,
                              paddingVertical: spacing.xs / 2,
                            }}>
                              <View style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: priority.color,
                                marginRight: spacing.xs,
                                shadowColor: priority.color,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.4,
                                shadowRadius: 2,
                                elevation: 2,
                              }} />
                              <Text style={{
                                color: priority.color,
                                fontSize: responsiveStyles.smallFontSize - 1,
                                fontFamily: typography.fonts.primary,
                                fontWeight: typography.weights.medium,
                              }}>
                                {priority.label}
                              </Text>
                            </View>
                          </View>

                          {/* Metadata sections - responsive */}
                          {suggestedAction && (
                            <View style={{
                              backgroundColor: colors.background.card,
                              borderRadius: borderRadius.sm,
                              padding: isSmallScreen ? spacing.sm : spacing.sm + 2,
                              marginBottom: spacing.sm,
                              borderWidth: 1,
                              borderColor: colors.status.warning.start + '30',
                              shadowColor: colors.status.warning.start,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: 2,
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: spacing.xs,
                              }}>
                                <Ionicons name="bulb" size={responsiveStyles.bodyFontSize} color={colors.status.warning.start} />
                                <Text style={{
                                  color: colors.status.warning.start,
                                  fontSize: responsiveStyles.smallFontSize,
                                  fontWeight: typography.weights.semibold,
                                  fontFamily: typography.fonts.primary,
                                  marginLeft: spacing.xs,
                                }}>
                                  Sugerowane działanie
                                </Text>
                              </View>
                              <Text style={{
                                color: colors.text.tertiary,
                                fontSize: responsiveStyles.smallFontSize,
                                lineHeight: responsiveStyles.smallFontSize + 4,
                                fontFamily: typography.fonts.primary,
                              }}>
                                {suggestedAction}
                              </Text>
                            </View>
                          )}

                          {budgetImpact && (
                            <View style={{
                              backgroundColor: budgetImpact > 0 ? colors.status.error.start + '20' : colors.status.success.start + '20',
                              borderRadius: borderRadius.sm,
                              padding: isSmallScreen ? spacing.sm : spacing.sm + 2,
                              marginBottom: spacing.sm,
                              borderWidth: 1,
                              borderColor: budgetImpact > 0 ? colors.status.error.start + '40' : colors.status.success.start + '40',
                              shadowColor: budgetImpact > 0 ? colors.status.error.start : colors.status.success.start,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: 2,
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: spacing.xs,
                              }}>
                                <Ionicons 
                                  name={budgetImpact > 0 ? "trending-up" : "trending-down"} 
                                  size={responsiveStyles.bodyFontSize} 
                                  color={budgetImpact > 0 ? colors.status.error.glow : colors.status.success.glow} 
                                />
                                <Text style={{
                                  color: budgetImpact > 0 ? colors.status.error.glow : colors.status.success.glow,
                                  fontSize: responsiveStyles.smallFontSize,
                                  fontWeight: typography.weights.semibold,
                                  fontFamily: typography.fonts.primary,
                                  marginLeft: spacing.xs,
                                }}>
                                  Wpływ na budżet
                                </Text>
                              </View>
                              <Text style={{
                                color: colors.text.tertiary,
                                fontSize: responsiveStyles.smallFontSize,
                                fontWeight: typography.weights.semibold,
                                fontFamily: typography.fonts.primary,
                              }}>
                                {budgetImpact > 0 ? '+' : ''}{budgetImpact} PLN
                              </Text>
                            </View>
                          )}

                          {/* Action button - responsive with enhanced styling */}
                          {actionUrl && (
                            <Pressable 
                              onPress={() => handleNotificationAction(notification)}
                              style={{
                                borderRadius: borderRadius.sm,
                                overflow: 'hidden',
                                marginTop: spacing.xs,
                                shadowColor: colors.primary.start,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                              }}
                            >
                              <LinearGradient
                                colors={gradients.primary.colors}
                                start={gradients.primary.start}
                                end={gradients.primary.end}
                                style={{
                                  paddingHorizontal: isSmallScreen ? spacing.sm : spacing.md,
                                  paddingVertical: isSmallScreen ? spacing.sm : spacing.sm + 2,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Ionicons name="open" size={responsiveStyles.bodyFontSize} color={colors.text.inverse} />
                                <Text style={{
                                  color: colors.text.inverse,
                                  fontSize: responsiveStyles.bodyFontSize - 1,
                                  fontWeight: typography.weights.semibold,
                                  fontFamily: typography.fonts.primary,
                                  marginLeft: spacing.xs,
                                }}>
                                  {isSmallScreen ? 'Zobacz' : 'Zobacz w RenoTimeline'}
                                </Text>
                              </LinearGradient>
                            </Pressable>
                          )}
                        </View>
                      </View>
                        </Pressable>
                      </LinearGradient>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    </>
  );
} 