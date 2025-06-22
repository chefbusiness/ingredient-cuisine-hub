
import { GenerateContentParams } from './types.ts';
import { generateIngredientPrompt } from './prompts/ingredient-prompts.ts';
import { generateCategoryPrompt } from './prompts/category-prompts.ts';
import { 
  generateMarketResearchPrompt,
  generateWeatherImpactPrompt,
  generateCulturalVariantsPrompt,
  generateTrendAnalysisPrompt,
  generateSupplyChainPrompt
} from './prompts/research-prompts.ts';

export const generatePrompt = (params: GenerateContentParams): string => {
  const { type, category, region = 'España', count = 1, ingredient } = params;
  
  switch (type) {
    case 'ingredient':
      return generateIngredientPrompt(params);
      
    case 'category':
      return generateCategoryPrompt(count);
      
    case 'market_research':
      return generateMarketResearchPrompt({ ingredient, category, region });
      
    case 'weather_impact':
      return generateWeatherImpactPrompt({ ingredient, category, region });
      
    case 'cultural_variants':
      return generateCulturalVariantsPrompt({ ingredient, category });
      
    case 'trend_analysis':
      return generateTrendAnalysisPrompt({ ingredient, category, region });
      
    case 'supply_chain':
      return generateSupplyChainPrompt({ ingredient, category, region });
      
    default:
      throw new Error(`Tipo de contenido no soportado: ${type}`);
  }
};
