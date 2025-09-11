import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ Mount App into #root div from index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
