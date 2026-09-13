// A lightweight, rule-based syllable splitter. It is not linguistically
// perfect (English syllabification has plenty of exceptions), but it is
// good enough to give a dyslexic reader useful visual chunks without
// needing a dictionary lookup or an API call.
//
// Approach: split each word into groups of one-or-more vowels, then
// attach the surrounding consonants using a few common English rules
// (e.g. keep "ch", "sh", "th", "ck" etc. together, split double
// consonants apart like "rab-bit").

const VOWELS = "aeiouyAEIOUY";
const KEEP_TOGETHER = ["ch", "sh", "th", "ph", "wh", "ck", "ng", "qu"];

function isVowel(ch) {
  return VOWELS.includes(ch);
}

export function splitSyllables(word) {
  if (!word) return [word];

  // Strip trailing punctuation, re-attach afterwards.
  const match = word.match(/^([a-zA-Z']+)([^a-zA-Z']*)$/);
  if (!match) return [word];
  const [, core, trailingPunct] = match;

  if (core.length <= 3) return [word];

  const chunks = [];
  let current = "";
  let i = 0;

  while (i < core.length) {
    current += core[i];

    const nextChar = core[i + 1];
    const nextTwo = core.slice(i, i + 2).toLowerCase();

    // Don't split common digraphs like "ch", "sh", "ck".
    if (KEEP_TOGETHER.includes(nextTwo)) {
      current += nextChar ?? "";
      i += 2;
      // Look ahead: if a vowel follows shortly, this is a natural break.
      if (i < core.length && !isVowel(core[i]) && current.length >= 2) {
        chunks.push(current);
        current = "";
      }
      continue;
    }

    const cur = core[i];
    if (
      isVowel(cur) &&
      nextChar &&
      !isVowel(nextChar) &&
      core[i + 2] &&
      isVowel(core[i + 2])
    ) {
      // vowel-consonant-vowel -> break after the consonant
      current += nextChar;
      chunks.push(current);
      current = "";
      i += 2;
      continue;
    }

    i += 1;
  }

  if (current) chunks.push(current);
  if (chunks.length === 0) return [word];

  chunks[chunks.length - 1] += trailingPunct;
  return chunks;
}

// Joins syllables with a visible separator for display.
export function toSyllableString(word, separator = "\u00B7") {
  return splitSyllables(word).join(separator);
}
