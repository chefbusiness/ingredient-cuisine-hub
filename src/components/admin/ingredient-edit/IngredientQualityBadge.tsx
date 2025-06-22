
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/hooks/useIngredients";

interface IngredientQualityBadgeProps {
  ingredient: Ingredient | null;
}

export const useDataQuality = (ingredient: Ingredient | null) => {
  if (!ingredient) return { score: 0, issues: [] };
  
  const issues = [];
  let score = 100;
  
  if (!ingredient.image_url) {
    issues.push("Sin imagen");
    score -= 20;
  }
  if (!ingredient.name_fr || !ingredient.name_it) {
    issues.push("Faltan traducciones");
    score -= 15;
  }
  if (!ingredient.temporada) {
    issues.push("Sin temporada");
    score -= 10;
  }
  if (!ingredient.origen) {
    issues.push("Sin origen");
    score -= 10;
  }
  
  return { score: Math.max(0, score), issues };
};

const IngredientQualityBadge = ({ ingredient }: IngredientQualityBadgeProps) => {
  const quality = useDataQuality(ingredient);
  
  return (
    <>
      <Badge variant={quality.score >= 80 ? "default" : quality.score >= 60 ? "secondary" : "destructive"}>
        Calidad: {quality.score}%
      </Badge>
      {quality.issues.length > 0 && (
        <div className="text-sm text-orange-600">
          Problemas detectados: {quality.issues.join(", ")}
        </div>
      )}
    </>
  );
};

export default IngredientQualityBadge;
