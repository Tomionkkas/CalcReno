# CalcReno - Project Context

## Project Overview

CalcReno is a React Native renovation calculator app built with Expo SDK 54. It is designed to help users create renovation projects, design room layouts (supporting both rectangle and L-shapes), calculate material costs, and export data.

The application integrates with Supabase for cloud synchronization and supports cross-app communication with "RenoTimeline" (a companion app) via shared schemas.

## Tech Stack

*   **Framework:** Expo 54
*   **Core:** React Native 0.81.5, React 19.1.0
*   **Language:** TypeScript
*   **Routing:** Expo Router (File-based routing)
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **Animations:** React Native Reanimated 4.1.1
*   **Backend / Database:** Supabase (Auth, Database, Real-time)
*   **State Management:** React Context + Custom Hooks
*   **Notifications:** Expo Notifications

## Key Architecture Patterns

### Routing & Navigation
*   **File-Based Routing:** Uses `expo-router`.
*   **Root Layout:** `app/_layout.tsx` handles the main stack, authentication state, and global providers.
*   **Key Screens:**
    *   `app/index.tsx`: Home screen (Project list).
    *   `app/add-project.tsx`: Project creation.
    *   `app/project/[id].tsx`: Project detail view (Tab-based interface).
    *   `app/auth/AuthScreen.tsx`: Authentication screen.

### Data & State
*   **Authentication:** Managed via `useAuth` hook (`app/hooks/useAuth.tsx`). Supports Guest Mode and Supabase Auth.
*   **Project Data:** Managed via `useProjectData` hook. Syncs with Supabase for authenticated users, AsyncStorage for guests.
*   **Storage Abstraction:** `app/utils/storage.ts` provides a unified API that switches between local and cloud storage.

### Database (Supabase)
*   **Dual Client Setup:**
    *   `calcreno_schema`: For app-specific data (projects, rooms).
    *   `shared_schema`: For cross-app data (profiles, notifications) shared with RenoTimeline.

### Styling & Theme
*   **Dark Mode First:** The app uses a deep navy background (`#0A0B1E`) as the default.
*   **NativeWind:** Styling is done using Tailwind classes (e.g., `className="bg-primary"`).
*   **Reanimated:** Animations are performance-critical, using worklets and shared values.

## Development Commands

*   **Install Dependencies:** `npm install`
*   **Start Dev Server:** `npx expo start` (or `npm start`)
*   **Run Android:** `npm run android`
*   **Run iOS:** `npm run ios`
*   **Run Web:** `npm run web`
*   **Test:** `npm test`
*   **Lint:** `npm run lint`

## Code Conventions

*   **TypeScript:** Strict mode enabled. Use Interfaces over Types.
*   **Components:** Functional components only. Use `React.FC`.
*   **Imports:** Prefer named exports.
*   **File Structure:**
    *   `app/`: Screens and routing.
    *   `app/components/`: Reusable UI components.
    *   `app/hooks/`: Custom business logic hooks.
    *   `app/utils/`: Helper functions and services.

## Important Context Files
*   `CLAUDE.md`: Contains detailed architecture and AI-specific instructions.
*   `app/_layout.tsx`: Main entry point configuration.
*   `app/utils/supabase.ts`: Database client configuration.
