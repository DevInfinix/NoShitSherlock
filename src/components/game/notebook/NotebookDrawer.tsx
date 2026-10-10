"use client";

import { AnimatePresence, motion } from "motion/react";
import type { UnlockedClue } from "@/server/services/game-session-service";
import { type ClueFilterTag, useNotebookStore } from "@/store/notebook-store";
import { ClueInspectionModal } from "./ClueInspectionModal";

interface NotebookDrawerProps {
  unlockedClues: UnlockedClue[];
}

const FILTER_TAGS: { label: string; value: ClueFilterTag }[] = [
  { label: "ALL", value: "all" },
  { label: "SUSPECTS", value: "suspect" },
  { label: "CRIME SCENE", value: "crime_scene" },
  { label: "FORENSICS", value: "forensics" },
  { label: "TIMELINE", value: "timeline" },
];

export function NotebookDrawer({ unlockedClues }: NotebookDrawerProps) {
  const {
    isOpen,
    setOpen,
    toggleOpen,
    selectedTag,
    setSelectedTag,
    inspectedClue,
    setInspectedClue,
  } = useNotebookStore();

  const filteredClues = unlockedClues.filter((clue) => {
    if (selectedTag === "all") return true;
    const metaTag = (clue.metadata as { tag?: string })?.tag?.toLowerCase();
    return metaTag === selectedTag;
  });

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-40 border-2 border-brass bg-ink-raised px-4 py-2.5 shadow-2xl font-mono text-xs uppercase tracking-wider text-paper hover:bg-oxblood hover:border-evidence-red transition-all flex items-center gap-2 cursor-pointer"
        aria-label="Toggle detective field notebook"
      >
        <span className="w-2 h-2 rounded-full bg-evidence-red" />
        <span>FIELD NOTEBOOK</span>
        <span className="border border-brass/40 px-1.5 py-0.5 text-brass text-[10px]">
          {unlockedClues.length}
        </span>
      </button>

      {/* Slide-out Notebook Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Close field notebook overlay"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-default"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md h-full bg-ink-raised border-l-2 border-brass/60 p-6 flex flex-col shadow-2xl relative z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brass/30 pb-4 mb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-brass block">
                    SCOTLAND YARD {"//"} FIELD JOURNAL
                  </span>
                  <h2 className="font-serif text-2xl text-paper font-bold mt-1">
                    Recovered Evidence
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-brass/40 px-3 py-1 font-mono text-xs text-brass hover:bg-brass/20 transition-colors cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Tag Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-brass/20 scrollbar-none">
                {FILTER_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => setSelectedTag(tag.value)}
                    className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                      selectedTag === tag.value
                        ? "border-evidence-red bg-oxblood text-paper font-bold"
                        : "border-brass/30 bg-ink text-paper-muted hover:border-brass hover:text-paper"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Clues List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredClues.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-brass/30 text-paper-muted font-mono text-xs">
                    {unlockedClues.length === 0
                      ? "No evidence items recovered yet. Solve deductions in the active dossier to unlock field clues."
                      : "No evidence items matching this category tag."}
                  </div>
                ) : (
                  filteredClues.map((clue) => {
                    const meta = clue.metadata as { tag?: string; timestamp?: string } | null;
                    return (
                      <button
                        type="button"
                        key={clue.id}
                        onClick={() => setInspectedClue(clue)}
                        className="w-full text-left p-3.5 border border-brass/30 bg-ink/80 hover:border-brass hover:bg-ink transition-all cursor-pointer group block"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
                            {clue.clueKey}
                          </span>
                          {meta?.tag && (
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-brass/20 text-smoke">
                              {meta.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-base text-paper font-semibold group-hover:text-brass transition-colors">
                          {clue.title}
                        </h3>
                        <p className="font-serif text-paper-muted text-xs line-clamp-2 mt-1">
                          {clue.clueText}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-brass/20 flex items-center justify-between font-mono text-xs text-smoke">
                <span>Total Items: {unlockedClues.length}</span>
                <span>Seq Clearance: Confirmed</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Clue Inspector Modal */}
      <ClueInspectionModal clue={inspectedClue} onClose={() => setInspectedClue(null)} />
    </>
  );
}
