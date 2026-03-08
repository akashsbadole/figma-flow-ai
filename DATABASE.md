# AI Design Studio — Complete Database Schema

## Enum Types

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

---

## Functions

### 1. update_updated_at_column
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 2. handle_new_user (auto-create profile)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;
```

### 3. handle_new_user_role (auto-assign 'user' role)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
```

### 4. handle_new_user_subscription (auto-create free plan)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, status, generations_limit)
  VALUES (NEW.id, 'free', 'active', 5);
  RETURN NEW;
END;
$$;
```

### 5. has_role (role check — used in RLS)
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

## Triggers

```sql
-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-assign 'user' role on signup
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Auto-create free subscription on signup
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_design_systems_updated_at
  BEFORE UPDATE ON public.design_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## Tables

### profiles
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text,
  avatar_url text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
```

### user_roles
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### user_subscriptions
```sql
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  generations_used integer NOT NULL DEFAULT 0,
  generations_limit integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### projects
```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
```

### designs
```sql
CREATE TABLE public.designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id),
  prompt text NOT NULL,
  html_code text,
  css_code text,
  svg_code text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs" ON public.designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);
```

### design_systems
```sql
CREATE TABLE public.design_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id),
  name text NOT NULL,
  colors jsonb DEFAULT '{}',
  typography jsonb DEFAULT '{}',
  spacing jsonb DEFAULT '{}',
  components jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.design_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own design systems" ON public.design_systems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own design systems" ON public.design_systems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own design systems" ON public.design_systems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own design systems" ON public.design_systems FOR DELETE USING (auth.uid() = user_id);
```

### templates
```sql
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  html_code text NOT NULL,
  css_code text NOT NULL,
  thumbnail_url text,
  tags text[] DEFAULT '{}',
  is_premium boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" ON public.templates FOR SELECT USING (true);
```

### saved_templates
```sql
CREATE TABLE public.saved_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES public.templates(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, template_id)
);

ALTER TABLE public.saved_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved templates" ON public.saved_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save templates" ON public.saved_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave templates" ON public.saved_templates FOR DELETE USING (auth.uid() = user_id);
```

### generation_history
```sql
CREATE TABLE public.generation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  prompt text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.generation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON public.generation_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.generation_history FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all history" ON public.generation_history FOR SELECT USING (has_role(auth.uid(), 'admin'));
```

---

## Storage

```sql
-- Public bucket for design images
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);

CREATE POLICY "Users can upload designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own designs" ON storage.objects FOR SELECT USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own designs" ON storage.objects FOR DELETE USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public read access for designs" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
```

---

## Entity Relationship Diagram

```
auth.users (managed by Supabase Auth)
    │
    ├──→ profiles (1:1)          user_id → auth.users.id
    ├──→ user_roles (1:1)        user_id → auth.users.id
    ├──→ user_subscriptions (1:1) user_id → auth.users.id
    ├──→ projects (1:N)          user_id → auth.users.id
    │       ├──→ designs (1:N)        project_id → projects.id
    │       └──→ design_systems (1:N) project_id → projects.id
    ├──→ designs (1:N)           user_id → auth.users.id
    ├──→ design_systems (1:N)    user_id → auth.users.id
    ├──→ generation_history (1:N) user_id → auth.users.id
    └──→ saved_templates (1:N)   user_id → auth.users.id
                └──→ templates (N:1) template_id → templates.id

templates (standalone, public read)
```

---

## Demo Credentials

| Role  | Email                       | Password  |
|-------|-----------------------------|-----------|
| Admin | demo@aidesignstudio.com     | demo1234  |
| User  | user@aidesignstudio.com     | user1234  |
