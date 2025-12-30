import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Trash2, User } from "lucide-react-native";
import { colors, typography, spacing, borderRadius } from "../../utils/theme";
import type { FeedbackComment } from "../../types/feedback";

interface CommentItemProps {
  comment: FeedbackComment;
  onDelete?: () => void;
  currentUserId: string | null;
}

const CommentItem = React.memo(({ comment, onDelete, currentUserId }: CommentItemProps) => {
  // OPTIMIZATION: Memoize relative time
  const relativeTime = useMemo(() => {
    const now = new Date();
    const created = new Date(comment.created_at);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffInMinutes < 1) return "Teraz";
    if (diffInMinutes < 60) return `${diffInMinutes}m temu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h temu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d temu`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mies temu`;
  }, [comment.created_at]);

  const canDelete = comment.is_author && onDelete;

  return (
    <View
      style={{
        backgroundColor: colors.glass.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.glass.border,
      }}
    >
      {/* Header: Author + Time + Delete */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, flex: 1 }}>
          <User size={14} color={colors.text.tertiary} />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              fontWeight: "600",
              fontFamily: typography.fonts.primary,
            }}
            numberOfLines={1}
          >
            {comment.user_name}
          </Text>

          {/* Developer Badge */}
          {comment.is_developer && (
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

          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.primary,
            }}
          >
            • {relativeTime}
          </Text>
        </View>

        {/* Delete Button */}
        {canDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={{
              padding: spacing.xs,
              borderRadius: borderRadius.full,
            }}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={colors.status.error.start} />
          </TouchableOpacity>
        )}
      </View>

      {/* Comment Content */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.base,
          fontFamily: typography.fonts.primary,
          lineHeight: typography.sizes.base * 1.5,
        }}
      >
        {comment.content}
      </Text>
    </View>
  );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;
