
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ChefHat, Users, Target, Heart } from "lucide-react";

const SobreNosotros = () => {
  const seoData = {
    title: "Sobre Nosotros - Chef John Guerrero y el Equipo | IngredientsIndex.pro",
    description: "Conoce al Chef John Guerrero y el equipo apasionado detrás de IngredientsIndex.pro. Desarrollamos herramientas profesionales para chefs y restaurantes con tecnología de vanguardia.",
    keywords: "Chef John Guerrero, equipo culinario, ChefBusiness, GastroSEO, AIChef.pro, herramientas para chefs",
    canonical: "https://ingredientsindex.pro/sobre-nosotros"
  };

  const breadcrumbItems = [
    { name: "Sobre Nosotros", url: "/sobre-nosotros", current: true }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead seoData={seoData} />
      
      <UnifiedHeader />
      
      {/* Breadcrumbs */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-muted-foreground">
              Conoce al equipo apasionado detrás de IngredientsIndex.pro
            </p>
          </div>

          {/* Chef John Guerrero Section */}
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary rounded-lg mr-4">
                  <ChefHat className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Chef John Guerrero</h2>
                  <p className="text-muted-foreground">Fundador y Visionario</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Detrás de este proyecto está el <strong>Chef John Guerrero</strong>, un profesional apasionado 
                por la cocina y la innovación tecnológica. Con años de experiencia en el sector gastronómico, 
                John identificó la necesidad de crear herramientas digitales que realmente sirvan a los 
                profesionales de la cocina.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Su visión es simple pero poderosa: desarrollar con tecnología de vanguardia las mejores 
                herramientas y funcionalidades para los profesionales de la cocina y los restaurantes, 
                combinando la pasión culinaria con la innovación digital.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-600 rounded-lg mr-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Nuestro Equipo</h2>
                  <p className="text-muted-foreground">Humano, Apasionado y Especializado</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Somos un equipo humano apasionado por la cocina y comprometido con desarrollar soluciones 
                tecnológicas que marquen la diferencia. Cada miembro del equipo aporta su experiencia única, 
                desde la gastronomía profesional hasta el desarrollo de software, para crear herramientas 
                que realmente entiendan y resuelvan los desafíos diarios de los profesionales culinarios.
              </p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-600 rounded-lg mr-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Nuestra Misión</h2>
                  <p className="text-muted-foreground">Innovación al Servicio de la Gastronomía</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Creemos que la tecnología debe estar al servicio de la creatividad culinaria, no al revés. 
                Por eso desarrollamos herramientas intuitivas, precisas y útiles que permiten a los chefs, 
                estudiantes de cocina y profesionales de la hostelería acceder a información confiable y 
                actualizada sobre ingredientes, precios, técnicas y tendencias gastronómicas.
              </p>
            </div>
          </div>

          {/* Ecosystem */}
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-600 rounded-lg mr-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Nuestro Ecosistema</h2>
                  <p className="text-muted-foreground">Soluciones Integrales para la Industria</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">ChefBusiness</h3>
                  <p className="text-muted-foreground">
                    Consultoría gastronómica especializada que ayuda a restaurantes y profesionales 
                    a optimizar sus operaciones y maximizar su rentabilidad.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">GastroSEO</h3>
                  <p className="text-muted-foreground">
                    Servicios de SEO y marketing digital específicamente diseñados para restaurantes 
                    y negocios gastronómicos, ayudándoles a destacar en el mundo digital.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">AIChef.pro</h3>
                  <p className="text-muted-foreground">
                    Suite de aplicaciones con inteligencia artificial para chefs, incluyendo 
                    herramientas para la creación de recetas, gestión de inventarios y análisis 
                    de costos con tecnología de vanguardia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-lg p-8 border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                ¿Quieres saber más?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Estamos siempre abiertos a escuchar nuevas ideas y colaboraciones
              </p>
              <a 
                href="/contacto"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SobreNosotros;
