"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VictimProtectionState = "safe" | "trap" | null;

type VictimCallUiProps = {
  onTranscriptChunk: (text: string) => void;
  protectionState?: VictimProtectionState;
  trapQuestion?: string;
};

const scamDemoTranscript = [
  "Hello, this is the fraud department from your bank.",
  "We detected a suspicious transfer and need to secure your account immediately.",
  "Please share the verification code we just sent to your phone.",
  "Do not tell anyone about this call while we complete the security check.",
];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function VictimCallUi({
  onTranscriptChunk,
  protectionState = null,
  trapQuestion = "",
}: VictimCallUiProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [speechStatus, setSpeechStatus] = useState("Microphone idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const simulationTimerRef = useRef<number | null>(null);
  const shouldListenRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (protectionState === "safe") return;

    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [protectionState]);

  useEffect(() => {
    const scrollToLatestTranscript = async () => {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    void scrollToLatestTranscript();
  }, [interimTranscript, transcript]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;

      const recognition = recognitionRef.current;
      if (!recognition) return;

      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (simulationTimerRef.current !== null) {
        window.clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (protectionState !== "safe") return;

    shouldListenRef.current = false;
    recognitionRef.current?.stop();
  }, [protectionState]);

  const appendTranscriptChunk = useCallback((text: string) => {
    setTranscript((chunks) => [...chunks, text]);
    onTranscriptChunk(text);
  }, [onTranscriptChunk]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechStatus("Speech recognition is not supported in this browser");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let interim = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const text = result[0].transcript.trim();
          if (!text) continue;
          if (result.isFinal) {
            appendTranscriptChunk(text);
          } else {
            interim += `${text} `;
          }
        }
        setInterimTranscript(interim.trim());
      };
      recognition.onend = () => {
        setInterimTranscript("");
        if (shouldListenRef.current) {
          try { recognition.start(); } catch { /* Recognition may still be shutting down. */ }
        } else {
          setIsListening(false);
          setSpeechStatus("Microphone idle");
        }
      };
      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setIsListening(false);
          setSpeechStatus("Microphone permission was denied");
        } else {
          setSpeechStatus(`Speech recognition error: ${event.error}`);
        }
      };
      recognitionRef.current = recognition;
    }

    shouldListenRef.current = true;
    setIsListening(true);
    setSpeechStatus("Listening for speech");
    try { recognitionRef.current.start(); } catch { /* Already running. */ }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
  };

  const simulateScamCall = () => {
    if (simulationTimerRef.current !== null) {
      window.clearInterval(simulationTimerRef.current);
    }

    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setInterimTranscript("");
    setSpeechStatus("Playing demo scam call");

    let chunkIndex = 0;
    const playNextChunk = () => {
      const text = scamDemoTranscript[chunkIndex];
      if (!text) return;

      appendTranscriptChunk(text);
      chunkIndex += 1;

      if (chunkIndex === scamDemoTranscript.length && simulationTimerRef.current !== null) {
        window.clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
        setSpeechStatus("Demo scam call complete");
      }
    };

    playNextChunk();
    simulationTimerRef.current = window.setInterval(playNextChunk, 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={simulateScamCall}
        disabled={protectionState === "safe"}
        className="mt-6 self-start rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-amber-200"
      >
        Simulate scam call
      </button>
      <div className="relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30">
      <div className="flex flex-col items-center border-b border-zinc-800 px-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-xl font-semibold text-cyan-200 ring-1 ring-cyan-400/30">M</div>
        <p className="mt-4 text-xl font-semibold text-zinc-50">Mom</p>
        <p className="mt-1 font-mono text-sm text-emerald-300">{formatDuration(elapsedSeconds)}</p>
        <div className="mt-6 flex h-8 items-center gap-1" aria-label="Listening waveform">
          {[12, 22, 30, 18, 26, 14, 24].map((height, index) => <span key={height} className={`w-1 rounded-full bg-cyan-300 ${isListening && protectionState !== "safe" ? "animate-pulse" : "opacity-40"}`} style={{ height, animationDelay: `${index * 120}ms` }} />)}
        </div>
        <button type="button" onClick={isListening ? stopListening : startListening} className="mt-5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-cyan-300">
          {isListening && protectionState !== "safe" ? "Stop listening" : "Start listening"}
        </button>
        <p className="mt-3 font-mono text-xs text-zinc-500" aria-live="polite">{speechStatus}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Live transcript</p>
        {transcript.length === 0 && !interimTranscript ? <p className="mt-3 font-mono text-sm text-zinc-600">Listening transcript will appear here.</p> : <div className="mt-3 space-y-3 font-mono text-sm leading-6 text-zinc-300">{transcript.map((chunk, index) => <p key={`${chunk}-${index}`}>{chunk}</p>)}{interimTranscript && <p className="text-cyan-300/70">{interimTranscript}</p>}</div>}
        <div ref={transcriptEndRef} />
      </div>

      {protectionState === "safe" && (
        <div className="absolute inset-0 z-10 flex animate-pulse flex-col items-center justify-center bg-red-950/95 px-8 text-center text-red-50">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center" aria-hidden="true">
            <span className="absolute h-16 w-16 animate-ping rounded-full border-2 border-red-300/70" />
            <span className="absolute h-11 w-11 animate-ping rounded-full border-2 border-red-200/80 [animation-delay:200ms]" />
            <span className="h-4 w-4 rounded-full bg-red-100 shadow-[0_0_20px_8px_rgba(254,202,202,0.7)]" />
          </div>
          <p className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-red-100">
            Scam terminated
          </p>
          <p className="mt-3 max-w-sm text-lg font-semibold leading-7">
            Call disconnected to protect user
          </p>
          <div className="mt-6 flex items-end gap-1" aria-label="Disconnect tone animation">
            {[20, 32, 12, 26, 8, 18].map((height, index) => (
              <span key={height} className="w-1.5 animate-pulse rounded-full bg-red-200" style={{ height, animationDelay: `${index * 100}ms` }} />
            ))}
          </div>
        </div>
      )}

      {protectionState === "trap" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-amber-300/95 px-8 text-center text-amber-950">
          <span className="rounded-full border border-amber-950/30 bg-amber-100/60 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
            Urgent verification
          </span>
          <p className="mt-5 text-xl font-bold leading-8">Ask the caller:</p>
          <p className="mt-3 max-w-md rounded-lg border border-amber-950/20 bg-amber-100/50 px-5 py-4 font-mono text-base font-semibold leading-7">
            “{trapQuestion || "Please verify your identity."}”
          </p>
        </div>
      )}
      </div>
    </>
  );
}
