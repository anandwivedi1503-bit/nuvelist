"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  STORAGE_KEY,
  type Library,
  type Manuscript,
  deleteManuscript,
  parseLibrary,
  upsertManuscript,
} from "@/lib/manuscript";
import { saveLibrary } from "@/lib/storage";

const CHANGE_EVENT = "nuvelist:change";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

function emitChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

type LibraryContextValue = {
  ready: boolean;
  library: Library;
  saveManuscript: (manuscript: Manuscript) => void;
  removeManuscript: (id: string) => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const library = useMemo(() => parseLibrary(raw || null), [raw]);

  const saveManuscript = useCallback((manuscript: Manuscript) => {
    const next = upsertManuscript(parseLibrary(getSnapshot() || null), manuscript);
    saveLibrary(next);
    emitChange();
  }, []);

  const removeManuscript = useCallback((id: string) => {
    const next = deleteManuscript(parseLibrary(getSnapshot() || null), id);
    saveLibrary(next);
    emitChange();
  }, []);

  const value = useMemo(
    () => ({ ready: true, library, saveManuscript, removeManuscript }),
    [library, saveManuscript, removeManuscript],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
}
