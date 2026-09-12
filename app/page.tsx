import TelemetryDrawer from "./components/telemetry-drawer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="flex min-h-0 flex-[3] flex-col border-b border-zinc-800 bg-zinc-950 p-6 md:border-r md:border-b-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            Endpoint / 01
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
            Victim Screen
          </h1>
          <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 font-mono text-sm text-zinc-600">
            Screen feed unavailable
          </div>
        </section>

        <section className="flex min-h-0 flex-[2] flex-col bg-zinc-900 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
            Monitoring / Active
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
            Guardian Screen
          </h2>
          <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 font-mono text-sm text-zinc-500">
            Guardian controls
          </div>
        </section>
      </main>
      <TelemetryDrawer />
    </div>
  );
}
