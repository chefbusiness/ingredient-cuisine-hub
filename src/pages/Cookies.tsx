
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const Cookies = () => {
  const seoData = {
    title: "Política de Cookies | IngredientsIndex.pro",
    description: "Información sobre cómo utilizamos las cookies en IngredientsIndex.pro para mejorar tu experiencia de navegación.",
    keywords: "política cookies, navegación web, cookies técnicas, analytics",
    canonical: "https://ingredientsindex.pro/cookies"
  };

  const breadcrumbItems = [
    { name: "Política de Cookies", url: "/cookies", current: true }
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
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Política de Cookies
            </h1>
            
            <p className="text-muted-foreground mb-8">
              <strong>Última actualización:</strong> Diciembre 2024
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">¿Qué son las cookies?</h2>
                <p>
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas 
                  un sitio web. Nos ayudan a recordar tus preferencias y mejorar tu experiencia de navegación.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Tipos de cookies que utilizamos</h2>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-lg font-medium text-foreground mb-2">Cookies Estrictamente Necesarias</h3>
                    <p className="mb-2">
                      <strong>Propósito:</strong> Esenciales para el funcionamiento básico del sitio web.
                    </p>
                    <p className="mb-2">
                      <strong>Ejemplos:</strong> Autenticación, seguridad, preferencias de idioma.
                    </p>
                    <p className="text-sm">
                      <strong>Nota:</strong> Estas cookies no se pueden desactivar sin afectar la funcionalidad del sitio.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-medium text-foreground mb-2">Cookies de Preferencias</h3>
                    <p className="mb-2">
                      <strong>Propósito:</strong> Recordar tus configuraciones y preferencias.
                    </p>
                    <p className="mb-2">
                      <strong>Ejemplos:</strong> Idioma seleccionado, moneda preferida, ingredientes favoritos.
                    </p>
                    <p className="text-sm">
                      <strong>Duración:</strong> Hasta 1 año o hasta que las elimines manualmente.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="text-lg font-medium text-foreground mb-2">Cookies de Análisis</h3>
                    <p className="mb-2">
                      <strong>Propósito:</strong> Entender cómo interactúas con nuestro sitio para mejorarlo.
                    </p>
                    <p className="mb-2">
                      <strong>Información recopilada:</strong> Páginas visitadas, tiempo de permanencia, errores encontrados.
                    </p>
                    <p className="text-sm">
                      <strong>Anonimización:</strong> Todos los datos se procesan de forma anónima.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies de terceros</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Supabase (Proveedor de base de datos)</h3>
                    <p>
                      <strong>Propósito:</strong> Autenticación y gestión de sesiones de usuario.
                    </p>
                    <p>
                      <strong>Más información:</strong> 
                      <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                        Política de privacidad de Supabase
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Gestión de cookies</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Configuración del navegador</h3>
                    <p className="mb-2">
                      Puedes controlar y/o eliminar las cookies según desees. Consulta la ayuda de tu navegador:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                      <li><a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Internet Explorer</a></li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">⚠️ Importante</h4>
                    <p className="text-sm">
                      Si deshabilitas todas las cookies, algunas funcionalidades del sitio podrían no funcionar 
                      correctamente, como recordar tus preferencias de idioma o mantener tu sesión iniciada.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Consentimiento</h2>
                <p className="mb-4">
                  Al continuar navegando en nuestro sitio web, aceptas el uso de cookies según se describe 
                  en esta política. Puedes cambiar tus preferencias en cualquier momento.
                </p>
                <p>
                  Para las cookies no esenciales, solicitaremos tu consentimiento explícito cuando sea requerido.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Actualizaciones</h2>
                <p>
                  Esta política de cookies puede actualizarse ocasionalmente para reflejar cambios en 
                  nuestras prácticas o por otros motivos operativos, legales o reglamentarios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contacto</h2>
                <p>
                  Si tienes preguntas sobre nuestro uso de cookies, contáctanos:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p><strong>Email:</strong> john@chefbusiness.co</p>
                  <p><strong>Asunto:</strong> Consulta sobre cookies</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cookies;
