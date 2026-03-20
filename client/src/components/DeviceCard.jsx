"use client";

export default function DeviceCard({ device, isMe, batteryStatus }) {
  const isCharging = batteryStatus?.charging;
  const level = batteryStatus?.level;
  const supported = batteryStatus?.supported;

  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${isMe ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5'}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/90 text-sm max-w-[120px] truncate" title={device?.name || "Unknown Browser"}>
            {device?.name || "Unknown Browser"}
          </span>
          {isMe && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">YOU</span>}
        </div>
        <span className="text-xs text-white/40 font-mono mt-1">{device?.socketId?.slice(0, 6) || "---"}</span>
      </div>

      <div className="flex items-center gap-3">
        {!supported ? (
          <span className="text-xs text-white/30 italic">No API</span>
        ) : (
          <>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold font-mono">{level != null ? `${level}%` : "--"}</span>
              <span className="text-[10px] text-white/50">{isCharging ? "Charging" : "Unplugged"}</span>
            </div>
            
            <div className="relative flex h-5 w-8 items-center rounded-[3px] border border-white/30 p-[1px]">
              <div className="absolute -right-[3px] top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-r-sm bg-white/30"></div>
              {level != null && (
                <div 
                  className={`h-full rounded-sm transition-all duration-1000 ${level <= 20 && !isCharging ? 'bg-red-500' : isCharging ? 'bg-emerald-500' : 'bg-white/80'}`}
                  style={{ width: `${level}%` }}
                ></div>
              )}
              {isCharging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-black">
                    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
