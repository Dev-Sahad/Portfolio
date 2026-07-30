import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/adminAccess'

export function getServiceDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getAuthenticatedAdminDatabase() {
  const sessionClient = await createServerClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user || !isAdminUser(user)) return null
  return getServiceDatabase()
}

export async function recordRevision(
  database: NonNullable<ReturnType<typeof getServiceDatabase>>,
  entityType: string,
  entityId: string,
  action: 'create' | 'update' | 'delete' | 'restore',
  snapshot: Record<string, unknown>,
) {
  await database.from('content_revisions').insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    snapshot,
  })
}
