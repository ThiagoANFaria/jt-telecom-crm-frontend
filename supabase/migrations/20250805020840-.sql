-- Criar tabela para histórico de chamadas do PABX
CREATE TABLE public.call_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    external_id TEXT, -- ID da chamada no PABX
    caller TEXT NOT NULL,
    called TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    recording_url TEXT,
    cost NUMERIC(10,2) DEFAULT 0,
    extension TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(external_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
CREATE POLICY "Users can manage their own call history" 
ON public.call_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_call_history_user_id ON public.call_history(user_id);
CREATE INDEX idx_call_history_start_time ON public.call_history(start_time);
CREATE INDEX idx_call_history_caller ON public.call_history(caller);
CREATE INDEX idx_call_history_called ON public.call_history(called);
CREATE INDEX idx_call_history_direction ON public.call_history(direction);
CREATE INDEX idx_call_history_external_id ON public.call_history(external_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_call_history_updated_at
    BEFORE UPDATE ON public.call_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();