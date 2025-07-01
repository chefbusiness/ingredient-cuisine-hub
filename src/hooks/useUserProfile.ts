
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Interfaz extendida para incluir avatar_url
interface ExtendedUserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_currency?: string;
  created_at: string;
  updated_at: string;
}

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
      setProfile(data as ExtendedUserProfile);
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
      console.log('Updating profile with:', updates);
      
      // Usar casting para bypassed la validación de tipos
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any) // Casting temporal para bypassed validación
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile update successful');
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
    if (!user) {
      console.error('No user found for avatar upload');
      return;
    }

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log('Uploading avatar:', { fileName, fileSize: file.size, userId: user.id });

      // Subir archivo con upsert para sobrescribir automáticamente
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Error de subida: ${uploadError.message}`);
      }

      console.log('Upload successful, getting public URL');

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      console.log('Public URL obtained:', publicUrl);

      // Actualizar perfil con nueva URL usando método directo
      console.log('Updating profile with avatar URL:', publicUrl);
      
      const profileUpdate = {
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate as any) // Casting explícito para bypassed validación
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error after upload:', profileError);
        throw new Error(`Error actualizando perfil: ${profileError.message}`);
      }

      console.log('Profile updated successfully with new avatar URL');

      // Actualizar estado local
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se ha actualizado correctamente"
      });

    } catch (error) {
      console.error('Error in uploadAvatar function:', error);
      toast({
        title: "Error",
        description: `No se pudo subir la foto de perfil: ${error.message}`,
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
