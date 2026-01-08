import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { logger } from "./logger";
import { sanitizeJsonParse, sanitizeForStorage, rateLimiter } from "./security";

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
  rotation?: 0 | 90 | 180 | 270; // Visual rotation in degrees
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

// OPTIMIZATION: Add caching layer to reduce database queries
const PROJECT_CACHE: { [userId: string]: { projects: Project[], timestamp: number } } = {};
const CACHE_TTL = 30000; // 30 seconds cache TTL

export const StorageService = {
  getStorageKey(isGuest: boolean = false, userId?: string): string {
    if (isGuest) {
      return GUEST_PROJECTS_KEY;
    }
    return userId ? `${USER_PROJECTS_KEY}_${userId}` : USER_PROJECTS_KEY;
  },

  async getProjects(isGuest: boolean = false, userId?: string): Promise<Project[]> {
    try {
      // OPTIMIZATION: Check cache first for logged-in users
      if (!isGuest && userId) {
        const cached = PROJECT_CACHE[userId];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          logger.log('[StorageService] Returning cached projects');
          return cached.projects;
        }
      }

      const key = this.getStorageKey(isGuest, userId);
      const data = await AsyncStorage.getItem(key);
      const localProjects = data ? JSON.parse(data) : [];

      // If user is logged in (not guest) and has no local projects, try to sync from database
      if (!isGuest && userId && localProjects.length === 0) {
        logger.log('No local projects found for logged in user, syncing from database...');
        const syncedProjects = await this.syncProjectsFromDatabase(userId);
        if (syncedProjects.length > 0) {
          // Save synced projects locally
          await this.saveProjects(syncedProjects, isGuest, userId);
          return syncedProjects;
        }
      }

      return localProjects;
    } catch (error) {
      logger.error("Error loading projects:", error);
      return [];
    }
  },

  // OPTIMIZATION: Complete rewrite using PostgreSQL joins - reduces 100+ queries to 1 query
  async syncProjectsFromDatabase(userId: string): Promise<Project[]> {
    try {
      logger.log('[StorageService] Syncing projects from database for user:', userId);

      // Use PostgreSQL joins to fetch all related data in ONE query
      const { data: projectsData, error: projectsError } = await supabase
        .schema('calcreno_schema')
        .from('calcreno_projects')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          updated_at,
          calcreno_rooms (
            id,
            name,
            room_type,
            area_sqm,
            height_m,
            description,
            created_at,
            calcreno_room_elements (
              id,
              element_type,
              material,
              area_sqm,
              unit_cost,
              total_cost,
              notes,
              created_at
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to 50 most recent projects for faster loading

      if (projectsError) {
        logger.error('[StorageService] Error fetching projects from database:', projectsError);
        return [];
      }

      if (!projectsData || projectsData.length === 0) {
        logger.log('[StorageService] No projects found in database for user');
        return [];
      }

      logger.log(`[StorageService] Found ${projectsData.length} projects in database`);

      // OPTIMIZATION: Use map instead of for loops - more functional and readable
      const projects: Project[] = projectsData.map((dbProject: any) => {
        const rooms: Room[] = (dbProject.calcreno_rooms || []).map((dbRoom: any) => {
          // Parse elements from joined data
          const elements: RoomElement[] = (dbRoom.calcreno_room_elements || []).map((dbElement: any) => {
            const notesMatch = dbElement.notes?.match(/Wall (\d+), Position (\d+)/);
            const wall = notesMatch ? parseInt(notesMatch[1]) : 1;
            const position = notesMatch ? parseInt(notesMatch[2]) : 0;
            const area = dbElement.area_sqm || 1;
            const dimension = Math.sqrt(area);

            return {
              id: dbElement.id,
              type: dbElement.element_type as "door" | "window",
              width: dimension,
              height: dimension,
              position,
              wall,
            };
          });

          // Parse room data from description JSON with safe parsing
          const defaultDescription = {
            shape: dbRoom.description?.includes('l-shape') ? 'l-shape' : 'rectangle' as const
          };
          const parsedDescription = dbRoom.description
            ? sanitizeJsonParse(dbRoom.description, defaultDescription)
            : defaultDescription;

          const shape = parsedDescription.shape || (dbRoom.description?.includes('l-shape') ? 'l-shape' : 'rectangle');
          const dimensions = parsedDescription.dimensions || (() => {
            const area = dbRoom.area_sqm || 16;
            const side = Math.sqrt(area);
            return {
              width: side,
              length: side,
              height: side,
              ...(shape === 'l-shape' && {
                width2: side / 2,
                length2: side / 2,
              })
            };
          })();

          return {
            id: dbRoom.id,
            name: dbRoom.name,
            shape: shape as "rectangle" | "l-shape",
            dimensions,
            elements,
            corner: parsedDescription.corner || (shape === 'l-shape' ? 'bottom-left' : undefined),
            materials: parsedDescription.materials || undefined,
          };
        });

        return {
          id: dbProject.id,
          name: dbProject.name,
          description: dbProject.description || undefined,
          status: dbProject.status as any,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          isPinned: false,
          totalCost: 0,
          rooms,
        };
      });

      // OPTIMIZATION: Update cache
      PROJECT_CACHE[userId] = {
        projects,
        timestamp: Date.now()
      };

      logger.log(`[StorageService] Successfully converted ${projects.length} projects from database`);
      return projects;
    } catch (error) {
      logger.error('[StorageService] Error syncing projects from database:', error);
      return [];
    }
  },

  async forceSyncFromDatabase(userId: string): Promise<Project[]> {
    try {
      // Rate limit sync operations
      const rateLimitResult = await rateLimiter.checkAndRecord('db:sync', userId);
      if (!rateLimitResult.allowed) {
        logger.warn('[StorageService] Sync rate limited for user:', userId);
        // Return cached data if available
        const cached = PROJECT_CACHE[userId];
        if (cached) {
          return cached.projects;
        }
        return [];
      }

      // Clear cache to force fresh data
      delete PROJECT_CACHE[userId];

      const projects = await this.syncProjectsFromDatabase(userId);
      if (projects.length > 0) {
        await this.saveProjects(projects, false, userId);
      }
      return projects;
    } catch (error) {
      logger.error('[StorageService] Error force syncing from database:', error);
      return [];
    }
  },

  async saveProjects(projects: Project[], isGuest: boolean = false, userId?: string): Promise<void> {
    try {
      const key = this.getStorageKey(isGuest, userId);
      await AsyncStorage.setItem(key, JSON.stringify(projects));

      // OPTIMIZATION: Update cache when saving
      if (!isGuest && userId) {
        PROJECT_CACHE[userId] = {
          projects,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      logger.error("Error saving projects:", error);
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
        logger.log('[StorageService] Adding project to database:', project.id);

        // Insert into Supabase database
        const { error } = await supabase
          .schema('calcreno_schema')
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
          logger.error('[StorageService] Failed to add project to database:', error);
        } else {
          logger.log('[StorageService] Project successfully added to database');
          // Clear cache to ensure fresh data on next load
          delete PROJECT_CACHE[userId];
        }
      } catch (error) {
        logger.error('[StorageService] Error adding project to database:', error);
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
        logger.log('[StorageService] Updating project in database:', updatedProject.id);

        // Update project in Supabase database
        const { error: projectError } = await supabase
          .schema('calcreno_schema')
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
          logger.error('[StorageService] Failed to update project in database:', projectError);
        } else {
          logger.log('[StorageService] Project successfully updated in database');

          // Sync rooms and elements
          await this.syncRoomsToDatabase(updatedProject.id, updatedProject.rooms);

          // Clear cache to ensure fresh data on next load
          delete PROJECT_CACHE[userId];
        }
      } catch (error) {
        logger.error('[StorageService] Error updating project in database:', error);
      }
    }
  },

  async syncRoomsToDatabase(projectId: string, rooms: Room[]): Promise<void> {
    try {
      // First, get existing rooms from database
      const { data: existingRooms, error: fetchError } = await supabase
        .schema('calcreno_schema')
        .from('calcreno_rooms')
        .select('id')
        .eq('project_id', projectId);

      if (fetchError) {
        logger.error('[StorageService] Error fetching existing rooms:', fetchError);
        return;
      }

      const existingRoomIds = existingRooms?.map(r => r.id) || [];
      const currentRoomIds = rooms.map(r => r.id);

      // Delete rooms that no longer exist
      const roomsToDelete = existingRoomIds.filter(id => !currentRoomIds.includes(id));
      if (roomsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_rooms')
          .delete()
          .in('id', roomsToDelete);

        if (deleteError) {
          logger.error('[StorageService] Error deleting rooms:', deleteError);
        }
      }

      // Upsert current rooms
      for (const room of rooms) {
        // Calculate area from dimensions
        let area_sqm = 0;
        if (room.dimensions) {
          if (room.shape === 'rectangle') {
            area_sqm = room.dimensions.width * room.dimensions.length;
          } else if (room.shape === 'l-shape') {
            area_sqm = room.dimensions.width * room.dimensions.length;
            if (room.dimensions.width2 && room.dimensions.length2) {
              area_sqm += room.dimensions.width2 * room.dimensions.length2;
            }
          }
        }

        // Create comprehensive description with materials data
        const roomDescription = JSON.stringify({
          shape: room.shape,
          dimensions: room.dimensions,
          corner: room.corner,
          materials: room.materials || null,
        });

        const { error: roomError } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_rooms')
          .upsert({
            id: room.id,
            project_id: projectId,
            name: room.name,
            room_type: 'general',
            area_sqm: area_sqm,
            height_m: 2.5,
            description: roomDescription,
            updated_at: new Date().toISOString(),
          });

        if (roomError) {
          logger.error(`[StorageService] Error upserting room ${room.id}:`, roomError);
          continue;
        }

        // Sync room elements
        await this.syncElementsToDatabase(room.id, room.elements);
      }
    } catch (error) {
      logger.error('[StorageService] Error syncing rooms to database:', error);
    }
  },

  async syncElementsToDatabase(roomId: string, elements: RoomElement[]): Promise<void> {
    try {
      // First, get existing elements from database
      const { data: existingElements, error: fetchError } = await supabase
        .schema('calcreno_schema')
        .from('calcreno_room_elements')
        .select('id')
        .eq('room_id', roomId);

      if (fetchError) {
        logger.error('[StorageService] Error fetching existing elements:', fetchError);
        return;
      }

      const existingElementIds = existingElements?.map(e => e.id) || [];
      const currentElementIds = elements.map(e => e.id);

      // Delete elements that no longer exist
      const elementsToDelete = existingElementIds.filter(id => !currentElementIds.includes(id));
      if (elementsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_room_elements')
          .delete()
          .in('id', elementsToDelete);

        if (deleteError) {
          logger.error('[StorageService] Error deleting elements:', deleteError);
        }
      }

      // Upsert current elements
      for (const element of elements) {
        const area_sqm = (element.width || 1) * (element.height || 1);
        const unit_cost = element.type === 'door' ? 500 : 200;
        const total_cost = area_sqm * unit_cost;

        const { error: elementError } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_room_elements')
          .upsert({
            id: element.id,
            room_id: roomId,
            element_type: element.type,
            material: element.type === 'door' ? 'wood' : 'glass',
            area_sqm: area_sqm,
            unit_cost: unit_cost,
            total_cost: total_cost,
            notes: `Wall ${element.wall || 1}, Position ${element.position || 0}`,
            updated_at: new Date().toISOString(),
          });

        if (elementError) {
          logger.error(`[StorageService] Error upserting element ${element.id}:`, elementError);
        }
      }
    } catch (error) {
      logger.error('[StorageService] Error syncing elements to database:', error);
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
        logger.log('[StorageService] Deleting project from database:', projectId);

        // Delete from Supabase database (cascading will handle rooms and elements)
        const { error } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', userId);

        if (error) {
          logger.error('[StorageService] Failed to delete project from database:', error);
        } else {
          logger.log('[StorageService] Project successfully deleted from database');
          // Clear cache
          delete PROJECT_CACHE[userId];
        }
      } catch (error) {
        logger.error('[StorageService] Error deleting project from database:', error);
      }
    }
  },

  // OPTIMIZATION: Fetch single project with optimized query
  async getProject(projectId: string, isGuest: boolean = false, userId?: string): Promise<Project | null> {
    // For logged-in users, check cache first
    if (!isGuest && userId) {
      const cached = PROJECT_CACHE[userId];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        const project = cached.projects.find((p) => p.id === projectId);
        if (project) {
          logger.log('[StorageService] Returning cached project:', projectId);
          return project;
        }
      }

      // If not in cache, fetch just this one project from database (not all projects!)
      try {
        logger.log('[StorageService] Fetching single project from database:', projectId);
        const { data: projectData, error: projectError } = await supabase
          .schema('calcreno_schema')
          .from('calcreno_projects')
          .select(`
            id,
            name,
            description,
            status,
            created_at,
            updated_at,
            calcreno_rooms (
              id,
              name,
              room_type,
              area_sqm,
              height_m,
              description,
              created_at,
              calcreno_room_elements (
                id,
                element_type,
                material,
                area_sqm,
                unit_cost,
                total_cost,
                notes,
                created_at
              )
            )
          `)
          .eq('user_id', userId)
          .eq('id', projectId)
          .single();

        if (projectError || !projectData) {
          logger.error('[StorageService] Error fetching project from database:', projectError);
        } else {
          // Convert to Project format (same logic as syncProjectsFromDatabase)
          const dbProject: any = projectData;
          const rooms: Room[] = (dbProject.calcreno_rooms || []).map((dbRoom: any) => {
            const elements: RoomElement[] = (dbRoom.calcreno_room_elements || []).map((dbElement: any) => {
              const notesMatch = dbElement.notes?.match(/Wall (\d+), Position (\d+)/);
              const wall = notesMatch ? parseInt(notesMatch[1]) : 1;
              const position = notesMatch ? parseInt(notesMatch[2]) : 0;
              const area = dbElement.area_sqm || 1;
              const dimension = Math.sqrt(area);

              return {
                id: dbElement.id,
                type: dbElement.element_type as "door" | "window",
                width: dimension,
                height: dimension,
                position,
                wall,
              };
            });

            // Parse room data from description JSON with safe parsing
            const defaultDesc = {
              shape: dbRoom.description?.includes('l-shape') ? 'l-shape' : 'rectangle' as const
            };
            const parsedDescription = dbRoom.description
              ? sanitizeJsonParse(dbRoom.description, defaultDesc)
              : defaultDesc;

            const shape = parsedDescription.shape || (dbRoom.description?.includes('l-shape') ? 'l-shape' : 'rectangle');
            const dimensions = parsedDescription.dimensions || (() => {
              const area = dbRoom.area_sqm || 16;
              const side = Math.sqrt(area);
              return {
                width: side,
                length: side,
                height: side,
                ...(shape === 'l-shape' && {
                  width2: side / 2,
                  length2: side / 2,
                })
              };
            })();

            return {
              id: dbRoom.id,
              name: dbRoom.name,
              shape: shape as "rectangle" | "l-shape",
              dimensions,
              elements,
              corner: parsedDescription.corner || (shape === 'l-shape' ? 'bottom-left' : undefined),
              materials: parsedDescription.materials || undefined,
            };
          });

          const project: Project = {
            id: dbProject.id,
            name: dbProject.name,
            description: dbProject.description || undefined,
            status: dbProject.status as any,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            isPinned: false,
            totalCost: 0,
            rooms,
          };

          logger.log('[StorageService] Found project in database with', project.rooms.length, 'rooms');
          return project;
        }
      } catch (error) {
        logger.error('[StorageService] Database fetch failed, falling back to local:', error);
      }
    }

    // Fallback to local storage
    const projects = await this.getProjects(isGuest, userId);
    return projects.find((p) => p.id === projectId) || null;
  },

  async clearGuestData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_PROJECTS_KEY);
    } catch (error) {
      logger.error("Error clearing guest data:", error);
    }
  },

  async clearUserData(userId?: string): Promise<void> {
    try {
      if (userId) {
        const key = this.getStorageKey(false, userId);
        await AsyncStorage.removeItem(key);
        // Clear cache
        delete PROJECT_CACHE[userId];
        logger.log('[StorageService] Cleared local data for user:', userId);
      }
    } catch (error) {
      logger.error("Error clearing user data:", error);
    }
  },
};
