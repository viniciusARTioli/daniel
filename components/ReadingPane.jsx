"use client";

import {useMemo} from "react";
import {useReadingSettings, THEMES} from "../context/ReadingSettingsContext";
import {useTextToSpeech} from "../hooks/useTextToSpeech";
import {splitSyllables} from "../lib/syllables";
import {parseContent} from "../lib/parseContent";
import {FONT_FAMILY_MAP} from "../lib/fonts";
import ReadingRuler from "./ReadingRuler";

const HEADING_TAGS = {h1: "h1", h2: "h2", h3: "h3"};

// Renders reading content (headings + paragraphs + bold/italic text) with
// all dyslexia-friendly settings applied, plus text-to-speech with
// word-by-word highlighting.
//
// `html` accepts a small fixed tag set only: h1, h2, h3, p, strong, em.
// See lib/parseContent.js for why (no DOMParser, so it stays safe to run
// during server-side prerendering / static builds).
//
// Usage: <ReadingPane html="<h1>Title</h1><p>Some passage...</p>" />
export default function ReadingPane({html}) {
	const {settings} = useReadingSettings();
	const {speak, stop, isPlaying, activeWordIndex} = useTextToSpeech({
		rate: settings.ttsRate,
	});

	const {blocks, plainText} = useMemo(() => parseContent(html), [html]);
	const theme = THEMES[settings.theme] ?? THEMES.cream;

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
		let content = renderWordText(word);

		if (word.strong) content = <strong>{content}</strong>;
		if (word.em) content = <em>{content}</em>;

		return (
			<span key={word.index}>
				<span
					style={{
						borderRadius: 4,
						padding: "1px 2px",
						backgroundColor: isActive ? "rgba(255, 215, 0, 0.55)" : "transparent",
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
			{settings.ruler ? <ReadingRuler>{passage}</ReadingRuler> : passage}

			<button type="button" onClick={() => (isPlaying ? stop() : speak(plainText))} style={{marginTop: 12}}>
				{isPlaying ? "Stop" : "Read aloud"}
			</button>
		</div>
	);
}
