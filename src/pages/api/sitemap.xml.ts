
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.VITE_PUBLIC_URL || 'https://your-domain.com';
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/directorio', priority: '0.9', changefreq: 'daily' }
    ];

    // Fetch real ingredients from Supabase for sitemap
    let ingredientPages: string[] = [];
    
    try {
      // Solo importar supabase si estamos en el servidor
      if (typeof window === 'undefined') {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://unqhfgupcutpeyepnavl.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucWhmZ3VwY3V0cGV5ZXBuYXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzYzNTcsImV4cCI6MjA2NjExMjM1N30.fAMG2IznLEqReHQ5F4D2bZB5oh74d1jYK2NSjRXvblk'
        );
        
        const { data: ingredients } = await supabase
          .from('ingredients')
          .select('slug')
          .not('slug', 'is', null);
        
        if (ingredients) {
          ingredientPages = ingredients.map(ing => ing.slug);
        }
      }
    } catch (error) {
      console.error('Error fetching ingredients for sitemap:', error);
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
  ${ingredientPages.map(slug => `
  <url>
    <loc>${baseUrl}/ingrediente/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
