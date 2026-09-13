"use client";

import {useMemo} from "react";
import {useReadingSettings, THEMES} from "../context/ReadingSettingsContext";
import {useTextToSpeech} from "../hooks/useTextToSpeech";
import {splitSyllables} from "../lib/syllables";
import ReadingRuler from "./ReadingRuler";

// Renders HTML content with dyslexia-friendly settings applied,
// plus optional text-to-speech with word-by-word highlighting.
// Usage: <ReadingPane text={SAMPLE_TEXT} />
export default function ReadingPane({text}) {
	const {settings} = useReadingSettings();

	const {speak, stop, isPlaying, activeWordIndex} = useTextToSpeech({
		rate: settings.ttsRate,
	});

	const theme = THEMES[settings.theme] ?? THEMES.cream;

	/*
	 * Convert the HTML string into readable blocks.
	 *
	 * Example:
	 * <h1>The Last Song</h1>
	 * <p>Leo stood on the football pitch.</p>
	 *
	 * becomes:
	 * [
	 *   { type: "h1", text: "The Last Song" },
	 *   { type: "p", text: "Leo stood on the football pitch." }
	 * ]
	 */
	const blocks = useMemo(() => {
		if (!text) return [];

		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");

		return Array.from(doc.body.children).map((element) => ({
			type: element.tagName.toLowerCase(),
			text: element.textContent.trim(),
		}));
	}, [text]);

	/*
	 * Create one continuous word index across the whole story.
	 *
	 * This is important for text-to-speech because activeWordIndex
	 * needs to keep counting when moving from one paragraph to another.
	 */
	let wordIndex = 0;

	function renderWord(word, index) {
		let content = word;

		if (settings.syllables) {
			const syllables = splitSyllables(word);

			content = syllables.map((syl, i) => (
				<span key={i}>
					{settings.bionic && i === 0 ? <b style={{fontWeight: 600}}>{syl}</b> : syl}

					{i < syllables.length - 1 && <span style={{opacity: 0.5}}>&middot;</span>}
				</span>
			));
		} else if (settings.bionic) {
			const boldLength = Math.ceil(word.length * 0.5);

			content = (
				<>
					<b style={{fontWeight: 600}}>{word.slice(0, boldLength)}</b>
					{word.slice(boldLength)}
				</>
			);
		}

		const isActive = index === activeWordIndex;

		return (
			<span
				key={index}
				style={{
					borderRadius: 4,
					padding: "1px 2px",
					backgroundColor: isActive ? "rgba(255, 215, 0, 0.55)" : "transparent",
					transition: "background-color 0.1s",
				}}
			>
				{content}
			</span>
		);
	}

	function renderBlock(block) {
		const words = block.text.split(/\s+/);

		const startIndex = wordIndex;

		wordIndex += words.length;

		const renderedWords = words.map((word, i) => {
			return renderWord(word, startIndex + i);
		});

		const commonStyle = {
			margin: 0,
			fontFamily: `'${settings.font}', sans-serif`,
			fontSize: `${settings.fontSize}px`,
			lineHeight: settings.lineHeight,
			letterSpacing: `${settings.letterSpacing}em`,
			wordSpacing: `${settings.letterSpacing + 0.05}em`,
			textAlign: "left",
			maxWidth: "65ch",
		};

		switch (block.type) {
			case "h1":
				return (
					<h1
						key={startIndex}
						style={{
							...commonStyle,
							fontSize: `${settings.fontSize * 1.5}px`,
							lineHeight: 1.2,
							marginBottom: "1.5rem",
						}}
					>
						{renderedWords.map((word, i) => (
							<span key={i}>
								{word}
								{i < renderedWords.length - 1 && " "}
							</span>
						))}
					</h1>
				);

			case "h2":
				return (
					<h2
						key={startIndex}
						style={{
							...commonStyle,
							fontSize: `${settings.fontSize * 1.2}px`,
							lineHeight: 1.3,
							marginTop: "2rem",
							marginBottom: "1.25rem",
						}}
					>
						{renderedWords.map((word, i) => (
							<span key={i}>
								{word}
								{i < renderedWords.length - 1 && " "}
							</span>
						))}
					</h2>
				);

			case "p":
			default:
				return (
					<p
						key={startIndex}
						style={{
							...commonStyle,
							marginBottom: "1.2em",
						}}
					>
						{renderedWords.map((word, i) => (
							<span key={i}>
								{word}
								{i < renderedWords.length - 1 && " "}
							</span>
						))}
					</p>
				);
		}
	}
	const plainText = useMemo(() => {
		if (!text) return "";

		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");

		return doc.body.textContent.trim();
	}, [text]);
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
			{blocks.map((block) => renderBlock(block))}
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
