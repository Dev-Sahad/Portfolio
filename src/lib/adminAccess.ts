type AdminIdentity = {
  id?: string
  email?: string | null
  app_metadata?: Record<string, unknown> | null
}

const OWNER_EMAIL = 'dev.sxhd@gmail.com , msahadk12@gmail.com'

export function isAdminUser(user?: AdminIdentity | null) {
  if (!user) return false

  const configuredEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const allowedEmails = new Set([OWNER_EMAIL, ...configuredEmails])
  const configuredUserId = process.env.ADMIN_USER_ID?.trim()

  return (
    user.app_metadata?.role === 'admin' ||
    Boolean(user.email && allowedEmails.has(user.email.toLowerCase())) ||
    Boolean(configuredUserId && user.id === configuredUserId)
  )
}
