
import { useState } from "react";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import AIChefBot from "@/components/AIChefBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const seoData = {
    title: "Contacto - Ponte en Contacto con Nosotros | IngredientsIndex.pro",
    description: "¿Tienes preguntas o sugerencias? Contáctanos en john@chefbusiness.co o utiliza nuestro formulario de contacto. Estamos aquí para ayudarte.",
    keywords: "contacto, john@chefbusiness.co, soporte, ayuda, sugerencias",
    canonical: "https://ingredientsindex.pro/contacto"
  };

  const breadcrumbItems = [
    { name: "Contacto", url: "/contacto", current: true }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              Contacto
            </h1>
            <p className="text-xl text-muted-foreground">
              ¿Tienes preguntas o sugerencias? Estamos aquí para ayudarte
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Principal</h3>
                    <a 
                      href="mailto:john@chefbusiness.co"
                      className="text-primary hover:underline text-lg"
                    >
                      john@chefbusiness.co
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Para consultas generales, sugerencias y colaboraciones
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tiempo de Respuesta</h3>
                    <p className="text-muted-foreground">
                      Respondemos en menos de 24 horas
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      De lunes a viernes, horario comercial
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ubicación</h3>
                    <p className="text-muted-foreground">
                      España
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Servicio global, enfoque local
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  ¿En qué podemos ayudarte?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Consultas sobre ingredientes específicos</li>
                  <li>• Sugerencias para nuevas funcionalidades</li>
                  <li>• Colaboraciones y partnerships</li>
                  <li>• Problemas técnicos o bugs</li>
                  <li>• Consultoría gastronómica personalizada</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Asunto *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                    placeholder="¿De qué quieres hablar?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                    placeholder="Cuéntanos más detalles..."
                    rows={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <AIChefBot />
    </div>
  );
};

export default Contacto;
