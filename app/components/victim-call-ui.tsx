"use client";

import { useEffect, useRef, useState } from "react";

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

type VictimCallUiProps = { onTranscriptChunk: (text: string) => void };

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function VictimCallUi({ onTranscriptChunk }: VictimCallUiProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [speechStatus, setSpeechStatus] = useState("Microphone idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldListenRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }), [interimTranscript, transcript]);

  useEffect(() => () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
  }, []);

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
            setTranscript((chunks) => [...chunks, text]);
            onTranscriptChunk(text);
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

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30">
      <div className="flex flex-col items-center border-b border-zinc-800 px-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-xl font-semibold text-cyan-200 ring-1 ring-cyan-400/30">M</div>
        <p className="mt-4 text-xl font-semibold text-zinc-50">Mom</p>
        <p className="mt-1 font-mono text-sm text-emerald-300">{formatDuration(elapsedSeconds)}</p>
        <div className="mt-6 flex h-8 items-center gap-1" aria-label="Listening waveform">
          {[12, 22, 30, 18, 26, 14, 24].map((height, index) => <span key={height} className={`w-1 rounded-full bg-cyan-300 ${isListening ? "animate-pulse" : "opacity-40"}`} style={{ height, animationDelay: `${index * 120}ms` }} />)}
        </div>
        <button type="button" onClick={isListening ? stopListening : startListening} className="mt-5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-cyan-300">
          {isListening ? "Stop listening" : "Start listening"}
        </button>
        <p className="mt-3 font-mono text-xs text-zinc-500" aria-live="polite">{speechStatus}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Live transcript</p>
        {transcript.length === 0 && !interimTranscript ? <p className="mt-3 font-mono text-sm text-zinc-600">Listening transcript will appear here.</p> : <div className="mt-3 space-y-3 font-mono text-sm leading-6 text-zinc-300">{transcript.map((chunk, index) => <p key={`${chunk}-${index}`}>{chunk}</p>)}{interimTranscript && <p className="text-cyan-300/70">{interimTranscript}</p>}</div>}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}
