# Nuvelist

A local-first writing studio for long-form drafts: manuscripts, chapters, characters, places, word-count goals, and Markdown export.

Work is stored in the browser (`localStorage`). There is no account system yet.

## Where development stands

The repository started as an empty README. This first slice is a working MVP you can run locally.

**Done**

- Library of manuscripts (create, open, delete)
- Writing studio with chapter list, reorder, and autosave
- Story bible for characters and places
- Target word count and per-chapter stats
- Markdown export
- Unit tests for manuscript helpers

**Still to do**

- Accounts, cloud sync, and multi-device backup
- Rich-text editing, comments, and revision history
- Daily writing goals and calendar stats
- EPUB/PDF export and sharing
- Mobile-native apps

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```
