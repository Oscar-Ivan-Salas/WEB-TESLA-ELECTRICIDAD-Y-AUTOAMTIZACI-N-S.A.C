-- ============================================================
-- TESLA - Tabla routing_events (proyecto fckbbohlxfqoyiomyxqm)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query > Run
--
-- Registra qué agente especialista de PILi atendió cada mensaje,
-- para que el panel admin-cerebro.html pueda mostrar el enrutamiento
-- en vivo en vez de datos simulados. Diseño genérico y reusable:
-- cualquier otro agente/negocio puede loguear aquí sus propios eventos
-- de enrutamiento con las mismas columnas (session_id, agent_id,
-- agent_name, message_snippet).
-- ============================================================

-- 1) Crear tabla (si no existe)
CREATE TABLE IF NOT EXISTS public.routing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id text,
  agent_id text NOT NULL,
  agent_name text,
  message_snippet text
);

-- Índice para leer rápido "el evento más reciente"
CREATE INDEX IF NOT EXISTS routing_events_created_at_idx
  ON public.routing_events (created_at DESC);

-- 2) Activar Row Level Security
ALTER TABLE public.routing_events ENABLE ROW LEVEL SECURITY;

-- 3) Políticas de seguridad (mismo patrón que la tabla leads):
--    - Público (anon): SOLO puede INSERTAR (lo hace api/chat.js al enrutar cada mensaje).
--    - Staff logueado (authenticated): SOLO puede LEER (lo hace admin-cerebro.html).
DROP POLICY IF EXISTS "routing_events_anon_insert" ON public.routing_events;
CREATE POLICY "routing_events_anon_insert" ON public.routing_events
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "routing_events_auth_select" ON public.routing_events;
CREATE POLICY "routing_events_auth_select" ON public.routing_events
  FOR SELECT TO authenticated USING (true);

-- 4) (Opcional, recomendado) Limitar el crecimiento de la tabla: borra eventos
--    de más de 7 días. Puedes correr esto manualmente de vez en cuando, o
--    programarlo como Cron Job en Supabase (Database > Cron Jobs).
-- DELETE FROM public.routing_events WHERE created_at < now() - interval '7 days';
