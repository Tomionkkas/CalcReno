import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Download, Share2 } from 'lucide-react-native';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '../../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExportPreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  projectName: string;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function ExportPreviewModal({
  visible,
  imageUri,
  projectName,
  onClose,
  onDownload,
  onShare,
}: ExportPreviewModalProps) {
  const currentDate = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={gradients.background.colors}
          start={gradients.background.start}
          end={gradients.background.end}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Podgląd eksportu</Text>
              <Text style={styles.subtitle}>{projectName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <ScrollView
            style={styles.imageContainer}
            contentContainerStyle={styles.imageContentContainer}
            showsVerticalScrollIndicator={false}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Brak podglądu</Text>
              </View>
            )}
          </ScrollView>

          {/* Metadata Footer */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Projekt:</Text>
              <Text style={styles.metadataValue}>{projectName}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Data eksportu:</Text>
              <Text style={styles.metadataValue}>{currentDate}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Format:</Text>
              <Text style={styles.metadataValue}>PNG</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDownload}
            >
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={styles.actionButtonGradient}
              >
                <Download size={20} color="white" />
                <Text style={styles.actionButtonText}>Pobierz</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onShare}
            >
              <LinearGradient
                colors={gradients.secondary.colors}
                start={gradients.secondary.start}
                end={gradients.secondary.end}
                style={styles.actionButtonGradient}
              >
                <Share2 size={20} color="white" />
                <Text style={styles.actionButtonText}>Udostępnij</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.95,
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  imageContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.lg,
  },
  imageContentContainer: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  image: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: borderRadius.md,
  },
  placeholderContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.glass.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
  },
  metadataContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metadataLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  metadataValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: 'white',
  },
});
