import { supabase } from '@/integrations/supabase/client';

export class MasterAuthService {
  static async createMasterUser() {
    try {
      console.log('Iniciando criação do usuário Master...');
      
      // Criar o usuário através do signup do Supabase Auth
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

      console.log('Resultado do signup:', { authData, authError });

      if (authError) {
        // Se o erro for que o usuário já existe, isso é esperado
        if (authError.message.includes('User already registered') || 
            authError.message.includes('already been registered')) {
          console.log('Usuário já existe, verificando perfil...');
          
          // Tentar fazer login para pegar o ID do usuário
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'master@jttelecom.com',
            password: 'JTMaster2024!'
          });

          if (loginData.user) {
            // Criar/atualizar o perfil se o login funcionou
            await this.createOrUpdateProfile(loginData.user.id);
            await supabase.auth.signOut(); // Fazer logout após criar o perfil
            return { success: true, message: 'Usuário Master configurado com sucesso!' };
          }
        } else {
          throw authError;
        }
      } else if (authData.user) {
        // Se o usuário foi criado com sucesso, criar o perfil
        console.log('Usuário criado, criando perfil...');
        await this.createOrUpdateProfile(authData.user.id);
        return { success: true, message: 'Usuário Master criado com sucesso!' };
      }

      return { success: false, error: 'Falha ao criar usuário Master' };
    } catch (error: any) {
      console.error('Erro detalhado ao criar usuário master:', error);
      return { success: false, error: error.message };
    }
  }

  static async createOrUpdateProfile(userId: string) {
    try {
      console.log('Criando/atualizando perfil para usuário:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: 'master@jttelecom.com',
          name: 'Super Administrador Master',
          user_level: 'master',
          tenant_id: null,
          is_active: true
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Erro ao criar perfil:', error);
        throw error;
      }

      console.log('Perfil criado/atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao criar/atualizar perfil:', error);
      throw error;
    }
  }

}