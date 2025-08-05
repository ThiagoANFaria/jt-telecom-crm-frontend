-- Criar função para notificar mudanças em deals via realtime
CREATE OR REPLACE FUNCTION notify_deal_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT, UPDATE ou DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM pg_notify('deal_changes', json_build_object(
      'action', 'DELETE',
      'pipeline_id', OLD.pipeline_id,
      'stage_id', OLD.stage_id,
      'deal_id', OLD.id
    )::text);
    RETURN OLD;
  ELSE
    PERFORM pg_notify('deal_changes', json_build_object(
      'action', TG_OP,
      'pipeline_id', NEW.pipeline_id,
      'stage_id', NEW.stage_id,
      'deal_id', NEW.id,
      'deal', row_to_json(NEW)
    )::text);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para notificar mudanças em deals
CREATE TRIGGER deal_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION notify_deal_change();

-- Habilitar realtime para as tabelas do pipeline
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;
ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_stages;