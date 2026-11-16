"use client";

import {useCallback, useEffect, useState} from "react";

const STORAGE_KEY = "selected-story";

// Tracks which story is open and remembers it between visits.
// `hydrated` is false until the saved choice has been read, so the page can
// avoid flashing the first story before switching to the remembered one.
export function useSelectedStory(stories) {
	const [storyId, setStoryId] = useState(stories[0].id);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY);
			if (saved && stories.some((s) => s.id === saved)) setStoryId(saved);
		} catch (err) {
			console.error("Could not load selected story:", err);
		} finally {
			setHydrated(true);
		}
	}, [stories]);

	const selectStory = useCallback((id) => {
		setStoryId(id);
		try {
			window.localStorage.setItem(STORAGE_KEY, id);
		} catch (err) {
			console.error("Could not save selected story:", err);
		}
	}, []);

	const story = stories.find((s) => s.id === storyId) ?? stories[0];
	return {story, selectStory, hydrated};
}
