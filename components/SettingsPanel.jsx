"use client";

import {useReadingSettings, THEMES, FONT_OPTIONS} from "../context/ReadingSettingsContext";

// Lets the user tune every reading preference. Drop this next to
// <ReadingPane /> on any page, or put it in a persistent sidebar/settings
// screen - it reads/writes the same shared context either way.
export default function SettingsPanel() {
	const {settings, updateSetting, resetSettings} = useReadingSettings();

	return (
		<div style={{display: "flex", flexWrap: "wrap", flexDirection: "row", gap: 16}}>
			<div>
				<label htmlFor="font-select">Font</label>
				<select id="font-select" value={settings.font} onChange={(e) => updateSetting("font", e.target.value)}>
					{FONT_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>

			<div>
				<label htmlFor="size-range">Font size: {settings.fontSize}px</label>
				<input id="size-range" type="range" min={16} max={32} step={1} value={settings.fontSize} onChange={(e) => updateSetting("fontSize", Number(e.target.value))} />
			</div>

			<div>
				<label htmlFor="lh-range">Line spacing: {settings.lineHeight}</label>
				<input
					id="lh-range"
					type="range"
					min={1.3}
					max={2.4}
					step={0.1}
					value={settings.lineHeight}
					onChange={(e) => updateSetting("lineHeight", Number(e.target.value))}
				/>
			</div>

			<div>
				<label htmlFor="ls-range">Letter spacing: {settings.letterSpacing}em</label>
				<input
					id="ls-range"
					type="range"
					min={0}
					max={0.2}
					step={0.01}
					value={settings.letterSpacing}
					onChange={(e) => updateSetting("letterSpacing", Number(e.target.value))}
				/>
			</div>

			<div>
				<label htmlFor="theme-select">Color theme</label>
				<select id="theme-select" value={settings.theme} onChange={(e) => updateSetting("theme", e.target.value)}>
					{Object.entries(THEMES).map(([key, theme]) => (
						<option key={key} value={key}>
							{theme.label}
						</option>
					))}
				</select>
			</div>

			<label style={{display: "flex", alignItems: "center", gap: 8}}>
				<input type="checkbox" checked={settings.bionic} onChange={(e) => updateSetting("bionic", e.target.checked)} />
				Bionic reading (bold word starts)
			</label>

			<label style={{display: "flex", alignItems: "center", gap: 8}}>
				<input type="checkbox" checked={settings.ruler} onChange={(e) => updateSetting("ruler", e.target.checked)} />
				Reading ruler (dims everything but the current line)
			</label>

			<label style={{display: "flex", alignItems: "center", gap: 8}}>
				<input type="checkbox" checked={settings.syllables} onChange={(e) => updateSetting("syllables", e.target.checked)} />
				Show syllable breaks
			</label>

			<button type="button" onClick={resetSettings}>
				Reset to defaults
			</button>
		</div>
	);
}
