# Integracja CalcReno ↔ RenoTimeline - Ecosystem Powiadomień

## 🎯 Wizja: Ecosystem Powiadomień

Integracja skupia się na inteligentnej komunikacji między aplikacjami poprzez zaawansowany system powiadomień.

**🏗️ FUNDAMENT: CalcReno → Supabase Integration**
Cały ecosystem wymaga shared authentication i cloud-based project IDs.

## ✅ **PHASE 0 - COMPLETED** 
✅ Supabase Integration w CalcReno ukończona
✅ Authentication system zintegrowany
✅ Data separation (guest vs logged users)
✅ Migration from AsyncStorage to Supabase
✅ Professional UI improvements
✅ Code pushed to GitHub

## 🚀 **PHASE 1 - COMPLETED** (MVP Cross-App Communication)
✅ Event Detection Service - wykrywa istotne zmiany w projektach CalcReno
✅ Cross-App Notifications System - powiadomienia między aplikacjami
✅ Project Export Button - eksport projektów CalcReno do RenoTimeline
✅ Notification Center w CalcReno - wyświetlanie powiadomień z RenoTimeline
✅ Database schema ready - tabele `cross_app_notifications` i `project_links`

## 📱 Obecny Stan CalcReno

### Aktualna Architektura:
- **React Native + Expo** - mobile-first aplikacja
- **AsyncStorage** - lokalne przechowywanie danych projektów
- **TypeScript** - type safety w całej aplikacji
- **NativeWind + Tailwind** - styling system

### Aktualne Struktury Danych:
```typescript
interface Project {
  id: string;
  name: string;
  status: "W trakcie" | "Planowany" | "Zakończony" | "Wstrzymany";
  startDate: string;
  endDate: string;
  isPinned: boolean;
  description?: string;
  rooms: Room[];
  totalCost?: number;
}

interface Room {
  id: string;
  name: string;
  shape: "rectangle" | "l-shape";
  dimensions: { width: number; length: number; height: number; };
  elements: RoomElement[]; // doors, windows
  materials?: MaterialCalculation;
}
```

### Obecne Funkcjonalności:
- ✅ Tworzenie i zarządzanie projektami
- ✅ Kalkulacja kosztów materiałów
- ✅ Geometria pomieszczeń (prostokąt + L-shape)
- ✅ Eksport PDF z kosztorysami
- ✅ Local storage management

### Potrzebne Zmiany dla Integracji:
- 🔄 **Migracja z AsyncStorage na Supabase** (cloud storage)
- 🔄 **Dodanie systemu autentykacji** (shared z RenoTimeline)
- 🔄 **Cross-app notifications API**
- 🔄 **Project linking/export functionality**

## 📊 Uproszczone Mapowanie Danych

### CalcReno -> RenoTimeline (Minimal Transfer):

**Podstawowe Dane Projektu:**
- Nazwa projektu → Project title w RenoTimeline
- Data utworzenia → Project creation date
- Podstawowy opis/adres → Project description
- ID projektu CalcReno → Reference link (żeby wiedzieć skąd pochodzi)

**Szacowany budżet całkowity →** Project budget field (opcjonalny)

**I to wszystko! Dane płyną TYLKO w jedną stronę: CalcReno → RenoTimeline.**
**Nie ma sensu synchronizować pokoi, materiałów, zadań - to różne domeny.**

### Dlaczego Tylko Jedna Strona:
- **CalcReno = Source of Truth** dla projektów (tam się tworzy projekt, budżet, podstawowe dane)
- **RenoTimeline = Execution Tool** (harmonogram, zadania, timeline na podstawie projektu z CalcReno)
- **No data back** - RenoTimeline nie tworzy projektów, tylko zarządza timeline dla istniejących

## 💼 Business Value Proposition

### Dla Użytkowników:
- **Proactive Management** - dowiadują się o problemach zanim się nasilą
- **Data-Driven Decisions** - decyzje na podstawie real-time data z obu aplikacji
- **Professional Image** - klienci widzą, że wszystko jest pod kontrolą
- **Viral Growth** - users polecają combo CalcReno + RenoTimeline

### Dla Biznesu:
- **User Retention** - trudno odejść gdy masz insights z obu aplikacji
- **Premium Features** - advanced AI insights jako paid feature
- **Market Positioning** - jedyny tak ecosystem na rynku
- **Data Monetization** - czyste monetyzacja path

## 🛠️ **PHASE 1 IMPLEMENTATION DETAILS**

### 📦 **Nowe Komponenty i Pliki Utworzone:**

#### 1. **Event Detection Service** (`app/utils/eventDetection.ts`)
- Wykrywa istotne zmiany w projektach CalcReno
- Automatycznie wysyła cross-app notifications do RenoTimeline
- **Triggery:**
  - **Budget Changes** (>15% change) → "Aktualizacja budżetu projektu"
  - **Project Completion** (wszystkie pomieszczenia wycenione) → "Kosztorys projektu ukończony"
  - **Cost Alerts** (pomieszczenie >25% budżetu) → "Alert kosztów projektu"

