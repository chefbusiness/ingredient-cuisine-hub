
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSuperAdmin = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_super_admin', {
          user_id: user.id
        });

        if (error) {
          console.error('Error checking super admin status:', error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(data || false);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, [user]);

  const promoteSuperAdmin = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('set_super_admin', {
        user_email: email
      });

      if (error) {
        console.error('Error promoting to super admin:', error);
        return { success: false, error: error.message };
      }

      return { success: true, promoted: data };
    } catch (error) {
      console.error('Error promoting to super admin:', error);
      return { success: false, error: 'Error inesperado' };
    }
  };

  return {
    isSuperAdmin,
    loading,
    promoteSuperAdmin
  };
};
