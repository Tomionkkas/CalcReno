import { useState } from "react";
import { useRouter } from "expo-router";

export function useHomeNavigation() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddProject = () => {
    setShowAddModal(true);
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setShowDeleteModal(true);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleFeedback = () => {
    router.push('/feedback');
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
    setDeleteLoading(false);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const closeLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  return {
    // Modal states
    showAddModal,
    showLogoutDialog,
    showDeleteModal,
    showSettings,
    projectToDelete,
    deleteLoading,
    
    // Actions
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleLogout,
    handleSettings,
    handleFeedback,
    
    // Close functions
    closeAddModal,
    closeDeleteModal,
    closeSettings,
    closeLogoutDialog,
    
    // Setters
    setDeleteLoading,
  };
}
