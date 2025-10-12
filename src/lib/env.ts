export const APP_VARIANT = process.env.NEXT_PUBLIC_APP_VARIANT ?? 'boat'

export const APP_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN ?? ''

const FALLBACK_ORIGIN = 'https://boat.dlogicai.in'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_ORIGIN

export function getPublicOrigin() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  if (APP_ORIGIN) return APP_ORIGIN
  return SITE_URL
}

export function buildInviteUrl(referralCode: string, options: { includeExternalParam?: boolean } = {}) {
  const origin = getPublicOrigin()
  const baseUrl = `${origin.replace(/\/$/, '')}/invite?ref=${referralCode}`
  const shouldIncludeParam = options.includeExternalParam ?? true
  if (!shouldIncludeParam) {
    return baseUrl
  }
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}openExternalBrowser=1`
}
