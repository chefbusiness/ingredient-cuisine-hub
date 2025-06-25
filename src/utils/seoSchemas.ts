
import { Ingredient } from '@/hooks/useIngredients';

const BASE_URL = 'https://ingredientsindex.pro';

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "IngredientsIndex.pro - Directorio de Ingredientes de Cocina y Hostelería",
  "url": BASE_URL,
  "logo": `${BASE_URL}/favicon.ico`,
  "description": "Directorio profesional de ingredientes culinarios con información detallada sobre precios, mermas, rendimientos y usos para chefs y profesionales de la hostelería",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English", "French", "Italian", "Portuguese", "Chinese"]
  }
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "IngredientsIndex.pro",
  "url": BASE_URL,
  "description": "Directorio profesional de ingredientes culinarios",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${BASE_URL}/directorio?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

export const generateIngredientSchema = (ingredient: Ingredient) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": ingredient.name,
  "description": ingredient.description,
  "image": ingredient.real_image_url || ingredient.image_url,
  "category": ingredient.categories?.name || "Ingrediente Culinario",
  "brand": {
    "@type": "Brand",
    "name": "IngredientsIndex.pro"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Popularidad",
      "value": `${ingredient.popularity}%`
    },
    {
      "@type": "PropertyValue", 
      "name": "Rendimiento",
      "value": `${ingredient.rendimiento}%`
    },
    {
      "@type": "PropertyValue",
      "name": "Merma",
      "value": `${ingredient.merma}%`
    }
  ],
  ...(ingredient.temporada && {
    "season": ingredient.temporada
  }),
  ...(ingredient.origen && {
    "countryOfOrigin": ingredient.origen
  }),
  "url": ingredient.slug 
    ? `${BASE_URL}/ingrediente/${ingredient.slug}`
    : `${BASE_URL}/ingrediente/${ingredient.id}`
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateFoodEstablishmentSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "IngredientsIndex.pro - Directorio de Ingredientes de Cocina y Hostelería",
  "description": "Recurso profesional para chefs y profesionales de la hostelería",
  "url": BASE_URL,
  "servesCuisine": ["International", "Professional Cooking"],
  "priceRange": "Free"
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
