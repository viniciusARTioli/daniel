"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "reading-bookmark:";

// One bookmark per contentId: { index, snippet, savedAt }.
// - index: which word (by global index) to resume at.
// - snippet: a few words of surrounding text, just so the "resume" banner
//   can show something readable instead of a raw number.
export function useBookmark(contentId) {
  const storageKey = `${PREFIX}${contentId}`;
  const [bookmark, setBookmarkState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      setBookmarkState(saved ? JSON.parse(saved) : null);
    } catch (err) {
      console.error("Could not load bookmark:", err);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const setBookmark = useCallback(
    (index, snippet) => {
      const next = { index, snippet, savedAt: Date.now() };
      setBookmarkState(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (err) {
        console.error("Could not save bookmark:", err);
      }
    },
    [storageKey]
  );

  const clearBookmark = useCallback(() => {
    setBookmarkState(null);
    try {
      window.localStorage.removeItem(storageKey);
    } catch (err) {
      console.error("Could not clear bookmark:", err);
    }
  }, [storageKey]);

  return { bookmark, setBookmark, clearBookmark, hydrated };
}
