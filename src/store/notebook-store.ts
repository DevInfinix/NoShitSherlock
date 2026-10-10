import { create } from "zustand";
import type { UnlockedClue } from "@/server/services/game-session-service";

export type ClueFilterTag = "all" | "suspect" | "crime_scene" | "forensics" | "timeline";

export interface NotebookState {
  isOpen: boolean;
  selectedTag: ClueFilterTag;
  inspectedClue: UnlockedClue | null;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setSelectedTag: (tag: ClueFilterTag) => void;
  setInspectedClue: (clue: UnlockedClue | null) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  isOpen: false,
  selectedTag: "all",
  inspectedClue: null,
  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setInspectedClue: (clue) => set({ inspectedClue: clue }),
}));
