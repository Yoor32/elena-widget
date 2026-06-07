import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const mount = document.getElementById("elena-widget-root") || (() => {
  const d = document.createElement("div");
  d.id = "elena-widget-root";
  document.body.appendChild(d);
  return d;
})();

createRoot(mount).render(<App />);
