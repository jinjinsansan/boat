export const V2_POINTS_CONFIG = {
  GOOGLE_AUTH: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_GOOGLE_AUTH || '2', 10),
  LINE_CONNECT: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_LINE_CONNECT || '24', 10),
  REFERRAL: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL || '10', 10),
  REFERRAL_BONUS: {
    1: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL_BONUS_1 || '30', 10),
    2: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL_BONUS_2 || '40', 10),
    3: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL_BONUS_3 || '50', 10),
    4: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL_BONUS_4 || '60', 10),
    default: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_REFERRAL_BONUS_DEFAULT || '100', 10),
  },
  DAILY_LOGIN: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_DAILY_LOGIN || '2', 10),
  PER_CHAT: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_PER_CHAT || '0', 10),
  MAX_TOTAL: parseInt(process.env.NEXT_PUBLIC_V2_POINTS_MAX_TOTAL || '100', 10),
}

let cachedConfig: typeof V2_POINTS_CONFIG | null = null
let cacheExpiry = 0

export function getV2PointsConfig() {
  const now = Date.now()
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig
  }

  cachedConfig = V2_POINTS_CONFIG
  cacheExpiry = now + 60 * 60 * 1000
  return cachedConfig
}

export function validatePointsConfig() {
  const errors: string[] = []
  const config = getV2PointsConfig()

  const ensurePositive = (value: number, label: string) => {
    if (value < 0) {
      errors.push(`${label} must be positive`)
    }
  }

  ensurePositive(config.GOOGLE_AUTH, 'GOOGLE_AUTH')
  ensurePositive(config.LINE_CONNECT, 'LINE_CONNECT')
  ensurePositive(config.REFERRAL, 'REFERRAL')
  ensurePositive(config.DAILY_LOGIN, 'DAILY_LOGIN')
  ensurePositive(config.PER_CHAT, 'PER_CHAT')
  ensurePositive(config.MAX_TOTAL, 'MAX_TOTAL')
  ensurePositive(config.REFERRAL_BONUS[1], 'REFERRAL_BONUS[1]')
  ensurePositive(config.REFERRAL_BONUS[2], 'REFERRAL_BONUS[2]')
  ensurePositive(config.REFERRAL_BONUS[3], 'REFERRAL_BONUS[3]')
  ensurePositive(config.REFERRAL_BONUS[4], 'REFERRAL_BONUS[4]')
  ensurePositive(config.REFERRAL_BONUS.default, 'REFERRAL_BONUS.default')

  return {
    valid: errors.length === 0,
    errors,
  }
}
