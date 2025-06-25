
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const Terminos = () => {
  const seoData = {
    title: "Términos de Uso | IngredientsIndex.pro",
    description: "Términos y condiciones de uso de IngredientsIndex.pro. Conoce las normas para utilizar nuestro directorio de ingredientes profesional.",
    keywords: "términos uso, condiciones, normas, directorio ingredientes",
    canonical: "https://ingredientsindex.pro/terminos"
  };

  const breadcrumbItems = [
    { name: "Términos de Uso", url: "/terminos", current: true }
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
              Términos de Uso
            </h1>
            
            <p className="text-muted-foreground mb-8">
              <strong>Última actualización:</strong> Diciembre 2024
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar IngredientsIndex.pro (el "Servicio"), aceptas estar sujeto a estos 
                  Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes 
                  utilizar nuestro servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descripción del Servicio</h2>
                <p className="mb-4">
                  IngredientsIndex.pro es un directorio profesional de ingredientes culinarios que proporciona:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Información detallada sobre ingredientes, incluyendo precios, mermas y rendimientos</li>
                  <li>Acceso gratuito limitado a 20 páginas de ingredientes</li>
                  <li>Registro gratuito para acceso ilimitado</li>
                  <li>Herramientas de búsqueda y filtrado</li>
                  <li>Contenido multiidioma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Registro y Cuentas de Usuario</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Elegibilidad</h3>
                    <p>
                      Debes tener al menos 16 años para crear una cuenta. Al registrarte, declaras que 
                      cumples con este requisito.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Responsabilidad de la Cuenta</h3>
                    <p>
                      Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, 
                      y de todas las actividades que ocurran bajo tu cuenta.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Información Precisa</h3>
                    <p>
                      Te comprometes a proporcionar información precisa, actual y completa durante 
                      el proceso de registro.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Uso Aceptable</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Usos Permitidos</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Consultar información sobre ingredientes para uso profesional o educativo</li>
                      <li>Guardar ingredientes como favoritos</li>
                      <li>Compartir enlaces a páginas específicas de ingredientes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Usos Prohibidos</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Realizar ingeniería inversa, descompilar o desensamblar el servicio</li>
                      <li>Extraer datos masivamente mediante web scraping o bots automatizados</li>
                      <li>Intentar acceder a áreas restringidas o cuentas de otros usuarios</li>
                      <li>Transmitir virus, malware o código malicioso</li>
                      <li>Usar el servicio para actividades ilegales o no autorizadas</li>
                      <li>Revender o redistribuir el contenido sin autorización</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propiedad Intelectual</h2>
                <div className="space-y-4">
                  <p>
                    <strong>Contenido del Servicio:</strong> Todo el contenido, incluyendo texto, imágenes, 
                    logotipos, y software, es propiedad de IngredientsIndex.pro o sus licenciantes y está 
                    protegido por derechos de autor y otras leyes de propiedad intelectual.
                  </p>
                  
                  <p>
                    <strong>Licencia de Uso:</strong> Te otorgamos una licencia limitada, no exclusiva, 
                    no transferible para acceder y utilizar el servicio únicamente para fines permitidos.
                  </p>
                  
                  <p>
                    <strong>Marcas Registradas:</strong> IngredientsIndex.pro y logos relacionados son 
                    marcas registradas y no pueden ser utilizadas sin permiso previo por escrito.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitación de Responsabilidad</h2>
                <div className="space-y-4">
                  <p>
                    <strong>Precisión de la Información:</strong> Aunque nos esforzamos por mantener 
                    información precisa y actualizada, no garantizamos la exactitud, completitud o 
                    actualidad de toda la información del servicio.
                  </p>
                  
                  <p>
                    <strong>Uso Profesional:</strong> La información proporcionada es para fines informativos 
                    y educativos. Para decisiones comerciales críticas, recomendamos verificar la información 
                    con fuentes adicionales.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Descargo de Responsabilidad:</strong> En ningún caso seremos responsables de 
                      daños directos, indirectos, incidentales, especiales o consecuentes que resulten del 
                      uso o la imposibilidad de usar el servicio.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modificaciones del Servicio</h2>
                <p>
                  Nos reservamos el derecho de modificar, suspender o interrumpir cualquier parte del 
                  servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante 
                  ti o terceros por cualquier modificación, suspensión o interrupción del servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Terminación</h2>
                <div className="space-y-4">
                  <p>
                    <strong>Por tu parte:</strong> Puedes terminar tu cuenta en cualquier momento 
                    contactándonos o eliminando tu cuenta desde la configuración.
                  </p>
                  
                  <p>
                    <strong>Por nuestra parte:</strong> Podemos suspender o terminar tu acceso si 
                    violas estos términos o por otras razones legítimas, con o sin previo aviso.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Ley Aplicable</h2>
                <p>
                  Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá 
                  en los tribunales competentes de España.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cambios en los Términos</h2>
                <p>
                  Podemos actualizar estos términos ocasionalmente. Los cambios importantes se 
                  notificarán por email o mediante aviso en el servicio. El uso continuado del 
                  servicio después de los cambios constituye tu aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contacto</h2>
                <p>
                  Si tienes preguntas sobre estos términos, contáctanos:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p><strong>Email:</strong> john@chefbusiness.co</p>
                  <p><strong>Asunto:</strong> Consulta sobre términos de uso</p>
                  <p><strong>Responsable:</strong> Chef John Guerrero</p>
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

export default Terminos;
