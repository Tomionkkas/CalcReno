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

const PROJECTS_KEY = "calcreno_projects";

export const StorageService = {
  async getProjects(): Promise<Project[]> {
    try {
      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  },

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects:", error);
      throw error;
    }
  },

  async addProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    projects.push(project);
    await this.saveProjects(projects);
  },

  async updateProject(updatedProject: Project): Promise<void> {
    const projects = await this.getProjects();
    const index = projects.findIndex((p) => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      await this.saveProjects(projects);
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    await this.saveProjects(filtered);
  },

  async getProject(projectId: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === projectId) || null;
  },
};
