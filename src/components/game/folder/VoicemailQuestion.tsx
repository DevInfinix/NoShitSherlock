"use client";

import { useId, useRef, useState } from "react";
import type { SanitizedHint, SanitizedQuestion } from "@/server/services/game-session-service";

interface QuestionProps {
  question: SanitizedQuestion;
  state?: {
    attemptsUsed: number;
    isSolved: boolean;
    lastAttemptAt: Date | null;
    solvedAt: Date | null;
  };
  hints: SanitizedHint[];
  isSubmitting: boolean;
  onSubmit: (answer: string) => Promise<void>;
  onRequestHint: (hintId: number) => Promise<void>;
}

export function VoicemailQuestion({
  question,
  state,
  hints,
  isSubmitting,
  onSubmit,
  onRequestHint,
}: QuestionProps) {
  const isSolved = state?.isSolved ?? false;
  const attemptsUsed = state?.attemptsUsed ?? 0;
  const attemptsRemaining = Math.max(0, question.maxAttempts - attemptsUsed);
  const isExhausted = attemptsRemaining === 0 && !isSolved;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [answer, setAnswer] = useState("");
  const inputId = useId();

  // Extract metadata
  const meta = question.metadata as {
    audioUrl?: string;
    transcript?: string;
    callerId?: string;
    recordedAt?: string;
  } | null;

  const audioUrl = meta?.audioUrl ?? null;
  const transcript = meta?.transcript ?? null;
  const callerId = meta?.callerId ?? "UNKNOWN CALLER // WIRETAP CHANNEL 04";

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || isSolved || isExhausted) return;
    await onSubmit(answer.trim());
  };

  return (
    <div className="relative border-2 border-[#1C1510]/30 bg-[#F4EDE0] p-6 shadow-md text-[#1C1510]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#1C1510]/20 pb-3 mb-4 gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ITEM 0{question.sortOrder} {"//"} WIRETAP SURVEILLANCE INTERCEPT
          </span>
          <span className="font-mono text-xs text-[#554436]">AUDIO LOG ENTRY #{question.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-[#1C1510]/30 bg-[#E8DCBF] px-2 py-0.5 font-mono text-[11px] font-bold text-[#1C1510]">
            {question.points} PTS
          </span>
          {isSolved && (
            <span className="border-2 border-[#A92A28] bg-[#A92A28]/15 px-2.5 py-0.5 font-mono text-xs font-black text-[#A92A28] uppercase tracking-wider rotate-[-2deg]">
              [INTERCEPT SOLVED]
            </span>
          )}
          {isExhausted && (
            <span className="border-2 border-[#78716A] bg-[#78716A]/20 px-2.5 py-0.5 font-mono text-xs font-bold text-[#78716A] uppercase tracking-wider">
              [ATTEMPTS EXHAUSTED]
            </span>
          )}
        </div>
      </div>

      {/* Forensic Prompt */}
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[#1C1510] mb-5 font-medium">
        {question.prompt}
      </p>

      {/* Analog Reel-to-Reel Wiretap Unit */}
      <div className="mb-6 p-4 sm:p-5 bg-[#201813] border-2 border-[#A9874A]/60 rounded-xs text-[#E7DDC8] shadow-lg">
        <div className="flex items-center justify-between border-b border-[#A9874A]/30 pb-3 mb-4">
          <span className="font-mono text-xs text-[#E7DDC8] uppercase tracking-wider flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? "bg-[#A92A28] animate-pulse" : "bg-[#78716A]"
              }`}
            />
            {callerId}
          </span>
          <span className="font-mono text-xs text-[#A9874A]">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>
        </div>

        {audioUrl ? (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="hidden"
          >
            <track kind="captions" />
          </audio>
        ) : null}

        {/* Vintage Reel Spools & Waveform Visualizer */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-6">
            {/* Left Tape Reel */}
            <div
              className={`w-12 h-12 rounded-full border-2 border-[#A9874A] flex items-center justify-center bg-[#15100C] ${
                isPlaying ? "animate-spin" : ""
              }`}
            >
              <div className="w-4 h-4 rounded-full border border-[#A9874A] bg-[#A9874A]/30" />
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="border-2 border-[#A9874A] bg-[#A9874A]/20 hover:bg-[#A9874A] hover:text-[#15100C] text-[#E7DDC8] px-5 py-2 font-mono text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? "Pause Tape" : "Play Surveillance Tape"}
            </button>

            {/* Right Tape Reel */}
            <div
              className={`w-12 h-12 rounded-full border-2 border-[#A9874A] flex items-center justify-center bg-[#15100C] ${
                isPlaying ? "animate-spin" : ""
              }`}
            >
              <div className="w-4 h-4 rounded-full border border-[#A9874A] bg-[#A9874A]/30" />
            </div>
          </div>

          {/* Transcript Accordion Button */}
          {transcript && (
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="border border-[#A9874A]/50 bg-[#15100C] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#A9874A] hover:bg-[#A9874A]/10 transition-colors cursor-pointer"
            >
              {showTranscript ? "Hide Log" : "View Stenographer Transcript"}
            </button>
          )}
        </div>

        {/* Tape Progress Scrub Bar */}
        <div className="mt-3 w-full bg-[#15100C] h-2 border border-[#A9874A]/40 overflow-hidden">
          <div
            className="bg-[#A92A28] h-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Stenographer Transcript Paper Note */}
      {showTranscript && transcript && (
        <div className="mb-6 border-l-4 border-[#641B1B] bg-[#E8DCBF]/70 p-4 font-mono text-xs sm:text-sm leading-relaxed text-[#1C1510] shadow-inner">
          <span className="text-[10px] uppercase tracking-widest block text-[#641B1B] font-bold mb-1">
            CERTIFIED WIRETAP TRANSCRIPT {"//"} STENOGRAPHY RECORD:
          </span>
          <p className="whitespace-pre-line italic">{transcript}</p>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={inputId}
            className="font-mono text-[10px] uppercase tracking-widest text-[#554436] font-bold block mb-1"
          >
            INTERCEPT DEDUCTION (NAME, CODEWORD, OR CRITICAL FACT):
          </label>
          <input
            id={inputId}
            type="text"
            value={answer}
            disabled={isSolved || isExhausted || isSubmitting}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your audio deduction here..."
            className="w-full border-2 border-[#1C1510]/50 bg-[#FFFFFF] p-3 font-mono text-base uppercase font-bold text-[#1C1510] focus:border-[#A92A28] focus:outline-hidden disabled:opacity-60 shadow-inner"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1C1510]/15">
          <span className="font-mono text-xs text-[#554436]">
            ATTEMPTS: {attemptsUsed} / {question.maxAttempts} ({attemptsRemaining} remaining)
          </span>

          <div className="flex gap-3">
            {hints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="border border-[#1C1510]/40 bg-[#E8DCBF]/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#1C1510] hover:bg-[#E8DCBF] transition-colors cursor-pointer"
              >
                {showHints ? "Fold Leads" : `Consult Leads (${hints.length})`}
              </button>
            )}

            {!isSolved && !isExhausted && (
              <button
                type="submit"
                disabled={!answer.trim() || isSubmitting}
                className="border-2 border-[#A92A28] bg-[#641B1B] text-[#E7DDC8] px-5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#A92A28] disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? "Verifying..." : "Verify Deduction"}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Consulted Hints Drawer */}
      {showHints && (
        <div className="mt-5 border-t-2 border-dashed border-[#1C1510]/20 pt-4 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ARCHIVAL HINTS & WITNESS DISCLOSURES:
          </span>
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="border border-[#1C1510]/20 bg-[#DFD3BA]/50 p-3 font-serif text-sm text-[#1C1510]"
            >
              {hint.isUnlocked ? (
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs text-[#641B1B] font-bold">
                    [LEAD #{hint.hintOrder}]:
                  </span>
                  <p className="italic leading-relaxed">{hint.hintText}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#554436]">
                    Sealed lead #{hint.hintOrder} ({hint.costPoints} PTS penalty)
                  </span>
                  <button
                    type="button"
                    disabled={isSubmitting || isSolved}
                    onClick={() => onRequestHint(hint.id)}
                    className="border border-[#641B1B] bg-[#641B1B]/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#641B1B] hover:bg-[#641B1B] hover:text-[#E7DDC8] transition-colors cursor-pointer"
                  >
                    Unseal Lead (-{hint.costPoints} PTS)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
