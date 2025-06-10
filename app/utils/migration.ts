import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';
import { supabase } from './supabase';
import type { Project } from './storage';

interface MigrationResult {
  success: boolean;
  migrated: number;
  error?: any;
}

export class DataMigrationService {
  static async migrateToSupabase(
    userId: string,
    onProgress?: (step: string, progress: number) => void
  ): Promise<MigrationResult> {
    try {
      onProgress?.('Sprawdzanie stanu migracji...', 5);

      // Check if already migrated
      const migrationStatus = await this.checkMigrationStatus();
      if (migrationStatus) {
        onProgress?.('Dane już zostały zmigrowane', 100);
        return { success: true, migrated: 0 };
      }

      onProgress?.('Pobieranie projektów z trybu offline...', 10);

      // 1. Get guest projects (this is what we want to migrate)
      const localProjects = await StorageService.getProjects(true);

      if (localProjects.length === 0) {
        onProgress?.('Brak projektów do migracji', 100);
        await this.markMigrationComplete();
        return { success: true, migrated: 0 };
      }

      onProgress?.('Przygotowanie danych...', 20);

      const totalProjects = localProjects.length;
      let migratedCount = 0;

      // 2. Migrate each project
      for (let i = 0; i < localProjects.length; i++) {
        const project = localProjects[i];
        const baseProgress = 20 + (i / totalProjects) * 70;

        onProgress?.(
          `Migracja projektu "${project.name}" (${i + 1}/${totalProjects})...`,
          baseProgress
        );

        try {
          // 3. Insert project into Supabase with better data preparation
          const projectData = {
            user_id: userId,
            name: project.name,
            description: project.description || null,
            status: project.status || 'Planowany',
            start_date: project.startDate || null,
            end_date: project.endDate || null,
            is_pinned: project.isPinned || false,
            total_cost: project.totalCost || null,
            local_id: project.id, // Store original local ID for reference
            metadata: {
              originalId: project.id,
              migratedAt: new Date().toISOString()
            }
          };

          console.log('Migrating project data:', projectData);

          const { data: insertedProject, error: projectError } = await supabase
            .from('calcreno_projects')
            .insert(projectData)
            .select()
            .single();

          if (projectError) {
            console.error('Project migration error:', projectError);
            throw projectError;
          }

          console.log('Project migrated successfully:', insertedProject.id);

          // 4. Migrate rooms
          for (const room of project.rooms) {
            const roomData = {
              project_id: insertedProject.id,
              name: room.name,
              shape: room.shape,
              dimensions: room.dimensions,
              corner: room.corner || null,
              local_id: room.id,
            };

            console.log('Migrating room data:', roomData);

            const { data: insertedRoom, error: roomError } = await supabase
              .from('calcreno_rooms')
              .insert(roomData)
              .select()
              .single();

            if (roomError) {
              console.error('Room migration error:', roomError);
              throw roomError;
            }

            console.log('Room migrated successfully:', insertedRoom.id);

            // 5. Migrate room elements
            for (const element of room.elements) {
              const elementData = {
                room_id: insertedRoom.id,
                type: element.type,
                width: element.width,
                height: element.height,
                position: element.position,
                wall: element.wall,
                local_id: element.id,
              };

              console.log('Migrating element data:', elementData);

              const { error: elementError } = await supabase
                .from('calcreno_room_elements')
                .insert(elementData);

              if (elementError) {
                console.error('Element migration error:', elementError);
                throw elementError;
              }

              console.log('Element migrated successfully');
            }
          }

          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate project ${project.name}:`, error);
          // Continue with next project rather than failing entirely
        }
      }

      onProgress?.('Finalizacja migracji...', 95);

      // 6. Mark migration as complete and clear guest data
      await this.markMigrationComplete();
      await this.clearGuestDataAfterMigration();

      onProgress?.('Migracja zakończona!', 100);

      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, migrated: 0, error };
    }
  }

  static async checkMigrationStatus(): Promise<boolean> {
    try {
      const migrated = await AsyncStorage.getItem('calcreno_migrated');
      return migrated === 'true';
    } catch {
      return false;
    }
  }

  static async markMigrationComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem('calcreno_migrated', 'true');
    } catch (error) {
      console.error('Failed to mark migration complete:', error);
    }
  }

  static async resetMigrationStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem('calcreno_migrated');
      console.log('Migration status reset - you can try migration again');
    } catch (error) {
      console.error('Failed to reset migration status:', error);
    }
  }

  static async createBackup(): Promise<{ success: boolean; backup?: string }> {
    try {
      // Backup guest projects (the ones we're migrating)
      const projects = await StorageService.getProjects(true);
      const backup = JSON.stringify({
        timestamp: new Date().toISOString(),
        projects,
        version: '1.0',
      });

      await AsyncStorage.setItem('calcreno_backup', backup);
      return { success: true, backup };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return { success: false };
    }
  }

  static async restoreFromBackup(): Promise<{ success: boolean; restored: number }> {
    try {
      const backup = await AsyncStorage.getItem('calcreno_backup');
      if (!backup) {
        return { success: false, restored: 0 };
      }

      const data = JSON.parse(backup);
      if (data.projects && Array.isArray(data.projects)) {
        await StorageService.saveProjects(data.projects);
        return { success: true, restored: data.projects.length };
      }

      return { success: false, restored: 0 };
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return { success: false, restored: 0 };
    }
  }

  // Check if user needs migration prompt
  static async shouldPromptMigration(): Promise<boolean> {
    try {
      const migrated = await this.checkMigrationStatus();
      if (migrated) return false;

      // Check if there are guest projects to migrate
      const guestProjects = await StorageService.getProjects(true);
      return guestProjects.length > 0;
    } catch {
      return false;
    }
  }

  // Clear guest data after successful migration
  static async clearGuestDataAfterMigration(): Promise<void> {
    try {
      await StorageService.clearGuestData();
      console.log('Guest data cleared after migration');
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  }
} 