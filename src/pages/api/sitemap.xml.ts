
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // In a real implementation, you would fetch ingredients from Supabase
    // For now, we'll create a basic sitemap structure
    const baseUrl = process.env.VITE_PUBLIC_URL || 'https://your-domain.com';
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/directorio', priority: '0.9', changefreq: 'daily' }
    ];

    // Note: In production, you would fetch real ingredient IDs from database
    const ingredientPages = [
      // This would be populated with real ingredient IDs
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${ingredientPages.map(ingredientId => `
  <url>
    <loc>${baseUrl}/ingrediente/${ingredientId}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
