import type { Context } from "https://edge.netlify.com/";

// Lista exhaustiva de User-Agents de bots sociales y crawlers
const BOT_PATTERNS = [
  // WhatsApp y Telegram (PRIORIDAD MÁXIMA)
  /WhatsApp/i,
  /Telegram/i,
  /TelegramBot/i,
  
  // Facebook (Meta) - Múltiples variantes
  /facebookexternalhit/i,
  /FacebookBot/i,
  /facebook/i,
  
  // Twitter/X
  /Twitterbot/i,
  /TwitterBot/i,
  
  // LinkedIn
  /LinkedInBot/i,
  /linkedin/i,
  
  // Discord
  /Discordbot/i,
  /Discord/i,
  
  // Slack
  /Slackbot/i,
  /SlackBot/i,
  
  // Herramientas de Social Media Management
  /PostPlanner/i,
  /Buffer/i,
  /Hootsuite/i,
  /SocialBee/i,
  
  // Crawlers SEO
  /Googlebot/i,
  /GoogleBot/i,
  /Google/i,
  /Bingbot/i,
  /bingbot/i,
  /YandexBot/i,
  /DuckDuckBot/i,
  
  // Pinterest y otros
  /Pinterest/i,
  /Skype/i,
  /SkypeUriPreview/i,
  
  // Fallback genérico
  /bot/i,
  /Bot/i,
  /crawler/i,
  /Crawler/i,
];

function isBotOrCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  
  // Solo procesar rutas de ingredientes
  if (!url.pathname.startsWith("/ingrediente/")) {
    return; // Continuar con el flujo normal
  }
  
  // Logging detallado para debugging
  console.log("🔍 [NETLIFY EDGE] URL:", url.pathname);
  console.log("🔍 [NETLIFY EDGE] User-Agent:", userAgent);
  console.log("🔍 [NETLIFY EDGE] Is Bot:", isBotOrCrawler(userAgent));
  
  // Si NO es un bot, continuar con el flujo normal (SPA)
  if (!isBotOrCrawler(userAgent)) {
    console.log("👤 [NETLIFY EDGE] Usuario normal - continuar con SPA");
    return; // Netlify servirá index.html normalmente
  }
  
  // Es un bot - generar HTML prerendeirizado
  console.log("🤖 [NETLIFY EDGE] Bot detectado - generando HTML prerendeirizado");
  
  try {
    // Extraer el slug del ingrediente
    const ingredientSlug = url.pathname.replace("/ingrediente/", "");
    
    if (!ingredientSlug) {
      console.error("❌ [NETLIFY EDGE] Slug de ingrediente vacío");
      return new Response("Ingredient not found", { status: 404 });
    }
    
    // Llamar a nuestra función Supabase existente
    const supabaseUrl = `https://unqhfgupcutpeyepnavl.supabase.co/functions/v1/ingredient-meta-prerender/ingrediente/${ingredientSlug}`;
    console.log("📡 [NETLIFY EDGE] Llamando a Supabase:", supabaseUrl);
    
    const response = await fetch(supabaseUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent, // Pasar el User-Agent original
      },
    });
    
    if (!response.ok) {
      console.error("❌ [NETLIFY EDGE] Error de Supabase:", response.status, response.statusText);
      throw new Error(`Supabase function failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log("✅ [NETLIFY EDGE] HTML generado exitosamente");
    
    // Devolver HTML prerendeirizado con headers optimizados
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200", // Cache 1h browser, 2h CDN
        "X-Robots-Tag": "index, follow",
        "X-Prerendered": "true",
        "X-Bot-Detected": userAgent.substring(0, 100), // Log del bot para debugging
      },
    });
    
  } catch (error) {
    console.error("💥 [NETLIFY EDGE] Error al generar HTML:", error);
    
    // Fallback a HTML básico si falla
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ingrediente - Ingredients Index Pro</title>
  <meta name="description" content="Directorio completo de ingredientes culinarios con precios, usos profesionales y recetas.">
  <meta property="og:title" content="Ingrediente - Ingredients Index Pro">
  <meta property="og:description" content="Directorio completo de ingredientes culinarios con precios, usos profesionales y recetas.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.href}">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Ingredients Index Pro</h1>
  <p>Directorio completo de ingredientes culinarios.</p>
  <script>window.location.href = "${url.href}";</script>
</body>
</html>`;
    
    return new Response(fallbackHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Prerendered": "fallback",
        "X-Error": "true",
      },
    });
  }
};