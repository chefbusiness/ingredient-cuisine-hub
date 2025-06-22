
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Zap } from "lucide-react";

interface AdminIngredientPreviewCardProps {
  ingredient: any;
  index: number;
}

const AdminIngredientPreviewCard = ({ ingredient, index }: AdminIngredientPreviewCardProps) => {
  const checkLanguageCompleteness = (item: any) => {
    const requiredLanguages = ['name_en', 'name_fr', 'name_it', 'name_pt', 'name_zh'];
    const missing = requiredLanguages.filter(lang => !item[lang]);
    return {
      isComplete: missing.length === 0,
      missing: missing,
      present: requiredLanguages.filter(lang => item[lang])
    };
  };

  const languageStatus = checkLanguageCompleteness(ingredient);

  return (
    <Card key={index} className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg">{ingredient.name}</h3>
          
          {/* Estado de idiomas */}
          {languageStatus?.isComplete ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              5 idiomas completos
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Faltan {languageStatus?.missing.length} idiomas
            </Badge>
          )}
          
          {ingredient.image_url && (
            <Badge className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Flux 1.1 Pro
            </Badge>
          )}
          
          {ingredient.category && (
            <Badge className="bg-purple-100 text-purple-800">
              {ingredient.category}
            </Badge>
          )}
        </div>
        
        {ingredient.image_url && (
          <div className="flex justify-center">
            <img 
              src={ingredient.image_url} 
              alt={ingredient.name} 
              className="w-48 h-48 object-cover rounded-lg border shadow-sm" 
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {ingredient.description}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
          <div><strong>Temporada:</strong> {ingredient.temporada}</div>
          <div><strong>Origen:</strong> {ingredient.origen}</div>
          <div><strong>Merma:</strong> {ingredient.merma}%</div>
          <div><strong>Rendimiento:</strong> {ingredient.rendimiento}%</div>
        </div>
      </div>
    </Card>
  );
};

export default AdminIngredientPreviewCard;
