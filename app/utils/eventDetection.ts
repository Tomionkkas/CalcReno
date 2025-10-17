import { supabase, sharedSupabase } from './supabase';
import type { Project } from './storage';
import { generateUUID, isValidUUID } from './storage';

export interface CrossAppNotification {
  project_id: string;
  source_app: 'calcreno' | 'renotimeline';
  target_app: 'calcreno' | 'renotimeline';
  notification_type: 'budget_updated' | 'project_milestone' | 'cost_alert' | 'project_completion';
  title: string;
  message: string;
  data?: any;
  user_id: string;
}

export class EventDetectionService {
  static async detectBudgetChanges(
    project: Project, 
    previousTotalCost: number = 0,
    userId: string
  ) {
    const currentCost = project.totalCost || 0;
    const changePercentage = previousTotalCost > 0 
      ? ((currentCost - previousTotalCost) / previousTotalCost) * 100 
      : 0;

    // Jeśli zmiana > 15%, wyślij powiadomienie
    if (Math.abs(changePercentage) > 15 && previousTotalCost > 0) {
      await this.sendCrossAppNotification({
        project_id: project.id,
        source_app: 'calcreno',
        target_app: 'renotimeline',
        notification_type: 'budget_updated',
        title: 'Aktualizacja budżetu projektu',
        message: `Budżet projektu "${project.name}" ${changePercentage > 0 ? 'wzrósł' : 'spadł'} o ${Math.abs(changePercentage).toFixed(1)}%`,
        data: {
          old_cost: previousTotalCost,
          new_cost: currentCost,
          change_percentage: changePercentage,
          calcreno_link: `calcreno://project/${project.id}`,
        },
        user_id: userId,
      });
    }
  }

  static async detectProjectCompletion(project: Project, userId: string) {
    // Sprawdź czy wszystkie pomieszczenia mają kalkulacje
    const roomsWithCalculations = project.rooms.filter(room => 
      room.materials && room.materials.totalCost && room.materials.totalCost > 0
    );
    const completionRate = project.rooms.length > 0 
      ? (roomsWithCalculations.length / project.rooms.length) * 100 
      : 0;

    if (completionRate === 100 && project.status !== 'Zakończony' && project.rooms.length > 0) {
      await this.sendCrossAppNotification({
        project_id: project.id,
        source_app: 'calcreno',
        target_app: 'renotimeline',
        notification_type: 'project_milestone',
        title: 'Kosztorys projektu ukończony',
        message: `Kosztorys projektu "${project.name}" został ukończony! Wszystkie ${project.rooms.length} pomieszczeń ma wyliczone koszty. Czas na harmonogram realizacji.`,
        data: {
          total_rooms: project.rooms.length,
          total_cost: project.totalCost,
          completion_rate: completionRate,
          renotimeline_suggestion: 'create_timeline',
        },
        user_id: userId,
      });
    }
  }

  static async detectSignificantCostItem(
    project: Project, 
    roomId: string, 
    newCost: number,
    userId: string
  ) {
    const totalBudget = project.totalCost || 0;
    const costPercentage = totalBudget > 0 ? (newCost / totalBudget) * 100 : 0;

    // Jeśli koszt jednego pomieszczenia > 25% całego budżetu
    if (costPercentage > 25 && totalBudget > 0) {
      const room = project.rooms.find(r => r.id === roomId);
      await this.sendCrossAppNotification({
        project_id: project.id,
        source_app: 'calcreno',
        target_app: 'renotimeline',
        notification_type: 'cost_alert',
        title: 'Alert kosztów projektu',
        message: `Uwaga! Pomieszczenie "${room?.name || 'Nieznane'}" w projekcie "${project.name}" pochłania ${costPercentage.toFixed(1)}% całego budżetu`,
        data: {
          room_id: roomId,
          room_name: room?.name,
          room_cost: newCost,
          cost_percentage: costPercentage,
          total_budget: totalBudget,
        },
        user_id: userId,
      });
    }
  }

  static async sendCrossAppNotification(notification: CrossAppNotification) {
    try {
      // Validate user ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(notification.user_id)) {
        console.error('Invalid user ID format:', notification.user_id);
        console.error('Expected UUID format, got:', typeof notification.user_id, notification.user_id);
        return;
      }

      console.log('Sending notification with user ID:', notification.user_id);

      // 1. Zapisz powiadomienie w Supabase
      const { error } = await sharedSupabase
        .from('cross_app_notifications')
        .insert({
          user_id: notification.user_id,
          from_app: notification.source_app,
          to_app: notification.target_app,
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          is_read: false,
        });

      if (error) {
        console.error('Failed to save notification to database:', error);
        console.error('Notification data:', {
          user_id: notification.user_id,
          notification_type: notification.notification_type,
          title: notification.title
        });
        return;
      }

      // 2. Sprawdź czy projekt ma połączenie z RenoTimeline
      const { data: linkedProject, error: linkError } = await supabase
        .from('project_links')
        .select('renotimeline_project_id')
        .eq('calcreno_project_id', notification.project_id)
        .eq('user_id', notification.user_id)
        .single();

      if (linkError && linkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Failed to check project links:', linkError);
        return;
      }

      // 3. Jeśli jest połączenie, spróbuj wysłać do RenoTimeline
      if (linkedProject) {
        try {
          // TODO: Replace with actual RenoTimeline API endpoint when available
          const renoTimelineApiUrl = 'https://renotimeline.app/api/cross-app-notification';
          
          await fetch(renoTimelineApiUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${notification.user_id}`, // Simplified auth for now
            },
            body: JSON.stringify({
              ...notification,
              target_project_id: linkedProject.renotimeline_project_id,
            }),
          });
        } catch (fetchError) {
          console.warn('Failed to send notification to RenoTimeline:', fetchError);
          // This is expected for now since RenoTimeline API doesn't exist yet
        }
      }

      console.log('Cross-app notification processed:', notification.title);
    } catch (error) {
      console.error('Failed to send cross-app notification:', error);
    }
  }

  // Helper method to check if project has RenoTimeline link
  static async isProjectLinkedToRenoTimeline(projectId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('project_links')
        .select('id')
        .eq('calcreno_project_id', projectId)
        .eq('user_id', userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  // Get recent notifications for user
  static async getRecentNotifications(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('cross_app_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('target_app', 'calcreno')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('cross_app_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Failed to mark notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
} 