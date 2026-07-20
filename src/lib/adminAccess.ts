type AdminIdentity = {
  id?: string
  email?: string | null
  app_metadata?: Record<string, unknown> | null
}

// 1. Separate the hardcoded emails into an array of individual strings
const OWNER_EMAILS = ['dev.sxhd@gmail.com', 'msahadk12@gmail.com']

export function isAdminUser(user?: AdminIdentity | null) {
  if (!user) return false

  const configuredEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  // 2. Use the spread operator (...OWNER_EMAILS) to pass them individually to the Set
  const allowedEmails = new Set([...OWNER_EMAILS, ...configuredEmails])
  const configuredUserId = process.env.ADMIN_USER_ID?.trim()

  return (
    user.app_metadata?.role === 'admin' ||
    Boolean(user.email && allowedEmails.has(user.email.toLowerCase())) ||
    Boolean(configuredUserId && user.id === configuredUserId)
  )
}
