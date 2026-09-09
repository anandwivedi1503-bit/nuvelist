import { STORAGE_KEY, emptyLibrary, parseLibrary, type Library } from "./manuscript";

export function loadLibrary(): Library {
  if (typeof window === "undefined") return emptyLibrary();
  return parseLibrary(window.localStorage.getItem(STORAGE_KEY));
}

export function saveLibrary(library: Library): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}
