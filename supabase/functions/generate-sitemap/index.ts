
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    console.log('🔄 === SITEMAP GENERATION START ===');
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

    // Inicializar cliente Supabase
    const supabase = createClient(
      'https://unqhfgupcutpeyepnavl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
    );

    // Cargar categorías con timeout
    try {
      const categoriesResult = await Promise.race([
        supabase.from('categories').select('name, created_at').limit(20),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]) as any;

      if (categoriesResult?.data && Array.isArray(categoriesResult.data)) {
        categoryPages = categoriesResult.data.map((cat: any) => ({
          name: cat.name,
          lastmod: cat.created_at || currentDate
        }));
        console.log(`✅ ${categoryPages.length} categorías cargadas`);
      }
    } catch (error) {
      console.log('⚠️ Usando categorías fallback');
      categoryPages = [
        { name: 'Verduras', lastmod: currentDate },
        { name: 'Frutas', lastmod: currentDate },
        { name: 'Carnes', lastmod: currentDate }
      ];
    }

    // Cargar ingredientes con timeout
    try {
      const ingredientsResult = await Promise.race([
        supabase.from('ingredients').select('slug, updated_at').not('slug', 'is', null).order('updated_at', { ascending: false }).limit(500),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]) as any;

      if (ingredientsResult?.data && Array.isArray(ingredientsResult.data)) {
        ingredientPages = ingredientsResult.data.map((ing: any) => ({
          slug: ing.slug,
          lastmod: ing.updated_at || currentDate
        }));
        console.log(`✅ ${ingredientPages.length} ingredientes cargados`);
      }
    } catch (error) {
      console.log('⚠️ Usando ingredientes fallback');
      ingredientPages = [
        { slug: 'tomate', lastmod: currentDate },
        { slug: 'cebolla', lastmod: currentDate },
        { slug: 'ajo', lastmod: currentDate }
      ];
    }

    // Construir sitemap XML limpio
    const xmlLines = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Páginas estáticas
    staticPages.forEach(page => {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${baseUrl}${page.url}</loc>`);
      xmlLines.push(`    <lastmod>${currentDate}</lastmod>`);
      xmlLines.push(`    <changefreq>${page.changefreq}</changefreq>`);
      xmlLines.push(`    <priority>${page.priority}</priority>`);
      xmlLines.push('  </url>');
    });

    // Páginas de categorías
    categoryPages.forEach(cat => {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${baseUrl}/directorio?categoria=${encodeURIComponent(cat.name)}</loc>`);
      xmlLines.push(`    <lastmod>${cat.lastmod}</lastmod>`);
      xmlLines.push('    <changefreq>weekly</changefreq>');
      xmlLines.push('    <priority>0.7</priority>');
      xmlLines.push('  </url>');
    });

    // Páginas de ingredientes
    ingredientPages.forEach(ing => {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${baseUrl}/ingrediente/${ing.slug}</loc>`);
      xmlLines.push(`    <lastmod>${ing.lastmod}</lastmod>`);
      xmlLines.push('    <changefreq>weekly</changefreq>');
      xmlLines.push('    <priority>0.8</priority>');
      xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');
    
    // Crear XML final como string limpio
    const xmlContent = xmlLines.join('\n');
    
    const totalUrls = staticPages.length + categoryPages.length + ingredientPages.length;
    console.log(`✅ Sitemap generado: ${totalUrls} URLs`);

    // Retornar respuesta limpia
    return new Response(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Error generando sitemap:', error);
    
    // Sitemap de emergencia
    const emergencyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ingredientsindex.pro/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(emergencyXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
