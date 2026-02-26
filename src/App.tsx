import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./contexts/AppContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Projects from "./pages/Projects";
import Finance from "./pages/Finance";
import Pricing from "./pages/Pricing";
import CalendarPage from "./pages/Calendar";
import Inventory from "./pages/Inventory";
import Notes from "./pages/Notes";
import NoteEditor from "./pages/NoteEditor";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
              <Route path="/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/tarefas" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/notas" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
              <Route path="/notas/:id" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
              <Route path="/projetos" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/financas" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/inventario" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/precificacao" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path="/documentos" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;