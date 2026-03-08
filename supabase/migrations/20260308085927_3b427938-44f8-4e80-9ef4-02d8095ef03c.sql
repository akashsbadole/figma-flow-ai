
-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('design', 'template', 'design_system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Designs table (AI generated designs)
CREATE TABLE public.designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT,
  html_code TEXT,
  css_code TEXT,
  svg_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own designs" ON public.designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);

-- Templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  html_code TEXT NOT NULL,
  css_code TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are viewable by everyone" ON public.templates FOR SELECT TO authenticated USING (true);

-- Saved templates (favorites)
CREATE TABLE public.saved_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);
ALTER TABLE public.saved_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved templates" ON public.saved_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save templates" ON public.saved_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave templates" ON public.saved_templates FOR DELETE USING (auth.uid() = user_id);

-- Design systems table
CREATE TABLE public.design_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB DEFAULT '{}',
  typography JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  components JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.design_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own design systems" ON public.design_systems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own design systems" ON public.design_systems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own design systems" ON public.design_systems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own design systems" ON public.design_systems FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_design_systems_updated_at BEFORE UPDATE ON public.design_systems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for generated designs
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);
CREATE POLICY "Anyone can view design images" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Authenticated users can upload designs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own design files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own design files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
