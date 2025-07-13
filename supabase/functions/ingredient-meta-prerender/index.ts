import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🚨 DETECCIÓN MEJORADA DE BOTS - Incluye TODOS los user agents críticos
function isBotOrCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    // 📱 WhatsApp y Telegram (PRIORIDAD MÁXIMA para compartir)
    'WhatsApp', 'whatsapp', 'Telegram', 'TelegramBot', 'telegram',
    
    // 📘 Facebook/Meta - Múltiples variantes
    'facebookexternalhit', 'FacebookBot', 'facebook', 'FacebookAgent', 'facebookcatalog',
    
    // 🐦 Twitter/X
    'Twitterbot', 'TwitterBot', 'twitter',
    
    // 💼 LinkedIn
    'LinkedInBot', 'linkedin', 'LinkedInApp',
    
    // 🎮 Discord
    'Discordbot', 'Discord', 'DiscordBot',
    
    // 💬 Slack
    'Slackbot', 'SlackBot', 'Slack-ImgProxy',
    
    // 🛠️ Social Media Management Tools
    'PostPlanner', 'Buffer', 'Hootsuite', 'SocialBee', 'Later', 'Sprout',
    'CoSchedule', 'MeetEdgar', 'Sendible', 'SocialOomph',
    
    // 🔍 Crawlers SEO (CRÍTICO)
    'Googlebot', 'GoogleBot', 'Google', 'Google-Structured-Data-Testing-Tool',
    'Google-PageSpeed', 'Google-Read-Aloud', 'Bingbot', 'bingbot', 
    'YandexBot', 'DuckDuckBot', 'BaiduSpider', 'Baiduspider',
    
    // 📊 SEO Tools
    'SemrushBot', 'AhrefsBot', 'MJ12bot', 'Screaming Frog',
    'GTmetrix', 'Pingdom', 'Site24x7', 'UptimeRobot',
    
    // 📌 Otros importantes
    'Pinterest', 'Skype', 'SkypeUriPreview', 'AppleBot', 'MSNBot',
    
    // 🔄 Fallbacks genéricos
    'bot', 'Bot', 'crawler', 'Crawler', 'spider', 'Spider', 'scraper'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  const matchedPattern = botPatterns.find(pattern => 
    userAgentLower.includes(pattern.toLowerCase())
  );
  
  const isBot = !!matchedPattern;
  
  // ✅ LOGGING DETALLADO para debugging
  console.log('🔍 BOT DETECTION ANALYSIS:', {
    userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
    isBot,
    matchedPattern: matchedPattern || 'none',
    timestamp: new Date().toISOString()
  });
  
  return isBot;
}

