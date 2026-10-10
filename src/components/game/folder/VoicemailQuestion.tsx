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
  const callerId = meta?.callerId ?? "UNKNOWN CALLER / TAP 04";

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
    <div className="border border-brass/40 bg-ink-raised/60 p-6 rounded-none shadow-md backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-brass">
          Question {question.sortOrder} — Wiretap Intercept
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-paper-muted">{question.points} PTS</span>
          {isSolved && (
            <span className="border border-evidence-red bg-evidence-red/20 px-2 py-0.5 font-mono text-xs text-evidence-red uppercase tracking-wider">
              [SOLVED]
            </span>
          )}
          {isExhausted && (
            <span className="border border-smoke bg-smoke/20 px-2 py-0.5 font-mono text-xs text-smoke uppercase tracking-wider">
              [EXHAUSTED]
            </span>
          )}
        </div>
      </div>

      <p className="font-serif text-lg leading-relaxed text-paper mb-4">{question.prompt}</p>

      {/* Retro Cassette Wiretap Unit */}
      <div className="mb-6 p-4 bg-ink border border-brass/40 rounded-xs">
        <div className="flex items-center justify-between border-b border-brass/20 pb-2 mb-3">
          <span className="font-mono text-xs text-evidence-red uppercase tracking-wider flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isPlaying ? "bg-evidence-red animate-pulse" : "bg-smoke"}`}
            />
            {callerId}
          </span>
          <span className="font-mono text-xs text-smoke">
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

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            className="border border-brass/60 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-brass hover:bg-brass/20 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isPlaying ? "PAUSE TAPE" : "PLAY INTERCEPT"}
          </button>

          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="border border-brass/30 px-3 py-1.5 font-mono text-xs text-paper-muted hover:text-paper hover:border-brass/60 transition-colors cursor-pointer"
          >
            {showTranscript ? "Hide Transcript" : "View Wiretap Transcript"}
          </button>
        </div>

        {/* Expandable Wiretap Transcript for Accessibility & Fallback */}
        {showTranscript && (
          <div className="mt-4 p-3 bg-ink-raised border-l-2 border-evidence-red text-sm font-mono text-paper-muted leading-relaxed">
            <span className="text-xs uppercase text-brass block mb-1">
              Official Wiretap Log Transcript:
            </span>
            {transcript ??
              "Audio transcript note: Inspect audio recording carefully for background sound clues and spoken passwords."}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={inputId}
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1"
          >
            Recovered Intelligence:
          </label>
          <input
            id={inputId}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSolved || isExhausted || isSubmitting}
            placeholder={question.placeholderText ?? "Enter intercepted information..."}
            className="w-full bg-ink border border-brass/50 p-2.5 font-mono text-sm uppercase text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden disabled:opacity-50 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brass/20">
          <span className="font-mono text-xs text-smoke">
            Attempts: {attemptsUsed} / {question.maxAttempts} ({attemptsRemaining} left)
          </span>

          <div className="flex gap-3">
            {hints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="border border-brass/40 px-3 py-1.5 font-mono text-xs text-brass hover:border-brass hover:text-paper transition-colors cursor-pointer"
              >
                {showHints ? "Hide Hints" : `Hints (${hints.length})`}
              </button>
            )}

            <button
              type="submit"
              disabled={!answer.trim() || isSolved || isExhausted || isSubmitting}
              className="bg-oxblood hover:bg-evidence-red text-paper px-4 py-1.5 font-mono text-xs uppercase tracking-wider border border-evidence-red/60 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "File Wiretap Deduction"}
            </button>
          </div>
        </div>
      </form>

      {showHints && hints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brass/20 space-y-3">
          <span className="font-mono text-xs text-brass uppercase tracking-widest block">
            Investigation Wiretaps & Informant Hints
          </span>
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="p-3 bg-ink/80 border border-brass/20 flex items-center justify-between gap-4"
            >
              <div className="text-sm font-mono text-paper-muted">
                {hint.isUnlocked ? (
                  <span className="text-paper">{hint.hintText}</span>
                ) : (
                  <span className="italic text-smoke">
                    Locked Lead — Cost: {hint.costPoints} PTS
                  </span>
                )}
              </div>
              {!hint.isUnlocked && !isSolved && (
                <button
                  type="button"
                  onClick={() => onRequestHint(hint.id)}
                  disabled={isSubmitting}
                  className="shrink-0 border border-brass/40 px-2 py-1 font-mono text-xs text-brass hover:bg-brass/20 transition-colors cursor-pointer"
                >
                  Unlock Hint
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
