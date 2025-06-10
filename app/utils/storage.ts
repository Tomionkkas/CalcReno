import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

// Simple UUID v4 generator for React Native
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if a string is a valid UUID format
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export interface Project {
  id: string;
  name: string;
  status: "W trakcie" | "Planowany" | "Zakończony" | "Wstrzymany";
  startDate: string;
  endDate: string;
  isPinned: boolean;
  description?: string;
  rooms: Room[];
  totalCost?: number;
}

export interface Room {
  id: string;
  name: string;
  shape: "rectangle" | "l-shape";
  dimensions: {
    width: number;
    length: number;
    height: number;
    width2?: number;
    length2?: number;
  };
  elements: RoomElement[];
  materials?: MaterialCalculation;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right"; // For L-shape orientation
}

export interface RoomElement {
  id: string;
  type: "door" | "window";
  width: number;
  height: number;
  position: number;
  wall: number;
}

export interface MaterialCalculation {
  materials: { [key: string]: number };
  totalCost: number;
  floorArea: number;
  netWallArea: number;
  roomPerimeter: number;
}

const GUEST_PROJECTS_KEY = "calcreno_guest_projects";
const USER_PROJECTS_KEY = "calcreno_user_projects";

export const StorageService = {
  getStorageKey(isGuest: boolean = false, userId?: string): string {
    if (isGuest) {
      return GUEST_PROJECTS_KEY;
    }
    return userId ? `${USER_PROJECTS_KEY}_${userId}` : USER_PROJECTS_KEY;
  },

  async getProjects(isGuest: boolean = false, userId?: string): Promise<Project[]> {
    try {
      const key = this.getStorageKey(isGuest, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  },

  async saveProjects(projects: Project[], isGuest: boolean = false, userId?: string): Promise<void> {
    try {
      const key = this.getStorageKey(isGuest, userId);
      await AsyncStorage.setItem(key, JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects:", error);
      throw error;
    }
  },

  async addProject(project: Project, isGuest: boolean = false, userId?: string): Promise<void> {
    // 1. Add to local storage first
    const projects = await this.getProjects(isGuest, userId);
    projects.push(project);
    await this.saveProjects(projects, isGuest, userId);

    // 2. If user is logged in (not guest), also add to database
    if (!isGuest && userId) {
      try {
        console.log('Adding project to database:', project.id);
        
        // Insert into Supabase database
        const { error } = await supabase
          .from('calcreno_projects')
          .insert({
            id: project.id,
            user_id: userId,
            name: project.name,
            description: project.description,
            status: project.status,
            start_date: project.startDate,
            end_date: project.endDate,
            is_pinned: project.isPinned,
            total_cost: project.totalCost,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Failed to add project to database:', error);
          // Don't throw error - local addition already completed
        } else {
          console.log('Project successfully added to database');
        }
      } catch (error) {
        console.error('Error adding project to database:', error);
        // Don't throw error - local addition already completed
      }
    }
  },

  async updateProject(updatedProject: Project, isGuest: boolean = false, userId?: string): Promise<void> {
    // 1. Update local storage first
    const projects = await this.getProjects(isGuest, userId);
    const index = projects.findIndex((p) => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      await this.saveProjects(projects, isGuest, userId);
    }

    // 2. If user is logged in (not guest), also update database
    if (!isGuest && userId) {
      try {
        console.log('Updating project in database:', updatedProject.id);
        
        // Update in Supabase database
        const { error } = await supabase
          .from('calcreno_projects')
          .update({
            name: updatedProject.name,
            description: updatedProject.description,
            status: updatedProject.status,
            start_date: updatedProject.startDate,
            end_date: updatedProject.endDate,
            is_pinned: updatedProject.isPinned,
            total_cost: updatedProject.totalCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedProject.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to update project in database:', error);
          // Don't throw error - local update already completed
        } else {
          console.log('Project successfully updated in database');
        }
      } catch (error) {
        console.error('Error updating project in database:', error);
        // Don't throw error - local update already completed
      }
    }
  },

  async deleteProject(projectId: string, isGuest: boolean = false, userId?: string): Promise<void> {
    // 1. Delete from local storage first
    const projects = await this.getProjects(isGuest, userId);
    const filtered = projects.filter((p) => p.id !== projectId);
    await this.saveProjects(filtered, isGuest, userId);

    // 2. If user is logged in (not guest), also delete from database
    if (!isGuest && userId) {
      try {
        console.log('Deleting project from database:', projectId);
        
        // Delete from Supabase database (cascading will handle rooms and elements)
        const { error } = await supabase
          .from('calcreno_projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to delete project from database:', error);
          // Don't throw error - local deletion already completed
          // Could implement retry mechanism or show warning to user
        } else {
          console.log('Project successfully deleted from database');
        }
      } catch (error) {
        console.error('Error deleting project from database:', error);
        // Don't throw error - local deletion already completed
      }
    }
  },

  async getProject(projectId: string, isGuest: boolean = false, userId?: string): Promise<Project | null> {
    const projects = await this.getProjects(isGuest, userId);
    return projects.find((p) => p.id === projectId) || null;
  },

  async clearGuestData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_PROJECTS_KEY);
    } catch (error) {
      console.error("Error clearing guest data:", error);
    }
  },
};
