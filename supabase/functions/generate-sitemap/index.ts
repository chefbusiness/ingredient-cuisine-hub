
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://ingredientsindex.pro';
    const currentDate = new Date().toISOString();

    // URLs estáticas del sitio
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/directorio', priority: '0.9', changefreq: 'daily' },
      { url: '/sobre-nosotros', priority: '0.6', changefreq: 'monthly' },
      { url: '/contacto', priority: '0.5', changefreq: 'monthly' },
      { url: '/categorias', priority: '0.7', changefreq: 'weekly' },
      { url: '/privacidad', priority: '0.3', changefreq: 'yearly' },
      { url: '/cookies', priority: '0.3', changefreq: 'yearly' },
      { url: '/terminos', priority: '0.3', changefreq: 'yearly' }
    ];

    let categoryPages: Array<{ name: string; lastmod: string }> = [];
    let ingredientPages: Array<{ slug: string; lastmod: string }> = [];

    try {
      const supabase = createClient(
        'https://unqhfgupcutpeyepnavl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
      );

      // Consulta para categorías con timeout reducido
      const categoriesPromise = supabase
        .from('categories')
        .select('name, created_at')
        .order('name')
        .limit(50);

      const categoriesResult = await Promise.race([
        categoriesPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout categorías')), 2000)
        )
      ]);

      const { data: categories, error: categoriesError } = categoriesResult as any;

      if (!categoriesError && categories && categories.length > 0) {
        categoryPages = categories.map((cat: any) => ({
          name: cat.name,
          lastmod: cat.created_at || currentDate
        }));
      }

      // Consulta para ingredientes con timeout reducido
      const ingredientsPromise = supabase
        .from('ingredients')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .neq('slug', '')
        .order('updated_at', { ascending: false })
        .limit(300);

      const ingredientsResult = await Promise.race([
        ingredientsPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ingredientes')), 2000)
        )
      ]);

      const { data: ingredients, error: ingredientsError } = ingredientsResult as any;

      if (!ingredientsError && ingredients && ingredients.length > 0) {
        ingredientPages = ingredients.map((ing: any) => ({
          slug: ing.slug,
          lastmod: ing.updated_at || currentDate
        }));
      }

    } catch (dbError) {
      // Continuar con sitemap básico
    }

    // Construir sitemap XML de forma segura
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>';
    xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Agregar páginas estáticas
    for (const page of staticPages) {
      xmlContent += '<url>';
      xmlContent += '<loc>' + baseUrl + page.url + '</loc>';
      xmlContent += '<lastmod>' + currentDate + '</lastmod>';
      xmlContent += '<changefreq>' + page.changefreq + '</changefreq>';
      xmlContent += '<priority>' + page.priority + '</priority>';
      xmlContent += '</url>';
    }

    // Agregar páginas de categorías
    for (const cat of categoryPages) {
      xmlContent += '<url>';
      xmlContent += '<loc>' + baseUrl + '/directorio?categoria=' + encodeURIComponent(cat.name) + '</loc>';
      xmlContent += '<lastmod>' + cat.lastmod + '</lastmod>';
      xmlContent += '<changefreq>weekly</changefreq>';
      xmlContent += '<priority>0.7</priority>';
      xmlContent += '</url>';
    }

    // Agregar páginas de ingredientes
    for (const ing of ingredientPages) {
      xmlContent += '<url>';
      xmlContent += '<loc>' + baseUrl + '/ingrediente/' + ing.slug + '</loc>';
      xmlContent += '<lastmod>' + ing.lastmod + '</lastmod>';
      xmlContent += '<changefreq>weekly</changefreq>';
      xmlContent += '<priority>0.8</priority>';
      xmlContent += '</url>';
    }

    xmlContent += '</urlset>';

    return new Response(xmlContent, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    // Sitemap de emergencia
    const emergencyXml = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      '<url><loc>https://ingredientsindex.pro/</loc><lastmod>' + new Date().toISOString() + '</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>' +
      '<url><loc>https://ingredientsindex.pro/directorio</loc><lastmod>' + new Date().toISOString() + '</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>' +
      '<url><loc>https://ingredientsindex.pro/sobre-nosotros</loc><lastmod>' + new Date().toISOString() + '</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>' +
      '<url><loc>https://ingredientsindex.pro/contacto</loc><lastmod>' + new Date().toISOString() + '</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>' +
      '</urlset>';

    return new Response(emergencyXml, {
      status: 200,
      headers: corsHeaders
    });
  }
});
