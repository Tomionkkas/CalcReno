-- Fix UUID issue in Supabase database
-- Run these commands in your Supabase SQL Editor

-- 1. Remove foreign key constraints first
ALTER TABLE project_links DROP CONSTRAINT IF EXISTS project_links_calcreno_project_id_fkey;
ALTER TABLE calcreno_rooms DROP CONSTRAINT IF EXISTS calcreno_rooms_project_id_fkey;
ALTER TABLE calcreno_room_elements DROP CONSTRAINT IF EXISTS calcreno_room_elements_room_id_fkey;

-- 2. Change column types from UUID to TEXT to support both UUIDs and timestamp-based IDs
ALTER TABLE calcreno_projects ALTER COLUMN id TYPE TEXT;
ALTER TABLE calcreno_rooms ALTER COLUMN id TYPE TEXT;
ALTER TABLE calcreno_rooms ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE calcreno_room_elements ALTER COLUMN id TYPE TEXT;
ALTER TABLE calcreno_room_elements ALTER COLUMN room_id TYPE TEXT;
ALTER TABLE project_links ALTER COLUMN calcreno_project_id TYPE TEXT;
ALTER TABLE project_links ALTER COLUMN renotimeline_project_id TYPE TEXT;
ALTER TABLE cross_app_notifications ALTER COLUMN id TYPE TEXT;

-- 3. Recreate foreign key constraints with TEXT columns
ALTER TABLE project_links 
ADD CONSTRAINT project_links_calcreno_project_id_fkey 
FOREIGN KEY (calcreno_project_id) REFERENCES calcreno_projects(id);

ALTER TABLE calcreno_rooms 
ADD CONSTRAINT calcreno_rooms_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES calcreno_projects(id) ON DELETE CASCADE;

ALTER TABLE calcreno_room_elements 
ADD CONSTRAINT calcreno_room_elements_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES calcreno_rooms(id) ON DELETE CASCADE;

-- 4. Update default value for cross_app_notifications to use gen_random_uuid()::text
ALTER TABLE cross_app_notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE project_links ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('calcreno_projects', 'calcreno_rooms', 'calcreno_room_elements', 'project_links', 'cross_app_notifications')
    AND column_name LIKE '%id%'
ORDER BY table_name, column_name; 