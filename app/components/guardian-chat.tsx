"use client";

import { useEffect, useRef, useState } from "react";

export default function GuardianChat() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [response, setResponse] = useState<"YES" | "NO" | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Temporary event boundary: wire this to the emergency-detection stream later.
  const triggerAlert = () => {
    setAlertVisible(true);
    setResponse(null);
  };

  useEffect(() => {
    if (alertVisible) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [alertVisible]);

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#0b141a] shadow-inner shadow-black/20">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-[#202c33] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-50">Family 🛡️</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">Guardian group</p>
        </div>
        <button
          type="button"
          onClick={triggerAlert}
          className="rounded border border-zinc-600 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          Test alert
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(29,43,49,0.8),_transparent_60%)] px-4 py-5">
        {!alertVisible && (
          <p className="pt-5 text-center font-mono text-xs text-zinc-600">Waiting for guardian alerts…</p>
        )}

        {alertVisible && (
          <div className="max-w-[92%] rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2 text-sm leading-5 text-zinc-100 shadow-sm">
            <p>🚨 Emergency detected on Mom&apos;s phone. Are you safe?</p>
            <div className="mt-3 flex gap-2">
              {(["YES", "NO"] as const).map((answer) => (
                <button
                  key={answer}
                  type="button"
                  onClick={() => setResponse(answer)}
                  aria-pressed={response === answer}
                  className={`rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-cyan-300 ${response === answer ? "border-emerald-300 bg-emerald-400/15 text-emerald-200" : "border-zinc-600 text-zinc-200 hover:border-emerald-300/60 hover:text-emerald-100"}`}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}
