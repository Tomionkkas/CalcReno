import { Alert } from 'react-native';
import { Linking } from 'react-native';
import { supabase } from './supabase';

export interface RenoTimelineNotificationData {
  notification_type: 'progress_update' | 'budget_alert' | 'milestone' | 'delay_warning' | 'material_ready' | 'cost_savings_opportunity';
  project_id?: string;
  project_name?: string;
  task_name?: string;
  completion_percentage?: number;
  budget_impact?: number;
  suggested_action?: string;
  action_url?: string;
}

export class CalcRenoNotificationHandler {
  static async handleProgressUpdate(data: RenoTimelineNotificationData) {
    if (data.completion_percentage === 100) {
      Alert.alert(
        'Zadanie ukończone!',
        `Zadanie "${data.task_name}" zostało ukończone. Czy chcesz sprawdzić rzeczywiste koszty w kalkulacji?`,
        [
          { text: 'Później' },
          { 
            text: 'Sprawdź koszty', 
            onPress: () => this.openCalcRenoProject(data.project_id) 
          }
        ]
      );
    }
  }

  static async handleBudgetAlert(data: RenoTimelineNotificationData) {
    const impact = data.budget_impact || 0;
    const impactText = impact > 0 ? `przekroczenie o ${impact} PLN` : `oszczędność ${Math.abs(impact)} PLN`;
    
    Alert.alert(
      'Alert budżetowy',
      `Projekt "${data.project_name}" ma ${impactText}. Czy chcesz zaktualizować kalkulację?`,
      [
        { text: 'Ignoruj' },
        { 
          text: 'Aktualizuj', 
          onPress: () => this.openCalcRenoProject(data.project_id) 
        }
      ]
    );
  }

  static async handleMilestone(data: RenoTimelineNotificationData) {
    Alert.alert(
      'Kamień milowy osiągnięty!',
      `Projekt "${data.project_name}" osiągnął ważny kamień milowy. Sprawdź postępy w RenoTimeline.`,
      [
        { text: 'OK' },
        { 
          text: 'Zobacz w RenoTimeline', 
          onPress: () => this.openRenoTimeline(data.action_url) 
        }
      ]
    );
  }

  static async handleDelayWarning(data: RenoTimelineNotificationData) {
    Alert.alert(
      'Ostrzeżenie o opóźnieniu',
      `Projekt "${data.project_name}" może się opóźnić. ${data.suggested_action || 'Sprawdź harmonogram w RenoTimeline.'}`,
      [
        { text: 'OK' },
        { 
          text: 'Zobacz szczegóły', 
          onPress: () => this.openRenoTimeline(data.action_url) 
        }
      ]
    );
  }

  static async handleMaterialReady(data: RenoTimelineNotificationData) {
    Alert.alert(
      'Materiały gotowe',
      `Materiały dla projektu "${data.project_name}" są gotowe do odbioru. Czy chcesz zaktualizować status w kalkulacji?`,
      [
        { text: 'Później' },
        { 
          text: 'Aktualizuj', 
          onPress: () => this.openCalcRenoProject(data.project_id) 
        }
      ]
    );
  }

  static async handleCostSavingsOpportunity(data: RenoTimelineNotificationData) {
    const savings = data.budget_impact ? Math.abs(data.budget_impact) : 0;
    
    Alert.alert(
      'Możliwość oszczędności',
      `Znaleźliśmy sposób na zaoszczędzenie ${savings} PLN w projekcie "${data.project_name}". ${data.suggested_action}`,
      [
        { text: 'Ignoruj' },
        { 
          text: 'Zobacz szczegóły', 
          onPress: () => this.openRenoTimeline(data.action_url) 
        }
      ]
    );
  }

  private static async openCalcRenoProject(projectId?: string) {
    if (projectId) {
      // Deep link to specific project in CalcReno
      try {
        await Linking.openURL(`calcreno://project/${projectId}`);
      } catch (error) {
        console.error('Failed to open CalcReno project:', error);
      }
    }
  }

  private static async openRenoTimeline(actionUrl?: string) {
    if (actionUrl) {
      try {
        await Linking.openURL(actionUrl);
      } catch (error) {
        console.error('Failed to open RenoTimeline URL:', error);
        // Fallback to main RenoTimeline app
        await Linking.openURL('https://renotimeline.app');
      }
    } else {
      await Linking.openURL('https://renotimeline.app');
    }
  }

  // Main handler that routes notifications to appropriate handlers
  static async handleNotification(data: RenoTimelineNotificationData) {
    switch (data.notification_type) {
      case 'progress_update':
        return this.handleProgressUpdate(data);
      case 'budget_alert':
        return this.handleBudgetAlert(data);
      case 'milestone':
        return this.handleMilestone(data);
      case 'delay_warning':
        return this.handleDelayWarning(data);
      case 'material_ready':
        return this.handleMaterialReady(data);
      case 'cost_savings_opportunity':
        return this.handleCostSavingsOpportunity(data);
      default:
        console.log('Unknown notification type:', data.notification_type);
    }
  }

  // Create a test notification for development
  static async createTestNotification(userId: string) {
    try {
      const { error } = await supabase
        .from('cross_app_notifications')
        .insert({
          user_id: userId,
          source_app: 'renotimeline',
          target_app: 'calcreno',
          notification_type: 'progress_update',
          title: 'Test: Zadanie ukończone',
          message: 'Instalacja elektryczna została ukończona zgodnie z planem. Sprawdź rzeczywiste koszty.',
          project_id: 'test-project-123',
          project_name: 'Remont kuchni',
          priority: 'medium',
          metadata: {
            task_name: 'Instalacja elektryczna',
            completion_percentage: 100,
            suggested_action: 'Zaktualizuj rzeczywiste koszty w kalkulacji'
          },
          action_url: 'https://renotimeline.app/projects/test-project-123'
        });

      if (error) throw error;
      console.log('Test notification created successfully');
    } catch (error) {
      console.error('Failed to create test notification:', error);
    }
  }
} 