#### 2. **Project Export Button** (`app/components/ProjectExportButton.tsx`) 
- Eksport projektów CalcReno do RenoTimeline
- Wyświetla się na każdej ProjectCard (tylko dla zalogowanych użytkowników)
- **Stany:**
  - Purple button: "📅 Utwórz harmonogram w RenoTimeline" (nowy projekt)
  - Green button: "📅 Otwórz w RenoTimeline" (projekt już połączony)
  - Loading state podczas eksportu
- **Funkcjonalności:**
  - Tworzy link w tabeli `project_links`
  - Wysyła sukcess notification 
  - Opcja otwarcia RenoTimeline po eksporcie

#### 3. **Notification Center** (`app/components/NotificationCenter.tsx`)
- Bell icon z unread counter w headerze (obok logout button)
- Modal z listą powiadomień z RenoTimeline
- **Features:**
  - Wyświetla powiadomienia z `cross_app_notifications` table
  - Mark as read functionality
  - Different icons for different notification types
  - Relative time formatting ("2 godz. temu")
  - Pull-to-refresh
  - Empty state z helpful text

#### 4. **Enhanced useProjectData Hook**
- Integracja z Event Detection Service
- Automatyczne wykrywanie zmian podczas zapisywania kalkulacji
- Background event detection (nie przeszkadza w UX)

#### 5. **Updated Database Schema**
Tabele były już gotowe w Supabase, ale teraz są aktywnie wykorzystywane:
```sql
-- cross_app_notifications: przechowuje powiadomienia między aplikacjami
-- project_links: łączy projekty CalcReno z projektami RenoTimeline
```

### 🔄 **Zintegrowane Komponenty:**

#### **ProjectCard Component** - Enhanced
- Dodany `ProjectExportButton` pod informacjami o projekcie
- Przekazuje full project object zamiast individual props
- Lepszy TypeScript typing

#### **Main Header** - Enhanced  
- Dodany `NotificationCenter` obok logout button
- Notification bell z unread counter
- Horizontal layout dla notifications + logout

#### **Index Screen** - Enhanced
- Import i użycie NotificationCenter
- Updated ProjectCard props

### 🎯 **User Experience Flow:**

1. **Użytkownik tworzy projekt w CalcReno** i dodaje pomieszczenia
2. **Przy zapisie kalkulacji** - Event Detection automatycznie sprawdza triggery
3. **Purple export button pojawia się** na ProjectCard
4. **Klik Export** → sukcess alert + opcja otwarcia RenoTimeline
5. **Button zmienia się na green** "Otwórz w RenoTimeline"
6. **Powiadomienia z RenoTimeline** pojawiają się w bell icon
7. **Klik notification** → deep link do odpowiedniego projektu

### 🔧 **Technical Architecture:**

```
CalcReno Project Changes
        ↓
Event Detection Service
        ↓
Supabase: cross_app_notifications table
        ↓
RenoTimeline API (future)
        ↓
RenoTimeline displays notification
        ↓
User action in RenoTimeline
        ↓
Notification back to CalcReno
        ↓
CalcReno Notification Center
```

## 🚀 Roadmap Implementacji

## 🏗️ ✅ Etap Przygotowawczy: CalcReno → Supabase Integration (FUNDAMENT)

### 🎯 Cel Etapu:
**Migracja CalcReno z AsyncStorage na Supabase - stworzenie fundamentu dla całego ecosystem.**

### 🔑 Dlaczego To Musi Być Pierwsze:
- **Shared Authentication** - jeden account dla obu aplikacji
- **Cloud-Based Projects** - projekty dostępne z każdego urządzenia  
- **Persistent Project IDs** - stable references dla cross-app linking
- **Real-time Foundation** - infrastructure dla notifications
- **User Email Addresses** - potrzebne dla email notifications

### 📋 Zakres Prac:

#### 0.1 **Supabase Client Setup w CalcReno**
- **Install @supabase/supabase-js** w React Native app
- **Environment variables** - connection do twojego istniejącego Supabase
- **Auth configuration** - shared auth z RenoTimeline
- **Offline-first architecture** - AsyncStorage jako cache, Supabase jako source of truth

**CalcReno Implementation Details:**
```bash
# Dodać dependencje do package.json
npm install @supabase/supabase-js
```

```typescript
// app/utils/supabase.ts - nowy plik
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### 0.2 **Authentication Integration**
- **Login/Register screens** w CalcReno
- **Shared user accounts** - same auth system jak RenoTimeline
- **Auto-migration prompt** - existing local projects → cloud
- **Guest mode fallback** - optional dla users którzy nie chcą account

**CalcReno Implementation Details:**
```typescript
// app/auth/AuthScreen.tsx - nowy komponent
import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { supabase } from '../utils/supabase';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    
    if (error) console.error('Auth error:', error.message);
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Zaloguj się' : 'Utwórz konto'}
      </Text>
      
      <TextInput
        className="border border-gray-300 rounded p-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        className="border border-gray-300 rounded p-3 mb-4"
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Pressable
        className="bg-blue-500 rounded p-3 mb-4"
        onPress={handleAuth}
      >
        <Text className="text-white text-center font-semibold">
          {isLogin ? 'Zaloguj' : 'Zarejestruj'}
        </Text>
      </Pressable>
    </View>
  );
}
```

```typescript
// app/hooks/useAuth.tsx - nowy hook
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

