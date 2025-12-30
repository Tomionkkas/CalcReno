import React, { useState } from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MessageSquare } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "./hooks/useAuth";
import { useFeedback } from "./hooks/useFeedback";
import { useFeedbackVotes } from "./hooks/useFeedbackVotes";
import { useToast } from "./hooks/useToast";
import CustomToast from "./components/CustomToast";
import FeedbackCard from "./components/Feedback/FeedbackCard";
import FeedbackEmptyState from "./components/Feedback/FeedbackEmptyState";
import CreateFeedbackModal from "./components/Feedback/CreateFeedbackModal";
import FeedbackDeleteModal from "./components/Feedback/FeedbackDeleteModal";
import { colors } from "./utils/theme";
import type { FeedbackPost } from "./types/feedback";

export default function FeedbackListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();

  const { posts, loading, refreshing, loadPosts, refreshPosts, createPost, deletePost } = useFeedback(user?.id || null, user?.email || null);
  const { toggleUpvote } = useFeedbackVotes(user?.id || null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<FeedbackPost | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddFeedback = () => {
    if (isGuest || !user) {
      showError("Wymagane logowanie", "Zaloguj się, aby dodać feedback");
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmitFeedback = async (title: string, description: string) => {
    const result = await createPost(title, description);
    if (result.success) {
      showSuccess("Sukces", "Feedback został dodany");
      setShowCreateModal(false);
    } else {
      showError("Błąd", "Nie udało się dodać feedbacku");
    }
  };

  const handleUpvote = async (post: FeedbackPost) => {
    if (isGuest || !user) {
      showError("Wymagane logowanie", "Zaloguj się, aby głosować");
      return;
    }

    const result = await toggleUpvote(post.id, post.has_upvoted || false);
    if (!result.success) {
      showError("Błąd", "Nie udało się zmienić głosu");
    } else {
      // Force refresh to update the count immediately
      await loadPosts();
    }
  };

  const handleDeletePress = (post: FeedbackPost) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    setDeleteLoading(true);
    const result = await deletePost(postToDelete.id);
    setDeleteLoading(false);

    if (result.success) {
      showSuccess("Sukces", "Feedback został usunięty");
      setShowDeleteModal(false);
      setPostToDelete(null);
    } else {
      showError("Błąd", "Nie udało się usunąć feedbacku");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleCardPress = (postId: string) => {
    router.push(`/feedback/${postId}`);
  };

  const renderFeedbackCard = ({ item }: { item: FeedbackPost }) => (
    <FeedbackCard
      post={item}
      onPress={() => handleCardPress(item.id)}
      onUpvote={() => handleUpvote(item)}
      onDelete={item.is_author ? () => handleDeletePress(item) : undefined}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Feedback",
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {loading && posts.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
          ) : posts.length === 0 ? (
            <FeedbackEmptyState
              onAddFeedback={!isGuest ? handleAddFeedback : undefined}
              isGuest={isGuest}
            />
          ) : (
            <FlatList
              data={posts}
              renderItem={renderFeedbackCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: insets.bottom + 100, // Extra padding for FAB
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshPosts}
                  tintColor={colors.primary.start}
                  colors={[colors.primary.start]}
                />
              }
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={21}
            />
          )}
        </View>

        {/* Floating Action Button for Authenticated Users */}
        {!isGuest && user && (
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom + 24,
              right: 24,
              zIndex: 9999,
            }}
          >
            <TouchableOpacity
              onPress={handleAddFeedback}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: "hidden",
                shadowColor: colors.primary.glow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
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
                <MessageSquare size={28} color={colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Feedback Modal */}
        <CreateFeedbackModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitFeedback}
        />

        {/* Delete Confirmation Modal */}
        <FeedbackDeleteModal
          visible={showDeleteModal}
          title="Usuń feedback"
          message={`Czy na pewno chcesz usunąć feedback "${postToDelete?.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
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
