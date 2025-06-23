
import { Ingredient } from '@/hooks/useIngredients';

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Directorio de Ingredientes de Cocina y Hostelería",
  "url": window.location.origin,
  "logo": `${window.location.origin}/favicon.ico`,
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
  "name": "Directorio de Ingredientes",
  "url": window.location.origin,
  "description": "Directorio profesional de ingredientes culinarios",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${window.location.origin}/directorio?search={search_term_string}`,
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
    "name": "Directorio de Ingredientes"
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
  })
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
  "name": "Directorio de Ingredientes de Cocina y Hostelería",
  "description": "Recurso profesional para chefs y profesionales de la hostelería",
  "url": window.location.origin,
  "servesCuisine": ["International", "Professional Cooking"],
  "priceRange": "Free"
});
