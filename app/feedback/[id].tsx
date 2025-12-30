import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowUp, MessageCircle, Trash2, User, Send } from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";
import { useFeedback } from "../hooks/useFeedback";
import { useFeedbackVotes } from "../hooks/useFeedbackVotes";
import { useFeedbackComments } from "../hooks/useFeedbackComments";
import { useToast } from "../hooks/useToast";
import CustomToast from "../components/CustomToast";
import CommentItem from "../components/Feedback/CommentItem";
import { StatusPill } from "../components/ui";
import FeedbackDeleteModal from "../components/Feedback/FeedbackDeleteModal";
import { colors, gradients, typography, spacing, borderRadius, shadows, components } from "../utils/theme";
import type { FeedbackPost } from "../types/feedback";

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();

  const { posts, loading: postsLoading, deletePost } = useFeedback(user?.id || null, user?.email || null);
  const { toggleUpvote } = useFeedbackVotes(user?.id || null);
  const { comments, loading: commentsLoading, addComment, deleteComment, canComment } = useFeedbackComments(
    id || "",
    user?.id || null,
    user?.email || null
  );

  const [post, setPost] = useState<FeedbackPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Find the current post from the posts list
  useEffect(() => {
    const foundPost = posts.find((p) => p.id === id);
    if (foundPost) {
      setPost(foundPost);
    }
  }, [id, posts]);

  const handleUpvote = async () => {
    if (isGuest || !user || !post) {
      showError("Wymagane logowanie", "Zaloguj się, aby głosować");
      return;
    }

    const result = await toggleUpvote(post.id, post.has_upvoted || false);
    if (!result.success) {
      showError("Błąd", "Nie udało się zmienić głosu");
    }
    // The post will be updated via the posts list subscription
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    if (isGuest || !user) {
      showError("Wymagane logowanie", "Zaloguj się, aby komentować");
      return;
    }

    if (!post || !canComment(post)) {
      showError("Brak uprawnień", "Nie możesz komentować tego posta");
      return;
    }

    setSubmittingComment(true);
    const result = await addComment(commentText.trim());
    setSubmittingComment(false);

    if (result.success) {
      setCommentText("");
      showSuccess("Sukces", "Komentarz został dodany");
    } else {
      showError("Błąd", "Nie udało się dodać komentarza");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      showSuccess("Sukces", "Komentarz został usunięty");
    } else {
      showError("Błąd", "Nie udało się usunąć komentarza");
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    setDeleteLoading(true);
    const result = await deletePost(post.id);
    setDeleteLoading(false);

    if (result.success) {
      showSuccess("Sukces", "Feedback został usunięty");
      setShowDeletePostModal(false);
      router.back();
    } else {
      showError("Błąd", "Nie udało się usunąć feedbacku");
    }
  };

  const statusConfig = post
    ? {
        "open": { type: "planned" as const, label: "Otwarte" },
        "in_progress": { type: "inProgress" as const, label: "W trakcie" },
        "resolved": { type: "completed" as const, label: "Rozwiązane" },
        "closed": { type: "paused" as const, label: "Zamknięte" },
      }[post.status]
    : null;

  const relativeTime = post
    ? (() => {
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
      })()
    : "";

  const userCanComment = post && user && canComment(post);
  const upvoteColor = post?.has_upvoted ? colors.primary.start : colors.text.secondary;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Szczegóły Feedback",
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () =>
            post?.is_author ? (
              <TouchableOpacity
                onPress={() => setShowDeletePostModal(true)}
                style={{ marginRight: 16 }}
                activeOpacity={0.7}
              >
                <Trash2 size={20} color={colors.status.error.start} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {postsLoading || !post ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
          ) : (
            <>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  padding: spacing.md,
                  paddingBottom: insets.bottom + (userCanComment ? 80 : 16),
                }}
              >
                {/* Post Section */}
                <View
                  style={{
                    backgroundColor: colors.glass.background,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    borderWidth: 1,
                    borderColor: colors.glass.border,
                    ...shadows.lg,
                  }}
                >
                  {/* Status */}
                  {statusConfig && (
                    <StatusPill status={statusConfig.type} label={statusConfig.label} style={{ marginBottom: spacing.sm }} />
                  )}

                  {/* Title */}
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontWeight: 'bold',
                      fontSize: typography.sizes.xl,
                      fontFamily: typography.fonts.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {post.title}
                  </Text>

                  {/* Description */}
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.base,
                      fontFamily: typography.fonts.primary,
                      marginBottom: spacing.md,
                      lineHeight: typography.sizes.base * 1.6,
                    }}
                  >
                    {post.description}
                  </Text>

                  {/* Footer: Upvote + Comment Count + Author */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                      {/* Upvote Button */}
                      <TouchableOpacity
                        onPress={handleUpvote}
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
                      >
                        <ArrowUp size={18} color={upvoteColor} />
                        <Text
                          style={{
                            color: upvoteColor,
                            fontSize: typography.sizes.base,
                            fontWeight: '600',
                            fontFamily: typography.fonts.primary,
                          }}
                        >
                          {post.upvote_count}
                        </Text>
                      </TouchableOpacity>

                      {/* Comment Count */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                        <MessageCircle size={18} color={colors.text.tertiary} />
                        <Text
                          style={{
                            color: colors.text.tertiary,
                            fontSize: typography.sizes.base,
                            fontFamily: typography.fonts.primary,
                          }}
                        >
                          {post.comment_count}
                        </Text>
                      </View>
                    </View>

                    {/* Author + Time */}
                    <View style={{ alignItems: "flex-end" }}>
                      {post.user_name && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: 2 }}>
                          <User size={12} color={colors.text.tertiary} />
                          <Text
                            style={{
                              color: colors.text.tertiary,
                              fontSize: typography.sizes.sm,
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
                </View>

                {/* Comments Section */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.lg,
                      fontWeight: 'bold',
                      fontFamily: typography.fonts.primary,
                      marginBottom: spacing.md,
                    }}
                  >
                    Komentarze ({comments.length})
                  </Text>

                  {commentsLoading ? (
                    <ActivityIndicator color={colors.primary.start} style={{ marginVertical: spacing.lg }} />
                  ) : comments.length === 0 ? (
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: typography.sizes.base,
                        fontFamily: typography.fonts.primary,
                        textAlign: "center",
                        paddingVertical: spacing.xl,
                      }}
                    >
                      Brak komentarzy
                    </Text>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={comment.is_author ? () => handleDeleteComment(comment.id) : undefined}
                        currentUserId={user?.id || null}
                      />
                    ))
                  )}
                </View>
              </ScrollView>

              {/* Comment Input (if user can comment) */}
              {userCanComment && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.background.primary,
                    borderTopWidth: 1,
                    borderTopColor: colors.glass.border,
                    padding: spacing.md,
                    paddingBottom: insets.bottom + spacing.md,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: colors.glass.background,
                        color: colors.text.primary,
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        fontSize: typography.sizes.base,
                        fontFamily: typography.fonts.primary,
                        minHeight: 40,
                        maxHeight: 100,
                        borderWidth: 1,
                        borderColor: colors.glass.border,
                      }}
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Dodaj komentarz..."
                      placeholderTextColor={colors.text.tertiary}
                      multiline
                      editable={!submittingComment}
                    />
                    <TouchableOpacity
                      onPress={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        overflow: "hidden",
                        opacity: !commentText.trim() || submittingComment ? 0.5 : 1,
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[colors.primary.start, colors.primary.end]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: "100%",
                          height: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {submittingComment ? (
                          <ActivityIndicator size="small" color={colors.text.primary} />
                        ) : (
                          <Send size={18} color={colors.text.primary} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </KeyboardAvoidingView>

        {/* Delete Post Modal */}
        <FeedbackDeleteModal
          visible={showDeletePostModal}
          title="Usuń feedback"
          message={`Czy na pewno chcesz usunąć feedback "${post?.title}"?`}
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeletePostModal(false)}
          loading={deleteLoading}
        />

        {/* Toast */}
        {toastConfig && (
          <CustomToast
            visible={isVisible}
            type={toastConfig.type}
            title={toastConfig.title}
            message={toastConfig.message}
            onClose={hideToast}
            duration={toastConfig.duration}
          />
        )}
      </LinearGradient>
    </>
  );
}
