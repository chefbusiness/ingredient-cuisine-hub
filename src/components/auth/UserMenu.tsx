
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Heart, History, Settings, LogOut, Crown, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserMenuProps {
  onShowAuthModal: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onShowAuthModal }) => {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, promoteSuperAdmin } = useSuperAdmin();
  const { toast } = useToast();
  const [promoting, setPromoting] = useState(false);

  if (!user) {
    return (
      <Button onClick={onShowAuthModal} variant="outline" size="sm">
        <User className="h-4 w-4 mr-2" />
        Iniciar Sesión
      </Button>
    );
  }

  const userInitials = user.email?.slice(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePromoteSuperAdmin = async () => {
    if (user.email !== 'john@chefbusiness.co') {
      toast({
        title: "No autorizado",
        description: "Solo se puede promover el usuario específico",
        variant: "destructive"
      });
      return;
    }

    setPromoting(true);
    try {
      const result = await promoteSuperAdmin(user.email);
      if (result.success) {
        toast({
          title: "¡Promoción exitosa!",
          description: "Usuario promovido a Super Admin"
        });
        // Reload to refresh super admin status
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo promover el usuario",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado",
        variant: "destructive"
      });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-xs ${isSuperAdmin ? 'bg-yellow-100 text-yellow-800' : ''}`}>
              {isSuperAdmin && <Crown className="h-3 w-3 absolute top-0 right-0" />}
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Crown className="h-3 w-3" />
                  Super Admin
                </span>
              ) : (
                "Cuenta Premium Gratuita"
              )}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {user.email === 'john@chefbusiness.co' && !isSuperAdmin && (
          <>
            <DropdownMenuItem onClick={handlePromoteSuperAdmin} disabled={promoting}>
              <Shield className="mr-2 h-4 w-4" />
              <span>{promoting ? 'Promoviendo...' : 'Activar Super Admin'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          <span>Mis Favoritos</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          <span>Historial</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
