import { createClient } from "@/utils/supabase/server";
import PageClient from "./PageClient";

export default async function Home() {
  let projects: any[] = [];
  let technologies: any[] = [];

  try {
    const supabase = await createClient();

    const [projectsRes, technologiesRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*, technologies(*)')
        .order('id', { ascending: true }),
      supabase
        .from('technologies')
        .select('*'),
    ]);

    projects = projectsRes.data || [];
    technologies = technologiesRes.data || [];
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    // Render page with empty data rather than crashing
  }

  return (
    <PageClient projects={projects} technologies={technologies} />
  );
}
