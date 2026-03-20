/**
 * Room CRUD helpers — Phase 2 implementation.
 * All operations will use Redis with a 30-minute TTL.
 */

const { getRedisClient } = require("./client");

const ROOM_TTL = 30 * 60; // 30 minutes in seconds

/**
 * Helper to refresh TTL for all keys related to a room.
 */
async function refreshRoomTTL(roomCode) {
  const redis = getRedisClient();
  await Promise.all([
    redis.expire(`room:${roomCode}:members`, ROOM_TTL),
    redis.expire(`room:${roomCode}:scratchpad`, ROOM_TTL),
  ]);
}

/**
 * Create a new room in Redis.
 * Just initializes the scratchpad and sets TTL.
 * @param {string} roomCode
 * @returns {Promise<void>}
 */
async function createRoom(roomCode) {
  const redis = getRedisClient();
  // Using a set to track members and a string for the scratchpad
  await redis.set(`room:${roomCode}:scratchpad`, "", "EX", ROOM_TTL);
}

/**
 * Check if a room exists in Redis.
 * @param {string} roomCode
 * @returns {Promise<boolean>}
 */
async function roomExists(roomCode) {
  const redis = getRedisClient();
  const exists = await redis.exists(`room:${roomCode}:scratchpad`);
  return exists === 1;
}

/**
 * Add a member to a room.
 * @param {string} roomCode
 * @param {string} socketId
 * @param {object} deviceInfo
 * @returns {Promise<void>}
 */
async function addMember(roomCode, socketId, deviceInfo) {
  const redis = getRedisClient();
  // Store the member info as a JSON string in a Hash mapped by socketId
  await redis.hset(`room:${roomCode}:members`, socketId, JSON.stringify(deviceInfo));
  await refreshRoomTTL(roomCode);
}

/**
 * Remove a member from a room.
 * @param {string} roomCode
 * @param {string} socketId
 * @returns {Promise<void>}
 */
async function removeMember(roomCode, socketId) {
  const redis = getRedisClient();
  await redis.hdel(`room:${roomCode}:members`, socketId);
  await refreshRoomTTL(roomCode);
}

/**
 * Get all members of a room.
 * @param {string} roomCode
 * @returns {Promise<object[]>}
 */
async function getMembers(roomCode) {
  const redis = getRedisClient();
  const membersData = await redis.hgetall(`room:${roomCode}:members`);
  return Object.entries(membersData).map(([socketId, info]) => ({
    socketId,
    ...JSON.parse(info)
  }));
}

/**
 * Store scratchpad text for a room.
 * @param {string} roomCode
 * @param {string} text
 * @returns {Promise<void>}
 */
async function setScratchpad(roomCode, text) {
  const redis = getRedisClient();
  await redis.set(`room:${roomCode}:scratchpad`, text, "EX", ROOM_TTL);
  await refreshRoomTTL(roomCode);
}

/**
 * Get scratchpad text for a room.
 * @param {string} roomCode
 * @returns {Promise<string>}
 */
async function getScratchpad(roomCode) {
  const redis = getRedisClient();
  const text = await redis.get(`room:${roomCode}:scratchpad`);
  return text || "";
}

/**
 * Clean up all room data entirely.
 * Useful if the room becomes empty and we want to actively destroy it.
 * @param {string} roomCode
 * @returns {Promise<void>}
 */
async function destroyRoom(roomCode) {
  const redis = getRedisClient();
  await redis.del(`room:${roomCode}:members`, `room:${roomCode}:scratchpad`);
}

module.exports = {
  ROOM_TTL,
  createRoom,
  roomExists,
  addMember,
  removeMember,
  getMembers,
  setScratchpad,
  getScratchpad,
  destroyRoom,
};
