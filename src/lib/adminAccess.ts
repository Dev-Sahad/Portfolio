type AdminIdentity = {
  id?: string
  email?: string | null
  app_metadata?: Record<string, unknown> | null
}

const OWNER_EMAILS = ['dev.sxhd@gmail.com', 'msahadk12@gmail.com']

export function getAllowedAdminEmails() {
  const configuredEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set([...OWNER_EMAILS, ...configuredEmails])
}

export function isAdminUser(user?: AdminIdentity | null) {
  if (!user) return false

  const allowedEmails = getAllowedAdminEmails()
  const configuredUserId = process.env.ADMIN_USER_ID?.trim()
  const isDev = process.env.NODE_ENV === 'development'

  return (
    isDev ||
    user.app_metadata?.role === 'admin' ||
    Boolean(user.email && allowedEmails.has(user.email.toLowerCase())) ||
    Boolean(configuredUserId && user.id === configuredUserId)
  )
}

