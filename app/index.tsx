import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomToast from "./components/CustomToast";
import { useToast } from "./hooks/useToast";
import { useFocusEffect } from "expo-router";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "./hooks/useAuth";
import ConfirmDialog from "./components/ConfirmDialog";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { SettingsScreen } from "./components/Settings/SettingsScreen";

// Import new hooks
import { useProjects } from "./hooks/useProjects";
import { useSearchFilter } from "./hooks/useSearchFilter";
import { useHomeNavigation } from "./hooks/useHomeNavigation";

// Import new components
import HomeHeader from "./components/Home/HomeHeader";
import SearchFilterBar from "./components/Home/SearchFilterBar";
import FilterDropdown from "./components/Home/FilterDropdown";
import SortDropdown from "./components/Home/SortDropdown";
import ProjectList from "./components/Home/ProjectList";
import FloatingActionButton from "./components/Home/FloatingActionButton";
import AddProjectModal from "./components/Home/AddProjectModal";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut, signOutGuest, isGuest, userProfile, needsOnboarding, setNeedsOnboarding } = useAuth();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();
  
  // Animation refs for micro-interactions
  const screenAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  // Initialize push notifications
  usePushNotifications();

  // Use custom hooks
  const {
    projects,
    loading,
    refreshing,
    loadProjects,
    refreshProjects,
    addProject,
    deleteProject,
    togglePinProject,
    sortProjects,
  } = useProjects({ user, isGuest, needsOnboarding, setNeedsOnboarding });

  const {
    searchQuery,
    setSearchQuery,
    filterVisible,
    sortVisible,
    activeFilter,
    statusFilters,
    filteredProjects,
    toggleFilter,
    toggleSort,
    applyFilter,
  } = useSearchFilter(projects);

  const {
    showAddModal,
    showLogoutDialog,
    showDeleteModal,
    showSettings,
    projectToDelete,
    deleteLoading,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleLogout,
    handleSettings,
    closeAddModal,
    closeDeleteModal,
    closeSettings,
    closeLogoutDialog,
    setDeleteLoading,
  } = useHomeNavigation();

  // Load projects on component mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('[HomeScreen] Focus effect - loading projects');
      loadProjects();
    }, [loadProjects]),
  );

  // Animate screen on mount and when user changes (login/logout)
  useEffect(() => {
    // Reset animations when user changes
    screenAnim.setValue(0);
    backgroundAnim.setValue(0);
    setAnimationStarted(false);
    
    // Instant screen animations - no wasted time
    Animated.parallel([
      Animated.timing(screenAnim, {
        toValue: 1,
        duration: 120, // Instant screen load
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 140, // Instant background
        useNativeDriver: false,
      }),
    ]).start(() => {
      setAnimationStarted(true);
    });
  }, [user?.id]); // Re-trigger animation when user changes

  const handleSaveProject = async (projectData: {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }) => {
    if (!projectData.name.trim()) {
      showError("Błąd", "Nazwa projektu jest wymagana");
      return;
    }

    const result = await addProject(projectData);
    if (result.success) {
      closeAddModal();
      showSuccess("Sukces", "Projekt został dodany");
    } else {
      showError("Błąd", "Nie udało się dodać projektu");
    }
  };

  const handleOnboardingCreateProject = () => {
    setNeedsOnboarding(false);
    handleAddProject();
  };

  const handleSkipOnboarding = () => {
    setNeedsOnboarding(false);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setDeleteLoading(true);
    const result = await deleteProject(projectToDelete.id);
    if (result.success) {
      showSuccess("Sukces", "Projekt został usunięty");
      closeDeleteModal();
    } else {
      showError("Błąd", "Nie udało się usunąć projektu");
    }
  };

  const handleTogglePin = async (projectId: string) => {
    const result = await togglePinProject(projectId);
    if (!result.success) {
      console.error("Error toggling pin:", result.error);
    }
  };

  const handleSortProjects = (sortType: string) => {
    sortProjects(sortType);
  };



  // Add a state to track if initial animation has started
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animate screen on mount and when user changes (login/logout)
  useEffect(() => {
    // Reset animations when user changes
    screenAnim.setValue(0);
    backgroundAnim.setValue(0);
    setAnimationStarted(false);
    
    // Instant screen animations - no wasted time
    Animated.parallel([
      Animated.timing(screenAnim, {
        toValue: 1,
        duration: 120, // Instant screen load
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 140, // Instant background
        useNativeDriver: false,
      }),
    ]).start(() => {
      setAnimationStarted(true);
    });
  }, [user?.id]); // Re-trigger animation when user changes

  // Always show with dark background to prevent white flash - removed loading condition
  // The screen now renders immediately with proper dark background

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#0A0B1E', // Always dark background to prevent white flash
      paddingTop: insets.top,
    }}>
    <Animated.View 
      style={{ 
        flex: 1,
        opacity: animationStarted ? screenAnim : 1, // Show immediately if animation not started
        transform: [
          {
            translateY: animationStarted ? screenAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 0], // Nearly instant appearance
            }) : 0,
          },
        ],
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Stable Background Gradient - Always visible to prevent white flash */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <LinearGradient
          colors={['#0A0B1E', '#1A1B2E', '#0A0B1E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <HomeHeader
        user={user}
        isGuest={isGuest}
        userProfile={userProfile}
        onSettingsPress={closeSettings}
        onLogoutPress={handleLogout}
      />

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterVisible={filterVisible}
        sortVisible={sortVisible}
        onFilterPress={toggleFilter}
        onSortPress={toggleSort}
      />

      <FilterDropdown
        visible={filterVisible}
        statusFilters={statusFilters}
        activeFilter={activeFilter}
        onFilterSelect={applyFilter}
      />

      <SortDropdown
        visible={sortVisible}
        onSortSelect={handleSortProjects}
      />

      <ProjectList
        projects={filteredProjects}
        loading={loading}
        refreshing={refreshing}
        onRefresh={refreshProjects}
        onEditProject={handleEditProject}
        onDeleteProject={(projectId) => {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            handleDeleteProject(projectId, project.name);
          }
        }}
        onPinProject={handleTogglePin}
        onAddProject={handleAddProject}
        insets={insets}
      />

      <FloatingActionButton
        onPress={handleAddProject}
        onSettingsPress={handleSettings}
        insets={insets}
      />

      <AddProjectModal
        visible={showAddModal}
        onClose={closeAddModal}
        onSave={handleSaveProject}
      />

      {/* Custom Toast */}
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

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title={isGuest ? "Wyjdź z trybu offline" : "Wyloguj się"}
        message={isGuest 
          ? "Czy na pewno chcesz wyjść z trybu offline? Będziesz mógł się zalogować lub utworzyć konto."
          : "Czy na pewno chcesz się wylogować?"
        }
        confirmText={isGuest ? "Wyjdź" : "Wyloguj"}
        cancelText="Anuluj"
        confirmColor="#EF4444"
        onConfirm={async () => {
          closeLogoutDialog();
          if (isGuest) {
            signOutGuest();
          } else {
            const { error } = await signOut();
            if (error) {
              showError("Błąd", "Nie udało się wylogować");
            }
          }
        }}
        onCancel={closeLogoutDialog}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProject}
        projectName={projectToDelete?.name || ""}
        loading={deleteLoading}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={needsOnboarding}
        onClose={handleSkipOnboarding}
        onCreateProject={handleOnboardingCreateProject}
        userName={userProfile?.firstName}
      />

      {/* Settings Screen */}
      <SettingsScreen
        visible={showSettings}
        onClose={closeSettings}
      />
    </Animated.View>
    </View>
  );
}
