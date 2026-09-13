# Reading helper — starter scaffold

A Next.js starting point for a dyslexia-friendly reading app: adjustable
font/size/spacing, color themes, bionic reading, a reading ruler, syllable
splitting, and text-to-speech with word-by-word highlighting.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.js          Root layout, wraps everything in ReadingSettingsProvider
  page.js             Home page: SettingsPanel + ReadingPane side by side
components/
  ReadingPane.jsx     Renders a passage with settings applied + TTS button
  ReadingRuler.jsx    Dims everything except a band around the pointer,
                       so only the current line stays readable
  SettingsPanel.jsx   Font/size/spacing/theme/bionic/ruler/syllable controls
context/
  ReadingSettingsContext.jsx   Shared state for all reading preferences,
                                persisted to localStorage
hooks/
  useTextToSpeech.js  Wraps the browser's speechSynthesis API, tracks the
                       currently-spoken word for highlighting
lib/
  syllables.js        Rule-based syllable splitter (no dictionary/API needed)
styles/
  globals.css         Base styles
```

## Reading ruler

`ReadingRuler` wraps the passage and tracks the mouse (or touch, on
tablets) position. It dims a semi-transparent overlay above and below a
band around the pointer, leaving roughly one line readable at a time.
Toggle it from the settings panel — it's off by default since not every
reader wants it, and it only responds to mouse/touch movement, so it stays
out of the way when unused.

If you'd rather have it auto-follow the TTS playback instead of the mouse,
you can drive its highlighted band from `activeWordIndex` (exposed by
`useTextToSpeech`) instead of pointer position — that's a natural next
iteration.

## Syllable splitting

`lib/syllables.js` is a small rule-based splitter — no dictionary lookup or
API call, so it works offline and instantly. It handles common English
patterns (keeping digraphs like "ch"/"sh"/"th" together, splitting
double consonants, vowel-consonant-vowel breaks) but won't be perfect for
every irregular word. Toggle "Show syllable breaks" in settings; combine it
with bionic reading and the first syllable of each word gets bolded too.

If accuracy becomes important later, swap in a proper hyphenation library
(e.g. `hypher` with an English pattern file) — `splitSyllables()` is the
only function you'd need to replace, everything else calls it as a black
box.

## Fonts

`ReadingPane` references fonts by name (Lexend, Atkinson Hyperlegible,
OpenDyslexic, Verdana). To actually load them:

- **Lexend / Atkinson Hyperlegible**: both are on Google Fonts. Easiest way
  in Next.js is `next/font/google`:

  ```js
  import { Lexend } from "next/font/google";
  const lexend = Lexend({ subsets: ["latin"] });
  ```

- **OpenDyslexic**: not on Google Fonts — download the `.woff2` files from
  https://opendyslexic.org and self-host with `next/font/local`, or load via
  a `@font-face` rule in `globals.css`.

## Where to go next

1. **Swap the hardcoded sample text** in `app/page.js` for real content —
   maybe a `content/` folder of `.md` or `.json` passages you can add to
   over time.
2. **Add a database** (SQLite via Prisma, or Supabase) once you want
   settings and progress to sync across devices rather than living only in
   `localStorage`.
3. **Build exercises**: word-building, phonics matching, spelling practice
   — each as its own route under `app/`, reusing `SettingsPanel` and the
   `useReadingSettings` hook so preferences stay consistent everywhere.
4. **Tie the ruler to TTS playback** instead of (or in addition to) the
   mouse, so the highlighted band auto-advances line by line as he listens.

## Deploying

Push to GitHub and import the repo at https://vercel.com/new — zero-config
deploy for Next.js, free tier is plenty for a personal project like this.
