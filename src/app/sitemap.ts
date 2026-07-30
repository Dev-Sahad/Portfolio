import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const database = await createClient()
  const [projectsResult, postsResult] = await Promise.all([
    database.from('projects').select('id,updated_at,created_at'),
    database.from('posts').select('slug,updated_at').eq('published', true),
  ])
  const base = 'https://sahad.is-a.dev'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...(projectsResult.data || []).map((project: any) => ({
      url: `${base}/portfolio/${project.id}`,
      lastModified: new Date(project.updated_at || project.created_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(postsResult.data || []).map((post: any) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
