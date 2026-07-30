import { createClient } from "@/utils/supabase/server";
import PageClient from "./PageClient";
import { defaultSiteSettings } from "@/lib/siteSettings";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let projects: any[] = [];
  let technologies: any[] = [];
  let testimonials: any[] = [];
  let posts: any[] = [];
  let settings: any = defaultSiteSettings;

  try {
    const supabase = await createClient();
    const [projectsRes, techRes, settingsRes, testimonialsRes, postsRes] = await Promise.all([
      supabase.from('projects').select('*, technologies(*)').order('is_featured', { ascending: false }).order('featured_order').order('created_at', { ascending: false }),
      supabase.from('technologies').select('*'),
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('testimonials').select('*').eq('approved', true).order('display_order').limit(6),
      supabase.from('posts').select('*').eq('published', true).order('published_at', { ascending: false }).limit(3),
    ]);
    projects = projectsRes.data || [];
    technologies = techRes.data || [];
    settings = settingsRes.data || defaultSiteSettings;
    testimonials = testimonialsRes.data || [];
    posts = postsRes.data || [];
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }

  if (settings.maintenance_mode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/35">Maintenance mode</p>
          <h1 className="mt-5 text-4xl font-bold sm:text-6xl">A sharper portfolio is on the way.</h1>
          <p className="mt-6 leading-7 text-white/55">{settings.maintenance_message}</p>
          <a href="/admin" className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm text-white/60 hover:bg-white hover:text-black">
            Admin access
          </a>
        </div>
      </main>
    )
  }

  return <PageClient projects={projects} technologies={technologies} settings={settings} testimonials={testimonials} posts={posts} />;
}
