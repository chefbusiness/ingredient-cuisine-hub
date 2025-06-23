
import { useSEO, SEOData } from '@/hooks/useSEO';

interface SEOHeadProps {
  seoData: SEOData;
}

const SEOHead = ({ seoData }: SEOHeadProps) => {
  useSEO(seoData);
  return null; // Este componente no renderiza nada visual
};

export default SEOHead;
