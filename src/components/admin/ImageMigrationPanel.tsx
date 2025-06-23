
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Database, Download } from "lucide-react";
import { useMigrateImages } from "@/hooks/useMigrateImages";
import { useIngredients } from "@/hooks/useIngredients";

const ImageMigrationPanel = () => {
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number;
    total: number;
    isRunning: boolean;
  }>({ current: 0, total: 0, isRunning: false });

  const { data: allIngredients = [] } = useIngredients();
  
  const replicateImages = allIngredients.filter(
    ing => ing.image_url && ing.image_url.includes('replicate.delivery')
  );
  
  const supabaseImages = allIngredients.filter(
    ing => ing.image_url && ing.image_url.includes('supabase')
  );

  const migrateImages = useMigrateImages({
    onProgress: (current, total) => {
      setMigrationProgress({ current, total, isRunning: true });
    }
  });

  const handleStartMigration = () => {
    setMigrationProgress({ current: 0, total: replicateImages.length, isRunning: true });
    
    migrateImages.mutate(undefined, {
      onSettled: () => {
        setMigrationProgress(prev => ({ ...prev, isRunning: false }));
      }
    });
  };

  const progressPercentage = migrationProgress.total > 0 
    ? Math.round((migrationProgress.current / migrationProgress.total) * 100) 
    : 0;

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Migración de Imágenes a Supabase Storage
          <Badge variant="outline" className="ml-2">
            SEO Optimized
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-800">Replicate URLs</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{replicateImages.length}</p>
            <p className="text-xs text-orange-600">Pendientes de migrar</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">Supabase Storage</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{supabaseImages.length}</p>
            <p className="text-xs text-green-600">Ya migradas</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{allIngredients.length}</p>
            <p className="text-xs text-blue-600">Ingredientes con imagen</p>
          </div>
        </div>

        {/* Migration Progress */}
        {migrationProgress.isRunning && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso de migración</span>
              <span>{migrationProgress.current}/{migrationProgress.total}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progressPercentage}% completado
            </p>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Beneficios de la migración:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 🔍 <strong>SEO mejorado:</strong> URLs descriptivas como "tomate-cherry-2024.webp"</li>
            <li>• ⚡ <strong>Performance:</strong> Control total sobre CDN y optimización</li>
            <li>• 🛡️ <strong>Confiabilidad:</strong> Sin dependencia de servicios externos</li>
            <li>• 💰 <strong>Costos:</strong> Mejor control de bandwidth y almacenamiento</li>
          </ul>
        </div>

        {/* Migration Action */}
        {replicateImages.length > 0 ? (
          <Button
            onClick={handleStartMigration}
            disabled={migrateImages.isPending || migrationProgress.isRunning}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {migrateImages.isPending || migrationProgress.isRunning ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Migrando imágenes... ({migrationProgress.current}/{migrationProgress.total})
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Migrar {replicateImages.length} imágenes a Supabase Storage
              </div>
            )}
          </Button>
        ) : (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-800">¡Migración completada!</p>
            <p className="text-sm text-green-600">
              Todas las imágenes están en Supabase Storage con nombres SEO-optimizados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageMigrationPanel;
