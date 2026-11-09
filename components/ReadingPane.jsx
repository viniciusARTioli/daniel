"use client";

import {useMemo, useState} from "react";
import {useReadingSettings, THEMES} from "../context/ReadingSettingsContext";
import {useTextToSpeech} from "../hooks/useTextToSpeech";
import {useBookmark} from "../hooks/useBookmark";
import {splitSyllables} from "../lib/syllables";
import {parseContent} from "../lib/parseContent";
import {FONT_FAMILY_MAP} from "../lib/fonts";
import {hashString} from "../lib/hash";
import ReadingRuler from "./ReadingRuler";

const HEADING_TAGS = {h1: "h1", h2: "h2", h3: "h3"};
const SNIPPET_RADIUS = 4; // words of context shown either side of a bookmark

// Renders reading content (headings + paragraphs + bold/italic text) with
// all dyslexia-friendly settings applied, plus text-to-speech with
// word-by-word highlighting and a bookmark for "where I stopped reading".
//
// `html` accepts a small fixed tag set only: h1, h2, h3, p, strong, em.
// See lib/parseContent.js for why (no DOMParser, so it stays safe to run
// during server-side prerendering / static builds).
//
// `contentId` (optional) keys the bookmark to this passage. If omitted,
// it's derived from hashing `html` - fine for a single fixed story, but
// pass an explicit stable id (e.g. "chapter-1") if the text might get
// small edits later, since editing it changes the hash and "loses" any
// saved bookmark.
//
// Usage: <ReadingPane html="<h1>Title</h1><p>Some passage...</p>" />
export default function ReadingPane({html, contentId}) {
	const {settings} = useReadingSettings();
	const {speak, stop, isPlaying, activeWordIndex} = useTextToSpeech({
		rate: settings.ttsRate,
	});

	const {blocks, plainText} = useMemo(() => parseContent(html), [html]);
	const flatWords = useMemo(() => blocks.flatMap((b) => b.words), [blocks]);
	const theme = THEMES[settings.theme] ?? THEMES.cream;

	const computedContentId = useMemo(() => hashString(html), [html]);
	const resolvedContentId = contentId ?? computedContentId;
	const {bookmark, setBookmark, clearBookmark, hydrated} = useBookmark(resolvedContentId);
	const [placingBookmark, setPlacingBookmark] = useState(false);

	function snippetAround(index) {
		const start = Math.max(0, index - SNIPPET_RADIUS);
		const end = Math.min(flatWords.length, index + SNIPPET_RADIUS + 1);
		return flatWords
			.slice(start, end)
			.map((w) => w.text)
			.join(" ");
	}

	function handleWordClick(word) {
		if (!placingBookmark) return;
		setBookmark(word.index, snippetAround(word.index));
		setPlacingBookmark(false);
	}

	function handleReadAloudClick() {
		if (isPlaying) {
			// Save where we stopped, same as a manual bookmark, so hitting
			// Stop while listening automatically marks your place.
			if (activeWordIndex >= 0) {
				setBookmark(activeWordIndex, snippetAround(activeWordIndex));
			}
			stop();
		} else {
			speak(plainText);
		}
	}

	function scrollToBookmark() {
		if (!bookmark) return;
		const el = document.getElementById(`word-${resolvedContentId}-${bookmark.index}`);
		if (el) el.scrollIntoView({behavior: "smooth", block: "center"});
	}

	function renderWordText(word) {
		if (settings.syllables) {
			const syllables = splitSyllables(word.text);
			return syllables.map((syl, i) => (
				<span key={i}>
					{settings.bionic && i === 0 ? <b style={{fontWeight: 500}}>{syl}</b> : syl}
					{i < syllables.length - 1 && <span style={{opacity: 0.5}}>{"\u00B7"}</span>}
				</span>
			));
		}

		if (settings.bionic) {
			const boldLength = Math.ceil(word.text.length * 0.5);
			return (
				<>
					<b style={{fontWeight: 500}}>{word.text.slice(0, boldLength)}</b>
					{word.text.slice(boldLength)}
				</>
			);
		}

		return word.text;
	}

	function renderWord(word) {
		const isActive = word.index === activeWordIndex;
		const isBookmarked = bookmark?.index === word.index;
		let content = renderWordText(word);

		if (word.strong) content = <strong>{content}</strong>;
		if (word.em) content = <em>{content}</em>;

		return (
			<span key={word.index}>
				{isBookmarked && (
					<span aria-hidden="true" style={{marginRight: 2}}>
						{"\u{1F516}"}
					</span>
				)}
				<span
					id={`word-${resolvedContentId}-${word.index}`}
					onClick={() => handleWordClick(word)}
					style={{
						borderRadius: 4,
						padding: "1px 2px",
						cursor: placingBookmark ? "crosshair" : "default",
						backgroundColor: isActive ? "rgba(255, 215, 0, 0.55)" : "transparent",
						boxShadow: isBookmarked ? "inset 0 -3px 0 0 #4A90D9" : "none",
					}}
				>
					{content}
				</span>{" "}
			</span>
		);
	}

	function blockStyle(tag) {
		const base = {
			margin: "0 0 1em 0",
			fontFamily: FONT_FAMILY_MAP[settings.font] ?? FONT_FAMILY_MAP.lexend,
			lineHeight: settings.lineHeight,
			letterSpacing: `${settings.letterSpacing}em`,
			wordSpacing: `${settings.letterSpacing + 0.05}em`,
			textAlign: "left",
			maxWidth: "65ch",
		};
		if (tag === "h1") return {...base, fontSize: `${settings.fontSize * 1.6}px`, fontWeight: 700};
		if (tag === "h2") return {...base, fontSize: `${settings.fontSize * 1.3}px`, fontWeight: 700};
		if (tag === "h3") return {...base, fontSize: `${settings.fontSize * 1.15}px`, fontWeight: 600};
		return {...base, fontSize: `${settings.fontSize}px`};
	}

	const passage = (
		<div
			style={{
				backgroundColor: theme.bg,
				color: theme.text,
				borderRadius: 12,
				padding: "1.5rem",
				transition: "background-color 0.2s, color 0.2s",
				maxHeight: "calc(100vh - 350px)",
				overflowY: "auto",
				WebkitOverflowScrolling: "touch",
			}}
		>
			{blocks.map((block, i) => {
				const Tag = HEADING_TAGS[block.tag] ?? "p";
				return (
					<Tag key={i} style={blockStyle(block.tag)}>
						{block.words.map(renderWord)}
					</Tag>
				);
			})}
		</div>
	);

	return (
		<div>
			{hydrated && bookmark && (
				<div
					style={{
						marginBottom: 12,
						padding: "10px 14px",
						borderRadius: 8,
						background: "rgba(74, 144, 217, 0.12)",
						border: "1px solid rgba(74, 144, 217, 0.4)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
						flexWrap: "wrap",
					}}
				>
					<span style={{fontSize: 14}}>
						{"\u{1F516}"} You stopped near: &ldquo;&hellip;{bookmark.snippet}&hellip;&rdquo;
					</span>
					<span style={{display: "flex", gap: 8}}>
						<button type="button" onClick={scrollToBookmark}>
							Resume here
						</button>
						<button type="button" onClick={clearBookmark}>
							Clear
						</button>
					</span>
				</div>
			)}

			{placingBookmark && <div style={{marginBottom: 12, fontSize: 14, fontStyle: "italic"}}>Tap or click the word where you stopped reading&hellip;</div>}
			<div style={{display: "flex", gap: 8, marginTop: 12, marginBottom: 12}}>
				<button type="button" onClick={handleReadAloudClick}>
					{isPlaying ? "Stop" : "Read aloud"}
				</button>
				<button type="button" onClick={() => setPlacingBookmark((p) => !p)}>
					{placingBookmark ? "Cancel" : "\u{1F516} Set bookmark"}
				</button>
			</div>
			{settings.ruler ? <ReadingRuler>{passage}</ReadingRuler> : passage}
		</div>
	);
}
