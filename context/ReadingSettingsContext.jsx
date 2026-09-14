"use client";

import {createContext, useContext, useEffect, useState} from "react";

// Central place for every reading preference. Add new toggles here as you
// build more features (e.g. syllable highlighting, reading ruler).
const DEFAULT_SETTINGS = {
	font: "lexend",
	fontSize: 20,
	lineHeight: 1.8,
	letterSpacing: 0.05,
	theme: "cream",
	bionic: false,
	ttsRate: 0.9,
	ruler: false,
	syllables: false,
};

export const THEMES = {
	cream: {bg: "#FAF3E0", text: "#333333", label: "Cream"},
	softblue: {bg: "#E8F1F8", text: "#25313A", label: "Soft blue"},
	paleyellow: {bg: "#FBF7D8", text: "#332F16", label: "Pale yellow"},
	grey: {bg: "#EDEDEB", text: "#2A2A28", label: "Soft grey"},
	dark: {bg: "#1E1E1E", text: "#F0F0F0", label: "Dark mode"},
};

// Keys must match FONT_FAMILY_MAP in lib/fonts.js.
export const FONT_OPTIONS = [
	{value: "lexend", label: "Lexend"},
	{value: "atkinson", label: "Atkinson Hyperlegible"},
	{value: "opendyslexic", label: "OpenDyslexic"},
	{value: "verdana", label: "Verdana"},
];

const ReadingSettingsContext = createContext(null);
const STORAGE_KEY = "reading-settings";

export function ReadingSettingsProvider({children}) {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [hydrated, setHydrated] = useState(false);

	// Load saved preferences once, on the client, after mount.
	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY);
			if (saved) setSettings({...DEFAULT_SETTINGS, ...JSON.parse(saved)});
		} catch (err) {
			console.error("Could not load reading settings:", err);
		} finally {
			setHydrated(true);
		}
	}, []);

	// Persist on every change, once hydrated.
	useEffect(() => {
		if (!hydrated) return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch (err) {
			console.error("Could not save reading settings:", err);
		}
	}, [settings, hydrated]);

	function updateSetting(key, value) {
		setSettings((prev) => ({...prev, [key]: value}));
	}

	function resetSettings() {
		setSettings(DEFAULT_SETTINGS);
	}

	return <ReadingSettingsContext.Provider value={{settings, updateSetting, resetSettings, hydrated}}>{children}</ReadingSettingsContext.Provider>;
}

export function useReadingSettings() {
	const ctx = useContext(ReadingSettingsContext);
	if (!ctx) {
		throw new Error("useReadingSettings must be used inside a ReadingSettingsProvider");
	}
	return ctx;
}
