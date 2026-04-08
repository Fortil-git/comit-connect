import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeDataProvider } from "@/contexts/ThemeDataContext";
import Login from "./pages/Login";
import AdminPanel from "./pages/admin/AdminPanel";
import Dashboard from "./pages/Dashboard";
import ThemeRouter from "./pages/ThemeRouter";
import SubThemeDetail from "./pages/SubThemeDetail";
import AutresSujets from "./pages/AutresSujets";
import HistoriqueComites from "./pages/HistoriqueComites";
import ComitesFuturs from "./pages/ComitesFuturs";
import ExportPDF from "./pages/ExportPDF";
import Invitations from "./pages/Invitations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
      <ThemeDataProvider>
      <SidebarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/theme/:themeId" element={<ThemeRouter />} />
            <Route path="/theme/:themeId/subtheme/:subThemeId" element={<SubThemeDetail />} />
            <Route path="/autres-sujets" element={<AutresSujets />} />
            <Route path="/historique-comites" element={<HistoriqueComites />} />
            <Route path="/comites-futurs" element={<ComitesFuturs />} />
            <Route path="/export-pdf" element={<ExportPDF />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </SidebarProvider>
      </ThemeDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
