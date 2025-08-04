import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_level: 'master' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Criar perfil se não existir
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                  email: user.email,
                  user_level: 'user'
                }
              ])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              setProfile(newProfile as Profile);
            }
          }
        } else {
          setProfile(data as Profile);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    isAdmin: profile?.user_level === 'admin',
    isMaster: profile?.user_level === 'master',
    isUser: profile?.user_level === 'user'
  };
};