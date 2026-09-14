import {ReadingSettingsProvider} from "../context/ReadingSettingsContext";
import {fontVariables} from "../lib/fonts";
import "../styles/globals.css";

export const metadata = {
	title: "Reading helper",
	description: "A reading practice app for dyslexic readers",
};

export default function RootLayout({children}) {
	return (
		<html lang="en" className={fontVariables}>
			<body>
				<ReadingSettingsProvider>{children}</ReadingSettingsProvider>
			</body>
		</html>
	);
}
