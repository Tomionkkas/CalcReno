import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Linking, Pressable, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import { Bell, X, ExternalLink, Calendar, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { EventDetectionService } from '../utils/eventDetection';
import { supabase } from '../utils/supabase';
import { PushNotificationService } from '../utils/pushNotifications';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;
const isShortScreen = screenHeight < 700;

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
  source_app: string;
  target_app: string;
  notification_type: string;
  title: string;
  message: string;
  data: any; // JSON data containing project_id, project_name, action_url, priority, etc.
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

  useEffect(() => {
    fetchNotifications();

    if (user) {
      // Create a unique channel name for this user session
      const channelName = `user_notifications_${user.id}_${Date.now()}`;
      
      // Real-time subscription dla nowych powiadomień
      const subscription = supabase
        .channel(channelName)
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
            
            // Only add if it's from renotimeline
            if (newNotification.source_app === 'renotimeline') {
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => {
                const newCount = prev + 1;
                // Update badge count with new count
                PushNotificationService.updateBadgeCount(newCount);
                return newCount;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cross_app_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedNotification = payload.new as RenoTimelineNotification;
            
            // Update existing notification if it's already in the list
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          }
        )
        .subscribe();

      // Fallback: Polling every 3 seconds as backup
      const pollingInterval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('cross_app_notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('source_app', 'renotimeline')
            .order('created_at', { ascending: false })
            .limit(50);

          if (!error && data) {
            const currentCount = notifications.length;
            const newCount = data.length;
            
            if (newCount > currentCount) {
              setNotifications(data);
              const unread = data.filter(n => !n.is_read).length;
              setUnreadCount(unread);
              await PushNotificationService.updateBadgeCount(unread);
            }
          }
        } catch (error) {
          console.error('Error polling notifications:', error);
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
        clearInterval(pollingInterval);
      };
    }
  }, [user, notifications.length]);

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

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      setNotifications(data || []);
      const unread = data?.filter(n => !n.is_read).length || 0;
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
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
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
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const ids = unreadNotifications.map(n => n.id);
      
      if (ids.length === 0) return;

      await supabase
        .from('cross_app_notifications')
        .update({ is_read: true })
        .in('id', ids);

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
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
      case 'progress_update': return '#10B981';
      case 'budget_alert': return '#F59E0B';
      case 'milestone': return '#6366F1';
      case 'delay_warning': return '#EF4444';
      case 'material_ready': return '#3B82F6';
      case 'cost_savings_opportunity': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'high': return { color: '#EF4444', label: 'Wysoki' };
      case 'medium': return { color: '#F59E0B', label: 'Średni' };
      case 'low': return { color: '#10B981', label: 'Niski' };
      default: return { color: '#6B7280', label: 'Normalny' };
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

  // Responsive styling values
  const responsiveStyles = {
    headerPadding: isSmallScreen ? 12 : 16,
    notificationMargin: isSmallScreen ? 8 : 12,
    notificationPadding: isSmallScreen ? 12 : 16,
    iconSize: isSmallScreen ? 16 : 20,
    headerIconSize: isSmallScreen ? 20 : 24,
    titleFontSize: isSmallScreen ? 18 : 20,
    bodyFontSize: isSmallScreen ? 13 : 14,
    smallFontSize: isSmallScreen ? 11 : 12,
    buttonPadding: isSmallScreen ? 6 : 8,
    emptyStatePadding: isSmallScreen ? 24 : 32,
    emptyStateIconSize: isSmallScreen ? 40 : 48,
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell - responsive sizing */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: '#1E2139',
          borderWidth: 1,
          borderColor: '#2A2D4A',
          borderRadius: 8,
          padding: responsiveStyles.buttonPadding,
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons name="notifications" size={responsiveStyles.iconSize} color="#B8BCC8" />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#1E2139',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Notification Modal - full responsive design */}
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0B1E' }} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={["#0A0B1E", "#151829"]}
            style={{ flex: 1 }}
          >
            {/* Header with responsive padding and sizing */}
            <View style={{
              paddingHorizontal: responsiveStyles.headerPadding,
              paddingVertical: isShortScreen ? 16 : 20,
              paddingTop: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#2A2D4A',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  flex: 1,
                  marginRight: 8,
                }}>
                  <Ionicons name="notifications" size={responsiveStyles.headerIconSize} color="#6C63FF" />
                  <Text style={{
                    color: 'white',
                    fontSize: responsiveStyles.titleFontSize,
                    fontWeight: 'bold',
                    marginLeft: 8,
                  }} numberOfLines={1}>
                    Powiadomienia
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <Pressable 
                      onPress={markAllAsRead}
                      style={{
                        backgroundColor: '#1E2139',
                        borderWidth: 1,
                        borderColor: '#2A2D4A',
                        borderRadius: 8,
                        paddingHorizontal: isSmallScreen ? 8 : 12,
                        paddingVertical: 6,
                        marginRight: 8,
                      }}
                    >
                      <Text style={{
                        color: '#B8BCC8',
                        fontSize: responsiveStyles.smallFontSize,
                        fontWeight: '500',
                      }}>
                        {isSmallScreen ? 'Oznacz' : 'Oznacz wszystkie'}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable 
                    onPress={fetchNotifications}
                    style={{
                      backgroundColor: '#6C63FF',
                      borderWidth: 1,
                      borderColor: '#8B7FF7',
                      borderRadius: 8,
                      padding: responsiveStyles.buttonPadding,
                      marginRight: 8,
                    }}
                  >
                    <Ionicons name="refresh" size={responsiveStyles.iconSize} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => setVisible(false)}
                    style={{
                      backgroundColor: '#1E2139',
                      borderWidth: 1,
                      borderColor: '#2A2D4A',
                      borderRadius: 8,
                      padding: responsiveStyles.buttonPadding,
                    }}
                  >
                    <Ionicons name="close" size={responsiveStyles.iconSize} color="#B8BCC8" />
                  </Pressable>
                </View>
              </View>
              
              {/* Source indicator */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#4DABF7',
                  marginRight: 6,
                }} />
                <Text style={{
                  color: '#B8BCC8',
                  fontSize: responsiveStyles.smallFontSize,
                }}>
                  Z aplikacji RenoTimeline
                </Text>
              </View>
            </View>

            {/* Notifications List with responsive ScrollView */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                paddingBottom: isSmallScreen ? 20 : 32,
                minHeight: isShortScreen ? '100%' : undefined,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  tintColor="#6C63FF"
                  colors={["#6C63FF"]}
                />
              }
            >
              {loading ? (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: isShortScreen ? 40 : 60,
                  minHeight: screenHeight * 0.4,
                }}>
                  <Ionicons name="reload" size={responsiveStyles.emptyStateIconSize * 0.7} color="#6B7280" />
                  <Text style={{
                    color: '#6B7280',
                    marginTop: 12,
                    fontSize: responsiveStyles.bodyFontSize,
                  }}>
                    Ładowanie powiadomień...
                  </Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: isShortScreen ? 40 : 60,
                  paddingHorizontal: responsiveStyles.headerPadding + 16,
                  minHeight: screenHeight * 0.4,
                }}>
                  <View style={{
                    backgroundColor: '#1E2139',
                    borderRadius: 16,
                    padding: responsiveStyles.emptyStatePadding,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#2A2D4A',
                    maxWidth: screenWidth - 32,
                  }}>
                    <Ionicons name="notifications-off" size={responsiveStyles.emptyStateIconSize} color="#6B7280" />
                    <Text style={{
                      color: '#B8BCC8',
                      fontSize: responsiveStyles.titleFontSize - 2,
                      fontWeight: '600',
                      textAlign: 'center',
                      marginTop: 16,
                    }}>
                      Brak powiadomień
                    </Text>
                    <Text style={{
                      color: '#6B7280',
                      fontSize: responsiveStyles.bodyFontSize,
                      textAlign: 'center',
                      marginTop: 8,
                      lineHeight: 20,
                    }}>
                      Gdy Twoje projekty będą realizowane w RenoTimeline, tutaj pojawią się aktualizacje postępów
                    </Text>
                  </View>
                </View>
              ) : (
                notifications.map((notification) => {
                  const priority = getPriorityIndicator(notification.data?.priority);
                  const iconName = getNotificationIcon(notification.notification_type);
                  const iconColor = getNotificationIconColor(notification.notification_type);
                  const projectName = notification.data?.project_name;
                  const suggestedAction = notification.data?.metadata?.suggested_action;
                  const budgetImpact = notification.data?.metadata?.budget_impact;
                  const actionUrl = notification.data?.action_url;
                  
                  return (
                    <Pressable
                      key={notification.id}
                      onPress={() => markAsRead(notification.id)}
                      style={{
                        backgroundColor: '#1E2139',
                        borderWidth: 1,
                        borderColor: notification.is_read ? '#2A2D4A' : '#6C63FF',
                        borderRadius: 12,
                        marginHorizontal: responsiveStyles.notificationMargin,
                        marginVertical: responsiveStyles.notificationMargin / 2,
                        padding: responsiveStyles.notificationPadding,
                        opacity: notification.is_read ? 0.7 : 1,
                        maxWidth: screenWidth - (responsiveStyles.notificationMargin * 2),
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* Icon - responsive sizing */}
                        <View style={{
                          width: isSmallScreen ? 36 : 40,
                          height: isSmallScreen ? 36 : 40,
                          borderRadius: isSmallScreen ? 18 : 20,
                          backgroundColor: `${iconColor}20`,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: isSmallScreen ? 10 : 12,
                        }}>
                          <Ionicons name={iconName as any} size={responsiveStyles.iconSize} color={iconColor} />
                        </View>
                        
                        {/* Content - responsive layout */}
                        <View style={{ flex: 1 }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}>
                            <Text style={{
                              color: 'white',
                              fontSize: responsiveStyles.bodyFontSize + 1,
                              fontWeight: '600',
                              flex: 1,
                              marginRight: 8,
                            }} numberOfLines={isSmallScreen ? 2 : 3}>
                              {notification.title}
                            </Text>
                            {!notification.is_read && (
                              <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#6C63FF',
                                marginTop: 2,
                              }} />
                            )}
                          </View>
                          
                          <Text style={{
                            color: '#B8BCC8',
                            fontSize: responsiveStyles.bodyFontSize,
                            lineHeight: responsiveStyles.bodyFontSize + 6,
                            marginBottom: 8,
                          }} numberOfLines={isSmallScreen ? 3 : 4}>
                            {notification.message}
                          </Text>
                          
                          {/* Project name - responsive */}
                          {projectName && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 6,
                            }}>
                              <Ionicons name="folder" size={responsiveStyles.smallFontSize} color="#6B7280" />
                              <Text style={{
                                color: '#6B7280',
                                fontSize: responsiveStyles.smallFontSize,
                                marginLeft: 4,
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
                            marginBottom: 12,
                            flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
                          }}>
                            <Text style={{
                              color: '#6B7280',
                              fontSize: responsiveStyles.smallFontSize,
                            }}>
                              {formatTimeAgo(notification.created_at)}
                            </Text>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: isSmallScreen ? 0 : 8,
                              marginTop: isSmallScreen ? 4 : 0,
                            }}>
                              <View style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: priority.color,
                                marginRight: 4,
                              }} />
                              <Text style={{
                                color: '#6B7280',
                                fontSize: responsiveStyles.smallFontSize - 1,
                              }}>
                                {priority.label}
                              </Text>
                            </View>
                          </View>

                          {/* Metadata sections - responsive */}
                          {suggestedAction && (
                            <View style={{
                              backgroundColor: '#374151',
                              borderRadius: 8,
                              padding: isSmallScreen ? 8 : 10,
                              marginBottom: 8,
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 4,
                              }}>
                                <Ionicons name="bulb" size={responsiveStyles.bodyFontSize} color="#F59E0B" />
                                <Text style={{
                                  color: '#F59E0B',
                                  fontSize: responsiveStyles.smallFontSize,
                                  fontWeight: '600',
                                  marginLeft: 4,
                                }}>
                                  Sugerowane działanie
                                </Text>
                              </View>
                              <Text style={{
                                color: '#B8BCC8',
                                fontSize: responsiveStyles.smallFontSize,
                                lineHeight: responsiveStyles.smallFontSize + 4,
                              }}>
                                {suggestedAction}
                              </Text>
                            </View>
                          )}

                          {budgetImpact && (
                            <View style={{
                              backgroundColor: budgetImpact > 0 ? '#7F1D1D' : '#14532D',
                              borderRadius: 8,
                              padding: isSmallScreen ? 8 : 10,
                              marginBottom: 8,
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 4,
                              }}>
                                <Ionicons 
                                  name={budgetImpact > 0 ? "trending-up" : "trending-down"} 
                                  size={responsiveStyles.bodyFontSize} 
                                  color={budgetImpact > 0 ? "#FCA5A5" : "#86EFAC"} 
                                />
                                <Text style={{
                                  color: budgetImpact > 0 ? "#FCA5A5" : "#86EFAC",
                                  fontSize: responsiveStyles.smallFontSize,
                                  fontWeight: '600',
                                  marginLeft: 4,
                                }}>
                                  Wpływ na budżet
                                </Text>
                              </View>
                              <Text style={{
                                color: '#B8BCC8',
                                fontSize: responsiveStyles.smallFontSize,
                                fontWeight: '600',
                              }}>
                                {budgetImpact > 0 ? '+' : ''}{budgetImpact} PLN
                              </Text>
                            </View>
                          )}

                          {/* Action button - responsive */}
                          {actionUrl && (
                            <Pressable 
                              onPress={() => handleNotificationAction(notification)}
                              style={{
                                borderRadius: 8,
                                overflow: 'hidden',
                                marginTop: 4,
                              }}
                            >
                              <LinearGradient
                                colors={["#6C63FF", "#4DABF7"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                  paddingHorizontal: isSmallScreen ? 12 : 16,
                                  paddingVertical: isSmallScreen ? 8 : 10,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Ionicons name="open" size={responsiveStyles.bodyFontSize} color="white" />
                                <Text style={{
                                  color: 'white',
                                  fontSize: responsiveStyles.bodyFontSize - 1,
                                  fontWeight: '600',
                                  marginLeft: 6,
                                }}>
                                  {isSmallScreen ? 'Zobacz' : 'Zobacz w RenoTimeline'}
                                </Text>
                              </LinearGradient>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </Pressable>
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