"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/hooks/useSocket";
import Scratchpad from "@/components/Scratchpad";
import DeviceMonitor from "@/components/DeviceMonitor";

export default function RoomPage({ params }) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  // Unwrap the params Promise (Next.js 15 requirement)
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code;

  // We wait to join the room explicitly on mount (if navigated directly via URL)
  // or just rely on the existing connection if they clicked from the landing page.
  const [initialData, setInitialData] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onRoomJoined = (data) => {
      setInitialData(data);
      setIsInitializing(false);
    };

    const onError = (err) => {
      alert("Lost connection to room or invalid code.");
      router.replace("/");
    };

    socket.on("room_joined", onRoomJoined);
    socket.on("room_created", onRoomJoined); // If they created it, same payload shape
    socket.on("room_error", onError);

    // If navigated directly via URL and not already joined, try to join automatically
    let deviceName = "Unknown Device";
    if (typeof navigator !== "undefined") {
      const match = navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge)\/([0-9]+)/i);
      deviceName = match ? `${match[1]} ${match[2]}` : "Web Browser";
    }
    
    // We emit join just in case setting up a fresh connection.
    socket.emit("join_room", { roomCode, deviceInfo: { name: deviceName } });

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("room_created", onRoomJoined);
      socket.off("room_error", onError);
    };
  }, [socket, isConnected, roomCode, router]);

  const handleLeave = () => {
    if (socket) socket.emit("leave_room");
    router.replace("/");
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white font-sans">
        <div className="flex items-center gap-3 opacity-50">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
          Connecting to room...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white font-sans">
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-40" />

      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-white/10 bg-black/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-white/40">Active Session</span>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <h1 className="text-xl font-bold tracking-[0.1em] text-white font-mono">{roomCode}</h1>
            </div>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white"
        >
          Leave
        </button>
      </header>

      {/* Main Layout */}
      <main className="z-10 flex flex-1 flex-col lg:flex-row gap-6 p-6">
        {/* Left Column: Scratchpad (70% width) */}
        <section className="flex flex-col flex-1 lg:w-2/3 h-[50vh] lg:h-auto">
          <Scratchpad initialText={initialData?.scratchpadText} roomCode={roomCode} />
        </section>

        {/* Right Column: Monitors (30% width) */}
        <section className="flex flex-col lg:w-1/3 gap-6">
          <DeviceMonitor initialMembers={initialData?.members} roomCode={roomCode} />
        </section>
      </main>
    </div>
  );
}
