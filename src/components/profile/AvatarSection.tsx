
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/contexts/ProfileContext';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarSectionProps {
  profile: any;
}

const AvatarSection = ({ profile }: AvatarSectionProps) => {
  const { user } = useAuth();
  const { uploadAvatar, updateProfile, updating } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    uploadAvatar(file);
  };

  const handleRemoveAvatar = async () => {
    await updateProfile({ avatar_url: null });
    setPreviewUrl(null);
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const currentAvatarUrl = previewUrl || profile?.avatar_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto de Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={currentAvatarUrl} alt="Avatar" />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {currentAvatarUrl ? 'Cambiar Foto' : 'Subir Foto'}
            </Button>

            {currentAvatarUrl && (
              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={updating}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-2">Recomendaciones:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Usa una imagen cuadrada para mejores resultados</li>
            <li>• Tamaño recomendado: 400x400 píxeles</li>
            <li>• Formatos admitidos: JPG, PNG, WebP</li>
            <li>• Tamaño máximo: 5MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSection;