// 🎯 HTML PARA USUARIOS NORMALES (redirección inmediata)
function generateUserHTML(ingredient: any): string {
  const canonicalUrl = `https://ingredientsindex.pro/ingrediente/${ingredient.slug}`;
  
  console.log('👤 GENERANDO REDIRECT para usuario normal:', {
    ingredient_name: ingredient.name,
    canonical_url: canonicalUrl
  });
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirigiendo a ${ingredient.name}...</title>
  <script>
    // Redirección inmediata y robusta
    try {
      window.location.replace("${canonicalUrl}");
    } catch(e) {
      window.location.href = "${canonicalUrl}";
    }
  </script>
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      text-align: center; 
      padding: 50px; 
      background: #f8f9fa; 
    }
    .redirect-info {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="redirect-info">
    <h2>Redirigiendo...</h2>
    <p>Accediendo a la información de <strong>${ingredient.name}</strong></p>
    <p><a href="${canonicalUrl}">Haz clic aquí si no eres redirigido automáticamente</a></p>
  </div>
</body>
</html>`;
}

// 🚀 HTML OPTIMIZADO PARA BOTS SOCIALES Y SEO
function generateIngredientHTML(ingredient: any): string {
  const baseUrl = 'https://ingredientsindex.pro';
  const canonicalUrl = `${baseUrl}/ingrediente/${ingredient.slug}`;
  
  // 🖼️ IMAGEN OPTIMIZADA: Preferir imagen real, fallback a generada, fallback a placeholder
  const imageUrl = ingredient.real_image_url || 
                   ingredient.image_url || 
                   `${baseUrl}/placeholder.svg`;
  
  // 📝 DESCRIPCIÓN OPTIMIZADA para compartir (160 chars para Facebook)
  let shareDescription = '';
  if (ingredient.description && ingredient.description.length > 0) {
    shareDescription = ingredient.description.length > 155 
      ? ingredient.description.substring(0, 152) + '...'
      : ingredient.description;
  } else {
    shareDescription = `Información completa sobre ${ingredient.name}: usos culinarios profesionales, precios actualizados, recetas y características técnicas.`;
  }
  
  // 🏷️ TÍTULO OPTIMIZADO para redes sociales (60 chars para Twitter)
  const shareTitle = `${ingredient.name} - Ingrediente Profesional | Ingredients Index Pro`;
  
  // 🔧 KEYWORDS SEO optimizadas
  const keywords = [
    ingredient.name,
    ingredient.name_en,
    'ingrediente profesional',
    'cocina profesional',
    'gastronomía',
    'chef',
    'precios ingredientes',
    'recetas profesionales',
    'hostelería',
    'ingredients index',
    ingredient.categories?.name
  ].filter(Boolean).join(', ');

  // Escapar caracteres especiales para HTML
  const escapeHtml = (text: string) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  const escapedTitle = escapeHtml(shareTitle);
  const escapedDescription = escapeHtml(shareDescription);
  const escapedName = escapeHtml(ingredient.name);

  console.log('🎨 GENERANDO HTML OPTIMIZADO PARA BOT:', {
    ingredient_name: ingredient.name,
    slug: ingredient.slug,
    image_url: imageUrl,
    canonical_url: canonicalUrl,
    description_length: shareDescription.length,
    has_real_image: !!ingredient.real_image_url,
    has_generated_image: !!ingredient.image_url
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- ✅ TÍTULO Y DESCRIPCIÓN OPTIMIZADOS -->
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- 🌟 OPEN GRAPH para Facebook, WhatsApp, Telegram (OPTIMIZADO) -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Imagen profesional de ${escapedName}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Ingredients Index Pro">
  <meta property="og:locale" content="es_ES">
  <meta property="og:locale:alternate" content="en_US">
  
  <!-- 🐦 TWITTER CARD optimizada -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="Imagen de ${escapedName}">
  <meta name="twitter:site" content="@IngredientsIndex">
  <meta name="twitter:creator" content="@IngredientsIndex">
  
  <!-- 📱 TELEGRAM optimizaciones específicas -->
  <meta property="telegram:channel" content="@IngredientsIndex">
  
  <!-- 📱 WhatsApp optimizaciones específicas -->
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  
  <!-- 💼 LinkedIn optimizaciones -->
  <meta property="og:article:author" content="Ingredients Index Pro">
  <meta property="og:article:section" content="Ingredientes Profesionales">
  
  <!-- 🔍 META TAGS SEO AVANZADOS -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="author" content="Ingredients Index Pro">
  <meta name="theme-color" content="#22c55e">
  <meta name="format-detection" content="telephone=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  
  <!-- 🔗 DATOS ESTRUCTURADOS JSON-LD para SEO MÁXIMO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Food",
    "name": "${escapedName}",
    "alternateName": ${ingredient.name_en ? `"${escapeHtml(ingredient.name_en)}"` : 'null'},
    "description": "${escapedDescription}",
    "image": {
      "@type": "ImageObject",
      "url": "${imageUrl}",
      "width": 800,
      "height": 600
    },
    "url": "${canonicalUrl}",
    "brand": {
      "@type": "Organization",
      "name": "Ingredients Index Pro",
      "url": "${baseUrl}",
      "logo": "${baseUrl}/logo.png"
    },
    "category": "${ingredient.categories?.name || 'Ingrediente Culinario'}",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Merma",
        "value": "${ingredient.merma || 0}%"
      },
      {
        "@type": "PropertyValue", 
        "name": "Rendimiento",
        "value": "${ingredient.rendimiento || 100}%"
      },
      {
        "@type": "PropertyValue",
        "name": "Popularidad",
        "value": "${ingredient.popularity || 0}"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${Math.min((ingredient.popularity || 0) / 20, 5)}",
      "ratingCount": "${ingredient.popularity || 1}",
      "bestRating": 5,
      "worstRating": 0
    },
    "offers": {
      "@type": "AggregateOffer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "EUR",
      "lowPrice": "0.50",
      "highPrice": "50.00"
    }
  }
  </script>
  
  <!-- 🍞 BREADCRUMB Schema para navegación SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "${baseUrl}/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Directorio de Ingredientes",
        "item": "${baseUrl}/directorio"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${escapedName}",
        "item": "${canonicalUrl}"
      }
    ]
  }
  </script>
  
  <!-- 🎨 ESTILOS MÍNIMOS para preview elegante -->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .ingredient-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .ingredient-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .ingredient-image {
      width: 100%;
      max-width: 500px;
      height: 300px;
      object-fit: cover;
      border-radius: 12px;
      margin: 20px auto;
      display: block;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    .ingredient-description {
      font-size: 1.1rem;
      line-height: 1.8;
      margin: 25px 0;
      color: #555;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      border-left: 4px solid #667eea;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
    }
    .cta-section {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-radius: 12px;
      margin-top: 30px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    @media (max-width: 768px) {
      .container { margin: 10px; border-radius: 12px; }
      .header { padding: 30px 20px; }
      .ingredient-title { font-size: 2rem; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="ingredient-title">${escapedName}</h1>
      <p class="ingredient-subtitle">Ingrediente Profesional | Ingredients Index Pro</p>
    </header>
    
    <main class="content">
      <img src="${imageUrl}" alt="Imagen profesional de ${escapedName}" class="ingredient-image" />
      
      <p class="ingredient-description">${escapedDescription}</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${ingredient.merma || 0}%</div>
          <div class="stat-label">Merma</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${ingredient.rendimiento || 100}%</div>
          <div class="stat-label">Rendimiento</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${ingredient.popularity || 0}</div>
          <div class="stat-label">Popularidad</div>
        </div>
      </div>
      
      <div class="cta-section">
        <h3>Información Completa</h3>
        <p style="margin: 15px 0; color: #666;">Accede a precios actualizados, recetas profesionales, información nutricional y mucho más.</p>
        <a href="${canonicalUrl}" class="cta-button">Ver Información Completa →</a>
      </div>
    </main>
  </div>
  
  <!-- 🔄 Auto-redirect solo para usuarios normales que lleguen aquí por error -->
  <script>
    // Solo redirigir si no es un bot y han pasado 3 segundos
    if (!navigator.userAgent.match(/bot|crawler|spider|telegram|whatsapp|facebook|twitter|linkedin|discord|slack|googlebot|bingbot/i)) {
      console.log('Usuario normal detectado, programando redirección...');
      setTimeout(() => {
        try {
          window.location.href = "${canonicalUrl}";
        } catch(e) {
          console.log('Error en redirección:', e);
        }
      }, 3000);
    }
  </script>
</body>
</html>`;
}

