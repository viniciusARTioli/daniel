"use client";

import ReadingPane from "../components/ReadingPane";
import SettingsPanel from "../components/SettingsPanel";
import StoryPicker from "../components/StoryPicker";
import {useSelectedStory} from "../hooks/useSelectedStory";
import {STORIES} from "../content/stories";

export default function HomePage() {
	const {story, selectStory, hydrated} = useSelectedStory(STORIES);

	return (
		<main
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: 24,
				maxWidth: 960,
				margin: "0 auto",
				padding: "2rem 1rem",
			}}
		>
			<aside style={{flex: 1, minWidth: 960}}>
				<SettingsPanel />
			</aside>
			<section style={{flex: 2, minWidth: 960}}>
				<StoryPicker stories={STORIES} selectedId={story.id} onSelect={selectStory} />
				{/* key remounts the pane per story, so scroll position, "set bookmark"
				    mode and any read-aloud in progress reset cleanly on switch. */}
				{hydrated && <ReadingPane key={story.id} html={story.html} contentId={story.id} />}
			</section>
		</main>
	);
}
