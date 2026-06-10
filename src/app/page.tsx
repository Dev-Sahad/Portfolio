import { createClient } from "@/utils/supabase/server";
import PageClient from "./PageClient";
import { defaultSiteSettings } from "@/lib/siteSettings";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let projects: any[] = [];
  let technologies: any[] = [];
  let settings: any = defaultSiteSettings;

  try {
    const supabase = await createClient();
    const [projectsRes, techRes, settingsRes] = await Promise.all([
      supabase.from('projects').select('*, technologies(*)').order('id', { ascending: true }),
      supabase.from('technologies').select('*'),
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    projects = projectsRes.data || [];
    technologies = techRes.data || [];
    settings = settingsRes.data || defaultSiteSettings;
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }

  return <PageClient projects={projects} technologies={technologies} settings={settings} />;
}
