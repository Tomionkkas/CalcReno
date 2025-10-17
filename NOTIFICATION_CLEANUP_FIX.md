# Notification Cleanup Fix

## Issue
When logging out of the app, a render error occurred:
```
Notifications.removeNotificationSubscription is not a function (it is undefined)
```

## Root Cause
The notification cleanup code was using an incorrect API method. The Expo Notifications API doesn't have a `removeNotificationSubscription()` method.

## Solution

**Before (BROKEN)**:
```typescript
return () => {
  Notifications.removeNotificationSubscription(notificationListener);
  Notifications.removeNotificationSubscription(responseListener);
  Notifications.removeNotificationSubscription(backgroundListener);
};
```

**After (FIXED)**:
```typescript
return () => {
  notificationListener.remove();
  responseListener.remove();
  backgroundListener.remove();
};
```

## Explanation
When you call `Notifications.addNotificationReceivedListener()` or similar methods, they return a subscription object with a `.remove()` method. You call `.remove()` directly on the subscription object to clean it up, not through a `Notifications` method.

## File Modified
- `app/utils/pushNotifications.ts` - Fixed the `setupNotificationListeners()` cleanup function

## Testing
1. Log in to the app
2. Log out
3. **Expected**: No error, clean logout ✅

## Status
✅ Fixed - No more errors on logout


