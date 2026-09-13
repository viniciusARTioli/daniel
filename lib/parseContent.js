// Deliberately does NOT use DOMParser — that API doesn't exist during
// Next.js's server-side prerendering (which is what runs on Cloudflare's
// build server), so relying on it breaks the production build.
//
// Instead this understands a small, fixed set of tags via regex. That's
// enough for reading passages (headings + paragraphs + bold/italic) while
// staying safe to run at build time. It intentionally does NOT support
// nested tags, lists, links, images, or arbitrary HTML — keep source
// content to the tags below.

const BLOCK_TAGS = ["h1", "h2", "h3", "p"];
const INLINE_TAGS = ["strong", "em"];

function parseInline(rawInner) {
  const inlineRegex = new RegExp(
    `<(${INLINE_TAGS.join("|")})>([\\s\\S]*?)<\\/\\1>|([^<]+)`,
    "g"
  );
  const segments = [];
  let match;

  while ((match = inlineRegex.exec(rawInner))) {
    const [, tag, tagged, plain] = match;
    const raw = tag ? tagged : plain;
    const words = raw.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);

    words.forEach((word) => {
      segments.push({
        text: word,
        strong: tag === "strong",
        em: tag === "em",
      });
    });
  }

  return segments;
}

// Parses a fixed-tag HTML string into blocks of words, each word tagged
// with a stable global index (used later to sync TTS highlighting).
//
// Returns: { blocks, plainText }
//   blocks: [{ tag: 'h1'|'h2'|'h3'|'p', words: [{ text, strong, em, index }] }]
//   plainText: all words joined with spaces, in order — feed this straight
//              into the TTS hook so word indices line up with what's shown.
export function parseContent(html) {
  const blockRegex = new RegExp(
    `<(${BLOCK_TAGS.join("|")})>([\\s\\S]*?)<\\/\\1>`,
    "g"
  );
  const blocks = [];
  let match;
  let globalIndex = 0;

  while ((match = blockRegex.exec(html))) {
    const [, tag, inner] = match;
    const words = parseInline(inner).map((word) => ({
      ...word,
      index: globalIndex++,
    }));
    blocks.push({ tag, words });
  }

  const plainText = blocks.flatMap((b) => b.words.map((w) => w.text)).join(" ");

  return { blocks, plainText };
}
