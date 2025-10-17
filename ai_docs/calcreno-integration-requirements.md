# CalcReno Integration Requirements - Cross-App Notifications

## Overview

This document outlines the implementation requirements for CalcReno to receive and process cross-app notifications from RenoTimeline. The RenoTimeline side is already fully implemented and sending notifications via Edge Functions to the shared Supabase database.

## Current Integration Status

### ✅ RenoTimeline (Completed)
- **Event Detection System** - `CalcRenoEventDetector` monitors task movements, completions, delays
- **Notification Templates** - Polish message templates with suggested actions
- **Edge Function** - `create-calcreno-notification` deployed and working
- **Database Schema** - `cross_app_notifications` table with RLS policies
- **Real-time Triggers** - Task movements automatically trigger notifications

### ⚠️ CalcReno (Mostly Implemented - Schema Fix Required)
- **✅ Notification Subscription System** - Real-time subscriptions implemented
- **✅ Real-time Updates** - Supabase real-time subscriptions working
- **✅ Notification UI Components** - NotificationCenter.tsx fully implemented
- **✅ Push Notification Service** - Complete React Native push notifications
- **❌ Database Schema Mismatch** - Missing key fields in cross_app_notifications table

## 🚨 CRITICAL ISSUE: Database Schema Mismatch

The current `cross_app_notifications` table is missing essential fields required for proper RenoTimeline integration:

### Missing Fields:
1. `project_id` - RenoTimeline project ID
2. `calcreno_project_id` - CalcReno project ID for correlation
3. `priority` - Notification priority (low/medium/high)

### Current Schema vs Required Schema:

**Current Schema (Incomplete):**
```sql
cross_app_notifications (
  id: string,
  user_id: string | null,
  source_app: string,
  target_app: string,
  notification_type: string,
  title: string,
  message: string,
  data: jsonb,
  is_read: boolean,
  expires_at: string,
  created_at: string
)
```

**Required Schema (Complete):**
```sql
cross_app_notifications (
  id: string,
  user_id: string | null,
  project_id: string,                    -- ❌ MISSING
  calcreno_project_id: string | null,    -- ❌ MISSING  
  source_app: string,
  target_app: string,
  notification_type: string,
  title: string,
  message: string,
  priority: string,                      -- ❌ MISSING
  data: jsonb,
  is_read: boolean,
  expires_at: string,
  created_at: string
)
```

## 🔧 IMMEDIATE FIX REQUIRED

### Step 1: Update Database Schema

Run this migration in Supabase SQL Editor:

```sql
-- Add missing columns to cross_app_notifications table
ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT '';

ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS calcreno_project_id TEXT;

ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high'));

-- Update any existing records with default values
UPDATE cross_app_notifications 
SET project_id = 'unknown-project' 
WHERE project_id = '';

-- Add foreign key constraint for project_id if needed
-- ALTER TABLE cross_app_notifications 
-- ADD CONSTRAINT fk_project_id 
-- FOREIGN KEY (project_id) REFERENCES renotimeline_projects(id);
```

### Step 2: Update TypeScript Schema

Update `app/utils/supabase.ts` cross_app_notifications interface:

```typescript
cross_app_notifications: {
  Row: {
    created_at: string | null
    data: Json | null
    expires_at: string | null
    id: string
    is_read: boolean | null
    message: string
    notification_type: string
    project_id: string                    // ✅ ADD THIS
    calcreno_project_id: string | null    // ✅ ADD THIS
    priority: string                      // ✅ ADD THIS
    source_app: string
    target_app: string
    title: string
    user_id: string | null
  }
  Insert: {
    created_at?: string | null
    data?: Json | null
    expires_at?: string | null
    id?: string
    is_read?: boolean | null
    message: string
    notification_type: string
    project_id: string                    // ✅ ADD THIS
    calcreno_project_id?: string | null   // ✅ ADD THIS
    priority?: string                     // ✅ ADD THIS
    source_app: string
    target_app: string
    title: string
    user_id?: string | null
  }
  Update: {
    created_at?: string | null
    data?: Json | null
    expires_at?: string | null
    id?: string
    is_read?: boolean | null
    message?: string
    notification_type?: string
    project_id?: string                   // ✅ ADD THIS
    calcreno_project_id?: string | null   // ✅ ADD THIS
    priority?: string                     // ✅ ADD THIS
    source_app?: string
    target_app?: string
    title?: string
    user_id?: string | null
  }
  Relationships: []
}
```

