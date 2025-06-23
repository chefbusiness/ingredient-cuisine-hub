
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = seoData.title;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (metaTag) {
        metaTag.content = content;
      } else {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        metaTag.content = content;
        document.head.appendChild(metaTag);
      }
    };

    // Update basic meta tags
    updateMetaTag('description', seoData.description);
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle || seoData.title, true);
    updateMetaTag('og:description', seoData.ogDescription || seoData.description, true);
    updateMetaTag('og:type', seoData.ogType || 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.description);
    
    if (seoData.twitterImage) {
      updateMetaTag('twitter:image', seoData.twitterImage);
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = seoData.canonical || window.location.href;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = seoData.canonical || window.location.href;
      document.head.appendChild(canonicalLink);
    }
  }, [seoData, location]);
};
