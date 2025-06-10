# Phase 2: Smart Notifications (RenoTimeline → CalcReno)

## 🎯 Overview
Phase 2 implements intelligent push notifications from **RenoTimeline to CalcReno**, allowing CalcReno users to receive real-time updates about their renovation projects' progress, budget changes, and optimization opportunities.

## ✅ Implementation Status

### 🔧 **Core Infrastructure** ✅
- **Push Notification Service** (`app/utils/pushNotifications.ts`)
  - Expo push notifications integration
  - Token registration and management
  - Platform-specific configuration (iOS/Android)
  - Automatic permission handling
  - Badge count management

- **Database Schema** ✅
  - `user_push_tokens` table for multi-device support
  - Enhanced `cross_app_notifications` with RenoTimeline fields
  - Row Level Security policies
  - Real-time subscriptions support

### 📱 **UI Components** ✅
- **NotificationCenter** (`app/components/NotificationCenter.tsx`)
  - Real-time notification display
  - Unread counter with badge
  - Pull-to-refresh functionality
  - Mark as read/unread functionality
  - Rich notification UI with priority colors

- **Test Components** ✅
  - `TestNotificationButton.tsx` for development testing
  - `notificationHandler.ts` for intelligent notification processing

### 🔗 **Integration Features** ✅
- **Smart Notification Handling**
  - Progress updates with completion tracking
  - Budget alerts with impact calculations
  - Milestone achievements
  - Delay warnings with suggested actions
  - Material readiness notifications
  - Cost savings opportunities

- **Deep Linking** ✅
  - CalcReno project deep links (`calcreno://project/{id}`)
  - RenoTimeline action URLs
  - Fallback handling for failed links

## 🗄️ Database Schema

### `user_push_tokens`
```sql
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  push_token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_name TEXT CHECK (app_name IN ('calcreno', 'renotimeline')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enhanced `cross_app_notifications`
```sql
ALTER TABLE cross_app_notifications ADD COLUMN:
- project_id TEXT
- project_name TEXT  
- priority TEXT CHECK (priority IN ('low', 'medium', 'high'))
- read_at TIMESTAMP WITH TIME ZONE
- action_url TEXT
- metadata JSONB
```

## 📋 Notification Types

### 1. **Progress Updates** ✅
- **Trigger**: Task completion in RenoTimeline
- **Action**: Offer to update actual costs in CalcReno
- **Data**: `completion_percentage`, `task_name`

### 2. **Budget Alerts** ✅  
- **Trigger**: Budget variance detected
- **Action**: Update cost calculation
- **Data**: `budget_impact` (positive/negative)

### 3. **Milestones** ✅
- **Trigger**: Project milestones achieved
- **Action**: View progress in RenoTimeline
- **Data**: `milestone_name`, `action_url`

### 4. **Delay Warnings** ✅
- **Trigger**: Schedule delays detected
- **Action**: Review timeline in RenoTimeline  
- **Data**: `timeline_impact`, `suggested_action`

### 5. **Material Ready** ✅
- **Trigger**: Materials available for pickup
- **Action**: Update material status in CalcReno
- **Data**: `material_type`, `delivery_date`

### 6. **Cost Savings** ✅
- **Trigger**: Optimization opportunities found
- **Action**: Review suggestions in RenoTimeline
- **Data**: `potential_savings`, `suggested_action`

## 🔧 Configuration

### Expo App Config (`app.json`)
```json
{
  "plugins": [
    ["expo-notifications", {
      "icon": "./assets/notification-icon.png",
      "color": "#4F46E5",
      "sounds": ["./assets/notification-sound.wav"],
      "mode": "production"
    }]
  ]
}
```

### Supabase Environment
```bash
EXPO_PUBLIC_SUPABASE_URL=https://qxyuayjpllrndylxhgoq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Usage

### Automatic Setup
1. Push notifications are automatically registered when user logs in
2. Real-time subscriptions are established for incoming notifications
3. Badge counts are managed automatically

### Manual Testing
```typescript
import { CalcRenoNotificationHandler } from './utils/notificationHandler';

// Create test notification
await CalcRenoNotificationHandler.createTestNotification(userId);
```

### Notification Handling
```typescript
// Notifications are automatically handled through:
// 1. Real-time Supabase subscriptions
// 2. Push notification listeners
// 3. Smart routing based on notification type
```

## 📱 User Experience

### Notification Flow
1. **RenoTimeline** detects important project event
2. **Notification** is inserted into `cross_app_notifications` table
3. **Push notification** is sent to CalcReno user's device
4. **Badge count** is updated on app icon
5. **User taps** notification to view details
6. **Smart actions** are presented based on notification type
7. **Deep linking** opens relevant sections in either app

### Visual Design
- **Priority-based colors**: Red (high), Yellow (medium), Green (low), Blue (default)
- **Rich metadata display**: Budget impacts, suggested actions, progress indicators
- **Unread indicators**: Blue dots and badge counts
- **Action buttons**: Context-specific actions for each notification type

## 🔄 Real-time Features

### Live Updates
- Real-time notification reception via Supabase subscriptions
- Automatic UI updates when new notifications arrive
- Badge count synchronization across app sessions

### Background Processing
- Push notifications work when app is backgrounded
- Badge counts persist across app restarts
- Notification history maintained in database

## 🧪 Testing

### Development Testing
1. Use `TestNotificationButton` component
2. Insert test data directly into database
3. Verify push token registration in Supabase

### Production Testing
1. Set up RenoTimeline to send real notifications
2. Test cross-app deep linking
3. Verify notification delivery on physical devices

## 🔮 Future Enhancements (Phase 3)

### Advanced Features (Planned)
- **Smart grouping**: Bundle related notifications
- **Notification scheduling**: Time-based delivery
- **Rich media**: Images and attachments in notifications  
- **Custom sounds**: Project-specific notification sounds
- **Geofencing**: Location-based material pickup reminders

### Integration Improvements
- **Two-way sync**: Real-time data synchronization between apps
- **Shared project dashboard**: Unified view of project status
- **Collaborative features**: Team notifications and updates

## 📊 Key Benefits

### For CalcReno Users
- **Stay informed**: Real-time project progress updates
- **Cost control**: Immediate budget variance notifications  
- **Optimization**: Proactive cost savings opportunities
- **Convenience**: Seamless integration with RenoTimeline

### For Development
- **Scalable architecture**: Easy to add new notification types
- **Real-time infrastructure**: Foundation for future features
- **Cross-platform**: Works on iOS and Android
- **Secure**: RLS policies protect user data

## 🔗 Related Files

### Core Implementation
- `app/utils/pushNotifications.ts` - Push notification service
- `app/components/NotificationCenter.tsx` - UI component
- `app/utils/notificationHandler.ts` - Business logic
- `app/hooks/usePushNotifications.ts` - React hook

### Database
- Migration: `phase_2_push_notifications_fixed`
- Tables: `user_push_tokens`, `cross_app_notifications`

### Configuration  
- `app.json` - Expo notification plugin config
- Phase 2 documentation in `ai_docs/integracja-calc-timeline.md`

---

**Phase 2 Status**: ✅ **COMPLETE** - Ready for integration with RenoTimeline
**Next Phase**: Phase 3 - Advanced cross-app features and bidirectional synchronization 