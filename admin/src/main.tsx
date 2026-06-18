import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TRPCProvider } from "@/providers/trpc";
import { LanguageProvider } from "@/providers/LanguageProvider";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TRPCProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </TRPCProvider>
  </StrictMode>,
);
