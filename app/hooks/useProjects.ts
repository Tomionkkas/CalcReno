import { useState, useEffect, useCallback } from "react";
import { StorageService, Project, generateUUID } from "../utils/storage";
import { logger } from "../utils/logger";

interface UseProjectsProps {
  user: any;
  isGuest: boolean;
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
}

export function useProjects({ user, isGuest, needsOnboarding, setNeedsOnboarding }: UseProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      logger.log('[useProjects] Loading projects for user:', user?.id, 'isGuest:', isGuest);
      
      let projectsData: Project[] = [];
      
      // For logged-in users, always try to sync from database first
      if (user && !isGuest) {
        logger.log('[useProjects] User is logged in - syncing from database...');
        try {
          projectsData = await StorageService.forceSyncFromDatabase(user.id);
          logger.log('[useProjects] Synced from database:', projectsData.length, 'projects');
        } catch (syncError) {
          logger.error('[useProjects] Database sync failed, falling back to local:', syncError);
          // Fallback to local storage if sync fails
          projectsData = await StorageService.getProjects(isGuest, user.id);
        }
      } else {
        // Guest mode - load from local storage
        projectsData = await StorageService.getProjects(isGuest, user?.id);
        logger.log('[useProjects] Guest mode - loaded from local:', projectsData.length, 'projects');
      }
      
      setProjects(projectsData);
      
      // Check if user needs onboarding (no projects and is logged in)
      if (user && !isGuest && projectsData.length === 0) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    } catch (error) {
      logger.error("[useProjects] Error loading projects:", error);
      // DON'T clear projects on error - keep whatever we have
    } finally {
      setLoading(false);
    }
  }, [user?.id, isGuest, setNeedsOnboarding]);

  const refreshProjects = useCallback(async () => {
    setRefreshing(true);
    
    // If user is logged in, force sync from database
    if (user && !isGuest) {
      try {
        logger.log('Force syncing projects from database...');
        const syncedProjects = await StorageService.forceSyncFromDatabase(user.id);
        setProjects(syncedProjects);
        
        // Check if user needs onboarding
        if (syncedProjects.length === 0) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (error) {
        logger.error('Error force syncing projects:', error);
        await loadProjects(); // Fallback to regular load
      }
    } else {
      await loadProjects();
    }
    
    setRefreshing(false);
  }, [user, isGuest, loadProjects, setNeedsOnboarding]);

  const addProject = useCallback(async (projectData: {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }) => {
    const newProject = {
      id: generateUUID(),
      name: projectData.name,
      description: projectData.description,
      status: projectData.status as any,
      startDate: projectData.startDate || new Date().toISOString().split("T")[0],
      endDate: projectData.endDate || new Date().toISOString().split("T")[0],
      isPinned: false,
      rooms: [],
    };

    try {
      await StorageService.addProject(newProject, isGuest, user?.id);
      setProjects(prev => [...prev, newProject]);
      
      // If this is the first project, disable onboarding
      if (needsOnboarding) {
        setNeedsOnboarding(false);
      }
      
      return { success: true, project: newProject };
    } catch (error) {
      logger.error("Error adding project:", error);
      return { success: false, error };
    }
  }, [isGuest, user?.id, needsOnboarding, setNeedsOnboarding]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await StorageService.deleteProject(projectId, isGuest, user?.id);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      return { success: true };
    } catch (error) {
      logger.error("Error deleting project:", error);
      return { success: false, error };
    }
  }, [isGuest, user?.id]);

  const togglePinProject = useCallback(async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, isPinned: !project.isPinned };
        await StorageService.updateProject(updatedProject, isGuest, user?.id);
        setProjects(prev => 
          prev.map((p) => (p.id === projectId ? updatedProject : p))
        );
        return { success: true };
      }
      return { success: false, error: "Project not found" };
    } catch (error) {
      logger.error("Error updating project:", error);
      return { success: false, error };
    }
  }, [projects, isGuest, user?.id]);

  const updateProjectStatus = useCallback(async (projectId: string, newStatus: Project["status"]) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, status: newStatus };
        await StorageService.updateProject(updatedProject, isGuest, user?.id);
        setProjects(prev => 
          prev.map((p) => (p.id === projectId ? updatedProject : p))
        );
        return { success: true };
      }
      return { success: false, error: "Project not found" };
    } catch (error) {
      logger.error("Error updating project status:", error);
      return { success: false, error };
    }
  }, [projects, isGuest, user?.id]);

  const sortProjects = useCallback((sortType: string) => {
    let sortedProjects = [...projects];

    switch (sortType) {
      case "name":
        sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sortedProjects.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        break;
      case "status":
        sortedProjects.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    setProjects(sortedProjects);
  }, [projects]);

  return {
    projects,
    loading,
    refreshing,
    loadProjects,
    refreshProjects,
    addProject,
    deleteProject,
    togglePinProject,
    updateProjectStatus,
    sortProjects,
  };
}
