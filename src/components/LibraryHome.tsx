"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createManuscript, manuscriptWordCount, sampleManuscript } from "@/lib/manuscript";
import { useLibrary } from "./LibraryProvider";

export function LibraryHome() {
  const router = useRouter();
  const { library, saveManuscript, removeManuscript } = useLibrary();

  function startBlank() {
    const manuscript = createManuscript("Untitled manuscript");
    saveManuscript(manuscript);
    router.push(`/book/${manuscript.id}`);
  }

  function startSample() {
    const manuscript = sampleManuscript();
    saveManuscript(manuscript);
    router.push(`/book/${manuscript.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm tracking-[0.28em] text-ink/55 uppercase">Nuvelist</p>
          <h1 className="font-serif mt-2 text-4xl leading-tight text-ink sm:text-5xl">
            A quiet desk for long stories.
          </h1>
          <p className="mt-3 max-w-xl text-ink/70">
            Draft manuscripts, keep chapters in order, and hold characters and places beside the
            page. Work stays in this browser until you add accounts later.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={startBlank}>
            New manuscript
          </button>
          <button type="button" className="btn-secondary" onClick={startSample}>
            Open sample story
          </button>
        </div>
      </header>

      {!library.manuscripts.length ? (
        <div className="rounded-3xl border border-ink/10 bg-white/70 p-10 text-center">
          <p className="font-serif text-2xl text-ink">Your shelf is empty.</p>
          <p className="mt-2 text-ink/65">Start a blank draft or load the sample to see the studio.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {library.manuscripts.map((manuscript) => {
            const words = manuscriptWordCount(manuscript);
            return (
              <li key={manuscript.id} className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm">
                <Link href={`/book/${manuscript.id}`} className="block">
                  <p className="text-xs tracking-widest text-ink/45 uppercase">
                    {manuscript.genre || "Manuscript"}
                  </p>
                  <h2 className="font-serif mt-1 text-2xl text-ink">{manuscript.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-ink/65">
                    {manuscript.logline || "No logline yet."}
                  </p>
                  <p className="mt-4 text-sm text-ink/55">
                    {manuscript.chapters.length} chapter
                    {manuscript.chapters.length === 1 ? "" : "s"} · {words.toLocaleString()} words
                  </p>
                </Link>
                <button
                  type="button"
                  className="mt-4 text-sm text-ink/45 hover:text-ink"
                  onClick={() => {
                    if (window.confirm(`Delete “${manuscript.title}”?`)) {
                      removeManuscript(manuscript.id);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