#### 0.3 **Database Schema dla CalcReno**
```sql
-- CalcReno-specific tables w twojej istniejącej Supabase
CREATE TABLE calcreno_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  status text CHECK (status IN ('W trakcie', 'Planowany', 'Zakończony', 'Wstrzymany')),
  start_date date,
  end_date date,
  is_pinned boolean DEFAULT false,
  total_cost decimal,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE calcreno_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES calcreno_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  shape text CHECK (shape IN ('rectangle', 'l-shape')),
  dimensions jsonb NOT NULL,
  corner text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE calcreno_room_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES calcreno_rooms(id) ON DELETE CASCADE,
  type text CHECK (type IN ('door', 'window')),
  width decimal NOT NULL,
  height decimal NOT NULL,
  position decimal NOT NULL,
  wall integer NOT NULL
);

-- RLS Policies
ALTER TABLE calcreno_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calcreno_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE calcreno_room_elements ENABLE ROW LEVEL SECURITY;
```

#### 0.4 **Data Migration System**
- **AsyncStorage → Supabase migration** one-time process
- **Data preservation** - zero data loss during migration
- **Rollback capability** - safety net if migration fails
- **Progress indicator** - user sees migration progress

**CalcReno Implementation Details:**
```typescript
// app/utils/migration.ts - nowy plik
import { StorageService } from './storage';
import { supabase } from './supabase';

export class DataMigrationService {
  static async migrateToSupabase(userId: string, onProgress?: (step: string, progress: number) => void) {
    try {
      onProgress?.('Pobieranie lokalnych projektów...', 10);
      
      // 1. Pobranie wszystkich lokalnych projektów
      const localProjects = await StorageService.getProjects();
      
      if (localProjects.length === 0) {
        onProgress?.('Brak projektów do migracji', 100);
        return { success: true, migrated: 0 };
      }

      onProgress?.('Przygotowanie danych...', 30);
      
      // 2. Konwersja lokalnych projektów na format Supabase
      const migratedCount = localProjects.length;
      
      for (let i = 0; i < localProjects.length; i++) {
        const project = localProjects[i];
        
        onProgress?.(`Migracja projektu ${i + 1}/${localProjects.length}...`, 
          30 + (i / localProjects.length) * 60);

        // 3. Zapis projektu do Supabase
        const { error: projectError } = await supabase
          .from('calcreno_projects')
          .insert({
            id: project.id,
            user_id: userId,
            name: project.name,
            description: project.description,
            status: project.status,
            start_date: project.startDate,
            end_date: project.endDate,
            is_pinned: project.isPinned,
            total_cost: project.totalCost,
          });

        if (projectError) throw projectError;

        // 4. Migracja pomieszczeń
        for (const room of project.rooms) {
          const { error: roomError } = await supabase
            .from('calcreno_rooms')
            .insert({
              id: room.id,
              project_id: project.id,
              name: room.name,
              shape: room.shape,
              dimensions: room.dimensions,
              corner: room.corner,
            });

          if (roomError) throw roomError;

          // 5. Migracja elementów pomieszczenia
          for (const element of room.elements) {
            const { error: elementError } = await supabase
              .from('calcreno_room_elements')
              .insert({
                id: element.id,
                room_id: room.id,
                type: element.type,
                width: element.width,
                height: element.height,
                position: element.position,
                wall: element.wall,
              });

            if (elementError) throw elementError;
          }
        }
      }

      onProgress?.('Finalizacja migracji...', 95);
      
      // 6. Oznaczenie migracji jako zakończonej
      await AsyncStorage.setItem('calcreno_migrated', 'true');
      
      onProgress?.('Migracja zakończona!', 100);
      
      return { success: true, migrated: migratedCount };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, error };
    }
  }

  static async checkMigrationStatus(): Promise<boolean> {
    try {
      const migrated = await AsyncStorage.getItem('calcreno_migrated');
      return migrated === 'true';
    } catch {
      return false;
    }
  }
}
```

```typescript
// app/components/MigrationScreen.tsx - nowy komponent
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { DataMigrationService } from '../utils/migration';
import { useAuth } from '../hooks/useAuth';

export function MigrationScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');

  const handleMigration = async () => {
    if (!user) return;
    
    setMigrating(true);
    
    const result = await DataMigrationService.migrateToSupabase(
      user.id,
      (step, progress) => {
        setStep(step);
        setProgress(progress);
      }
    );

    if (result.success) {
      onComplete();
    }
    
    setMigrating(false);
  };

  return (
    <View className="flex-1 justify-center p-6">
      <Text className="text-xl font-bold mb-4 text-center">
        Migracja Danych do Chmury
      </Text>
      
      {migrating ? (
        <View>
          <Text className="text-center mb-4">{step}</Text>
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-center mt-2">{progress}%</Text>
        </View>
      ) : (
        <Pressable
          className="bg-green-500 rounded p-4"
          onPress={handleMigration}
        >
          <Text className="text-white text-center font-semibold">
            Rozpocznij Migrację
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

#### 0.5 **Offline-First Sync**
- **Local cache** - AsyncStorage as fast local storage
- **Smart sync** - only upload changes
- **Conflict resolution** - handle offline edits
- **Background sync** - automatic when online

### 📈 Success Metrics:
- 90%+ data migration success rate (zero data loss)
- 70%+ users complete auth setup willingly
- 50%+ users actively use cloud sync features
- Performance equal or better than AsyncStorage

### ⏱️ Timeline: 2-3 tygodnie

---

## Faza 2: Smart Notifications (RenoTimeline → CalcReno)

### 🎯 Cel Fazy:
**CalcReno receives intelligent notifications from RenoTimeline** o postępach, problemach i możliwościach optymalizacji projektów.

### 📋 Zakres Prac:

#### 2.1 **Notification Reception System w CalcReno**

**CalcReno Implementation Details:**
```typescript
// app/components/NotificationCenter.tsx - Enhanced version
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';

