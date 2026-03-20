"use client";

import { useState, useEffect, useCallback } from "react";
import useSocket from "@/hooks/useSocket";

export default function Scratchpad({ initialText = "", roomCode }) {
  const { socket } = useSocket();
  const [text, setText] = useState(initialText);
  
  // Update state when initialText prop comes in from Room fetch
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Listen for incoming syncs from other clients
  useEffect(() => {
    if (!socket) return;
    const onSync = (newText) => {
      setText(newText);
    };
    socket.on("scratchpad_sync", onSync);
    return () => socket.off("scratchpad_sync", onSync);
  }, [socket]);

  // Debounce logic for emitting changes
  const emitChange = useCallback(
    (newText) => {
      if (!socket || !roomCode) return;
      socket.emit("scratchpad_update", { roomCode, text: newText });
    },
    [socket, roomCode]
  );

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    emitChange(newText);
  };

  return (
    <div className="glass-panel w-full flex-grow flex flex-col p-4 shadow-2xl relative group">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-semibold tracking-tight text-white/90 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Scratchpad
        </h2>
        <span className="text-xs text-white/30 font-mono tracking-widest hidden sm:block">EPHEMERAL • AUTO-SYNC</span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Start typing to sync across all devices..."
        className="w-full flex-grow resize-none bg-transparent outline-none text-white/80 placeholder-white/20 p-2 font-mono text-sm sm:text-base selection:bg-white/20"
        spellCheck={false}
      />
    </div>
  );
}
