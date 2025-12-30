import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUp, MessageCircle, Trash2, User } from "lucide-react-native";
import { GlassmorphicView, StatusPill } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, components } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";
import type { FeedbackPost } from "../../types/feedback";

interface FeedbackCardProps {
  post: FeedbackPost;
  onPress: () => void;
  onUpvote: () => void;
  onDelete?: () => void;
}

// OPTIMIZATION: Memo the FeedbackCard to prevent unnecessary re-renders
const FeedbackCard = React.memo(({
  post,
  onPress,
  onUpvote,
  onDelete,
}: FeedbackCardProps) => {
  const { getAccessibilityProps } = useAccessibility();

  // OPTIMIZATION: Memoize status config
  const statusConfig = useMemo(() => {
    switch (post.status) {
      case "in_progress":
        return { type: "inProgress" as const, label: "W trakcie" };
      case "resolved":
        return { type: "completed" as const, label: "Rozwiązane" };
      case "closed":
        return { type: "paused" as const, label: "Zamknięte" };
      case "open":
      default:
        return { type: "planned" as const, label: "Otwarte" };
    }
  }, [post.status]);

  // OPTIMIZATION: Memoize relative time
  const relativeTime = useMemo(() => {
    const now = new Date();
    const created = new Date(post.created_at);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffInMinutes < 1) return "Teraz";
    if (diffInMinutes < 60) return `${diffInMinutes}m temu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h temu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d temu`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mies temu`;
  }, [post.created_at]);

  // OPTIMIZATION: Memoize upvote button color based on state
  const upvoteColor = useMemo(
    () => post.has_upvoted ? colors.primary.start : colors.text.secondary,
    [post.has_upvoted]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ marginBottom: spacing.md }}
      {...getAccessibilityProps(
        `Feedback: ${post.title}`,
        `${post.upvote_count} głosów, ${post.comment_count} komentarzy`
      )}
    >
      <GlassmorphicView
        intensity="medium"
        style={{
          borderRadius: borderRadius.lg,
          overflow: "hidden",
          ...shadows.lg,
        }}
      >
        <LinearGradient
          colors={gradients.card.colors}
          start={gradients.card.start}
          end={gradients.card.end}
          style={{ padding: spacing.md }}
        >
          {/* Header Section */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
            <StatusPill
              status={statusConfig.type}
              label={statusConfig.label}
            />

            {/* Delete Button (if is_author) */}
            {post.is_author && onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  ...components.touchTarget,
                  padding: spacing.xs,
                  borderRadius: borderRadius.full,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps('Usuń feedback', 'Kliknij, aby usunąć ten feedback')}
              >
                <Trash2 size={18} color={colors.status.error.start} />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: 'bold',
              fontSize: typography.sizes.lg,
              fontFamily: typography.fonts.primary,
              marginBottom: spacing.xs,
            }}
            numberOfLines={2}
          >
            {post.title}
          </Text>

          {/* Description */}
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
              marginBottom: spacing.md,
              lineHeight: typography.sizes.sm * 1.5,
            }}
            numberOfLines={3}
          >
            {post.description}
          </Text>

          {/* Footer Section */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {/* Left: Upvote Button + Comment Count */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              {/* Upvote Button */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onUpvote();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  backgroundColor: post.has_upvoted ? colors.glass.border : colors.glass.background,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: post.has_upvoted ? colors.primary.start : colors.glass.border,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps(
                  post.has_upvoted ? 'Usuń głos' : 'Zagłosuj',
                  `Liczba głosów: ${post.upvote_count}`
                )}
              >
                <ArrowUp size={16} color={upvoteColor} />
                <Text
                  style={{
                    color: upvoteColor,
                    fontSize: typography.sizes.sm,
                    fontWeight: '600',
                    fontFamily: typography.fonts.primary,
                  }}
                >
                  {post.upvote_count}
                </Text>
              </TouchableOpacity>

              {/* Comment Count */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <MessageCircle size={16} color={colors.text.tertiary} />
                <Text
                  style={{
                    color: colors.text.tertiary,
                    fontSize: typography.sizes.sm,
                    fontFamily: typography.fonts.primary,
                  }}
                >
                  {post.comment_count}
                </Text>
              </View>
            </View>

            {/* Right: Author + Time */}
            <View style={{ alignItems: "flex-end" }}>
              {/* Author */}
              {post.user_name && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: 2 }}>
                  <User size={12} color={colors.text.tertiary} />
                  <Text
                    style={{
                      color: colors.text.tertiary,
                      fontSize: typography.sizes.xs,
                      fontFamily: typography.fonts.primary,
                    }}
                    numberOfLines={1}
                  >
                    {post.user_name}
                  </Text>
                  {post.is_developer && (
                    <View
                      style={{
                        paddingHorizontal: spacing.xs,
                        paddingVertical: 2,
                        backgroundColor: colors.primary.glow,
                        borderRadius: borderRadius.xs,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary.start,
                          fontSize: 10,
                          fontWeight: '600',
                          fontFamily: typography.fonts.primary,
                        }}
                      >
                        DEV
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Time */}
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.sizes.xs,
                  fontFamily: typography.fonts.primary,
                }}
              >
                {relativeTime}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </GlassmorphicView>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.upvote_count === nextProps.post.upvote_count &&
    prevProps.post.comment_count === nextProps.post.comment_count &&
    prevProps.post.has_upvoted === nextProps.post.has_upvoted &&
    prevProps.post.status === nextProps.post.status
  );
});

FeedbackCard.displayName = 'FeedbackCard';

export default FeedbackCard;
