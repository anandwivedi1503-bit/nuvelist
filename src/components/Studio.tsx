"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type Character,
  type Manuscript,
  type Place,
  createChapter,
  createId,
  exportMarkdown,
  manuscriptWordCount,
  moveChapter,
  wordCount,
} from "@/lib/manuscript";
import { useLibrary } from "./LibraryProvider";

type Panel = "write" | "bible" | "stats";

export function Studio({ manuscriptId }: { manuscriptId: string }) {
  const { library, saveManuscript } = useLibrary();
  const stored = library.manuscripts.find((item) => item.id === manuscriptId) ?? null;
  const [panel, setPanel] = useState<Panel>("write");
  const [session, setSession] = useState(() => ({
    routeId: manuscriptId,
    draft: stored,
    chapterId: stored?.chapters[0]?.id ?? null,
  }));

  if (session.routeId !== manuscriptId) {
    setSession({
      routeId: manuscriptId,
      draft: stored,
      chapterId: stored?.chapters[0]?.id ?? null,
    });
  } else if (!session.draft && stored) {
    setSession({
      routeId: manuscriptId,
      draft: stored,
      chapterId: stored.chapters[0]?.id ?? null,
    });
  } else if (session.draft && !stored) {
    setSession({ routeId: manuscriptId, draft: null, chapterId: null });
  }

  const draft = session.routeId === manuscriptId ? session.draft : stored;
  const chapterId = session.routeId === manuscriptId ? session.chapterId : stored?.chapters[0]?.id ?? null;

  useEffect(() => {
    if (!draft) return;
    const handle = window.setTimeout(() => {
      saveManuscript({ ...draft, updatedAt: Date.now() });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draft, saveManuscript]);

  const chapter = useMemo(
    () => draft?.chapters.find((item) => item.id === chapterId) ?? draft?.chapters[0],
    [draft, chapterId],
  );

  if (!draft || !chapter) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <p className="font-serif text-3xl">That manuscript is not on this shelf.</p>
        <Link href="/" className="btn-secondary mt-6 inline-flex">
          Back to library
        </Link>
      </div>
    );
  }

  const activeChapter = chapter;
  const manuscript = draft;
  const words = manuscriptWordCount(manuscript);
  const progress =
    manuscript.targetWords > 0
      ? Math.min(100, Math.round((words / manuscript.targetWords) * 100))
      : 0;

  function setDraft(updater: (current: Manuscript | null) => Manuscript | null) {
    setSession((current) => ({ ...current, draft: updater(current.draft) }));
  }

  function setChapterId(nextId: string | null) {
    setSession((current) => ({ ...current, chapterId: nextId }));
  }

  function update(patch: Partial<Manuscript>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function updateChapter(patch: Partial<typeof activeChapter>) {
    const activeId = activeChapter.id;
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        chapters: current.chapters.map((item) => (item.id === activeId ? { ...item, ...patch } : item)),
      };
    });
  }

  function downloadMarkdown() {
    const blob = new Blob([exportMarkdown(manuscript)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${manuscript.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
        <div>
          <Link href="/" className="text-xs tracking-[0.24em] text-ink/50 uppercase">
            Nuvelist
          </Link>
          <input
            className="font-serif mt-1 block w-full bg-transparent text-2xl text-ink outline-none"
            value={manuscript.title}
            onChange={(event) => update({ title: event.target.value })}
            aria-label="Manuscript title"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink/55">
            {words.toLocaleString()} / {manuscript.targetWords.toLocaleString()} words
          </p>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-ink" style={{ width: `${progress}%` }} />
          </div>
          <button type="button" className="btn-secondary" onClick={downloadMarkdown}>
            Export Markdown
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full border-b border-ink/10 p-4 lg:w-72 lg:border-r lg:border-b-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs tracking-widest text-ink/50 uppercase">Chapters</h2>
            <button
              type="button"
              className="text-sm text-ink/70 hover:text-ink"
              onClick={() => {
                const next = createChapter(`Chapter ${manuscript.chapters.length + 1}`);
                update({ chapters: [...manuscript.chapters, next] });
                setChapterId(next.id);
              }}
            >
              Add
            </button>
          </div>
          <ul className="space-y-1">
            {manuscript.chapters.map((item, index) => (
              <li key={item.id} className="flex items-center gap-1">
                <button
                  type="button"
                  className={`flex-1 rounded-xl px-3 py-2 text-left text-sm ${
                    item.id === activeChapter.id ? "bg-ink text-paper" : "hover:bg-ink/5"
                  }`}
                  onClick={() => setChapterId(item.id)}
                >
                  <span className="block truncate">{item.title || `Chapter ${index + 1}`}</span>
                  <span className="block text-xs opacity-70">{wordCount(item.body)} words</span>
                </button>
                <button
                  type="button"
                  className="px-1 text-ink/40 hover:text-ink"
                  onClick={() => update({ chapters: moveChapter(manuscript.chapters, item.id, -1) })}
                  aria-label="Move chapter up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-1 text-ink/40 hover:text-ink"
                  onClick={() => update({ chapters: moveChapter(manuscript.chapters, item.id, 1) })}
                  aria-label="Move chapter down"
                >
                  ↓
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-2 border-b border-ink/10 px-5 py-3">
            {(["write", "bible", "stats"] as Panel[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-3 py-1 text-sm capitalize ${
                  panel === item ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/5"
                }`}
                onClick={() => setPanel(item)}
              >
                {item === "bible" ? "Story bible" : item}
              </button>
            ))}
          </div>

          {panel === "write" ? (
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8">
              <input
                className="font-serif mb-4 bg-transparent text-3xl text-ink outline-none"
                value={activeChapter.title}
                onChange={(event) => updateChapter({ title: event.target.value })}
                aria-label="Chapter title"
              />
              <textarea
                className="font-serif min-h-[28rem] flex-1 resize-none bg-transparent text-lg leading-8 text-ink outline-none"
                value={activeChapter.body}
                onChange={(event) => updateChapter({ body: event.target.value })}
                placeholder="Write the next page…"
              />
              <div className="mt-4 flex items-center justify-between text-sm text-ink/50">
                <span>{wordCount(activeChapter.body)} words in this chapter</span>
                {manuscript.chapters.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const remaining = manuscript.chapters.filter((item) => item.id !== activeChapter.id);
                      update({ chapters: remaining });
                      setChapterId(remaining[0]?.id ?? null);
                    }}
                  >
                    Delete chapter
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {panel === "bible" ? (
            <div className="grid flex-1 gap-8 p-6 lg:grid-cols-2">
              <BibleList
                items={manuscript.characters}
                onAdd={() =>
                  update({
                    characters: [
                      ...manuscript.characters,
                      { id: createId("char"), name: "New character", role: "", notes: "" },
                    ],
                  })
                }
                onChange={(characters) => update({ characters })}
              />
              <PlaceList
                items={manuscript.places}
                onAdd={() =>
                  update({
                    places: [...manuscript.places, { id: createId("pl"), name: "New place", notes: "" }],
                  })
                }
                onChange={(places) => update({ places })}
              />
            </div>
          ) : null}

          {panel === "stats" ? (
            <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
              <label className="block text-sm text-ink/60">
                Genre
                <input
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-ink"
                  value={manuscript.genre}
                  onChange={(event) => update({ genre: event.target.value })}
                />
              </label>
              <label className="block text-sm text-ink/60">
                Logline
                <textarea
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-ink"
                  rows={3}
                  value={manuscript.logline}
                  onChange={(event) => update({ logline: event.target.value })}
                />
              </label>
              <label className="block text-sm text-ink/60">
                Target word count
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-ink"
                  value={manuscript.targetWords}
                  onChange={(event) => update({ targetWords: Number(event.target.value) || 0 })}
                />
              </label>
              <ul className="divide-y border-y border-ink/10">
                {manuscript.chapters.map((item) => (
                  <li key={item.id} className="flex justify-between py-3 text-sm">
                    <span>{item.title}</span>
                    <span>{wordCount(item.body).toLocaleString()} words</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function BibleList({
  items,
  onAdd,
  onChange,
}: {
  items: Character[];
  onAdd: () => void;
  onChange: (items: Character[]) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs tracking-widest text-ink/50 uppercase">Characters</h2>
        <button type="button" className="text-sm text-ink/70" onClick={onAdd}>
          Add
        </button>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <input
              className="w-full bg-transparent font-medium outline-none"
              value={item.name}
              onChange={(event) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, name: event.target.value } : entry)))
              }
            />
            <input
              className="mt-2 w-full bg-transparent text-sm text-ink/60 outline-none"
              placeholder="Role"
              value={item.role}
              onChange={(event) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, role: event.target.value } : entry)))
              }
            />
            <textarea
              className="mt-2 w-full bg-transparent text-sm outline-none"
              rows={3}
              placeholder="Notes"
              value={item.notes}
              onChange={(event) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, notes: event.target.value } : entry)))
              }
            />
            <button
              type="button"
              className="mt-2 text-xs text-ink/40"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlaceList({
  items,
  onAdd,
  onChange,
}: {
  items: Place[];
  onAdd: () => void;
  onChange: (items: Place[]) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs tracking-widest text-ink/50 uppercase">Places</h2>
        <button type="button" className="text-sm text-ink/70" onClick={onAdd}>
          Add
        </button>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <input
              className="w-full bg-transparent font-medium outline-none"
              value={item.name}
              onChange={(event) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, name: event.target.value } : entry)))
              }
            />
            <textarea
              className="mt-2 w-full bg-transparent text-sm outline-none"
              rows={3}
              placeholder="Notes"
              value={item.notes}
              onChange={(event) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, notes: event.target.value } : entry)))
              }
            />
            <button
              type="button"
              className="mt-2 text-xs text-ink/40"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
