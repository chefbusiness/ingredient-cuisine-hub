import { ChefHat, Utensils, TrendingUp, Zap, Instagram, Youtube, Facebook, X } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-primary rounded">
                <ChefHat className="h-3 w-3 text-primary-foreground" />
              </div>
              <h4 className="text-sm font-medium text-foreground">Directorio de Ingredientes</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              La herramienta profesional para chefs y profesionales de la hostelería.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Idea original del{" "}
              <a 
                href="https://www.instagram.com/johnguerrero_es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Instagram className="h-3 w-3" />
                Chef John Guerrero
              </a>
            </p>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Síguenos en redes:</p>
              <div className="flex items-center gap-3">
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="X (Twitter)"
                >
                  <X className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                  title="TikTok"
                >
                  🎵
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-3 text-foreground">Navegación</h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/directorio" className="hover:text-foreground transition-colors">Directorio</Link></li>
              <li><Link to="/categorias" className="hover:text-foreground transition-colors">Categorías</Link></li>
              <li><Link to="/sobre-nosotros" className="hover:text-foreground transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-foreground transition-colors">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-3 text-foreground">Legal</h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><Link to="/privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground transition-colors">Política de Cookies</Link></li>
              <li><Link to="/terminos" className="hover:text-foreground transition-colors">Términos de Uso</Link></li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                ¿Preguntas o sugerencias?<br />
                <a 
                  href="mailto:john@chefbusiness.co" 
                  className="text-primary hover:underline"
                >
                  john@chefbusiness.co
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-3 text-foreground">Nuestros Aliados</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://aichef.pro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Zap className="h-3 w-3 mt-0.5 text-primary group-hover:text-foreground transition-colors" />
                  <div>
                    <div className="font-medium">AI Chef Pro</div>
                    <div className="leading-tight">Suite de Apps con IA para Chefs</div>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href="https://chefbusiness.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Utensils className="h-3 w-3 mt-0.5 text-primary group-hover:text-foreground transition-colors" />
                  <div>
                    <div className="font-medium">Chefbusiness</div>
                    <div className="leading-tight">Consultoría Gastronómica</div>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href="https://gastroseo.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <TrendingUp className="h-3 w-3 mt-0.5 text-primary group-hover:text-foreground transition-colors" />
                  <div>
                    <div className="font-medium">GastroSEO</div>
                    <div className="leading-tight">SEO para Restaurantes</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Directorio de Ingredientes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
