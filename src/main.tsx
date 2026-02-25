import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SidebarProvider } from "./contexts/SidebarContext.tsx";

createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <App />
  </SidebarProvider>
);