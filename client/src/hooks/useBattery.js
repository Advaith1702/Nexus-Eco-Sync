"use client";

import { useEffect, useState } from "react";

/**
 * Hook to access the Web Battery API.
 * Returns { level, charging, supported }.
 */
export default function useBattery() {
  const [battery, setBattery] = useState({
    level: null,
    charging: null,
    supported: false,
  });

  useEffect(() => {
    let batteryManager = null;

    const update = () => {
      if (!batteryManager) return;
      setBattery({
        level: Math.round(batteryManager.level * 100),
        charging: batteryManager.charging,
        supported: true,
      });
    };

    if (typeof navigator !== "undefined" && navigator.getBattery) {
      navigator.getBattery().then((bm) => {
        batteryManager = bm;
        update();
        bm.addEventListener("levelchange", update);
        bm.addEventListener("chargingchange", update);
      });
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener("levelchange", update);
        batteryManager.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  return battery;
}
