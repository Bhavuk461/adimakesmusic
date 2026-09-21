import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Fonts ship with the site instead of loading from Google, so blockers
// (Brave Shields, privacy extensions, restricted networks) can't swap the
// headline into a fallback face. Only the weights the design uses.
import "@fontsource/anton/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