### Step 3: Update Notification Interfaces

Update `app/components/NotificationCenter.tsx` interface to match:

```typescript
interface RenoTimelineNotification {
  id: string;
  user_id: string | null;
  project_id: string;                     // ✅ ADD THIS
  calcreno_project_id: string | null;     // ✅ ADD THIS
  source_app: string;
  target_app: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;                       // ✅ ADD THIS
  data: any;
  is_read: boolean | null;
  expires_at: string | null;
  created_at: string | null;
}
```

## ✅ Already Implemented Components

CalcReno already has these components working correctly:

### 1. ✅ Notification Center UI
- Professional dark theme design
- Real-time updates via Supabase subscriptions
- Badge count management
- Pull-to-refresh functionality
- Mark as read/unread functionality

### 2. ✅ Push Notification Service
- Complete expo-notifications integration
- Permission handling
- Token management
- Background notification support

### 3. ✅ Real-time Subscription
- Supabase real-time channels
- Automatic notification updates
- Polling fallback system

### 4. ✅ Database Operations
- Fetch notifications
- Mark as read
- Update notification status

### 5. ✅ Event Detection Service
- Send cross-app notifications
- Project linking system
- Notification creation

## 🚀 Post-Fix Integration Flow

After the schema fix, the integration will work as follows:

### RenoTimeline → CalcReno Flow:
1. **RenoTimeline** detects task completion/delay
2. **RenoTimeline** sends notification with:
   - `project_id` (RenoTimeline project ID)
   - `calcreno_project_id` (linked CalcReno project if available)
   - `priority` (low/medium/high)
3. **CalcReno** receives real-time notification
4. **CalcReno** shows in NotificationCenter with proper priority styling
5. **CalcReno** sends push notification to user

### Example Notification Creation (RenoTimeline side):
```typescript
await supabase
  .from('cross_app_notifications')
  .insert({
    user_id: 'user-uuid',
    project_id: 'renotimeline-project-123',        // ✅ Required
    calcreno_project_id: 'calcreno-project-456',   // ✅ If linked
    source_app: 'renotimeline',
    target_app: 'calcreno',
    notification_type: 'task_completed',
    title: 'Zadanie ukończone',
    message: 'Instalacja elektryczna została ukończona zgodnie z planem.',
    priority: 'medium',                             // ✅ Required
    data: {
      task_name: 'Instalacja elektryczna',
      completion_percentage: 100,
      suggested_action: 'Sprawdź rzeczywiste koszty'
    },
    is_read: false
  });
```

## Implementation Priority

### 🔥 URGENT (30 minutes)
1. **Database Schema Fix** - Add missing columns
2. **TypeScript Interface Update** - Update supabase.ts types
3. **Component Interface Update** - Update NotificationCenter.tsx types

### 🚀 READY (Already Completed)
- Real-time notification system ✅
- Professional UI/UX ✅
- Push notifications ✅
- Database integration ✅

## Testing After Fix

### Integration Testing:
1. **Add missing columns** to database
2. **Update TypeScript interfaces**
3. **Send test notification** from RenoTimeline with all required fields
4. **Verify CalcReno receives** notification correctly
5. **Check priority styling** works in NotificationCenter

### Expected Result:
- ✅ Notifications appear in CalcReno instantly
- ✅ Priority indicators show correct colors
- ✅ Project correlation works if calcreno_project_id provided
- ✅ Push notifications sent to user

## Conclusion

CalcReno has a **complete and professional notification system** already implemented. The only blocker is a **database schema mismatch** where three critical fields are missing. This is a **30-minute fix** that will make the entire integration functional.

The notification system is **production-ready** and includes:
- Real-time updates
- Professional UI/UX  
- Push notifications
- Badge management
- Responsive design

Once the schema is fixed, **RenoTimeline can immediately start sending notifications** and they will appear seamlessly in CalcReno. 