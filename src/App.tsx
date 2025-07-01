
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Directorio from "./pages/Directorio";
import IngredienteDetalle from "./pages/IngredienteDetalle";
import SobreNosotros from "./pages/SobreNosotros";
import Contacto from "./pages/Contacto";
import Categorias from "./pages/Categorias";
import Privacidad from "./pages/Privacidad";
import Cookies from "./pages/Cookies";
import Terminos from "./pages/Terminos";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen">
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/directorio" element={<Directorio />} />
              <Route path="/ingrediente/:id" element={<IngredienteDetalle />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/sobre-nosotros" element={<SobreNosotros />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
