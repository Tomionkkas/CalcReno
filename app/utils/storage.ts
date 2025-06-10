import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const projects = await this.getProjects(isGuest, userId);
    projects.push(project);
    await this.saveProjects(projects, isGuest, userId);
  },

  async updateProject(updatedProject: Project, isGuest: boolean = false, userId?: string): Promise<void> {
    const projects = await this.getProjects(isGuest, userId);
    const index = projects.findIndex((p) => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      await this.saveProjects(projects, isGuest, userId);
    }
  },

  async deleteProject(projectId: string, isGuest: boolean = false, userId?: string): Promise<void> {
    const projects = await this.getProjects(isGuest, userId);
    const filtered = projects.filter((p) => p.id !== projectId);
    await this.saveProjects(filtered, isGuest, userId);
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
