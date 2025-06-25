
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = 'https://ingredientsindex.pro';
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/directorio', priority: '0.9', changefreq: 'daily' }
    ];

    // Fetch real ingredients from Supabase for sitemap
    let ingredientPages: string[] = [];
    let categoryPages: string[] = [];
    
    try {
      // Solo importar supabase si estamos en el servidor
      if (typeof window === 'undefined') {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://unqhfgupcutpeyepnavl.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
        );
        
        // Obtener ingredientes con slug
        const { data: ingredients } = await supabase
          .from('ingredients')
          .select('slug, updated_at')
          .not('slug', 'is', null)
          .order('updated_at', { ascending: false });
        
        if (ingredients) {
          ingredientPages = ingredients.map(ing => ({
            slug: ing.slug,
            lastmod: ing.updated_at || new Date().toISOString()
          }));
        }

        // Obtener categorías únicas
        const { data: categories } = await supabase
          .from('categories')
          .select('slug, name')
          .not('slug', 'is', null);
        
        if (categories) {
          categoryPages = categories.map(cat => cat.slug);
        }
      }
    } catch (error) {
      console.error('Error fetching data for sitemap:', error);
      // Si hay error, continuamos con sitemap básico
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${categoryPages.map(slug => `
  <url>
    <loc>${baseUrl}/directorio?category=${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${ingredientPages.map(item => `
  <url>
    <loc>${baseUrl}/ingrediente/${typeof item === 'string' ? item : item.slug}</loc>
    <lastmod>${typeof item === 'string' ? new Date().toISOString() : item.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
