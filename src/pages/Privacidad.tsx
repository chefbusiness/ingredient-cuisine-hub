
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";

const Privacidad = () => {
  const seoData = {
    title: "Política de Privacidad | IngredientsIndex.pro",
    description: "Conoce cómo protegemos y gestionamos tu información personal en IngredientsIndex.pro. Transparencia total en el manejo de datos.",
    keywords: "política privacidad, protección datos, GDPR, información personal",
    canonical: "https://ingredientsindex.pro/privacidad"
  };

  const breadcrumbItems = [
    { name: "Política de Privacidad", url: "/privacidad", current: true }
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
              Política de Privacidad
            </h1>
            
            <p className="text-muted-foreground mb-8">
              <strong>Última actualización:</strong> Diciembre 2024
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Información que Recopilamos</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Información Personal</h3>
                    <p>Cuando te registras en nuestro servicio, recopilamos:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Dirección de correo electrónico</li>
                      <li>Preferencias de idioma y moneda</li>
                      <li>Información de perfil opcional</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Información de Uso</h3>
                    <p>Automáticamente recopilamos:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Páginas visitadas y tiempo de navegación</li>
                      <li>Ingredientes consultados y búsquedas realizadas</li>
                      <li>Información técnica del dispositivo y navegador</li>
                      <li>Dirección IP (anonimizada)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cómo Usamos tu Información</h2>
                <ul className="space-y-2">
                  <li><strong>Proporcionar el servicio:</strong> Mostrar información personalizada de ingredientes</li>
                  <li><strong>Mejorar la experiencia:</strong> Personalizar contenido según tus preferencias</li>
                  <li><strong>Comunicación:</strong> Enviar actualizaciones importantes (solo si consientes)</li>
                  <li><strong>Análisis:</strong> Entender cómo se usa la plataforma para mejorarla</li>
                  <li><strong>Seguridad:</strong> Detectar y prevenir uso fraudulento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Compartir Información</h2>
                <p className="mb-4">
                  <strong>No vendemos, alquilamos ni compartimos tu información personal</strong> con terceros, 
                  excepto en los siguientes casos limitados:
                </p>
                <ul className="space-y-2">
                  <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (hosting, analytics)</li>
                  <li><strong>Requisitos legales:</strong> Cuando la ley lo requiera</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos legales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Almacenamiento y Seguridad</h2>
                <div className="space-y-4">
                  <p>
                    <strong>Ubicación:</strong> Tus datos se almacenan en servidores seguros en la Unión Europea.
                  </p>
                  <p>
                    <strong>Seguridad:</strong> Utilizamos cifrado SSL/TLS, autenticación segura y acceso restringido.
                  </p>
                  <p>
                    <strong>Retención:</strong> Mantenemos tus datos mientras tengas una cuenta activa o según requiera la ley.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Tus Derechos (GDPR)</h2>
                <p className="mb-4">Tienes derecho a:</p>
                <ul className="space-y-2">
                  <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
                  <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                  <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
                </ul>
                <p className="mt-4">
                  Para ejercer estos derechos, contáctanos en: 
                  <a href="mailto:john@chefbusiness.co" className="text-primary hover:underline ml-1">
                    john@chefbusiness.co
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies y Tecnologías Similares</h2>
                <p className="mb-4">Utilizamos cookies para:</p>
                <ul className="space-y-2">
                  <li><strong>Esenciales:</strong> Funcionamiento básico de la web</li>
                  <li><strong>Preferencias:</strong> Recordar tu idioma y configuración</li>
                  <li><strong>Analytics:</strong> Entender cómo usas la plataforma (anonimizado)</li>
                </ul>
                <p className="mt-4">
                  Puedes gestionar las cookies desde la configuración de tu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cambios en esta Política</h2>
                <p>
                  Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes 
                  por email y/o mediante un aviso en la plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta política de privacidad, contáctanos:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p><strong>Email:</strong> john@chefbusiness.co</p>
                  <p><strong>Responsable:</strong> Chef John Guerrero</p>
                  <p><strong>Empresa:</strong> IngredientsIndex.pro</p>
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

export default Privacidad;
