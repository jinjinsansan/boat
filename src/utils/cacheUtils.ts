const CACHE_VERSION = 'v1'
const DEFAULT_TTL = 5 * 60 * 1000 // 5分

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
  ttl: number
}

export class CacheManager {
  private getKey(key: string) {
    return `dlogic_cache_${key}`
  }

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL) {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
        ttl,
      }
      window.localStorage.setItem(this.getKey(key), JSON.stringify(entry))
    } catch (error) {
      console.warn('[Boat] キャッシュ保存失敗:', error)
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = window.localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)

      // バージョンチェック
      if (entry.version !== CACHE_VERSION) {
        this.remove(key)
        return null
      }

      // TTLチェック
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('[Boat] キャッシュ取得失敗:', error)
      return null
    }
  }

  remove(key: string) {
    try {
      window.localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.warn('[Boat] キャッシュ削除失敗:', error)
    }
  }

  clear() {
    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('dlogic_cache_')) {
          window.localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('[Boat] キャッシュクリア失敗:', error)
    }
  }

  isStale<T>(key: string, staleTtl: number = 30 * 1000) {
    try {
      const item = window.localStorage.getItem(this.getKey(key))
      if (!item) return { data: null as T | null, isStale: true }

      const entry: CacheEntry<T> = JSON.parse(item)

      if (entry.version !== CACHE_VERSION) {
        this.remove(key)
        return { data: null as T | null, isStale: true }
      }

      if (Date.now() - entry.timestamp > entry.ttl) {
        this.remove(key)
        return { data: null as T | null, isStale: true }
      }

      const isStale = Date.now() - entry.timestamp > staleTtl
      return { data: entry.data, isStale }
    } catch (error) {
      console.warn('[Boat] キャッシュステータス確認失敗:', error)
      return { data: null as T | null, isStale: true }
    }
  }
}

export const cacheManager = new CacheManager()
