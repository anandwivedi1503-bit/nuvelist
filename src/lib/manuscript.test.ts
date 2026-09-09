import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createManuscript,
  deleteManuscript,
  exportMarkdown,
  manuscriptWordCount,
  moveChapter,
  parseLibrary,
  upsertManuscript,
  wordCount,
} from "./manuscript.ts";

test("wordCount ignores extra whitespace", () => {
  assert.equal(wordCount("  one   two\nthree  "), 3);
  assert.equal(wordCount("   "), 0);
});

test("createManuscript starts with one empty chapter", () => {
  const manuscript = createManuscript("Harbor");
  assert.equal(manuscript.title, "Harbor");
  assert.equal(manuscript.chapters.length, 1);
  assert.equal(manuscriptWordCount(manuscript), 0);
});

test("upsert and delete keep the library consistent", () => {
  const first = createManuscript("A");
  const second = createManuscript("B");
  let library = { manuscripts: [] as typeof first[] };
  library = upsertManuscript(library, first);
  library = upsertManuscript(library, second);
  assert.equal(library.manuscripts.length, 2);
  library = upsertManuscript(library, { ...first, title: "A revised" });
  assert.equal(library.manuscripts.find((item) => item.id === first.id)?.title, "A revised");
  library = deleteManuscript(library, first.id);
  assert.equal(library.manuscripts.length, 1);
  assert.equal(library.manuscripts[0].id, second.id);
});

test("moveChapter reorders without dropping items", () => {
  const manuscript = createManuscript("Order");
  manuscript.chapters = [
    { id: "a", title: "One", body: "" },
    { id: "b", title: "Two", body: "" },
    { id: "c", title: "Three", body: "" },
  ];
  const moved = moveChapter(manuscript.chapters, "c", -1);
  assert.deepEqual(
    moved.map((chapter) => chapter.id),
    ["a", "c", "b"],
  );
});

test("exportMarkdown includes title and chapters", () => {
  const manuscript = createManuscript("Salt");
  manuscript.chapters[0].title = "Dawn";
  manuscript.chapters[0].body = "The map changed.";
  const markdown = exportMarkdown(manuscript);
  assert.match(markdown, /# Salt/);
  assert.match(markdown, /## Dawn/);
  assert.match(markdown, /The map changed\./);
});

test("parseLibrary recovers from invalid JSON", () => {
  assert.deepEqual(parseLibrary("not-json"), { manuscripts: [] });
  assert.deepEqual(parseLibrary(null), { manuscripts: [] });
});
