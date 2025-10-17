import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { Calendar, ExternalLink, Clock, CheckCircle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { supabase, functionsSupabase } from '../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import { GlassmorphicView } from './ui';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '../utils/theme';
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
        .from('project_exports')
        .select('timeline_project_id')
        .eq('project_id', project.id)
        .single();

      if (!error && data) {
        setIsLinked(true);
        setRenoTimelineProjectId(data.timeline_project_id);
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
            status: project.status,
            user_id: user.id,
            project_type: 'renovation',
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

      // Get user session for proper JWT authentication
      console.log('Getting user session for JWT...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Authentication error:', sessionError);
        throw new Error('User not authenticated');
      }

      console.log('✅ Got valid session, calling Edge Function via manual fetch...');
      console.log('Export data being sent:', exportData);

      const projectRef = 'kralcmyhjvoiywcpntkg';
      const functionUrl = `https://${projectRef}.supabase.co/functions/v1/import-calcreno-project`;
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYWxjbXloanZvaXl3Y3BudGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzM3OTAsImV4cCI6MjA3MTQ0OTc5MH0.10JbU5SR2bwJyGorKifCVqCqQcnbBR4xup7NnYxz3AE';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(exportData),
      });

      console.log('Manual fetch response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Edge Function failed (manual fetch):', errorBody);
        throw new Error(`Import failed: Edge function returned status ${response.status}. Body: ${errorBody}`);
      }

      const result = await response.json();
      
      console.log('🎯 Edge Function result:', result);

      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to import project to RenoTimeline');
      }

      const renoTimelineProjectId = result.renotimeline_project_id;
      
      // Update local state (no need to create link again as Edge Function handles it)
      setIsLinked(true);
      setRenoTimelineProjectId(renoTimelineProjectId);

      // Cross-app notification removed - only RenoTimeline→CalcReno flow is kept
      // CalcReno→RenoTimeline notifications disabled per user request

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
      <View style={{
        backgroundColor: colors.glass.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glass.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="small" color={colors.text.muted} />
          <Text style={{
            color: colors.text.muted,
            marginLeft: spacing.sm,
            fontSize: typography.sizes.sm,
            fontFamily: typography.fonts.primary,
          }}>
            Sprawdzanie połączenia...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {isLinked ? (
        <TouchableOpacity
          style={{
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            marginTop: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            ...shadows.sm,
          }}
          onPress={handleLinkedProjectPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.success.colors}
            start={gradients.success.start}
            end={gradients.success.end}
            style={{
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <CheckCircle size={18} color={colors.text.primary} />
            <Text style={{
              color: colors.text.primary,
              fontWeight: typography.weights.semibold,
              marginLeft: spacing.sm,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
            }}>
              Połączono z RenoTimeline
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            marginTop: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            ...shadows.sm,
          }}
          onPress={exportToRenoTimeline}
          disabled={exporting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.accent.purple, colors.primary.start]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {exporting ? (
              <>
                <ActivityIndicator size="small" color={colors.text.primary} />
                <Text style={{
                  color: colors.text.primary,
                  fontWeight: typography.weights.semibold,
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.primary,
                }}>
                  Eksportowanie...
                </Text>
              </>
            ) : (
              <>
                <ExternalLink size={18} color={colors.text.primary} />
                <Text style={{
                  color: colors.text.primary,
                  fontWeight: typography.weights.semibold,
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.primary,
                }}>
                  Wyślij do RenoTimeline
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.glass.overlay }}>
          <GlassmorphicView
            intensity="heavy"
            style={{
              borderRadius: borderRadius.xl,
              marginHorizontal: spacing.lg,
              padding: spacing.lg,
              maxWidth: 400,
              width: '100%',
              borderWidth: 1,
              borderColor: colors.glass.border,
            }}
          >
            {/* Close button */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: spacing.md,
                right: spacing.md,
                padding: spacing.xs,
              }}
              onPress={() => setShowSuccessModal(false)}
            >
              <X size={20} color={colors.text.muted} />
            </TouchableOpacity>

            {/* Success icon */}
            <View style={{ alignItems: "center", marginBottom: spacing.md }}>
              <View style={{
                backgroundColor: colors.status.success.start + '30',
                borderRadius: borderRadius.full,
                padding: spacing.md,
                marginBottom: spacing.sm,
              }}>
                <CheckCircle size={32} color={colors.status.success.start} />
              </View>
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                textAlign: "center",
                fontFamily: typography.fonts.primary,
              }}>
                Sukces!
              </Text>
            </View>

            {/* Message */}
            <Text style={{
              color: colors.text.secondary,
              textAlign: "center",
              marginBottom: spacing.lg,
              lineHeight: 24,
              fontSize: typography.sizes.base,
              fontFamily: typography.fonts.primary,
            }}>
              Projekt "{project.name}" został pomyślnie eksportowany do RenoTimeline.
            </Text>

            {/* Action button */}
            <TouchableOpacity
              style={{
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.primary.start,
                alignItems: "center",
              }}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={{
                color: colors.text.primary,
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.base,
                fontFamily: typography.fonts.primary,
              }}>
                OK
              </Text>
            </TouchableOpacity>
          </GlassmorphicView>
        </View>
      </Modal>

      {/* Connected Project Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.glass.overlay }}>
          <GlassmorphicView
            intensity="heavy"
            style={{
              borderRadius: borderRadius.xl,
              marginHorizontal: spacing.lg,
              padding: spacing.lg,
              maxWidth: 400,
              width: '100%',
              borderWidth: 1,
              borderColor: colors.glass.border,
            }}
          >
            {/* Close button */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: spacing.md,
                right: spacing.md,
                padding: spacing.xs,
              }}
              onPress={() => setShowInfoModal(false)}
            >
              <X size={20} color={colors.text.muted} />
            </TouchableOpacity>

            {/* Info icon */}
            <View style={{ alignItems: "center", marginBottom: spacing.md }}>
              <View style={{
                backgroundColor: colors.status.success.start + '30',
                borderRadius: borderRadius.full,
                padding: spacing.md,
                marginBottom: spacing.sm,
              }}>
                <CheckCircle size={32} color={colors.status.success.start} />
              </View>
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                textAlign: "center",
                fontFamily: typography.fonts.primary,
              }}>
                Projekt Połączony
              </Text>
            </View>

            {/* Message */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                color: colors.text.secondary,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: spacing.md,
                fontSize: typography.sizes.base,
                fontFamily: typography.fonts.primary,
              }}>
                Projekt "{project.name}" jest już dostępny w RenoTimeline.
              </Text>
              <View style={{
                backgroundColor: colors.primary.start + '20',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.primary.start + '40',
              }}>
                <Text style={{
                  color: colors.primary.start,
                  fontSize: typography.sizes.sm,
                  textAlign: "center",
                  fontWeight: typography.weights.medium,
                  fontFamily: typography.fonts.primary,
                }}>
                  💡 Aby zobaczyć harmonogram i zadania, otwórz aplikację RenoTimeline w przeglądarce internetowej.
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={{
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                backgroundColor: colors.primary.start,
                alignItems: "center",
              }}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={{
                color: colors.text.primary,
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.base,
                fontFamily: typography.fonts.primary,
              }}>
                Rozumiem
              </Text>
            </TouchableOpacity>
          </GlassmorphicView>
        </View>
      </Modal>
    </>
  );
} 