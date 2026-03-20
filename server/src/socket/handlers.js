/**
 * Socket.io event handlers — Phase 2 implementation.
 */

const EVENTS = require("./events");
const {
  createRoom,
  roomExists,
  addMember,
  removeMember,
  getMembers,
  destroyRoom,
  getScratchpad,
  setScratchpad,
} = require("../redis/rooms");

/**
 * Generate a random 6-character alphanumeric room code.
 */
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Register all socket event handlers on a given socket instance.
 * @param {import("socket.io").Server} io - Socket.io server
 * @param {import("socket.io").Socket} socket - individual socket connection
 */
function registerHandlers(io, socket) {
  console.log(`[socket] client connected: ${socket.id}`);

  // Track the user's current room to handle disconnects cleanly
  let currentRoom = null;

  socket.on(EVENTS.CREATE_ROOM, async (data) => {
    try {
      const roomCode = generateRoomCode();
      await createRoom(roomCode);
      
      currentRoom = roomCode;
      socket.join(roomCode);
      
      const deviceInfo = data?.deviceInfo || { name: "Host Device" };
      await addMember(roomCode, socket.id, deviceInfo);
      
      const members = await getMembers(roomCode);
      const scratchpadText = await getScratchpad(roomCode);

      socket.emit(EVENTS.ROOM_CREATED, { roomCode, members, scratchpadText });
      console.log(`[socket] CREATE_ROOM ${roomCode} from ${socket.id}`);
    } catch (err) {
      console.error("[socket] CREATE_ROOM error", err);
      socket.emit(EVENTS.ROOM_ERROR, { message: "Failed to create room" });
    }
  });

  socket.on(EVENTS.JOIN_ROOM, async (data) => {
    try {
      if (!data || !data.roomCode) {
        return socket.emit(EVENTS.ROOM_ERROR, { message: "Room code required" });
      }
      
      const tempCode = data.roomCode.toUpperCase();
      const exists = await roomExists(tempCode);
      
      if (!exists) {
        return socket.emit(EVENTS.ROOM_ERROR, { message: "Room not found or expired" });
      }

      currentRoom = tempCode;
      socket.join(currentRoom);

      const deviceInfo = data.deviceInfo || { name: "Guest Device" };
      await addMember(currentRoom, socket.id, deviceInfo);

      const members = await getMembers(currentRoom);
      const scratchpadText = await getScratchpad(currentRoom);

      // Tell the new user they joined successfully
      socket.emit(EVENTS.ROOM_JOINED, { roomCode: currentRoom, members, scratchpadText });
      
      // Tell everyone else in the room
      socket.to(currentRoom).emit(EVENTS.USER_JOINED, { socketId: socket.id, deviceInfo });
      socket.to(currentRoom).emit(EVENTS.DEVICE_LIST, members);

      console.log(`[socket] JOIN_ROOM ${currentRoom} from ${socket.id}`);
    } catch (err) {
      console.error("[socket] JOIN_ROOM error", err);
      socket.emit(EVENTS.ROOM_ERROR, { message: "Failed to join room" });
    }
  });

  const handleLeaveOrDisconnect = async () => {
    if (!currentRoom) return;

    try {
      const roomToLeave = currentRoom;
      currentRoom = null;
      socket.leave(roomToLeave);
      
      await removeMember(roomToLeave, socket.id);
      
      const members = await getMembers(roomToLeave);
      
      if (members.length === 0) {
        // Room is empty, destroy it immediately instead of waiting for 30m TTL
        await destroyRoom(roomToLeave);
        console.log(`[socket] Room ${roomToLeave} destroyed (empty)`);
      } else {
        // Notify remaining members
        socket.to(roomToLeave).emit(EVENTS.USER_LEFT, { socketId: socket.id });
        socket.to(roomToLeave).emit(EVENTS.DEVICE_LIST, members);
      }
    } catch (err) {
      console.error("[socket] Leave/Disconnect error", err);
    }
  };

  socket.on(EVENTS.LEAVE_ROOM, async () => {
    console.log(`[socket] LEAVE_ROOM from ${socket.id}`);
    await handleLeaveOrDisconnect();
  });

  socket.on(EVENTS.DISCONNECT, async () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
    await handleLeaveOrDisconnect();
  });

  socket.on(EVENTS.SCRATCHPAD_UPDATE, async (data) => {
    if (!currentRoom || !data) return;
    try {
      await setScratchpad(currentRoom, data.text);
      // Broadcast to everyone else in the room
      socket.to(currentRoom).emit(EVENTS.SCRATCHPAD_SYNC, data.text);
    } catch (err) {
      console.error("[socket] SCRATCHPAD_UPDATE error", err);
    }
  });

  socket.on(EVENTS.DEVICE_STATUS_UPDATE, (data) => {
    if (!currentRoom || !data) return;
    // We don't save battery history in Redis intentionally (it's highly ephemeral),
    // we just pipe the live stream to other clients in the room.
    socket.to(currentRoom).emit(EVENTS.DEVICE_STATUS_SYNC, {
      socketId: socket.id,
      battery: data.battery
    });
  });
}

module.exports = { registerHandlers };
