import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Detectar solo bots sociales específicos y conocidos
function isSocialBot(userAgent: string): boolean {
  const botPatterns = [
    // Solo bots sociales específicos que necesitan meta tags
    'facebookexternalhit',
    'Twitterbot', 
    'WhatsApp',
    'Telegram',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
    // Herramientas de scheduling social específicas
    'PostPlanner',
    'Buffer',
    'Hootsuite',
    'SocialBee',
    'Later',
    'Sprout',
    'CoSchedule',
    'MeetEdgar'
  ]
  
  const userAgentLower = userAgent.toLowerCase()
  
  // Solo detectar patrones muy específicos de bots sociales
  return botPatterns.some(pattern => 
    userAgentLower.includes(pattern.toLowerCase())
  )
}

// Generar HTML para usuarios normales (con redirección inmediata)
function generateUserHTML(ingredient: any): string {
  const canonicalUrl = ingredient.slug 
    ? `https://ingredientsindex.pro/ingrediente/${ingredient.slug}`
    : `https://ingredientsindex.pro/ingrediente/${ingredient.id}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirigiendo...</title>
    <script>
      // Redirección inmediata para usuarios
      window.location.replace('${canonicalUrl}');
    </script>
    <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
    <p>Redirigiendo a <a href="${canonicalUrl}">${ingredient.name}</a>...</p>
</body>
</html>`
}

// Generar HTML completo con meta tags para bots/crawlers
function generateIngredientHTML(ingredient: any): string {
  const title = `${ingredient.name} | Ingrediente Profesional - Precios y Características | IngredientsIndex.pro`
  const description = `${ingredient.description} Información completa sobre ${ingredient.name}: precios, merma (${ingredient.merma}%), rendimiento (${ingredient.rendimiento}%), usos culinarios y más.`
  const imageUrl = ingredient.real_image_url || ingredient.image_url || 'https://ingredientsindex.pro/og-image.jpg'
  const canonicalUrl = ingredient.slug 
    ? `https://ingredientsindex.pro/ingrediente/${ingredient.slug}`
    : `https://ingredientsindex.pro/ingrediente/${ingredient.id}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${ingredient.name} - Ingrediente Profesional | IngredientsIndex.pro">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="IngredientsIndex.pro">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${canonicalUrl}">
    <meta property="twitter:title" content="${ingredient.name} - Ingrediente Profesional | IngredientsIndex.pro">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    
    <!-- WhatsApp específico -->
    <meta property="og:image:width" content="800">
    <meta property="og:image:height" content="600">
    
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Meta tags adicionales para mejor SEO -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="IngredientsIndex.pro">
    <meta property="og:locale" content="es_ES">
    <meta property="article:author" content="IngredientsIndex.pro">
    <meta property="article:section" content="Ingredientes">
    <meta name="theme-color" content="#22c55e">
</head>
<body>
    <h1>${ingredient.name}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${ingredient.name}" style="max-width: 100%; height: auto;">
    <p>Para ver la información completa, visita: <a href="${canonicalUrl}">${canonicalUrl}</a></p>
</body>
</html>`
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const userAgent = req.headers.get('user-agent') || ''
    
    console.log('🤖 User-Agent:', userAgent)
    console.log('🔍 URL:', url.pathname)

    // Solo procesar URLs de ingredientes
    const ingredientMatch = url.pathname.match(/\/ingrediente\/(.+)/)
    if (!ingredientMatch) {
      return new Response('Not Found', { status: 404 })
    }

    const ingredientParam = ingredientMatch[1]
    console.log('📋 Ingrediente param:', ingredientParam)

    // Verificar si es un bot/crawler o usuario normal
    const isBot = isSocialBot(userAgent)
    console.log(`${isBot ? '🤖' : '👤'} ${isBot ? 'Bot/Crawler' : 'Usuario normal'} detectado`)
    console.log('📊 User-Agent completo:', userAgent)

    // Determinar si es UUID (ID) o slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ingredientParam)
    
    // Buscar ingrediente por ID o slug
    let query = supabase
      .from('ingredients')
      .select(`
        id,
        name,
        description,
        slug,
        merma,
        rendimiento,
        image_url,
        real_image_url,
        categories (
          name
        )
      `)

    if (isUUID) {
      query = query.eq('id', ingredientParam)
    } else {
      query = query.eq('slug', ingredientParam)
    }

    const { data: ingredient, error } = await query.single()

    if (error || !ingredient) {
      console.error('❌ Error obteniendo ingrediente:', error)
      return new Response('Ingredient Not Found', { status: 404 })
    }

    console.log('✅ Ingrediente encontrado:', ingredient.name)

    // Generar HTML optimizado según el tipo de usuario
    const html = isBot 
      ? generateIngredientHTML(ingredient) // HTML estático para bots
      : generateUserHTML(ingredient) // HTML con redirección para usuarios
    
    const cacheControl = isBot 
      ? 'public, max-age=3600' // Cache más largo para bots
      : 'no-cache, no-store, must-revalidate' // Sin cache para usuarios

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': cacheControl,
      },
    })

  } catch (error) {
    console.error('💥 Error en prerender function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})