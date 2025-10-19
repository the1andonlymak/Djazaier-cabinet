import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FaqPage from "./pages/FaqPage";
import RendezVous from "./pages/RendezVous";
import CasCliniques from "./pages/CasCliniques";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/cryptoflow" element={<Index />} />
          <Route path="/cryptoflow/a-propos" element={<About />} />
          <Route path="/cryptoflow/services" element={<Services />} />
          <Route path="/cryptoflow/contact" element={<Contact />} />
          <Route path="/cryptoflow/faq" element={<FaqPage />} />
          <Route path="/cryptoflow/cas-cliniques" element={<CasCliniques />} />
          <Route path="/cas-cliniques" element={<CasCliniques />} />
          <Route path="/cryptoflow/rendez-vous" element={<RendezVous />} />
          {/* Admin portal: protected route at /cryptoflow/login */}
          <Route path="/cryptoflow/login" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