interface RenoTimelineNotification {
  id: string;
  project_id: string;
  project_name: string;
  notification_type: 'progress_update' | 'budget_alert' | 'milestone' | 'delay_warning';
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    task_name?: string;
    completion_percentage?: number;
    budget_impact?: number;
    timeline_impact?: string;
    suggested_action?: string;
  };
  created_at: string;
  read_at?: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<RenoTimelineNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
            filter: `recipient_user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as RenoTimelineNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cross_app_notifications')
        .select('*')
        .eq('recipient_user_id', user.id)
        .eq('source_app', 'renotimeline')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read_at).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress_update': return '✅';
      case 'budget_alert': return '💰';
      case 'milestone': return '🎯';
      case 'delay_warning': return '⚠️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-blue-100 border-blue-300';
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
            <Pressable onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {notifications.length === 0 ? (
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
                      <Text className="text-xs text-gray-500">
                        Projekt: {notification.project_name}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString('pl-PL')}
                      </Text>

                      {notification.metadata?.suggested_action && (
                        <View className="mt-3 p-2 bg-blue-50 rounded">
                          <Text className="text-sm text-blue-800">
                            💡 Sugerowane działanie: {notification.metadata.suggested_action}
                          </Text>
                        </View>
                      )}

                      {notification.action_url && (
                        <Pressable className="mt-2 bg-blue-500 rounded px-3 py-2 self-start">
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
```

#### 2.2 **Notification API Endpoint w CalcReno**

```typescript
// app/api/notifications.ts - nowy plik (jeśli potrzebujesz local API)
// Lub bezpośrednio przez Supabase triggers

// Supabase function dla webhook z RenoTimeline
create or replace function handle_renotimeline_notification()
returns trigger as $$
begin
  -- Automatycznie wyślij email notification
  perform net.http_post(
    url := 'https://your-email-service.com/send',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'to', (select email from auth.users where id = new.recipient_user_id),
      'subject', new.title,
      'html', format('<h2>%s</h2><p>%s</p><p>Projekt: %s</p>', 
        new.title, new.message, new.project_name)
    )
  );
  return new;
end;
$$ language plpgsql;

-- Trigger przy dodaniu nowego powiadomienia
create trigger on_renotimeline_notification_created
  after insert on cross_app_notifications
  for each row execute function handle_renotimeline_notification();
```

#### 2.3 **Enhanced Database Schema for Notifications**

```sql
-- Rozszerzona tabela powiadomień
ALTER TABLE cross_app_notifications ADD COLUMN IF NOT EXISTS recipient_user_id uuid REFERENCES auth.users(id);
ALTER TABLE cross_app_notifications ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE cross_app_notifications ADD COLUMN IF NOT EXISTS notification_type text;
ALTER TABLE cross_app_notifications ADD COLUMN IF NOT EXISTS action_url text;
ALTER TABLE cross_app_notifications ADD COLUMN IF NOT EXISTS read_at timestamp;

-- Indeksy dla performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON cross_app_notifications(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON cross_app_notifications(recipient_user_id) WHERE read_at IS NULL;
```

#### 2.4 **Integration w Main App Layout**

```typescript
// app/_layout.tsx - dodaj NotificationCenter do header
import { NotificationCenter } from './components/NotificationCenter';

// W głównym headerze (obok logout button)
<View className="flex-row items-center space-x-2">
  <NotificationCenter />
  {user && (
    <Pressable onPress={handleLogout} className="p-2">
      <Ionicons name="log-out" size={24} color="#666" />
    </Pressable>
  )}
</View>
```

#### 2.5 **Rich Email Templates (CalcReno Users)**

```html
<!-- Email template for CalcReno users -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aktualizacja z RenoTimeline</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; color: white; padding: 20px; text-align: center;">
    <h1>📅 Aktualizacja z RenoTimeline</h1>
  </div>
  
  <div style="padding: 20px;">
    <h2>{{notification.title}}</h2>
    <p>{{notification.message}}</p>
    
    <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3>📊 Szczegóły projektu: {{project_name}}</h3>
      {{#if metadata.completion_percentage}}
      <p><strong>Postęp:</strong> {{metadata.completion_percentage}}%</p>
      {{/if}}
      {{#if metadata.budget_impact}}
      <p><strong>Wpływ na budżet:</strong> {{metadata.budget_impact}} PLN</p>
      {{/if}}
      {{#if metadata.timeline_impact}}
      <p><strong>Wpływ na harmonogram:</strong> {{metadata.timeline_impact}}</p>
      {{/if}}
    </div>

    {{#if metadata.suggested_action}}
    <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
      <h4>💡 Sugerowane działanie:</h4>
      <p>{{metadata.suggested_action}}</p>
    </div>
    {{/if}}

    <div style="text-align: center; margin: 30px 0;">
      <a href="calcreno://project/{{project_id}}" 
         style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">
        📱 Otwórz w CalcReno
      </a>
      <a href="{{action_url}}" 
         style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        👀 Zobacz w RenoTimeline
      </a>
    </div>
  </div>
  
  <div style="background: #F9FAFB; padding: 15px; text-align: center; color: #6B7280; font-size: 14px;">
    <p>Otrzymujesz to powiadomienie, ponieważ Twój projekt CalcReno jest realizowany w RenoTimeline.</p>
    <p><a href="#" style="color: #4F46E5;">Wyłącz powiadomienia</a> | <a href="#" style="color: #4F46E5;">Zarządzaj preferencjami</a></p>
  </div>
</body>
</html>
```

