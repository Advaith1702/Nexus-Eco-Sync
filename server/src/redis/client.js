/**
 * Mock Redis client for local development without a Redis server.
 * Implements the exact same API signature used in rooms.js.
 */

class MockRedis {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
    console.log("[redis] connected (Mock In-Memory Mode)");
  }

  _scheduleExpiration(key, ttlSeconds) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    const timerId = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
      console.log(`[redis-mock] expired ${key}`);
    }, ttlSeconds * 1000);
    this.timers.set(key, timerId);
  }

  async expire(key, ttlSeconds) {
    if (this.store.has(key)) {
      this._scheduleExpiration(key, ttlSeconds);
      return 1;
    }
    return 0;
  }

  async set(key, value, ex, ttlSeconds) {
    this.store.set(key, String(value));
    if (ex === "EX" && ttlSeconds) {
      this._scheduleExpiration(key, ttlSeconds);
    }
    return "OK";
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
  }

  async hset(key, field, value) {
    if (!this.store.has(key)) {
      this.store.set(key, new Map());
    }
    const hash = this.store.get(key);
    hash.set(field, String(value));
    return 1; // Number of fields added
  }

  async hdel(key, field) {
    if (!this.store.has(key)) return 0;
    const hash = this.store.get(key);
    const deleted = hash.delete(field);
    return deleted ? 1 : 0;
  }

  async hgetall(key) {
    if (!this.store.has(key)) return {};
    const hash = this.store.get(key);
    const result = {};
    for (const [field, value] of hash.entries()) {
      result[field] = value;
    }
    return result;
  }

  async del(...keys) {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.has(key)) {
        this.store.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

let redisMockInstance = null;

function getRedisClient() {
  if (!redisMockInstance) {
    redisMockInstance = new MockRedis();
  }
  return redisMockInstance;
}

module.exports = { getRedisClient };
