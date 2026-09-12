"use client";

import { useCallback, useState } from "react";
import GuardianChat from "./guardian-chat";
import TelemetryDrawer, { type TelemetryEntry } from "./telemetry-drawer";
import VictimCallUi from "./victim-call-ui";

const initialTelemetry: TelemetryEntry[] = [
  { timestamp: "2026-09-12T10:38:14.021Z", event: "screen.connected", source: "victim", sessionId: "sess_7a4f" },
  { timestamp: "2026-09-12T10:38:15.408Z", event: "guardian.ready", source: "guardian", protections: ["network-watch", "input-audit"] },
];

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const onTranscriptChunk = useCallback((text: string) => {
    console.log("Transcript chunk:", text);
    setTelemetry((entries) => [...entries, { timestamp: new Date().toISOString(), event: "speech.transcript.final", source: "victim", text }]);
  }, []);

  return (
    <div className="flex min-h-screen flex-1 flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="flex min-h-0 flex-[3] flex-col border-b border-zinc-800 bg-zinc-950 p-6 md:border-r md:border-b-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Endpoint / 01</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">Victim Screen</h1>
          <VictimCallUi onTranscriptChunk={onTranscriptChunk} />
        </section>
        <section className="flex min-h-0 flex-[2] flex-col bg-zinc-900 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Monitoring / Active</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">Guardian Screen</h2>
          <GuardianChat />
        </section>
      </main>
      <TelemetryDrawer entries={telemetry} />
    </div>
  );
}
