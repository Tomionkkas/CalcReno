import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { Calendar, ExternalLink, Clock, CheckCircle, X } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import { EventDetectionService } from '../utils/eventDetection';
import type { Project } from '../utils/storage';
import { generateUUID, isValidUUID } from '../utils/storage';

interface ProjectExportButtonProps {
  project: Project;
  onExportComplete?: () => void;
}

export default function ProjectExportButton({ project, onExportComplete }: ProjectExportButtonProps) {
  const { user, isGuest } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [renoTimelineProjectId, setRenoTimelineProjectId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    checkProjectLink();
  }, [project.id, user?.id]);

  const checkProjectLink = async () => {
    if (!user?.id) {
      setChecking(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('project_links')
        .select('renotimeline_project_id')
        .eq('calcreno_project_id', project.id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsLinked(true);
        setRenoTimelineProjectId(data.renotimeline_project_id);
      } else {
        setIsLinked(false);
        setRenoTimelineProjectId(null);
      }
    } catch (error) {
      console.error('Error checking project link:', error);
    } finally {
      setChecking(false);
    }
  };

  const exportToRenoTimeline = async () => {
    if (!user) {
      Alert.alert('Błąd', 'Musisz być zalogowany aby eksportować projekt do RenoTimeline');
      return;
    }

    if (isGuest) {
      Alert.alert('Funkcja niedostępna', 'Eksport do RenoTimeline jest dostępny tylko dla zalogowanych użytkowników. Zaloguj się, aby korzystać z tej funkcji.');
      return;
    }

    setExporting(true);

    try {
      // First, ensure the CalcReno project exists in the database
      const { data: existingProject } = await supabase
        .from('calcreno_projects')
        .select('id')
        .eq('id', project.id)
        .single();

      if (!existingProject) {
        // Create the project in CalcReno database first
        const { error: projectError } = await supabase
          .from('calcreno_projects')
          .insert({
            id: project.id,
            name: project.name,
            description: project.description,
            start_date: project.startDate,
            end_date: project.endDate,
            total_cost: project.totalCost,
            status: project.status,
            user_id: user.id,
          });

        if (projectError) {
          console.error('Failed to save CalcReno project:', projectError);
          throw new Error('Nie udało się zapisać projektu CalcReno do bazy danych');
        }
      }

      // Przygotowanie danych do eksportu (tylko podstawowe)
      const exportData = {
        calcreno_project_id: project.id,
        name: project.name,
        description: project.description || `Projekt importowany z CalcReno - ${project.rooms.length} pomieszczeń`,
        start_date: project.startDate,
        end_date: project.endDate,
        estimated_budget: project.totalCost || 0,
        user_email: user.email,
        user_id: user.id,
        rooms_count: project.rooms.length,
        completion_status: project.status,
        created_at: new Date().toISOString(),
      };

      // For now, simulate the API call and create local project link
      console.log('Exporting project to RenoTimeline:', exportData);
      
      // Call the real RenoTimeline import API
      const response = await fetch(`https://qxyuayjpllrndylxhgoq.supabase.co/functions/v1/import-from-calcreno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXVheWpwbGxybmR5bHhoZ29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzQ3MjgsImV4cCI6MjA2NDcxMDcyOH0.mJRzBqsdibq2szXkkbCRgAgQ5xUvbP9SieJx__cab_k`,
        },
        body: JSON.stringify(exportData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to import project to RenoTimeline');
      }

      const renoTimelineProjectId = result.renotimeline_project_id;
      
      // Update local state (no need to create link again as Edge Function handles it)
      setIsLinked(true);
      setRenoTimelineProjectId(renoTimelineProjectId);

      // Send success notification
      await EventDetectionService.sendCrossAppNotification({
        project_id: project.id,
        source_app: 'calcreno',
        target_app: 'renotimeline',
        notification_type: 'project_milestone',
        title: 'Nowy projekt z CalcReno',
        message: `Projekt "${project.name}" został pomyślnie zaimportowany z CalcReno`,
        data: {
          export_data: exportData,
          link_created: true,
        },
        user_id: user.id,
      } as any);

      // Show success modal
      setShowSuccessModal(true);

      onExportComplete?.();

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Błąd', 'Nie udało się eksportować projektu do RenoTimeline. Spróbuj ponownie później.');
    } finally {
      setExporting(false);
    }
  };

  const handleLinkedProjectPress = () => {
    // Show info modal instead of Alert
    setShowInfoModal(true);
  };

  // Don't show for guest users
  if (isGuest || !user) {
    return null;
  }

  if (checking) {
    return (
      <View className="bg-gray-100 rounded-lg p-3 mt-2">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#6B7280" />
          <Text className="text-gray-600 ml-2">Sprawdzanie połączenia...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {isLinked ? (
        <TouchableOpacity
          className="bg-green-500 rounded-lg p-3 mt-2 flex-row items-center justify-center"
          onPress={handleLinkedProjectPress}
          activeOpacity={0.8}
        >
          <CheckCircle size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">
             Połączono z RenoTimeline
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="bg-purple-500 rounded-lg p-3 mt-2 flex-row items-center justify-center"
          onPress={exportToRenoTimeline}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Eksportowanie...</Text>
            </>
          ) : (
            <>
              <Calendar size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">
                📅 Utwórz harmonogram w RenoTimeline
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-gray-800 rounded-xl mx-6 p-6 max-w-sm w-full border border-gray-700">
            {/* Close button */}
            <TouchableOpacity
              className="absolute top-4 right-4 p-1"
              onPress={() => setShowSuccessModal(false)}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Success icon */}
            <View className="items-center mb-4">
              <View className="bg-green-900/30 rounded-full p-3 mb-3">
                <CheckCircle size={32} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-white text-center">
                Sukces!
              </Text>
            </View>

            {/* Message */}
            <Text className="text-gray-300 text-center mb-6 leading-6">
              Projekt "{project.name}" został pomyślnie eksportowany do RenoTimeline.
            </Text>

            {/* Action button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3 px-6"
              onPress={() => setShowSuccessModal(false)}
            >
              <Text className="text-white font-semibold text-center">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Connected Project Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-gray-800 rounded-xl mx-6 p-6 max-w-sm w-full border border-gray-700">
            {/* Close button */}
            <TouchableOpacity
              className="absolute top-4 right-4 p-1"
              onPress={() => setShowInfoModal(false)}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Info icon */}
            <View className="items-center mb-4">
              <View className="bg-green-900/30 rounded-full p-3 mb-3">
                <CheckCircle size={32} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-white text-center">
                Projekt Połączony
              </Text>
            </View>

            {/* Message */}
            <View className="mb-6">
              <Text className="text-gray-300 text-center leading-6 mb-4">
                Projekt "{project.name}" jest już dostępny w RenoTimeline.
              </Text>
              <View className="bg-blue-900/30 rounded-lg p-4 border border-blue-800/50">
                <Text className="text-blue-300 text-sm text-center font-medium">
                  💡 Aby zobaczyć harmonogram i zadania, otwórz aplikację RenoTimeline w przeglądarce internetowej.
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3 px-6"
              onPress={() => setShowInfoModal(false)}
            >
              <Text className="text-white font-semibold text-center">
                Rozumiem
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
} 