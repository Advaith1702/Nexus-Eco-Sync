/**
 * Nexus (Eco-Sync) — Backend Server
 * Express + HTTP + Socket.io bootstrap
 */

require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { registerHandlers } = require("./socket/handlers");

const PORT = process.env.PORT || 3001;

// --- Express app ---
const app = express();
app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "nexus-server", uptime: process.uptime() });
});

// --- HTTP server ---
const server = http.createServer(app);

// --- Socket.io ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  registerHandlers(io, socket);
});

// --- Start ---
server.listen(PORT, () => {
  console.log(`[nexus] server listening on http://localhost:${PORT}`);
});
