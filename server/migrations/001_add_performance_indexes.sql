-- Migration: 001_add_performance_indexes
-- Date: 2026-03-19
-- Description: Add performance indexes for faster queries
-- Database: Neon (PostgreSQL)

-- Indexes for designs table
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_project_id ON public.designs(project_id);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Indexes for generation_history table
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON public.generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_type ON public.generation_history(type);

-- Indexes for templates table
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON public.templates(is_premium);

-- Indexes for saved_templates table
CREATE INDEX IF NOT EXISTS idx_saved_templates_user_id ON public.saved_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_templates_template_id ON public.saved_templates(template_id);

-- Indexes for design_systems table
CREATE INDEX IF NOT EXISTS idx_design_systems_user_id ON public.design_systems(user_id);

-- Indexes for user_subscriptions table
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_designs_user_created ON public.designs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_type ON public.generation_history(user_id, type, created_at DESC);

COMMENT ON INDEX idx_designs_user_id IS 'Faster lookup of designs by user';
COMMENT ON INDEX idx_designs_created_at IS 'Faster sorting of designs by creation date';
COMMENT ON INDEX idx_generation_history_user_id IS 'Faster lookup of user generation history';
COMMENT ON INDEX idx_generation_history_created_at IS 'Faster date filtering and sorting';
