import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
console.log("Index.jsx executing - mounting React app");
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root mount element not found');
}
