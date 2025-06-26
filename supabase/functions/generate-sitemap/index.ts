
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600'
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

    // Intentar obtener datos dinámicos con timeout muy corto
    try {
      const supabase = createClient(
        'https://unqhfgupcutpeyepnavl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
      );

      // Timeout muy corto para evitar delays
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1500)
      );

      // Obtener categorías
      try {
        const categoriesResult = await Promise.race([
          supabase.from('categories').select('name, created_at').limit(30),
          timeoutPromise
        ]) as any;

        if (categoriesResult?.data && Array.isArray(categoriesResult.data)) {
          categoryPages = categoriesResult.data.map((cat: any) => ({
            name: cat.name,
            lastmod: cat.created_at || currentDate
          }));
        }
      } catch {
        // Silenciar errores de categorías
      }

      // Obtener ingredientes
      try {
        const ingredientsResult = await Promise.race([
          supabase.from('ingredients').select('slug, updated_at').not('slug', 'is', null).limit(200),
          timeoutPromise
        ]) as any;

        if (ingredientsResult?.data && Array.isArray(ingredientsResult.data)) {
          ingredientPages = ingredientsResult.data.map((ing: any) => ({
            slug: ing.slug,
            lastmod: ing.updated_at || currentDate
          }));
        }
      } catch {
        // Silenciar errores de ingredientes
      }

    } catch {
      // Continuar con sitemap básico si hay errores
    }

    // Construir sitemap XML limpio
    const xmlParts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    // Páginas estáticas
    staticPages.forEach(page => {
      xmlParts.push(
        '<url>',
        `<loc>${baseUrl}${page.url}</loc>`,
        `<lastmod>${currentDate}</lastmod>`,
        `<changefreq>${page.changefreq}</changefreq>`,
        `<priority>${page.priority}</priority>`,
        '</url>'
      );
    });

    // Páginas de categorías
    categoryPages.forEach(cat => {
      xmlParts.push(
        '<url>',
        `<loc>${baseUrl}/directorio?categoria=${encodeURIComponent(cat.name)}</loc>`,
        `<lastmod>${cat.lastmod}</lastmod>`,
        '<changefreq>weekly</changefreq>',
        '<priority>0.7</priority>',
        '</url>'
      );
    });

    // Páginas de ingredientes
    ingredientPages.forEach(ing => {
      xmlParts.push(
        '<url>',
        `<loc>${baseUrl}/ingrediente/${ing.slug}</loc>`,
        `<lastmod>${ing.lastmod}</lastmod>`,
        '<changefreq>weekly</changefreq>',
        '<priority>0.8</priority>',
        '</url>'
      );
    });

    xmlParts.push('</urlset>');

    const xmlContent = xmlParts.join('');

    return new Response(xmlContent, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    // Sitemap de emergencia mínimo
    const emergencyXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '<url>',
      '<loc>https://ingredientsindex.pro/</loc>',
      `<lastmod>${new Date().toISOString()}</lastmod>`,
      '<changefreq>daily</changefreq>',
      '<priority>1.0</priority>',
      '</url>',
      '<url>',
      '<loc>https://ingredientsindex.pro/directorio</loc>',
      `<lastmod>${new Date().toISOString()}</lastmod>`,
      '<changefreq>daily</changefreq>',
      '<priority>0.9</priority>',
      '</url>',
      '</urlset>'
    ].join('');

    return new Response(emergencyXml, {
      status: 200,
      headers: corsHeaders
    });
  }
});
