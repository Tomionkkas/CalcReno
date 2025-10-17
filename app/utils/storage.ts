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
      const localProjects = data ? JSON.parse(data) : [];
      
      // If user is logged in (not guest) and has no local projects, try to sync from database
      if (!isGuest && userId && localProjects.length === 0) {
        console.log('No local projects found for logged in user, syncing from database...');
        const syncedProjects = await this.syncProjectsFromDatabase(userId);
        if (syncedProjects.length > 0) {
          // Save synced projects locally
          await this.saveProjects(syncedProjects, isGuest, userId);
          return syncedProjects;
        }
      }
      
      return localProjects;
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  },

  async syncProjectsFromDatabase(userId: string): Promise<Project[]> {
    try {
      console.log('Syncing projects from database for user:', userId);
      
      // Fetch projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('calcreno_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects from database:', projectsError);
        return [];
      }

      if (!projectsData || projectsData.length === 0) {
        console.log('No projects found in database for user');
        return [];
      }

      console.log(`Found ${projectsData.length} projects in database`);

      // Convert database format to app format
      const projects: Project[] = [];
      
      for (const dbProject of projectsData) {
        // Fetch rooms for this project
        const { data: roomsData, error: roomsError } = await supabase
          .from('calcreno_rooms')
          .select('*')
          .eq('project_id', dbProject.id)
          .order('created_at', { ascending: true });

        const rooms: Room[] = [];
        
        if (!roomsError && roomsData) {
          for (const dbRoom of roomsData) {
            // Fetch elements for this room
            const { data: elementsData, error: elementsError } = await supabase
              .from('calcreno_room_elements')
              .select('*')
              .eq('room_id', dbRoom.id)
              .order('created_at', { ascending: true });

            const elements: RoomElement[] = [];
            
            if (!elementsError && elementsData) {
              for (const dbElement of elementsData) {
                // Parse wall and position from notes if available
                const notesMatch = dbElement.notes?.match(/Wall (\d+), Position (\d+)/);
                const wall = notesMatch ? parseInt(notesMatch[1]) : 1;
                const position = notesMatch ? parseInt(notesMatch[2]) : 0;
                
                // Approximate width and height from area_sqm (assuming square elements)
                const area = dbElement.area_sqm || 1;
                const dimension = Math.sqrt(area);
                
                elements.push({
                  id: dbElement.id,
                  type: dbElement.element_type as "door" | "window",
                  width: dimension,
                  height: dimension,
                  position: position,
                  wall: wall,
                });
              }
            }

            // Convert area back to approximate dimensions
            const area = dbRoom.area_sqm || 16; // Default 4x4 room
            const side = Math.sqrt(area);
            
            // Determine shape from description
            const shape = dbRoom.description?.includes('l-shape') ? 'l-shape' : 'rectangle';
            
            rooms.push({
              id: dbRoom.id,
              name: dbRoom.name,
              shape: shape as "rectangle" | "l-shape",
              dimensions: {
                width: side,
                height: side,
                // For L-shape, use half dimensions for additional area
                ...(shape === 'l-shape' && {
                  mainWidth: side,
                  mainHeight: side,
                  additionalWidth: side / 2,
                  additionalHeight: side / 2,
                })
              },
              elements,
              corner: shape === 'l-shape' ? 'bottom-left' : undefined,
            });
          }
        }

        projects.push({
          id: dbProject.id,
          name: dbProject.name,
          description: dbProject.description || undefined,
          status: dbProject.status as any,
          startDate: new Date().toISOString().split("T")[0], // Default to today
          endDate: new Date().toISOString().split("T")[0], // Default to today
          isPinned: false, // Default to not pinned
          totalCost: 0, // Default to 0 cost
          rooms,
        });
      }

      console.log(`Successfully converted ${projects.length} projects from database`);
      return projects;
    } catch (error) {
      console.error('Error syncing projects from database:', error);
      return [];
    }
  },

  async forceSyncFromDatabase(userId: string): Promise<Project[]> {
    try {
      const projects = await this.syncProjectsFromDatabase(userId);
      if (projects.length > 0) {
        await this.saveProjects(projects, false, userId);
      }
      return projects;
    } catch (error) {
      console.error('Error force syncing from database:', error);
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
            project_type: 'renovation', // Default project type
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
        
        // Update project in Supabase database
        const { error: projectError } = await supabase
          .from('calcreno_projects')
          .update({
            name: updatedProject.name,
            description: updatedProject.description,
            status: updatedProject.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedProject.id)
          .eq('user_id', userId);

        if (projectError) {
          console.error('Failed to update project in database:', projectError);
        } else {
          console.log('Project successfully updated in database');
          
          // Sync rooms and elements
          await this.syncRoomsToDatabase(updatedProject.id, updatedProject.rooms);
        }
      } catch (error) {
        console.error('Error updating project in database:', error);
        // Don't throw error - local update already completed
      }
    }
  },

  async syncRoomsToDatabase(projectId: string, rooms: Room[]): Promise<void> {
    try {
      // First, get existing rooms from database
      const { data: existingRooms, error: fetchError } = await supabase
        .from('calcreno_rooms')
        .select('id')
        .eq('project_id', projectId);

      if (fetchError) {
        console.error('Error fetching existing rooms:', fetchError);
        return;
      }

      const existingRoomIds = existingRooms?.map(r => r.id) || [];
      const currentRoomIds = rooms.map(r => r.id);

      // Delete rooms that no longer exist
      const roomsToDelete = existingRoomIds.filter(id => !currentRoomIds.includes(id));
      if (roomsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('calcreno_rooms')
          .delete()
          .in('id', roomsToDelete);
        
        if (deleteError) {
          console.error('Error deleting rooms:', deleteError);
        }
      }

      // Upsert current rooms
      for (const room of rooms) {
        // Calculate area from dimensions
        let area_sqm = 0;
        if (room.dimensions) {
          if (room.shape === 'rectangle') {
            area_sqm = room.dimensions.width * room.dimensions.height;
          } else if (room.shape === 'l-shape' && room.dimensions.mainWidth && room.dimensions.mainHeight) {
            area_sqm = (room.dimensions.mainWidth * room.dimensions.mainHeight) + 
                      (room.dimensions.additionalWidth * room.dimensions.additionalHeight);
          }
        }

        const { error: roomError } = await supabase
          .from('calcreno_rooms')
          .upsert({
            id: room.id,
            project_id: projectId,
            name: room.name,
            room_type: 'general', // Default room type
            area_sqm: area_sqm,
            height_m: 2.5, // Default height
            description: `${room.shape} room`, // Basic description
            updated_at: new Date().toISOString(),
          });

        if (roomError) {
          console.error(`Error upserting room ${room.id}:`, roomError);
          continue;
        }

        // Sync room elements
        await this.syncElementsToDatabase(room.id, room.elements);
      }
    } catch (error) {
      console.error('Error syncing rooms to database:', error);
    }
  },

  async syncElementsToDatabase(roomId: string, elements: RoomElement[]): Promise<void> {
    try {
      // First, get existing elements from database
      const { data: existingElements, error: fetchError } = await supabase
        .from('calcreno_room_elements')
        .select('id')
        .eq('room_id', roomId);

      if (fetchError) {
        console.error('Error fetching existing elements:', fetchError);
        return;
      }

      const existingElementIds = existingElements?.map(e => e.id) || [];
      const currentElementIds = elements.map(e => e.id);

      // Delete elements that no longer exist
      const elementsToDelete = existingElementIds.filter(id => !currentElementIds.includes(id));
      if (elementsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('calcreno_room_elements')
          .delete()
          .in('id', elementsToDelete);
        
        if (deleteError) {
          console.error('Error deleting elements:', deleteError);
        }
      }

      // Upsert current elements
      for (const element of elements) {
        // Calculate area and cost for the element
        const area_sqm = (element.width || 1) * (element.height || 1);
        const unit_cost = element.type === 'door' ? 500 : 200; // Default costs
        const total_cost = area_sqm * unit_cost;

        const { error: elementError } = await supabase
          .from('calcreno_room_elements')
          .upsert({
            id: element.id,
            room_id: roomId,
            element_type: element.type,
            material: element.type === 'door' ? 'wood' : 'glass', // Default materials
            area_sqm: area_sqm,
            unit_cost: unit_cost,
            total_cost: total_cost,
            notes: `Wall ${element.wall || 1}, Position ${element.position || 0}`,
            updated_at: new Date().toISOString(),
          });

        if (elementError) {
          console.error(`Error upserting element ${element.id}:`, elementError);
        }
      }
    } catch (error) {
      console.error('Error syncing elements to database:', error);
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

  async clearUserData(userId?: string): Promise<void> {
    try {
      if (userId) {
        const key = this.getStorageKey(false, userId);
        await AsyncStorage.removeItem(key);
        console.log('Cleared local data for user:', userId);
      }
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },
};
