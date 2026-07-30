export type Testimonial = {
  id: string
  name: string
  role?: string | null
  company?: string | null
  quote: string
  avatar_url?: string | null
  source_url?: string | null
  rating: number
  approved: boolean
  display_order: number
  created_at: string
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content: string
  cover_url?: string | null
  tags: string[]
  published: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
}

export type AnalyticsSummary = {
  total: number
  lastSevenDays: number
  byType: Array<{ event_type: string; count: number }>
  popularProjects: Array<{ entity_id: string; count: number }>
}

export type ContactInboxMessage = {
  id: string
  name: string
  email: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  page?: string | null
  created_at: string
}

export type ContentRevision = {
  id: number
  entity_type: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'restore'
  snapshot: Record<string, unknown>
  created_at: string
}
