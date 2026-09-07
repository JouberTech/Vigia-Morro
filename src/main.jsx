import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MonitoringProvider } from "./context/MonitoringContext";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MonitoringProvider>
        <App />
      </MonitoringProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
