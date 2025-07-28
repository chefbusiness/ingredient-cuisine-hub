
import { Ingredient } from '@/hooks/useIngredients';

const BASE_URL = 'https://ingredientsindex.pro';

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "IngredientsIndex.pro - Directorio de Ingredientes de Cocina y Hostelería",
  "url": BASE_URL,
  "logo": `${BASE_URL}/lovable-uploads/84324d50-7dfc-4c95-b2ca-abb45a097a4e.png`,
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

export const generateIngredientSEO = (ingredient: Ingredient) => {
  // Generar título optimizado y único
  const categoryEmoji = getCategoryEmoji(ingredient.categories?.name);
  const seasonInfo = ingredient.temporada ? ` - Temporada ${ingredient.temporada}` : '';
  const popularityBadge = ingredient.popularity > 80 ? ' ⭐ Popular' : '';
  
  const title = `${ingredient.name} ${categoryEmoji}${popularityBadge} | Precio${seasonInfo} | Chef Profesional`;
  
  // Generar meta description optimizada (150-160 caracteres)
  const originInfo = ingredient.origen ? ` Origen: ${ingredient.origen}.` : '';
  const priceInfo = ingredient.ingredient_prices && ingredient.ingredient_prices.length > 0 
    ? ` Precio actual disponible.` : '';
  const performanceInfo = ` Rendimiento ${ingredient.rendimiento}%, merma ${ingredient.merma}%.`;
  
  const baseDescription = `${ingredient.name} profesional ✨${priceInfo}${originInfo}${performanceInfo} ¡Descubre técnicas y usos culinarios!`;
  
  // Truncar si es necesario pero mantener coherencia
  const metaDescription = baseDescription.length > 160 
    ? `${ingredient.name} profesional ✨${priceInfo} Rendimiento ${ingredient.rendimiento}%, merma ${ingredient.merma}%. ¡Técnicas culinarias exclusivas!`
    : baseDescription;
  
  const imageUrl = ingredient.real_image_url || ingredient.image_url || `${BASE_URL}/og-image.jpg`;
  const canonicalUrl = ingredient.slug 
    ? `${BASE_URL}/ingrediente/${ingredient.slug}`
    : `${BASE_URL}/ingrediente/${ingredient.id}`;
  
  // Keywords más específicas y relevantes
  const categoryKeywords = ingredient.categories?.name || 'ingredientes';
  const keywords = `${ingredient.name}, ${categoryKeywords}, cocina profesional, chef, precios ${ingredient.name}, técnicas culinarias, hostelería, gastronomía, rendimiento, merma`;

  return {
    title,
    description: metaDescription,
    keywords,
    ogTitle: `${ingredient.name} ${categoryEmoji} - Guía Profesional del Chef`,
    ogDescription: metaDescription,
    ogImage: imageUrl,
    ogType: 'product',
    twitterCard: 'summary_large_image',
    twitterTitle: `${ingredient.name} ${categoryEmoji} | Chef Profesional`,
    twitterDescription: metaDescription,
    twitterImage: imageUrl,
    canonical: canonicalUrl
  };
};

// Función auxiliar para emojis por categoría
const getCategoryEmoji = (categoryName?: string): string => {
  if (!categoryName) return '🥘';
  
  const categoryEmojis: Record<string, string> = {
    'verduras': '🥬',
    'frutas': '🍎',
    'carnes': '🥩',
    'pescados': '🐟',
    'mariscos': '🦐',
    'lácteos': '🥛',
    'cereales': '🌾',
    'legumbres': '🫘',
    'especias': '🌶️',
    'hierbas': '🌿',
    'hongos': '🍄',
    'aceites': '🫒',
    'vinagres': '🍾',
    'frutos secos': '🥜',
    'condimentos': '🧂',
    'salsas': '🥫',
    'endulzantes': '🍯'
  };
  
  const normalizedCategory = categoryName.toLowerCase();
  return categoryEmojis[normalizedCategory] || '🥘';
};

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
