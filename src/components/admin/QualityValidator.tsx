
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

interface QualityValidatorProps {
  ingredient: any;
}

const QualityValidator = ({ ingredient }: QualityValidatorProps) => {
  const validateIngredient = (ingredient: any): QualityIssue[] => {
    const issues: QualityIssue[] = [];

    // Verificaciones históricas críticas
    const historicalErrors = [
      {
        ingredient: 'tomate',
        wrongOrigin: ['mediterráneo', 'europa', 'españa', 'italia'],
        correctOrigin: 'América (México/Perú)'
      },
      {
        ingredient: 'patata',
        wrongOrigin: ['europa', 'irlanda', 'españa'],
        correctOrigin: 'Andes (Perú/Bolivia)'
      },
      {
        ingredient: 'maíz',
        wrongOrigin: ['europa', 'asia', 'mediterráneo'],
        correctOrigin: 'Mesoamérica (México)'
      }
    ];

    historicalErrors.forEach(({ ingredient: ing, wrongOrigin, correctOrigin }) => {
      if (ingredient.name?.toLowerCase().includes(ing) || ingredient.name_en?.toLowerCase().includes(ing)) {
        wrongOrigin.forEach(wrong => {
          if (ingredient.origen?.toLowerCase().includes(wrong) || 
              ingredient.description?.toLowerCase().includes(`origen ${wrong}`)) {
            issues.push({
              type: 'error',
              message: `ERROR HISTÓRICO: ${ingredient.name} tiene origen incorrecto. Origen real: ${correctOrigin}`,
              field: 'origen'
            });
          }
        });
      }
    });

    // Verificar longitud de descripción
    if (ingredient.description) {
      const wordCount = ingredient.description.split(' ').length;
      if (wordCount > 600) {
        issues.push({
          type: 'warning',
          message: `Descripción muy larga (${wordCount} palabras). Objetivo: 400-500 palabras`,
          field: 'description'
        });
      } else if (wordCount < 350) {
        issues.push({
          type: 'warning',
          message: `Descripción muy corta (${wordCount} palabras). Objetivo: 400-500 palabras`,
          field: 'description'
        });
      }
    }

    // Verificar marcadores de markdown visibles
    if (ingredient.description?.includes('###SECCION')) {
      issues.push({
        type: 'error',
        message: 'Marcadores de markdown visibles en la descripción. Necesita procesamiento.',
        field: 'description'
      });
    }

    // Verificar datos faltantes críticos
    if (!ingredient.origen || ingredient.origen.trim().length < 3) {
      issues.push({
        type: 'warning',
        message: 'Falta información de origen geográfico',
        field: 'origen'
      });
    }

    if (!ingredient.temporada || ingredient.temporada.trim().length < 3) {
      issues.push({
        type: 'info',
        message: 'Falta información de temporada',
        field: 'temporada'
      });
    }

    return issues;
  };

  const issues = validateIngredient(ingredient);
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');

  if (issues.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Calidad validada: No se detectaron problemas críticos
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((issue, idx) => (
        <Alert key={`error-${idx}`} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>ERROR:</strong> {issue.message}
          </AlertDescription>
        </Alert>
      ))}
      
      {warnings.map((issue, idx) => (
        <Alert key={`warning-${idx}`} className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>ADVERTENCIA:</strong> {issue.message}
          </AlertDescription>
        </Alert>
      ))}

      {infos.map((issue, idx) => (
        <Alert key={`info-${idx}`} className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>INFO:</strong> {issue.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default QualityValidator;
