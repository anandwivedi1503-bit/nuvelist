export const STORAGE_KEY = "nuvelist.v1";

export type Chapter = {
  id: string;
  title: string;
  body: string;
};

export type Character = {
  id: string;
  name: string;
  role: string;
  notes: string;
};

export type Place = {
  id: string;
  name: string;
  notes: string;
};

export type Manuscript = {
  id: string;
  title: string;
  genre: string;
  logline: string;
  targetWords: number;
  createdAt: number;
  updatedAt: number;
  chapters: Chapter[];
  characters: Character[];
  places: Place[];
};

export type Library = {
  manuscripts: Manuscript[];
};

export function now(): number {
  return Date.now();
}

export function createId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function manuscriptWordCount(manuscript: Manuscript): number {
  return manuscript.chapters.reduce((sum, chapter) => sum + wordCount(chapter.body), 0);
}

export function emptyLibrary(): Library {
  return { manuscripts: [] };
}

export function createChapter(title = "Chapter 1"): Chapter {
  return { id: createId("ch"), title, body: "" };
}

export function createManuscript(title = "Untitled manuscript"): Manuscript {
  const timestamp = now();
  return {
    id: createId("ms"),
    title,
    genre: "",
    logline: "",
    targetWords: 80000,
    createdAt: timestamp,
    updatedAt: timestamp,
    chapters: [createChapter("Chapter 1")],
    characters: [],
    places: [],
  };
}

export function sampleManuscript(): Manuscript {
  const timestamp = now();
  return {
    id: createId("ms"),
    title: "The Salt Road",
    genre: "Literary fiction",
    logline: "A cartographer inherits a map that redraws itself every dawn.",
    targetWords: 80000,
    createdAt: timestamp,
    updatedAt: timestamp,
    chapters: [
      {
        id: createId("ch"),
        title: "The Inheritance",
        body: "By the time the letter reached Mira, the tide had already taken the southern pier. She read it twice on the quay, salt drying on the paper, then folded the map into her coat and started inland.",
      },
    ],
    characters: [
      {
        id: createId("char"),
        name: "Mira Voss",
        role: "Protagonist",
        notes: "A surveyor who no longer trusts printed coastlines.",
      },
    ],
    places: [
      {
        id: createId("pl"),
        name: "Harbor of Keln",
        notes: "A working port whose streets flood on the spring moon.",
      },
    ],
  };
}

export function upsertManuscript(library: Library, manuscript: Manuscript): Library {
  const exists = library.manuscripts.some((item) => item.id === manuscript.id);
  const next = exists
    ? library.manuscripts.map((item) => (item.id === manuscript.id ? manuscript : item))
    : [manuscript, ...library.manuscripts];
  return { manuscripts: next };
}

export function deleteManuscript(library: Library, id: string): Library {
  return { manuscripts: library.manuscripts.filter((item) => item.id !== id) };
}

export function moveChapter(chapters: Chapter[], id: string, direction: -1 | 1): Chapter[] {
  const index = chapters.findIndex((chapter) => chapter.id === id);
  if (index < 0) return chapters;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= chapters.length) return chapters;
  const copy = [...chapters];
  const [removed] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, removed);
  return copy;
}

export function exportMarkdown(manuscript: Manuscript): string {
  const header = [
    `# ${manuscript.title}`,
    manuscript.genre ? `*${manuscript.genre}*` : "",
    manuscript.logline,
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const body = manuscript.chapters
    .map((chapter) => `## ${chapter.title}\n\n${chapter.body.trim()}`)
    .join("\n\n");

  return `${header}\n\n${body}\n`;
}

export function parseLibrary(raw: string | null): Library {
  if (!raw) return emptyLibrary();
  try {
    const parsed = JSON.parse(raw) as Library;
    if (!parsed || !Array.isArray(parsed.manuscripts)) return emptyLibrary();
    return parsed;
  } catch {
    return emptyLibrary();
  }
}
