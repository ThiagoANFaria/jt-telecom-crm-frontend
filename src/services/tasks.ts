import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export class TasksService {
  
  // Buscar todas as tarefas do usuário
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de tarefas:', error);
      throw error;
    }
  }

  // Criar nova tarefa
  async createTask(taskData: Omit<TaskInsert, 'user_id'>, userId: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: userId,
          status: taskData.status || 'pendente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Atualizar tarefa
  async updateTask(taskId: string, updates: TaskUpdate, userId: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  // Deletar tarefa
  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar tarefa:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  }

  // Marcar tarefa como concluída
  async completeTask(taskId: string, userId: string): Promise<Task> {
    try {
      return await this.updateTask(taskId, { 
        status: 'completed',
        updated_at: new Date().toISOString()
      }, userId);
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      throw error;
    }
  }

  // Buscar tarefas com filtros
  async searchTasks(searchTerm: string, userId: string, filters?: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    due_date_start?: string;
    due_date_end?: string;
  }): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId);

      // Aplicar filtro de busca por texto
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Aplicar filtros adicionais
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.assigned_to && filters.assigned_to !== 'all') {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.due_date_start) {
        query = query.gte('due_date', filters.due_date_start);
      }

      if (filters?.due_date_end) {
        query = query.lte('due_date', filters.due_date_end);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  }

  // Buscar tarefas por status
  async getTasksByStatus(status: string, userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas por status:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas por status:', error);
      throw error;
    }
  }

  // Buscar tarefas por prioridade
  async getTasksByPriority(priority: string, userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .eq('priority', priority)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas por prioridade:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas por prioridade:', error);
      throw error;
    }
  }

  // Buscar tarefas vencidas
  async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .lt('due_date', today)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas vencidas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas vencidas:', error);
      throw error;
    }
  }

  // Buscar tarefas do dia
  async getTodayTasks(userId: string): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .eq('due_date', today)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas do dia:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas do dia:', error);
      throw error;
    }
  }

  // Buscar tarefas da próxima semana
  async getUpcomingTasks(userId: string, days: number = 7): Promise<Task[]> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('user_id', userId)
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas próximas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tarefas próximas:', error);
      throw error;
    }
  }

  // Obter estatísticas de tarefas
  async getTaskStats(userId: string): Promise<any> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      const total = tasks?.length || 0;
      const pending = tasks?.filter(t => t.status === 'pending').length || 0;
      const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0;
      const completed = tasks?.filter(t => t.status === 'completed').length || 0;
      const cancelled = tasks?.filter(t => t.status === 'cancelled').length || 0;

      // Prioridades
      const high = tasks?.filter(t => t.priority === 'high').length || 0;
      const medium = tasks?.filter(t => t.priority === 'medium').length || 0;
      const low = tasks?.filter(t => t.priority === 'low').length || 0;

      // Vencidas
      const today = new Date().toISOString().split('T')[0];
      const overdue = tasks?.filter(t => 
        t.due_date && 
        t.due_date < today && 
        t.status !== 'completed' && 
        t.status !== 'cancelled'
      ).length || 0;

      // Tarefas criadas este mês
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonth = tasks?.filter(t => {
        const taskDate = new Date(t.created_at);
        return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
      }).length || 0;

      // Taxa de conclusão
      const completionRate = total > 0 ? (completed / total * 100) : 0;

      return {
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        high,
        medium,
        low,
        overdue,
        thisMonth,
        completionRate: Math.round(completionRate),
        byStatus: {
          pending,
          in_progress: inProgress,
          completed,
          cancelled
        },
        byPriority: {
          high,
          medium,
          low
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Atribuir tarefa a outro usuário
  async assignTask(taskId: string, assignedTo: string, userId: string): Promise<Task> {
    try {
      return await this.updateTask(taskId, { 
        assigned_to: assignedTo,
        updated_at: new Date().toISOString()
      }, userId);
    } catch (error) {
      console.error('Erro ao atribuir tarefa:', error);
      throw error;
    }
  }

  // Buscar tarefa por ID
  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          leads:lead_id(name),
          clients:client_id(name)
        `)
        .eq('id', taskId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar tarefa:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      throw error;
    }
  }

  // Duplicar tarefa
  async duplicateTask(taskId: string, userId: string): Promise<Task> {
    try {
      const originalTask = await this.getTaskById(taskId, userId);
      if (!originalTask) {
        throw new Error('Tarefa não encontrada');
      }

      const { id, created_at, updated_at, ...taskData } = originalTask;
      
      return await this.createTask({
        ...taskData,
        title: `${taskData.title} (Cópia)`,
        status: 'pending'
      }, userId);
    } catch (error) {
      console.error('Erro ao duplicar tarefa:', error);
      throw error;
    }
  }
}

export const tasksService = new TasksService();

// Real-time subscriptions para tarefas
export const taskRealtimeService = {
  // Subscrever mudanças em tarefas do usuário
  subscribeToUserTasks(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tasks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Limpar subscrições
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};