-- ==============================================================================
-- MUHAMMAD SAHAD PORTFOLIO - MASTER SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE ALL PORTFOLIO TABLES
-- ==============================================================================

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    technologies text[] DEFAULT '{}'::text[],
    image_url text,
    image_urls jsonb DEFAULT '[]'::jsonb,
    live_url text,
    github_url text,
    key_features text[] DEFAULT '{}'::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    issuer text,
    date text,
    image_url text,
    credential_id text,
    verify_url text,
    created_at timestamptz DEFAULT now()
);

-- Comments / Guestbook Table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    comment text NOT NULL,
    avatar_url text,
    likes integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    liked_by_admin boolean DEFAULT false,
    replies jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Technologies Table
CREATE TABLE IF NOT EXISTS public.technologies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    icon text,
    category text DEFAULT 'Frontend',
    proficiency int DEFAULT 90,
    created_at timestamptz DEFAULT now()
);

-- 3D Tech Word Cloud Canvas Table
CREATE TABLE IF NOT EXISTS public.scene3d_words (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text text NOT NULL,
    color text DEFAULT '#ffffff',
    "fontSize" float DEFAULT 1.8,
    opacity float DEFAULT 0.75,
    created_at timestamptz DEFAULT now()
);

-- Global Portfolio Settings Table
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id int PRIMARY KEY DEFAULT 1,
    owner_name text DEFAULT 'Muhammad Sahad',
    hero_title_primary text DEFAULT 'Frontend',
    hero_title_secondary text DEFAULT 'Developer',
    hero_role text DEFAULT 'Junior Programmer',
    hero_description text DEFAULT 'Creating modern websites with a clean, responsive, and elegant appearance.',
    availability_text text DEFAULT 'Available for work',
    about_eyebrow text DEFAULT 'ABOUT ME',
    about_title text DEFAULT 'Muhammad Sahad',
    about_description text DEFAULT 'Front-End Developer & UI Enthusiast transforming complex designs into production web apps.',
    about_quote text DEFAULT 'Turning ideas into clean, modern, and meaningful digital experiences.',
    cv_url text DEFAULT 'https://drive.google.com/file/d/1KqECb-TA5sgncNXY2pajnUX7bwAM6ASM/view',
    github_url text DEFAULT 'https://github.com/Dev-Sahad/',
    linkedin_url text DEFAULT 'https://www.linkedin.com/in/muhammad--sahad',
    instagram_url text DEFAULT 'https://www.instagram.com/sahad_____sha/',
    youtube_url text DEFAULT 'https://www.youtube.com/@SAHAD-IS-LIVE',
    tiktok_url text DEFAULT 'https://www.tiktok.com/@sahad_____sha',
    contact_heading text DEFAULT 'Contact Me',
    contact_subheading text DEFAULT 'Have something in mind? Send a message and let us connect.',
    spotify_playlist_url text DEFAULT 'https://open.spotify.com/embed/playlist/0vvRV2Fw8k78yF31oN4L4g',
    intro_music_url text DEFAULT 'https://www.youtube.com/watch?v=LNUlNbmsDBk',
    maintenance_mode boolean DEFAULT false,
    show_testimonials boolean DEFAULT true,
    assistant_enabled boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

-- Instagram Posts Feed Table
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url text NOT NULL,
    caption text,
    likes_count int DEFAULT 400,
    comments_count int DEFAULT 30,
    post_url text DEFAULT 'https://www.instagram.com/sahad_____sha/',
    created_at timestamptz DEFAULT now()
);

-- Visitor Radar Geolocation Table
CREATE TABLE IF NOT EXISTS public.visitors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text,
    city text,
    country text,
    country_code text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Web Vitals & Analytics Telemetry Table
CREATE TABLE IF NOT EXISTS public.analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    metric_name text,
    metric_value float,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 3. ENABLE ROW-LEVEL SECURITY (RLS) & PUBLIC READ / ADMIN POLICIES
-- ==============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene3d_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
    DROP POLICY IF EXISTS "Public Read Certificates" ON public.certificates;
    DROP POLICY IF EXISTS "Public Read Comments" ON public.comments;
    DROP POLICY IF EXISTS "Public Insert Comments" ON public.comments;
    DROP POLICY IF EXISTS "Public Read Technologies" ON public.technologies;
    DROP POLICY IF EXISTS "Public Read 3D Words" ON public.scene3d_words;
    DROP POLICY IF EXISTS "Public Read Settings" ON public.portfolio_settings;
    DROP POLICY IF EXISTS "Public Read Instagram" ON public.instagram_posts;
    DROP POLICY IF EXISTS "Public Insert Visitors" ON public.visitors;
    DROP POLICY IF EXISTS "Public Insert Analytics" ON public.analytics;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Public Read Access Policies
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Technologies" ON public.technologies FOR SELECT USING (true);
CREATE POLICY "Public Read 3D Words" ON public.scene3d_words FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Instagram" ON public.instagram_posts FOR SELECT USING (true);
CREATE POLICY "Public Insert Visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Analytics" ON public.analytics FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 4. SEED DEFAULT INITIAL DATA
-- ==============================================================================

INSERT INTO public.portfolio_settings (id, owner_name, instagram_url)
VALUES (1, 'Muhammad Sahad', 'https://www.instagram.com/sahad_____sha/')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.scene3d_words (text, color, "fontSize", opacity) VALUES
  ('Design', '#ffffff', 1.8, 0.75),
  ('Frontend', '#aaaaff', 2.0, 0.80),
  ('React 19', '#ffffff', 1.8, 0.70),
  ('TypeScript', '#88aaff', 1.6, 0.70),
  ('Next.js 15', '#ffffff', 1.8, 0.75),
  ('Three.js', '#ffffff', 1.6, 0.70),
  ('Tailwind CSS', '#66ffaa', 1.6, 0.65),
  ('Supabase RLS', '#3ecf8e', 1.8, 0.70),
  ('UI / UX', '#ff6688', 1.8, 0.70)
ON CONFLICT DO NOTHING;

INSERT INTO public.instagram_posts (image_url, caption, likes_count, comments_count) VALUES
  ('/hero-cyber-portrait.jpg', 'Cyberpunk Cyber Eye Spec Avatar setup ⚡ Next.js 15 & WebGL 3D experience apps. #dev #frontend', 428, 34),
  ('/hero-anime-portrait.jpg', 'Anime Visor edition 🚀 Designing high-performance portfolio systems. #react19 #threejs', 512, 48)
ON CONFLICT DO NOTHING;
