
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Camera, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import BasicInfoSection from '@/components/profile/BasicInfoSection';
import PasswordSection from '@/components/profile/PasswordSection';
import AvatarSection from '@/components/profile/AvatarSection';
import { useResponsive } from '@/hooks/useResponsive';

const Perfil = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("info");

  // Redirect si no está autenticado
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
        <UnifiedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando perfil...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      <UnifiedHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">Administra tu información personal y configuración de cuenta</p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 h-auto' : 'grid-cols-3'}`}>
                  <TabsTrigger value="info" className={`flex items-center gap-2 ${isMobile ? 'justify-start py-3' : ''}`}>
                    <User className="h-4 w-4" />
                    {!isMobile && "Información Personal"}
                    {isMobile && "Info Personal"}
                  </TabsTrigger>
                  <TabsTrigger value="password" className={`flex items-center gap-2 ${isMobile ? 'justify-start py-3' : ''}`}>
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </TabsTrigger>
                  <TabsTrigger value="avatar" className={`flex items-center gap-2 ${isMobile ? 'justify-start py-3' : ''}`}>
                    <Camera className="h-4 w-4" />
                    {!isMobile && "Foto de Perfil"}
                    {isMobile && "Foto"}
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="info" className="space-y-6">
                    <BasicInfoSection profile={profile} user={user} />
                  </TabsContent>

                  <TabsContent value="password" className="space-y-6">
                    <PasswordSection />
                  </TabsContent>

                  <TabsContent value="avatar" className="space-y-6">
                    <AvatarSection profile={profile} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
