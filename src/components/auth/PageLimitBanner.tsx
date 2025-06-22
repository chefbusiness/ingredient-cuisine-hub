
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, Star } from 'lucide-react';

interface PageLimitBannerProps {
  remainingViews: number;
  onShowAuthModal: () => void;
}

export const PageLimitBanner: React.FC<PageLimitBannerProps> = ({ 
  remainingViews, 
  onShowAuthModal 
}) => {
  if (remainingViews > 5) return null; // Only show when close to limit

  const isAtLimit = remainingViews === 0;

  return (
    <Card className={`mb-6 ${isAtLimit ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAtLimit ? (
              <Lock className="h-5 w-5 text-red-600" />
            ) : (
              <Eye className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {isAtLimit 
                  ? '¡Has alcanzado el límite gratuito!' 
                  : `Te quedan ${remainingViews} páginas gratuitas`
                }
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAtLimit 
                  ? 'Regístrate gratis para acceso ilimitado a todo el directorio'
                  : 'Regístrate gratis para ver ingredientes ilimitados y guardar favoritos'
                }
              </p>
            </div>
          </div>
          <Button 
            onClick={onShowAuthModal}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Star className="h-4 w-4" />
            <span>Registro Gratuito</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