#### 2.6 **Event Types from RenoTimeline**

```typescript
// Types of notifications CalcReno receives from RenoTimeline
interface RenoTimelineEventTypes {
  'progress_update': {
    task_name: string;
    completion_percentage: number;
    actual_vs_planned: string;
  };
  'budget_alert': {
    budget_variance: number;
    cost_category: string;
    suggested_action: string;
  };
  'milestone': {
    milestone_name: string;
    completion_date: string;
    next_phase: string;
  };
  'delay_warning': {
    delayed_task: string;
    impact_days: number;
    critical_path: boolean;
  };
  'material_ready': {
    material_type: string;
    delivery_date: string;
    installation_ready: boolean;
  };
  'cost_savings_opportunity': {
    potential_savings: number;
    optimization_area: string;
    action_required: string;
  };
}
```

#### 2.7 **CalcReno Specific Notification Handling**

```typescript
// app/utils/notificationHandler.ts - nowy plik
import { Alert } from 'react-native';
import { Linking } from 'expo-linking';
import { supabase } from './supabase';

export class CalcRenoNotificationHandler {
  static async handleProgressUpdate(notification: RenoTimelineNotification) {
    // Sprawdź czy completion_percentage pozwala na aktualizację kosztorysu
    if (notification.metadata?.completion_percentage === 100) {
      Alert.alert(
        'Zadanie ukończone!',
        `Zadanie "${notification.metadata.task_name}" zostało ukończone. Czy chcesz sprawdzić rzeczywiste koszty w kalkulacji?`,
        [
          { text: 'Później' },
          { 
            text: 'Sprawdź koszt', 
            onPress: () => Linking.openURL(`calcreno://project/${notification.project_id}/calculate`)
          }
        ]
      );
    }
  }

  static async handleBudgetAlert(notification: RenoTimelineNotification) {
    const budgetImpact = notification.metadata?.budget_impact;
    if (budgetImpact && Math.abs(budgetImpact) > 1000) {
      Alert.alert(
        'Znacząca zmiana budżetu',
        `Zmiana budżetu: ${budgetImpact > 0 ? '+' : ''}${budgetImpact} PLN. Czy chcesz zaktualizować kalkulację w CalcReno?`,
        [
          { text: 'Nie teraz' },
          { 
            text: 'Aktualizuj kalkulację', 
            onPress: () => Linking.openURL(`calcreno://project/${notification.project_id}/budget`)
          }
        ]
      );
    }
  }

  static async handleMilestone(notification: RenoTimelineNotification) {
    // Zaznacz milestone w CalcReno project status
    try {
      await supabase
        .from('calcreno_projects')
        .update({ 
          status: 'W trakcie',
          updated_at: new Date().toISOString()
        })
        .eq('id', notification.project_id);
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  }

  static async handleDelayWarning(notification: RenoTimelineNotification) {
    if (notification.metadata?.critical_path) {
      Alert.alert(
        'Krytyczne opóźnienie!',
        `Opóźnienie zadania "${notification.metadata.delayed_task}" może wpłynąć na cały projekt. Sprawdź czy potrzebne są dodatkowe zasoby.`,
        [
          { text: 'OK' },
          { 
            text: 'Zobacz harmonogram', 
            onPress: () => Linking.openURL(notification.action_url || '')
          }
        ]
      );
    }
  }
}
```

#### 2.8 **Push Notifications Implementation**

**Dependencies Installation:**
```bash
npx expo install expo-notifications expo-device expo-constants
```

**CalcReno Push Notification Service:**
```typescript
// app/utils/pushNotifications.ts - nowy plik
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('Push token:', token);
        
        // Save token to Supabase for the current user
        await this.savePushTokenToDatabase(token);
        
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  static async savePushTokenToDatabase(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: Platform.OS,
          app_name: 'calcreno',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,app_name'
        });

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error in savePushTokenToDatabase:', error);
    }
  }

  static async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'renotimeline_notification') {
      // Handle different notification types
      switch (data.notification_type) {
        case 'progress_update':
          if (data.project_id) {
            Linking.openURL(`calcreno://project/${data.project_id}`);
          }
          break;
        case 'budget_alert':
          if (data.project_id) {
            Linking.openURL(`calcreno://project/${data.project_id}/budget`);
          }
          break;
        case 'milestone':
          if (data.action_url) {
            Linking.openURL(data.action_url);
          }
          break;
        default:
          // Open notification center
          break;
      }
    }
  }

  static setupNotificationListeners() {
    // Handle notifications when app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Update badge count or show in-app notification
    });

    // Handle notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }
}
```

**Enhanced Auth Hook with Push Notifications:**
```typescript
// app/hooks/useAuth.tsx - Enhanced version
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { PushNotificationService } from '../utils/pushNotifications';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Register for push notifications if user is logged in
      if (session?.user) {
        PushNotificationService.registerForPushNotifications();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Register for push notifications when user signs in
          await PushNotificationService.registerForPushNotifications();
        }
      }
    );

    // Setup notification listeners
    const cleanup = PushNotificationService.setupNotificationListeners();

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, []);

  return { user, loading };
}
```

**Database Schema for Push Tokens:**
```sql
-- User push tokens table
CREATE TABLE user_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android')),
  app_name text NOT NULL CHECK (app_name IN ('calcreno', 'renotimeline')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, app_name)
);

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens
  FOR ALL USING (auth.uid() = user_id);
