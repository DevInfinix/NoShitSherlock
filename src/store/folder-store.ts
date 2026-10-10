import { create } from "zustand";

export interface FolderUIState {
  activeSectionIndex: number;
  isFolderOpen: boolean;
  isNotebookOpen: boolean;
  activeQuestionId: number | null;
  inspectedClueId: number | null;
  setActiveSectionIndex: (index: number) => void;
  setFolderOpen: (open: boolean) => void;
  toggleFolderOpen: () => void;
  setNotebookOpen: (open: boolean) => void;
  toggleNotebookOpen: () => void;
  setActiveQuestionId: (id: number | null) => void;
  setInspectedClueId: (id: number | null) => void;
}

export const useFolderStore = create<FolderUIState>((set) => ({
  activeSectionIndex: 0,
  isFolderOpen: true,
  isNotebookOpen: false,
  activeQuestionId: null,
  inspectedClueId: null,
  setActiveSectionIndex: (index) => set({ activeSectionIndex: index }),
  setFolderOpen: (open) => set({ isFolderOpen: open }),
  toggleFolderOpen: () => set((state) => ({ isFolderOpen: !state.isFolderOpen })),
  setNotebookOpen: (open) => set({ isNotebookOpen: open }),
  toggleNotebookOpen: () => set((state) => ({ isNotebookOpen: !state.isNotebookOpen })),
  setActiveQuestionId: (id) => set({ activeQuestionId: id }),
  setInspectedClueId: (id) => set({ inspectedClueId: id }),
}));
