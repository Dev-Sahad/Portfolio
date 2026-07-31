import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { getProjectThumbnail } from '@/lib/portfolioMedia'

type Props = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { id } = await params
  const database = await createClient()
  const { data: project } = await database.from('projects').select('title,description,image_url,github_url').eq('id', id).maybeSingle()
  if (!project) return { title: 'Project case study' }
  const thumbnail = getProjectThumbnail(project)
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/portfolio/${id}` },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.description,
      images: thumbnail ? [{ url: thumbnail }] : undefined,
    },
  }
}

export default function ProjectLayout({ children }: Props) {
  return children
}