// 🚀 FUNCIÓN PRINCIPAL CON LOGGING COMPLETO
Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('🚀 INGREDIENT META PRERENDER - Iniciando procesamiento');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';
    const path = url.pathname;
    const referer = req.headers.get('referer') || '';
    const xForwardedFor = req.headers.get('x-forwarded-for') || '';
    
    console.log('📥 REQUEST ANALYSIS:', {
      method: req.method,
      path,
      userAgent: userAgent.substring(0, 200) + (userAgent.length > 200 ? '...' : ''),
      referer,
      clientIP: xForwardedFor,
      timestamp: new Date().toISOString()
    });

    // Extraer ID/slug del ingrediente
    const ingredientMatch = path.match(/\/ingrediente\/(.+)/);
    if (!ingredientMatch) {
      console.error('❌ URL no válida - no se encontró parámetro de ingrediente');
      return new Response('URL no válida', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const ingredientParam = ingredientMatch[1];
    console.log('🔍 PARÁMETRO EXTRAÍDO:', ingredientParam);

    // Conectar a Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ CONFIGURACIÓN FALTANTE - Variables de Supabase no encontradas');
      throw new Error('Configuración de Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determinar si es UUID o slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ingredientParam);
    
    console.log('🎯 TIPO DE BÚSQUEDA:', isUUID ? 'UUID' : 'SLUG');

    // Buscar ingrediente
    let query = supabase
      .from('ingredients')
      .select(`
        id,
        name,
        name_en,
        description,
        slug,
        merma,
        rendimiento,
        popularity,
        image_url,
        real_image_url,
        categories (
          name
        )
      `);

    if (isUUID) {
      query = query.eq('id', ingredientParam);
    } else {
      query = query.eq('slug', ingredientParam);
    }

    const { data: ingredient, error } = await query.single();

    if (error || !ingredient) {
      console.error('❌ INGREDIENTE NO ENCONTRADO:', { 
        ingredientParam, 
        isUUID, 
        error: error?.message,
        errorCode: error?.code 
      });
      return new Response('Ingrediente no encontrado', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    console.log('✅ INGREDIENTE ENCONTRADO:', {
      id: ingredient.id,
      name: ingredient.name,
      slug: ingredient.slug,
      has_real_image: !!ingredient.real_image_url,
      has_generated_image: !!ingredient.image_url,
      popularity: ingredient.popularity,
      category: ingredient.categories?.name
    });

    // 🤖 DETECTAR SI ES BOT
    const isBot = isBotOrCrawler(userAgent);
    
    // Generar HTML apropiado
    const html = isBot 
      ? generateIngredientHTML(ingredient)
      : generateUserHTML(ingredient);
    
    const processingTime = Date.now() - startTime;
    
    console.log('📤 RESPUESTA LISTA:', {
      isBot,
      htmlLength: html.length,
      ingredientName: ingredient.name,
      processingTimeMs: processingTime,
      responseType: isBot ? 'BOT_OPTIMIZED_HTML' : 'USER_REDIRECT_HTML'
    });

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': isBot 
          ? 'public, max-age=3600, s-maxage=7200' // Cache 1h navegador, 2h CDN para bots
          : 'no-cache, no-store, must-revalidate', // Sin cache para usuarios
        'X-Processing-Time': `${processingTime}ms`,
        'X-Bot-Detected': isBot ? 'true' : 'false',
        'X-Ingredient-Name': ingredient.name,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('💥 ERROR CRÍTICO en ingredient-meta-prerender:', {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });
    
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <title>Error - Ingredients Index Pro</title>
        <meta charset="UTF-8">
      </head>
      <body>
        <h1>Error temporal</h1>
        <p>Lo sentimos, ha ocurrido un error temporal. Por favor, intenta de nuevo en unos momentos.</p>
        <p><a href="https://ingredientsindex.pro/">Volver al inicio</a></p>
      </body>
      </html>
    `, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
});