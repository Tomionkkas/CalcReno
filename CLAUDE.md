# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.


## Project Overview

CalcReno is a React Native renovation calculator app built with Expo SDK 54. It allows users to create renovation projects, design room layouts (rectangle and L-shape), calculate material costs, and export data. The app integrates with Supabase for cloud sync and cross-app communication with RenoTimeline (a companion app for project timeline management).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Testing
npm test

# Linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Expo 54 with React Native 0.81.5
- **Routing**: expo-router (file-based routing)
- **Styling**: NativeWind (Tailwind for React Native)
- **Animations**: react-native-reanimated 4.1.1
- **State Management**: React Context + custom hooks
- **Backend**: Supabase (authentication, database, real-time subscriptions)
- **Push Notifications**: expo-notifications

### Key Directories
- `app/` - Main application code with file-based routing
  - `app/index.tsx` - Home screen (project list)
  - `app/project/[id].tsx` - Project detail screen with tabs
  - `app/auth/` - Authentication screens and components
  - `app/components/` - Reusable UI components
  - `app/hooks/` - Custom React hooks
  - `app/utils/` - Utilities and services
- `assets/` - Static assets (fonts, images)
- `ai_docs/` - Architecture and integration documentation

### Database Schema

**Supabase Multi-Schema Architecture:**
- `calcreno_schema` - CalcReno-specific tables (projects, rooms, room_elements)
- `shared_schema` - Cross-app shared tables (profiles, notifications, push tokens)

**Three Supabase Clients:**
1. `supabase` - Default client for CalcReno operations (calcreno_schema)
2. `sharedSupabase` - For cross-app operations (shared_schema)
3. `functionsSupabase` - For Edge Functions (no schema override)

See `app/utils/supabase.ts` for full type definitions and client configuration.

### State Management Patterns

**Authentication**: `useAuth` hook (app/hooks/useAuth.tsx)
- Supports email/password auth, guest mode, and offline mode
- Manages user sessions, profiles, and onboarding state
- Handles migration from AsyncStorage to Supabase

**Project Data**: `useProjectData` hook (app/hooks/useProjectData.tsx)
- Manages project CRUD operations
- Handles room management within projects
- Syncs with Supabase when authenticated, AsyncStorage for guests

**Storage Layer**: `app/utils/storage.ts`
- `StorageService` - Unified API for AsyncStorage and Supabase
- Automatically chooses storage backend based on auth state
- Migration utilities in `app/utils/migration.ts`

### Critical Implementation Details

**Room Rendering & L-Shape Support:**
- Rectangle rooms: 4 walls with standard dimensions
- L-shape rooms: 6 walls with corner orientation (top-left, top-right, bottom-left, bottom-right)
- Corner orientation determines which quadrant is "cut out" from the rectangle
- Wall calculations in `app/utils/shapeCalculations.ts`
- Visual rendering in `app/components/ProjectPlanner/RoomShapes/`

**Animation Performance:**
- Uses react-native-reanimated for smooth 60fps animations
- Avoid using Animated API from react-native (deprecated in favor of reanimated)
- Screen transitions: 80-100ms duration for instant feel
- All animations use worklet functions for UI thread execution

**Platform-Specific Considerations:**
- iOS requires slightly longer delays for state updates (150ms vs 100ms)
- Force re-renders after room changes using `forceUpdate` state
- Dark theme enforced app-wide to prevent white flashes on transitions

**Push Notifications:**
- Service in `app/utils/pushNotifications.ts`
- Registers tokens to `shared_schema.user_push_tokens`
- Supports deep linking and notification actions
- Real-time subscriptions for cross-app notifications

## Common Patterns

### Adding a New Screen
1. Create file in `app/` directory (e.g., `app/new-screen.tsx`)
2. Add Stack.Screen entry in `app/_layout.tsx`
3. Use SafeAreaView and consistent background color `#0A0B1E`
4. Apply fast transition specs (80-100ms animations)

### Creating Custom Hooks
- Place in `app/hooks/` directory
- Follow naming convention: `use[Name].tsx`
- Use TypeScript interfaces for return types
- Example: `useProjects`, `useToast`, `useAuth`

### Database Operations
```typescript
// CalcReno-specific data
const { data } = await supabase
  .from('calcreno_projects')
  .select('*')

// Shared cross-app data
const { data } = await sharedSupabase
  .from('profiles')
  .select('*')
```

### Material Calculations
- Entry point: `app/components/MaterialCalculator.tsx`
- Room details prepared in `project/[id].tsx` via `prepareRoomDetailsForCalculator`
- Calculations in `app/components/ProjectSummary/utils/materialCalculations.ts`
- Export utilities in `app/components/ProjectSummary/MaterialDetailsModal/utils/materialExportUtils.ts`

## Coding Standards (from .cursor/rules/)

**TypeScript:**
- Use interfaces over types
- Enable strict mode
- Avoid `any` - use precise types
- Use `React.FC` for functional components

**Component Structure:**
- Functional components with hooks (no classes)
- File structure: exported component, subcomponents, helpers, types
- PascalCase for components, camelCase for functions/variables
- Named exports preferred

**Performance:**
- Minimize `useEffect` and `useState`
- Use `React.memo()` for static props
- Optimize FlatLists with `removeClippedSubviews`, `maxToRenderPerBatch`
- Avoid anonymous functions in render methods

**Styling:**
- Use NativeWind (Tailwind) classes where possible
- Centralized theme in `app/utils/theme.ts`
- Responsive design with Flexbox
- Dark mode as default (colors.background.primary = '#0A0B1E')

**Supabase Practices:**
- Always specify schema when querying
- Use typed clients (Database type from supabase.ts)
- Handle auth errors gracefully
- Implement Row Level Security (RLS) policies

## Testing & Debugging

**Logging:**
- Custom logger in `app/utils/logger.ts`
- Use `logger.log()` instead of `console.log` for production
- Platform-aware logging

**Common Issues:**
- If rooms don't update: Check `forceUpdate` state in ProjectDetailScreen
- If auth fails: Verify Supabase env vars in `process.env.EXPO_PUBLIC_SUPABASE_*`
- If migrations fail: Check `app/utils/migration.ts` for data format compatibility

## Cross-App Integration

CalcReno integrates with RenoTimeline for project timeline management:
- Export projects via `app/components/ProjectExportButton.tsx`
- Receive notifications from RenoTimeline via push notifications
- Event detection in `app/utils/eventDetection.ts`
- Shared user profiles and preferences via `shared_schema`

See `ai_docs/` for detailed integration documentation.