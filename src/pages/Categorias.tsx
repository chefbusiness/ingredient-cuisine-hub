
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import AIChefBot from "@/components/AIChefBot";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Categorias = () => {
  const { data: categories, isLoading } = useCategories();

  const seoData = {
    title: "Categorías de Ingredientes - Explora por Tipo | IngredientsIndex.pro",
    description: "Explora todas las categorías de ingredientes disponibles: verduras, carnes, pescados, lácteos, especias y más. Encuentra fácilmente lo que buscas.",
    keywords: "categorías ingredientes, verduras, carnes, pescados, lácteos, especias, cocina profesional",
    canonical: "https://ingredientsindex.pro/categorias"
  };

  const breadcrumbItems = [
    { name: "Categorías", url: "/categorias", current: true }
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
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Categorías de Ingredientes
            </h1>
            <p className="text-xl text-muted-foreground">
              Explora todos los ingredientes organizados por categorías
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/directorio?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.name_en}
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    Ver ingredientes →
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && (!categories || categories.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No se encontraron categorías disponibles.
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-16 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg p-8 border">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                ¿No encuentras lo que buscas?
              </h2>
              <p className="text-muted-foreground mb-6">
                También puedes usar nuestro buscador avanzado o contactarnos para sugerir nuevas categorías
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/directorio"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ir al Directorio
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center px-6 py-3 bg-white border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Contactar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <AIChefBot />
    </div>
  );
};

export default Categorias;
