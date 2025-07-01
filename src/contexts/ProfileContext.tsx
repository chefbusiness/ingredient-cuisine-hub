
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_currency?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updating: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    console.log('🔍 Loading profile for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error loading profile:', error);
        throw error;
      }
      
      console.log('✅ Profile loaded successfully:', data);
      console.log('🖼️ Current avatar_url in profile:', (data as any)?.avatar_url);
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    console.log('📝 Updating profile with data:', updates);
    setUpdating(true);
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Sending update to database:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database update successful');

      // Actualizar estado local inmediatamente
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('🔄 Local profile state updated');

      // Forzar recarga del perfil para asegurar sincronización
      console.log('🔄 Reloading profile to ensure sync...');
      await loadProfile();

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email actualizado",
        description: "Revisa tu nuevo email para confirmar el cambio"
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el email",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente"
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la contraseña",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      console.error('❌ No user found for avatar upload');
      return;
    }

    console.log('🚀 Starting avatar upload process...');
    console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });
    console.log('👤 User ID:', user.id);

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log('📤 Uploading to storage with filename:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Error de subida: ${uploadError.message}`);
      }

      console.log('✅ Upload successful, getting public URL');

      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL obtained:', publicUrl);

      // Actualizar perfil con nueva URL y forzar recarga
      await updateProfile({ avatar_url: publicUrl });

      console.log('✅ Avatar upload process completed successfully');

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se ha actualizado correctamente"
      });

    } catch (error) {
      console.error('❌ Error in uploadAvatar function:', error);
      toast({
        title: "Error",
        description: `No se pudo subir la foto de perfil: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const value = {
    profile,
    loading,
    updating,
    updateProfile,
    updateEmail,
    updatePassword,
    uploadAvatar,
    refreshProfile: loadProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
