
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
    console.log('🗺️ Generando sitemap dinámico...');
    
    // Crear cliente de Supabase
    const supabase = createClient(
      'https://unqhfgupcutpeyepnavl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
    );

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
      // Obtener categorías activas
      console.log('📂 Obteniendo categorías...');
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('name, created_at')
        .order('name');

      if (categoriesError) {
        console.error('Error obteniendo categorías:', categoriesError);
      } else if (categories) {
        categoryPages = categories.map(cat => ({
          name: cat.name,
          lastmod: cat.created_at || currentDate
        }));
        console.log(`✅ ${categoryPages.length} categorías encontradas`);
      }

      // Obtener ingredientes con slug válido
      console.log('🥕 Obteniendo ingredientes...');
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .neq('slug', '')
        .order('updated_at', { ascending: false });

      if (ingredientsError) {
        console.error('Error obteniendo ingredientes:', ingredientsError);
      } else if (ingredients) {
        ingredientPages = ingredients.map(ing => ({
          slug: ing.slug,
          lastmod: ing.updated_at || currentDate
        }));
        console.log(`✅ ${ingredientPages.length} ingredientes encontrados`);
      }
    } catch (dbError) {
      console.error('Error accediendo a la base de datos:', dbError);
      // Continuar con sitemap básico en caso de error
    }

    // Generar XML del sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categoryPages.map(cat => `
  <url>
    <loc>${baseUrl}/directorio?categoria=${encodeURIComponent(cat.name)}</loc>
    <lastmod>${cat.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${ingredientPages.map(ing => `
  <url>
    <loc>${baseUrl}/ingrediente/${ing.slug}</loc>
    <lastmod>${ing.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    console.log(`🎉 Sitemap generado con ${staticPages.length + categoryPages.length + ingredientPages.length} URLs`);

    return new Response(sitemap, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error generando sitemap:', error);
    
    // Sitemap básico de emergencia
    const emergencySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ingredientsindex.pro/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ingredientsindex.pro/directorio</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(emergencySitemap, {
      headers: corsHeaders
    });
  }
});
