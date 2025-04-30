import { LRUCache } from 'lru-cache'

export class CacheService {
  constructor(options = {}) {
    this.cache = new LRUCache({
      max: options.maxItems || 500,
      maxAge: options.maxAge || 1000 * 60 * 60, // 1 hour
      ...options
    });
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, ttl) {
    return this.cache.set(key, value, { ttl });
  }  

  async has(key) {
    return this.cache.has(key);
  }

  async delete(key) {
    return this.cache.delete(key);
  }

  async clear() {
    return this.cache.clear();
  }

  async getStats() {
    return {
      size: this.cache.size,
      itemCount: this.cache.itemCount,
      length: this.cache.length
    };
  }
}

// Create a singleton instance
const cacheService = new CacheService();

export default cacheService;
