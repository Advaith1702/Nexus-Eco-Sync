/**
 * Socket.io event name constants.
 * Single source of truth — used by both server handlers and (could be shared with) client.
 */

module.exports = {
  // Connection lifecycle
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Room management
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ROOM_CREATED: "room_created",
  ROOM_JOINED: "room_joined",
  ROOM_ERROR: "room_error",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",

  // Scratchpad
  SCRATCHPAD_UPDATE: "scratchpad_update",
  SCRATCHPAD_SYNC: "scratchpad_sync",

  // Device / Hardware monitor
  DEVICE_STATUS_UPDATE: "device_status_update",
  DEVICE_STATUS_SYNC: "device_status_sync",
  DEVICE_LIST: "device_list",
};
