export const VISITOR_PROFILE_EVENT = 'portfolio:visitor-profile'

export type VisitorProfile = {
  visitorName: string
  phone: string | null
  locationConsent: boolean
  latitude: number | null
  longitude: number | null
  locationAccuracy: number | null
}
