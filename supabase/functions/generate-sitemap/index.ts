
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
    console.log('🗺️ [SITEMAP] Iniciando generación de sitemap dinámico...');
    
    const baseUrl = 'https://ingredientsindex.pro';
    const currentDate = new Date().toISOString();

    // URLs estáticas del sitio (siempre disponibles)
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

    console.log('✅ [SITEMAP] URLs estáticas preparadas:', staticPages.length);

    // Inicializar arrays para datos dinámicos
    let categoryPages: Array<{ name: string; lastmod: string }> = [];
    let ingredientPages: Array<{ slug: string; lastmod: string }> = [];

    try {
      console.log('🔗 [SITEMAP] Conectando a Supabase...');
      
      const supabase = createClient(
        'https://unqhfgupcutpeyepnavl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
      );

      console.log('📂 [SITEMAP] Obteniendo categorías...');
      
      // Consulta simplificada para categorías con timeout
      const categoriesPromise = supabase
        .from('categories')
        .select('name, created_at')
        .order('name')
        .limit(50); // Limitar para evitar timeouts

      const categoriesResult = await Promise.race([
        categoriesPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout obteniendo categorías')), 5000)
        )
      ]);

      const { data: categories, error: categoriesError } = categoriesResult as any;

      if (categoriesError) {
        console.warn('⚠️ [SITEMAP] Error obteniendo categorías:', categoriesError.message);
      } else if (categories && categories.length > 0) {
        categoryPages = categories.map((cat: any) => ({
          name: cat.name,
          lastmod: cat.created_at || currentDate
        }));
        console.log(`✅ [SITEMAP] ${categoryPages.length} categorías obtenidas`);
      }

      console.log('🥕 [SITEMAP] Obteniendo ingredientes...');
      
      // Consulta simplificada para ingredientes con timeout
      const ingredientsPromise = supabase
        .from('ingredients')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .neq('slug', '')
        .order('updated_at', { ascending: false })
        .limit(500); // Limitar para evitar timeouts

      const ingredientsResult = await Promise.race([
        ingredientsPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout obteniendo ingredientes')), 5000)
        )
      ]);

      const { data: ingredients, error: ingredientsError } = ingredientsResult as any;

      if (ingredientsError) {
        console.warn('⚠️ [SITEMAP] Error obteniendo ingredientes:', ingredientsError.message);
      } else if (ingredients && ingredients.length > 0) {
        ingredientPages = ingredients.map((ing: any) => ({
          slug: ing.slug,
          lastmod: ing.updated_at || currentDate
        }));
        console.log(`✅ [SITEMAP] ${ingredientPages.length} ingredientes obtenidos`);
      }

    } catch (dbError) {
      console.error('❌ [SITEMAP] Error accediendo a la base de datos:', dbError);
      console.log('🔄 [SITEMAP] Continuando con sitemap básico...');
    }

    // Generar XML del sitemap
    console.log('📝 [SITEMAP] Generando XML...');
    
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

    const totalUrls = staticPages.length + categoryPages.length + ingredientPages.length;
    console.log(`🎉 [SITEMAP] Sitemap generado exitosamente con ${totalUrls} URLs`);

    return new Response(sitemap, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ [SITEMAP] Error crítico generando sitemap:', error);
    
    // Sitemap de emergencia con URLs esenciales
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
  <url>
    <loc>https://ingredientsindex.pro/sobre-nosotros</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://ingredientsindex.pro/contacto</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    console.log('🚨 [SITEMAP] Enviando sitemap de emergencia');

    return new Response(emergencySitemap, {
      status: 200,
      headers: corsHeaders
    });
  }
});
