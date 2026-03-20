"use client";

import { useState, useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import useBattery from "@/hooks/useBattery";
import DeviceCard from "./DeviceCard";

export default function DeviceMonitor({ initialMembers = [], roomCode }) {
  const { socket } = useSocket();
  const battery = useBattery();
  
  const [members, setMembers] = useState(initialMembers);
  const [deviceStatuses, setDeviceStatuses] = useState({});

  // Broadcast own battery status when it changes
  useEffect(() => {
    if (!socket || !battery.supported || !roomCode) return;
    socket.emit("device_status_update", { roomCode, battery });
  }, [socket, battery, roomCode]);

  useEffect(() => {
    if (!socket) return;

    const onDeviceList = (newMembers) => setMembers(newMembers);
    
    const onUserJoined = (data) => {
      setMembers((prev) => {
        if (prev.find((m) => m.socketId === data.socketId)) return prev;
        return [...prev, { socketId: data.socketId, ...data.deviceInfo }];
      });
      // When a new user joins, if we have battery info, blast it out so they see us
      if (battery.supported) {
        socket.emit("device_status_update", { roomCode, battery });
      }
    };

    const onUserLeft = (data) => {
      setMembers((prev) => prev.filter((m) => m.socketId !== data.socketId));
      setDeviceStatuses((prev) => {
        const next = { ...prev };
        delete next[data.socketId];
        return next;
      });
    };

    const onDeviceStatusSync = (data) => {
      setDeviceStatuses((prev) => ({
        ...prev,
        [data.socketId]: data.battery
      }));
    };

    socket.on("device_list", onDeviceList);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("device_status_sync", onDeviceStatusSync);

    return () => {
      socket.off("device_list", onDeviceList);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("device_status_sync", onDeviceStatusSync);
    };
  }, [socket, battery, roomCode]);

  return (
    <div className="glass-panel flex-grow flex flex-col p-4">
      <div className="mb-4 px-2 flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">Hardware Monitor</h2>
        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 overflow-y-auto pr-2">
        {members.length === 0 && (
          <p className="text-sm text-white/40 italic px-2">Waiting for devices...</p>
        )}
        
        {members.map((member) => (
          <DeviceCard 
            key={member.socketId} 
            device={member} 
            isMe={socket && member.socketId === socket.id}
            batteryStatus={socket && member.socketId === socket.id ? battery : deviceStatuses[member.socketId]}
          />
        ))}
      </div>
    </div>
  );
}
