-- Criar tabela de pipelines
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de estágios
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE
);

-- Criar tabela de deals/negócios
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pipeline_id UUID NOT NULL,
  stage_id UUID NOT NULL,
  lead_id UUID,
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL
);

-- Habilitar RLS
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pipelines
CREATE POLICY "Users can manage their own pipelines" ON public.pipelines
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para estágios
CREATE POLICY "Users can manage stages of their pipelines" ON public.pipeline_stages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.pipelines 
    WHERE pipelines.id = pipeline_stages.pipeline_id 
    AND pipelines.user_id = auth.uid()
  )
);

-- Políticas RLS para deals
CREATE POLICY "Users can manage their own deals" ON public.deals
FOR ALL USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_pipelines_updated_at
BEFORE UPDATE ON public.pipelines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at
BEFORE UPDATE ON public.pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir pipeline padrão para demonstração
INSERT INTO public.pipelines (user_id, name, description) 
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'Pipeline Padrão', 
  'Pipeline de vendas principal'
);

-- Inserir estágios padrão
INSERT INTO public.pipeline_stages (pipeline_id, name, position, color) 
SELECT 
  p.id,
  stage_name,
  position,
  color
FROM public.pipelines p,
(VALUES 
  ('Prospecção', 1, '#8B5CF6'),
  ('Qualificação', 2, '#3B82F6'),
  ('Proposta', 3, '#F59E0B'),
  ('Negociação', 4, '#EF4444'),
  ('Fechado', 5, '#10B981')
) AS stages(stage_name, position, color)
WHERE p.name = 'Pipeline Padrão';