import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

type Props = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { id } = await params
  const database = await createClient()
  const { data: project } = await database.from('projects').select('title,description,image_url').eq('id', id).maybeSingle()
  if (!project) return { title: 'Project case study' }
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/portfolio/${id}` },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.description,
      images: project.image_url ? [{ url: project.image_url }] : undefined,
    },
  }
}

export default function ProjectLayout({ children }: Props) {
  return children
}
