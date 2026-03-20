"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/hooks/useSocket";

export default function CreateRoom() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (data) => {
      setIsCreating(false);
      router.push(`/room/${data.roomCode}`);
    };

    const onError = (err) => {
      setIsCreating(false);
      alert(err.message || "Failed to create room.");
    };

    socket.on("room_created", onRoomCreated);
    socket.on("room_error", onError);

    return () => {
      socket.off("room_created", onRoomCreated);
      socket.off("room_error", onError);
    };
  }, [socket, router]);

  const handleCreate = () => {
    if (!socket || !isConnected) return;
    setIsCreating(true);
    
    // Attempt to get a friendly device name, e.g., browser agent
    let deviceName = "Unknown Device";
    if (typeof navigator !== "undefined") {
      const match = navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge)\/([0-9]+)/i);
      deviceName = match ? `${match[1]} ${match[2]}` : "Web Browser";
    }

    socket.emit("create_room", { deviceInfo: { name: deviceName } });
  };

  return (
    <div className="glass-panel flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-white/[0.05] group">
      <div className="mb-6 rounded-full bg-emerald-500/10 p-4 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white">Create Room</h2>
      <p className="mb-8 text-sm text-white/50">Start a new ephemeral session to share text instantly.</p>
      
      <button
        onClick={handleCreate}
        disabled={!isConnected || isCreating}
        className="w-full rounded-full bg-white px-6 py-3 font-medium text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isCreating ? "Creating..." : isConnected ? "Start Session" : "Connecting..."}
      </button>
    </div>
  );
}
