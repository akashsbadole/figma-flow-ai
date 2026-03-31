-- Migration: 002_add_foreign_keys
-- Date: 2026-03-19
-- Description: Add foreign key constraints for data integrity
-- Database: Neon (PostgreSQL)

-- Drop existing foreign keys if they exist (to make migration idempotent)
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS fk_designs_project;
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS fk_designs_user;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS fk_projects_user;
ALTER TABLE public.generation_history DROP CONSTRAINT IF EXISTS fk_history_user;
ALTER TABLE public.design_systems DROP CONSTRAINT IF EXISTS fk_design_systems_user;
ALTER TABLE public.design_systems DROP CONSTRAINT IF EXISTS fk_design_systems_project;
ALTER TABLE public.saved_templates DROP CONSTRAINT IF EXISTS fk_saved_templates_user;
ALTER TABLE public.saved_templates DROP CONSTRAINT IF EXISTS fk_saved_templates_template;
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_user;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS fk_profiles_user;

-- Add foreign key constraints with ON DELETE CASCADE
ALTER TABLE public.designs 
  ADD CONSTRAINT fk_designs_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.designs 
  ADD CONSTRAINT fk_designs_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.projects 
  ADD CONSTRAINT fk_projects_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.generation_history 
  ADD CONSTRAINT fk_history_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.design_systems 
  ADD CONSTRAINT fk_design_systems_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.design_systems 
  ADD CONSTRAINT fk_design_systems_project 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

ALTER TABLE public.saved_templates 
  ADD CONSTRAINT fk_saved_templates_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.saved_templates 
  ADD CONSTRAINT fk_saved_templates_template 
  FOREIGN KEY (template_id) 
  REFERENCES public.templates(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.user_subscriptions 
  ADD CONSTRAINT fk_subscriptions_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT fk_profiles_user 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Add comments for documentation
COMMENT ON CONSTRAINT fk_designs_project ON public.designs IS 'Cascade delete when project is deleted';
COMMENT ON CONSTRAINT fk_designs_user ON public.designs IS 'Cascade delete when user is deleted';
COMMENT ON CONSTRAINT fk_projects_user ON public.projects IS 'Cascade delete when user is deleted';
COMMENT ON CONSTRAINT fk_history_user ON public.generation_history IS 'Cascade delete when user is deleted';
COMMENT ON CONSTRAINT fk_saved_templates_template ON public.saved_templates IS 'Cascade delete when template is deleted';
