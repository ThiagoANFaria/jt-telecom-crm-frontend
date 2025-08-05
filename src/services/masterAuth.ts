import { supabase } from '@/integrations/supabase/client';

export class MasterAuthService {
  static async createMasterUser() {
    try {
      // Primeiro, tenta fazer signup do usuário master
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'master@jttelecom.com',
        password: 'JTMaster2024!',
        options: {
          emailRedirectTo: `${window.location.origin}/master`,
          data: {
            name: 'Super Administrador Master',
            user_level: 'master'
          }
        }
      });

      if (authError && authError.message !== 'User already registered') {
        throw authError;
      }

      // Se o usuário foi criado ou já existe, vamos atualizar/criar o perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'master@jttelecom.com',
            name: 'Super Administrador Master',
            user_level: 'master',
            tenant_id: null,
            is_active: true
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao criar usuário master:', error);
      return { success: false, error };
    }
  }

  static async ensureMasterExists() {
    try {
      // Verificar se já existe um perfil master
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'master@jttelecom.com')
        .eq('user_level', 'master')
        .single();

      if (!existingProfile) {
        // Se não existe, criar o usuário master
        await this.createMasterUser();
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao verificar usuário master:', error);
      return { success: false, error };
    }
  }
}