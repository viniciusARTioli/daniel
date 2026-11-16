"use client";

import { useCallback, useRef, useState } from "react";

// Wraps the browser's built-in speechSynthesis API. Free, no backend, but
// note the 'boundary' event (used for word highlighting) is well supported
// in Chrome/Edge and patchier in Safari - test on whatever device your son
// actually uses.
export function useTextToSpeech({ rate = 0.9 } = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const utteranceRef = useRef(null);

  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.warn("Speech synthesis not supported in this browser.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;

      utterance.onboundary = (event) => {
        if (event.name !== "word") return;
        const before = text.slice(0, event.charIndex).trim();
        const wordIndex = before.length === 0 ? 0 : before.split(/\s+/).length;
        setActiveWordIndex(wordIndex);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setActiveWordIndex(-1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveWordIndex(-1);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    },
    [rate]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveWordIndex(-1);
  }, []);

  return { speak, stop, isPlaying, activeWordIndex };
}
