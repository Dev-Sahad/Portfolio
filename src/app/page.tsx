import { createClient } from "@/utils/supabase/server";
import PageClient from "./PageClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let projects: any[] = [];
  let technologies: any[] = [];

  try {
    const supabase = await createClient();
    const [projectsRes, techRes] = await Promise.all([
      supabase.from('projects').select('*, technologies(*)').order('id', { ascending: true }),
      supabase.from('technologies').select('*'),
    ]);
    projects = projectsRes.data || [];
    technologies = techRes.data || [];
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }

  return <PageClient projects={projects} technologies={technologies} />;
}
