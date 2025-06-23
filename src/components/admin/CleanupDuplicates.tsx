
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle } from "lucide-react";
import { useDeleteDuplicateIngredient } from "@/hooks/mutations/useDeleteDuplicateIngredient";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CleanupDuplicates = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: deleteDuplicate, isPending } = useDeleteDuplicateIngredient();

  const handleCleanup = () => {
    deleteDuplicate(undefined, {
      onSuccess: () => {
        setShowConfirm(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpieza de Duplicados
        </CardTitle>
        <CardDescription>
          Eliminar ingredientes duplicados detectados en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Se ha detectado un duplicado de "Aceite de Oliva Virgen Extra". 
            Esta acción eliminará la versión más antigua manteniendo la más reciente.
          </AlertDescription>
        </Alert>

        {!showConfirm ? (
          <Button 
            onClick={() => setShowConfirm(true)}
            variant="outline"
            className="w-full"
          >
            Eliminar Duplicado Detectado
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar el duplicado más antiguo?
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleCleanup}
                disabled={isPending}
                variant="destructive"
                size="sm"
              >
                {isPending ? "Eliminando..." : "Sí, eliminar"}
              </Button>
              <Button 
                onClick={() => setShowConfirm(false)}
                variant="outline"
                size="sm"
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CleanupDuplicates;
