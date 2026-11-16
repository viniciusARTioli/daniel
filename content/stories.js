import {THE_LAST_SONG} from "./the-last-song";
import {THE_VIDEOGAME_HERO} from "./the-videogame-hero";

// The list of stories shown in the picker.
//
// - `id` must be unique and STABLE: it keys the saved bookmark for that
//   story and remembers which story was last open. Don't change it after
//   he has started reading, or his bookmark for it will be lost.
// - `title` is what shows in the dropdown.
// - `html` is the story text (h1, h2, h3, p, strong, em only).
//
// To add a story: create a file in content/, import it here, add an entry.
export const STORIES = [
	{id: "the-last-song", title: "The Last Song", html: THE_LAST_SONG},
	{id: "the-videogame-hero", title: "Daniel: The Hero Inside the Game", html: THE_VIDEOGAME_HERO},
];
