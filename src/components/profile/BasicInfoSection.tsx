
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Mail, Calendar, Loader2 } from 'lucide-react';

interface BasicInfoSectionProps {
  profile: any;
  user: User | null;
}

const BasicInfoSection = ({ profile, user }: BasicInfoSectionProps) => {
  const { updateEmail, updating } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');

  const handleEmailUpdate = async () => {
    if (newEmail && newEmail !== user?.email) {
      await updateEmail(newEmail);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
                <Button 
                  onClick={handleEmailUpdate}
                  disabled={updating || !newEmail || newEmail === user?.email}
                  size="sm"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setNewEmail(user?.email || '');
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              </div>
            )}
          </div>

          {profile?.created_at && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de registro
              </Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(profile.created_at)}
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Cuenta Premium Gratuita:</strong> Tienes acceso ilimitado a todos los ingredientes y funcionalidades.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
