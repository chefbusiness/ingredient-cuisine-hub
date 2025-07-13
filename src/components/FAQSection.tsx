
import { ChevronDown } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "¿Cómo se calculan los porcentajes de merma y rendimiento?",
      answer: "Los porcentajes de merma y rendimiento se basan en datos recopilados de cocinas profesionales y estudios gastronómicos. La merma representa la pérdida de peso durante la preparación, mientras que el rendimiento indica el aprovechamiento útil del ingrediente."
    },
    {
      question: "¿Con qué frecuencia se actualizan los precios?",
      answer: "Los precios se actualizan diariamente mediante nuestro sistema automatizado que consulta múltiples fuentes de mercados mayoristas y distribuidores especializados en cada país."
    },
    {
      question: "¿Puedo acceder a información de precios de otros países?",
      answer: "Sí, nuestro directorio incluye información de precios de múltiples países. Puedes filtrar por país específico para ver precios locales en la moneda correspondiente."
    },
    {
      question: "¿Qué significa el índice de popularidad?",
      answer: "El índice de popularidad indica qué tan frecuentemente se consulta un ingrediente en nuestra plataforma, basado en las visitas de chefs profesionales y estudiantes de gastronomía."
    },
    {
      question: "¿Cómo puedo usar la información de temporadas?",
      answer: "La información de temporadas te ayuda a planificar menús y compras aprovechando cuando los ingredientes están en su mejor momento de calidad y precio más favorable."
    },
    {
      question: "¿Hay límite en el número de ingredientes que puedo consultar?",
      answer: "Los usuarios pueden consultar hasta 5 ingredientes de forma gratuita. Después de eso, pueden registrarse gratuitamente para acceso ilimitado a todo el directorio."
    }
  ];

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Preguntas Frecuentes
          </h3>
          <p className="text-sm text-muted-foreground">
            Respuestas a las consultas más comunes sobre nuestro directorio
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
