"use client";

import { useState } from "react";

const telemetry = [
  {
    timestamp: "2026-09-12T10:38:14.021Z",
    event: "screen.connected",
    source: "victim",
    sessionId: "sess_7a4f",
  },
  {
    timestamp: "2026-09-12T10:38:15.408Z",
    event: "guardian.ready",
    source: "guardian",
    protections: ["network-watch", "input-audit"],
  },
  {
    timestamp: "2026-09-12T10:38:18.991Z",
    event: "telemetry.heartbeat",
    latencyMs: 24,
    status: "nominal",
  },
];

export default function TelemetryDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="shrink-0 border-t border-zinc-800 bg-zinc-950 text-zinc-100">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="telemetry-log"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-400"
      >
        <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
          Telemetry
        </span>
        <span className="font-mono text-xs text-zinc-400">
          {isOpen ? "Collapse  −" : "Expand  +"}
        </span>
      </button>

      {isOpen && (
        <div id="telemetry-log" className="h-52 overflow-y-auto border-t border-zinc-800 bg-black px-5 py-4">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-emerald-300">
            {JSON.stringify(telemetry, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
