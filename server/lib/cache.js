/**
 * Multi-tier cache: in-memory → Redis (Upstash) → fetcher (Firestore).
 * Reduces Firestore reads on hot read paths.
 */

const memory = new Map();

let redisClient = null;
let redisInitAttempted = false;

function getTtlSeconds() {
  const n = parseInt(process.env.CACHE_TTL_SECONDS, 10);
  return Number.isFinite(n) && n > 0 ? n : 300;
}

function initRedis() {
  if (redisInitAttempted) return redisClient;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({ url, token });
    console.log('[cache] Upstash Redis enabled');
  } catch (e) {
    console.warn('[cache] Redis unavailable:', e.message);
    redisClient = null;
  }
  return redisClient;
}

function memoryGet(key) {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key, value, ttlSec) {
  memory.set(key, {
    value,
    expiresAt: Date.now() + ttlSec * 1000,
  });
}

/**
 * @param {string} key
 * @param {() => Promise<unknown>} fetcher
 * @returns {Promise<{ value: unknown, source: 'memory' | 'redis' | 'origin' }>}
 */
async function getOrSet(key, fetcher) {
  const ttlSec = getTtlSeconds();

  const fromMemory = memoryGet(key);
  if (fromMemory !== null) {
    return { value: fromMemory, source: 'memory' };
  }

  const redis = initRedis();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw != null) {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        memorySet(key, value, ttlSec);
        return { value, source: 'redis' };
      }
    } catch (e) {
      console.warn('[cache] Redis get failed:', e.message);
    }
  }

  const value = await fetcher();
  memorySet(key, value, ttlSec);

  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSec });
    } catch (e) {
      console.warn('[cache] Redis set failed:', e.message);
    }
  }

  return { value, source: 'origin' };
}

async function invalidate(key) {
  memory.delete(key);
  const redis = initRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch (e) {
      console.warn('[cache] Redis del failed:', e.message);
    }
  }
}

async function invalidateAll() {
  memory.clear();
  const redis = initRedis();
  if (redis) {
    try {
      const keys = [
        'cache:questions:all',
        'cache:categories:all',
        'cache:categories:names',
        'cache:difficulties',
      ];
      await redis.del(...keys);
    } catch (e) {
      console.warn('[cache] Redis bulk del failed:', e.message);
    }
  }
}

module.exports = {
  getOrSet,
  invalidate,
  invalidateAll,
  getTtlSeconds,
};
