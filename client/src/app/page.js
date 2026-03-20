import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden font-sans">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-60" />

      <main className="z-10 flex w-full max-w-4xl flex-col items-center gap-12 px-6 py-16 text-center">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-md mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Real-time Ephemeral Bridge
          </div>
          <h1 className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            Nexus <span className="text-white/20 font-light">Eco-Sync</span>
          </h1>
          <p className="max-w-xl text-lg text-white/60 sm:text-xl">
            Instantly sync clipboard text and monitor device statuses across a shared session. No accounts, no history, just real-time.
          </p>
        </div>

        {/* Action Cards Section */}
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          <CreateRoom />
          <JoinRoom />
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-white/40">
        <p>Built for instant connection.</p>
      </footer>
    </div>
  );
}