```

**Enhanced Cross-App Notification with Push:**
```typescript
// Supabase Edge Function: send-push-notification
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { notification } = await req.json();
    
    // Get user's push token for CalcReno
    const { data: tokenData } = await supabase
      .from('user_push_tokens')
      .select('push_token')
      .eq('user_id', notification.recipient_user_id)
      .eq('app_name', 'calcreno')
      .single();

    if (!tokenData?.push_token) {
      return new Response('No push token found', { status: 404 });
    }

    // Send push notification via Expo Push API
    const message = {
      to: tokenData.push_token,
      sound: 'default',
      title: notification.title,
      body: notification.message,
      data: {
        type: 'renotimeline_notification',
        notification_type: notification.notification_type,
        project_id: notification.project_id,
        action_url: notification.action_url,
      },
      badge: 1,
      priority: notification.priority === 'high' ? 'high' : 'normal',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

**App Configuration for Push Notifications:**
```json
// app.json - Enhanced configuration
{
  "expo": {
    "name": "CalcReno",
    "slug": "calcreno",
    "scheme": "calcreno",
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#4F46E5",
      "sounds": ["./assets/sounds/notification.wav"]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#4F46E5",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

**Enhanced Main App Layout with Push Setup:**
```typescript
// app/_layout.tsx - Enhanced with push notifications
import { useEffect } from 'react';
import { PushNotificationService } from './utils/pushNotifications';
import { useAuth } from './hooks/useAuth';

export default function RootLayout() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Register for push notifications when app starts and user is authenticated
      PushNotificationService.registerForPushNotifications();
    }
  }, [user]);

  // ... rest of layout code
}
```

### 📈 Success Metrics:
- **90%+ notification delivery rate** z RenoTimeline do CalcReno
- **70%+ open rate** dla email notifications
- **50%+ users** regularnie sprawdzają notification center
- **30%+ action rate** na suggested actions w powiadomieniach

## Faza 3: AI Integration

### 🎯 Cel Fazy:
Wykorzystanie AI do analizy korelacji między kosztami a harmonogramem oraz predykcyjnych insights.

### 📋 Zakres Prac:

#### 3.1 **Correlation Engine między Cost Data i Time Data**
**Case vs Budget Analytics:**
- **Czas pracy** był zgodny z kalkulacją 20%
- **Efficiency Patterns** - teams które konsekwentnie przekraczają zapłanowane ramki
- **Seasonality** - ceny materiałów wahają się w różnych porach roku

#### 3.2 **Predictive Notifications**
**"Tej podstawie poprzednich projektów:**
- **Cost Overrun Alerts** - projekt skłania się ku przekroczeniu budżetu
- **Timeline Predictions** - na podstawie postępu może się opóźnić
- **Efficiency Recommendations** - teams które mogu usprawić workflow

#### 3.3 **AI-Powered Cross-App Insights**
**Smart Correlation Engine:**
```typescript
interface AIInsight {
  insight_type: 'cost_efficiency' | 'timeline_prediction' | 'resource_optimization';
  confidence: number; // 0-1
  description: string;
  recommended_actions: string[];
  data_sources: Array<{
    app: string;
    data_type: string;
    time_range: string;
  }>;
}
```

#### 3.4 **Predictive Notifications**
```html
🤖 [AI Insight] Projekt "Remont kuchni" - Predykcja kosztów

Na podstawie analizy 50+ podobnych projektów:
⚠️ Istnieje 78% prawdopodobieństwo przekroczenia budżetu o ~15%

🎯 Główne czynniki ryzyka:
- Opóźnienia w dostawach materiałów (aktualnie 3 dni)
- Zespół ma tendencję do 20% przekroczenia czasu na instalacje elektryczne

💡 Sugerowane działania:
1. Zabezpiecz dodatkowy budżet na materiały (+10%)
2. Rozważ przyspieszenie dostaw kluczowych materiałów
3. Zaplanuj buffer czasowy dla prac elektrycznych

