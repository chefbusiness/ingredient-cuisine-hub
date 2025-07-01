
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_currency?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
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

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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
    if (!user) return;

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Eliminar avatar anterior si existe
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Subir nuevo avatar
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      // Actualizar perfil con nueva URL
      await updateProfile({ avatar_url: publicUrl });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto de perfil",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    updateProfile,
    updateEmail,
    updatePassword,
    uploadAvatar,
    refreshProfile: loadProfile
  };
};
