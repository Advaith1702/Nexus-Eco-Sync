"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

/**
 * Hook to manage the Socket.io connection lifecycle.
 * Returns { socket, isConnected }.
 */
export default function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));

    if (!s.connected) s.connect();

    return () => {
      s.off("connect");
      s.off("disconnect");
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}
