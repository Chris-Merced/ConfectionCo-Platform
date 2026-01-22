import { createRoot } from "react-dom/client";
import "./styles.css";
import type { ReactElement } from "react";

function App(): ReactElement{
  return <h1>ConfectionCo</h1>;
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);