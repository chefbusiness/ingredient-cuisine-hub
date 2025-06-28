
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";

interface QualityData {
  score: number;
  issues: string[];
}

interface IngredientQualityScoreProps {
  ingredient: Ingredient;
}

export const getDataQuality = (ingredient: Ingredient): QualityData => {
  let score = 100;
  const issues = [];
  
  if (!ingredient.image_url) {
    score -= 20;
    issues.push("Sin imagen");
  }
  if (!ingredient.name_fr || !ingredient.name_it) {
    score -= 15;
    issues.push("Faltan traducciones");
  }
  if (!ingredient.temporada) {
    score -= 10;
    issues.push("Sin temporada");
  }
  if (!ingredient.origen) {
    score -= 10;
    issues.push("Sin origen");
  }
  
  return { score: Math.max(0, score), issues };
};

const IngredientQualityScore = ({ ingredient }: IngredientQualityScoreProps) => {
  const quality = getDataQuality(ingredient);
  
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={quality.score >= 80 ? "default" : quality.score >= 60 ? "secondary" : "destructive"}
        className="text-xs"
      >
        {quality.score}%
      </Badge>
      {quality.issues.length > 0 && (
        <div className="text-xs text-orange-600" title={quality.issues.join(", ")}>
          {quality.issues.length} problema{quality.issues.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default IngredientQualityScore;
