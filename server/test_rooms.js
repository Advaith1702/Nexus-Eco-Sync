const { io } = require("socket.io-client");
const EVENTS = require("./src/socket/events");

const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Connected as", socket.id);
  
  socket.emit(EVENTS.CREATE_ROOM, { deviceInfo: { name: "Test Script Host" } });
});

socket.on(EVENTS.ROOM_CREATED, (data) => {
  console.log("Room Created:", data);
  
  // Try joining the room we just created from a second connection
  const guestSocket = io("http://localhost:3001");
  guestSocket.on("connect", () => {
    guestSocket.emit(EVENTS.JOIN_ROOM, { 
      roomCode: data.roomCode,
      deviceInfo: { name: "Test Script Guest" } 
    });
  });

  guestSocket.on(EVENTS.ROOM_JOINED, (guestData) => {
    console.log("Guest Joined Room:", guestData);
    
    // Now Guest leaves
    setTimeout(() => {
      console.log("Guest leaving...");
      guestSocket.disconnect();
    }, 1000);
  });
});

socket.on(EVENTS.USER_JOINED, (data) => {
  console.log("Host sees user joined:", data);
});

socket.on(EVENTS.USER_LEFT, (data) => {
  console.log("Host sees user left:", data);
  
  setTimeout(() => {
    console.log("Host leaving...");
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on(EVENTS.ROOM_ERROR, (err) => {
  console.error("Room Error:", err);
  process.exit(1);
});