[Zobacz szczegóły] [Aktualizuj budżet w CalcReno] [Dostosuj timeline]
```

### 📈 Success Metrics:
- 60%+ accuracy w predykcjach AI
- 50%+ users implementuje AI recommendations
- 20% redukcja cost overruns w projektach z AI insights

## Faza 4: Full Ecosystem

### 🎯 Cel Fazy:
Kompletny ecosystem z zaawansowanymi funkcjami współpracy i analityki.

### 📋 Zakres Prac:

#### 4.1 **Mobile Notifications przy PWA**
- **Push notifications** na urządzenia mobilne
- **Cross-app deep linking** w mobile
- **Offline notification queue** - sync po powrocie online

#### 4.2 **Client Portal i Cross-App Reporting**
- **Unified dashboard** dla klientów z obu aplikacji
- **Integrated progress reports** - costs + timeline w jednym miejscu
- **Predictive project completion** estimates

#### 4.3 **Integration z Zewnętrznymi Tools (Accounting, etc.)**
- **Integracja z e-księgowością** (fakturowanie automatyczne)
- **Supplier APIs** - real-time pricing i availability updates
- **Weather API** integration dla outdoor work scheduling

#### 4.4 **Advanced Workflow Automation**
- **Cross-app workflows** - events w jednej aplikacji trigger actions w drugiej
- **Approval processes** spanning both apps
- **Automated reporting** i invoice generation

### 📈 Success Metrics:
- 80%+ users aktywnie korzysta z ecosystem features
- 40% wzrost customer satisfaction scores
- 30% redukcja total project completion time

## 🛠️ Technical Considerations

### Lightweight Integration:
- **Minimal API surface** - tylko basic data + events
- **Event-driven architecture** - notification triggers
- **Async processing** - nie blocking UI operations
- **Graceful degradation** - apps działają independently

### Privacy & Security:
- **Opt-in notifications** - user kontroluje co dostaje
- **Data minimization** - tylko necessary info crosses apps
- **Secure API keys** - encrypted communication
- **GDPR compliance** - easy data deletion path

## ✅ Verdict: Brilliant Simplification

### 🎯 Benefits:
- **No podejście jest znacznie lepsze od complex data sync**
- **Clear value** - immediate benefit dla users
- **Scalable** - easy to add more notification types
- **Low risk** - apps remain independent
- **Business sense** - clean monetization path

### 🚀 Realistic scope - achievable & reasonable timeline
### 💼 User value - immediate benefit dla users  
### 🎯 Clear implementation path

## 📊 Główna Integracja: Smart Notifications System

### Concept:
Aplikacje komunikują się przez inteligentne powiadomienia. a nie przez kompleksową synchronizację danych.

### Progress Updates:
- **Project Moment Reached** - zadanie 'wykonanie kończy zostać ukończone'
- **Budget Alert** - przekroczenie budżetu 50% realizacji, Czas na update kosztorysu w CalcReno  
- **Milestone Notifications** - faza projektu zakończona/rozpoczęta

### CalcReno → RenoTimeline Notifications:
**Budget Insights:**
- "Budżet zostanie złożenety z 13%. Sprawdź aktualizację w harmonogramie" 
- "Nowy kosztorys zmiało 40% dostępności. Probuemy zaplanowanie ramice"  
- "Materiały zaawansowane gotowe. Dodatkowe proce skargu w kalendarz?"

**Budget Alerts:**
- "Dodatkowe nowe zadanie. Wstaw nurt kosztorys w kalendarzu"
- "Projekty pozatywy o 1 tydzień. Sprawdź wp na otywy kalendarz"

### Future AI:
**AI wysyła puszczalne kosztorys w RenoTimeline, projekt skłoni się na 30% przewyższenia budżetu-**
"z podstawy podobnych projektów i historii zespołu, usuwm dostępność 2 Bunkzenie roboczy..."

### Email-First Notification Strategy

### Dlaczego Email:
- **Universal access** - działa niezależnie od tego, w której aplikacji jest user
- **Professional** - business users preferują email dla wichtigych powiadomień  
- **Rich content** - można załączyć screenshots, linki, dane
- **Persistent** - nie znika jak in-app notification

### Architektura Powiadomień

### Notification Bridge Service
Jak działa:
1. **Event Detection** - każda aplikacja wykrywa ważne wydarzenia
2. **Cross-App Notification API** - wysyła powiadomienie do drugiej aplikacji  
3. **Smart Filtering** - AI decyduje które wydarzenia są releventne
4. **Multi-Channel Delivery** - email + in-app notification center

### Technical Flow:
**RenoTimeline Side:**
```
📅 Task Completed → Event Trigger →
Check if project has CalcReno link →
Generate notification →
Send to Notification Bridge →
Deliver to CalcReno user
```

**CalcReno Side:**  
```
💰 Budget Updated → Event Trigger →
Check if project linked to RenoTimeline →
Generate notification → 
Send to Notification Bridge →
Deliver to RenoTimeline user
```

### 🎯 Next Steps - Implementation Roadmap:

## 🚀 **ETAP 0: CalcReno → Supabase (FUNDAMENT) - 2-3 tygodnie**
1. **Install Supabase client** w CalcReno React Native
2. **Setup authentication screens** (login/register) 
3. **Create CalcReno database schema** w istniejącej Supabase
4. **Build data migration system** AsyncStorage → Supabase
5. **Implement offline-first sync** z conflict resolution
6. **Test user migration flow** end-to-end z data preservation

## 🔗 **ETAP 1: Cross-App Linking (MVP) - 1-2 tygodnie**  
1. **Setup project export API endpoint** w RenoTimeline (przyjmuje dane z CalcReno)
2. **Implement "Export to RenoTimeline" button** w CalcReno (authenticated users only)
3. **Add shared user verification** - owner-only project export
4. **Test basic workflow**: CalcReno project → RenoTimeline creation

## 📧 **ETAP 2: Smart Notifications (VALUE) - 2-3 tygodnie**
1. **Implement cross-app notification API** w obu aplikacjach (bidirectional notifications)
2. **Implement basic event detection** (budget changes w CalcReno, task completion w RenoTimeline)  
3. **Create email templates** for cross-app notifications
4. **Setup notification center enhancement** w RenoTimeline
5. **Test notification flow** end-to-end: events → emails → actions

## 🤖 **ETAP 3+: AI & Advanced Features**
- Correlation engine, predictive insights, advanced workflow automation

### 💡 **Kluczowa Insight:**
Bez Etapu 0 (Supabase integration), reszta systemu nie ma fundamentu. Users bez account = no cross-app features.

Dzięki takiemu podejściu możemy stworzyć wartościowy ecosystem bez skomplikowanej synchronizacji danych!

---

## 📱 **CalcReno Detailed Implementation Plan**

### 🎯 **Current CalcReno State Analysis:**
- **Tech Stack:** React Native + Expo, TypeScript, NativeWind + Tailwind
- **Storage:** AsyncStorage (local only)
- **Architecture:** Component-based with hooks (useProjectData, useToast)
- **Features:** Project management, room geometry, cost calculations, PDF export
- **Dependencies:** 20+ Expo modules, React Native ecosystem

### 🔄 **Required Changes Summary:**

#### **New Dependencies:**
```bash
npm install @supabase/supabase-js expo-linking
```

#### **New File Structure:**
```
app/
  auth/
    AuthScreen.tsx          # Login/register UI
  utils/
    supabase.ts            # Supabase client config
    migration.ts           # AsyncStorage → Supabase migration
    eventDetection.ts      # Cross-app event detection
  hooks/
    useAuth.tsx            # Authentication state management
  components/
    MigrationScreen.tsx    # Migration progress UI
    ProjectExportButton.tsx # Export to RenoTimeline
