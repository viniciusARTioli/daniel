import { ReadingSettingsProvider } from "../context/ReadingSettingsContext";
import "../styles/globals.css";

export const metadata = {
  title: "Reading helper",
  description: "A reading practice app for dyslexic readers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReadingSettingsProvider>{children}</ReadingSettingsProvider>
      </body>
    </html>
  );
}
