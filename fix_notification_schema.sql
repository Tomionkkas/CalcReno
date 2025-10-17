-- Fix Notification Schema - Add Missing Columns
-- Run this migration in your Supabase SQL Editor

-- Add missing columns to cross_app_notifications table
ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT '';

ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS calcreno_project_id TEXT;

ALTER TABLE cross_app_notifications 
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high'));

-- Update any existing records with default values
UPDATE cross_app_notifications 
SET project_id = 'unknown-project-' || id 
WHERE project_id = '';

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cross_app_notifications' 
ORDER BY ordinal_position;

-- Test the schema by creating a sample notification
INSERT INTO cross_app_notifications (
    user_id,
    project_id,
    calcreno_project_id,
    source_app,
    target_app,
    notification_type,
    title,
    message,
    priority,
    data,
    is_read
) VALUES (
    -- Replace with actual user ID for testing
    (SELECT id FROM auth.users LIMIT 1),
    'renotimeline-test-123',
    'calcreno-test-456',
    'renotimeline',
    'calcreno',
    'task_completed',
    'Test Notification',
    'This is a test notification to verify the schema fix works.',
    'medium',
    '{"task_name": "Test Task", "completion_percentage": 100}',
    false
);

-- Query to see the test notification
SELECT 
    id,
    project_id,
    calcreno_project_id,
    priority,
    title,
    message,
    created_at
FROM cross_app_notifications 
WHERE title = 'Test Notification'
ORDER BY created_at DESC 
LIMIT 1; 