```

#### **Modified Files:**
- `app/_layout.tsx` - Add auth wrapper and migration prompts
- `app/hooks/useProjectData.tsx` - Integrate event detection
- `app/utils/storage.ts` - Hybrid local/cloud storage
- `app/index.tsx` - Add auth prompts and export buttons
- `package.json` - New dependencies

### 🏗️ **Implementation Phases:**

#### **Phase 0.1: Supabase Foundation (2 days)**
1. **Environment Setup**
   - Install Supabase client
   - Configure environment variables
   - Create Supabase client utility

2. **Authentication Integration**
   - Build auth screens (login/register)
   - Implement auth state management
   - Add guest mode support

#### **Phase 0.2: Data Migration (3 days)**
1. **Migration System**
   - Build migration service with progress tracking
   - Implement data preservation safeguards
   - Add rollback capabilities

2. **Storage Layer Upgrade**
   - Modify storage service for hybrid local/cloud
   - Implement offline-first sync
   - Add conflict resolution

#### **Phase 1: Cross-App Features (2 days)**
1. **Project Export**
   - Build export button component
   - Integrate with RenoTimeline API
   - Add deep linking support

2. **Event Detection**
   - Implement budget change detection
   - Add project completion tracking
   - Integrate notification sending

### 🎯 **Key Integration Points:**

#### **Data Mapping: CalcReno → RenoTimeline**
```typescript
// CalcReno Project → RenoTimeline Project
{
  name: project.name,
  description: project.description,
  start_date: project.startDate,
  end_date: project.endDate,
  estimated_budget: project.totalCost,
  source: 'calcreno',
  source_project_id: project.id
}
```

#### **Event Types to Detect:**
- **Budget Changes** (>15% change)
- **Project Completion** (100% rooms calculated)
- **Significant Cost Items** (>25% of total budget)

#### **Notification Triggers:**
- Send to RenoTimeline when budget changes significantly
- Alert when project calculation is complete
- Notify about major cost variances

### 🔧 **Technical Considerations:**

#### **Offline-First Architecture:**
- AsyncStorage remains primary for speed
- Supabase as source of truth
- Background sync when online
- Conflict resolution for offline edits

#### **User Experience:**
- Seamless migration with progress indicator
- Optional cloud features (guest mode available)
- Deep linking between apps
- Smart notification preferences

#### **Data Security:**
- Shared authentication with RenoTimeline
- User-owned data model
- Encrypted communication
- GDPR compliance ready

### 📊 **Success Metrics:**
- **Migration Success:** 90%+ zero data loss
- **User Adoption:** 70%+ complete auth setup
- **Performance:** Equal or better than AsyncStorage
- **Integration Usage:** 50%+ use cross-app features

### ⚠️ **Risk Mitigation:**
- **Gradual rollout** with feature flags
- **Rollback plan** if migration fails
- **Fallback modes** for offline operation
- **Data backup** before any migration

### 🎉 **Value Proposition for CalcReno Users:**
- **Cloud backup** of projects (never lose data)
- **Cross-device sync** (phone ↔ tablet)
- **Seamless timeline creation** from cost estimates
- **Smart project insights** via RenoTimeline integration
- **Professional workflow** with notifications and exports 
