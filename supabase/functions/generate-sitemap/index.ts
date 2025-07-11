
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=1800', // Reducido a 30 minutos
  'X-Robots-Tag': 'noindex', // Evitar indexar el sitemap en motores de búsqueda
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 === SITEMAP GENERATION START ===');
    const baseUrl = 'https://ingredientsindex.pro';
    const currentDate = new Date().toISOString();
    console.log('📅 Current date:', currentDate);

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
    console.log('🔗 Inicializando cliente Supabase...');
    const supabase = createClient(
      'https://unqhfgupcutpeyepnavl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
    );

    // Cargar categorías rápidamente
    console.log('📋 === CARGANDO CATEGORÍAS ===');
    try {
      const categoriesPromise = supabase
        .from('categories')
        .select('name, created_at')
        .limit(20);
      
      const categoriesResult = await Promise.race([
        categoriesPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Categories timeout')), 2000))
      ]) as any;

      if (categoriesResult?.data && Array.isArray(categoriesResult.data)) {
        categoryPages = categoriesResult.data.map((cat: any) => ({
          name: cat.name,
          lastmod: cat.created_at || currentDate
        }));
        console.log(`✅ ${categoryPages.length} categorías cargadas exitosamente`);
      } else {
        console.log('⚠️ No se encontraron categorías');
      }
    } catch (catError) {
      console.log('❌ Error al cargar categorías:', catError.message);
      // Categorías fallback
      categoryPages = [
        { name: 'Verduras', lastmod: currentDate },
        { name: 'Frutas', lastmod: currentDate },
        { name: 'Carnes', lastmod: currentDate }
      ];
    }

    // Cargar ingredientes con límite para evitar timeouts
    console.log('🥬 === CARGANDO INGREDIENTES ===');
    try {
      const ingredientsPromise = supabase
        .from('ingredients')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(500); // Límite para evitar timeouts
      
      const ingredientsResult = await Promise.race([
        ingredientsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ingredients timeout')), 3000))
      ]) as any;

      if (ingredientsResult?.data && Array.isArray(ingredientsResult.data)) {
        ingredientPages = ingredientsResult.data.map((ing: any) => ({
          slug: ing.slug,
          lastmod: ing.updated_at || currentDate
        }));
        console.log(`✅ ${ingredientPages.length} ingredientes cargados exitosamente`);
      } else {
        console.log('⚠️ No se encontraron ingredientes');
      }
    } catch (ingError) {
      console.log('❌ Error al cargar ingredientes:', ingError.message);
      // Ingredientes fallback mínimos
      ingredientPages = [
        { slug: 'tomate', lastmod: currentDate },
        { slug: 'cebolla', lastmod: currentDate },
        { slug: 'ajo', lastmod: currentDate },
        { slug: 'patata', lastmod: currentDate },
        { slug: 'zanahoria', lastmod: currentDate }
      ];
    }

    // Construir sitemap XML completo
    console.log('🔨 === CONSTRUYENDO SITEMAP XML ===');
    const xmlParts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    // Agregar páginas estáticas
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

    // Agregar páginas de categorías
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

    // Agregar páginas de ingredientes
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
    
    // Crear XML limpio con saltos de línea
    const xmlContent = xmlParts.join('\n');
    
    const totalUrls = staticPages.length + categoryPages.length + ingredientPages.length;
    console.log(`✅ === SITEMAP GENERADO EXITOSAMENTE ===`);
    console.log(`📊 Total URLs: ${totalUrls} (${staticPages.length} estáticas + ${categoryPages.length} categorías + ${ingredientPages.length} ingredientes)`);
    console.log(`📏 XML length: ${xmlContent.length} characters`);

    // Headers limpios solo para XML
    const cleanHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800'
    };

    return new Response(xmlContent, {
      status: 200,
      headers: cleanHeaders
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
