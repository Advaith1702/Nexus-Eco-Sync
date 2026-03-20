"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/hooks/useSocket";

export default function JoinRoom() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const onRoomJoined = (data) => {
      setIsJoining(false);
      router.push(`/room/${data.roomCode}`);
    };

    const onError = (err) => {
      setIsJoining(false);
      setError(err.message || "Failed to join room.");
      setTimeout(() => setError(null), 3000);
    };

    socket.on("room_joined", onRoomJoined);
    socket.on("room_error", onError);

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("room_error", onError);
    };
  }, [socket, router]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!socket || !isConnected || code.length !== 6) return;
    
    setIsJoining(true);
    setError(null);

    let deviceName = "Unknown Device";
    if (typeof navigator !== "undefined") {
      const match = navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge)\/([0-9]+)/i);
      deviceName = match ? `${match[1]} ${match[2]}` : "Web Browser";
    }

    socket.emit("join_room", { 
      roomCode: code, 
      deviceInfo: { name: deviceName } 
    });
  };

  return (
    <div className="glass-panel flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-white/[0.05] group">
      <div className="mb-6 rounded-full bg-blue-500/10 p-4 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white">Join Room</h2>
      <p className="mb-6 text-sm text-white/50">Enter a 6-digit code to connect.</p>
      
      <form onSubmit={handleJoin} className="w-full relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="ENTER CODE"
          disabled={!isConnected || isJoining}
          className="w-full rounded-full border border-white/10 bg-black/50 px-6 py-3 text-center text-xl font-bold tracking-[0.2em] text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors mb-4 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isConnected || isJoining || code.length !== 6}
          className="w-full rounded-full bg-white/10 border border-white/20 px-6 py-3 font-medium text-white transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white/10"
        >
          {isJoining ? "Joining..." : isConnected ? "Connect" : "Connecting..."}
        </button>
        {error && (
          <p className="absolute -bottom-8 left-0 right-0 text-xs text-red-400 animate-in slide-in-from-top-2">{error}</p>
        )}
      </form>
    </div>
  );
}
