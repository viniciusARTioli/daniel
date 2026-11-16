"use client";

// Dropdown for choosing which story to read.
export default function StoryPicker({stories, selectedId, onSelect}) {
	return (
		<div style={{marginBottom: 12}}>
			<label htmlFor="story-select">Story</label>
			<select id="story-select" value={selectedId} onChange={(e) => onSelect(e.target.value)} style={{maxWidth: "100%"}}>
				{stories.map((story) => (
					<option key={story.id} value={story.id}>
						{story.title}
					</option>
				))}
			</select>
		</div>
	);
}
