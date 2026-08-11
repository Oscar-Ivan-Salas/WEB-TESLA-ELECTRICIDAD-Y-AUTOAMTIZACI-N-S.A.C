-- ============================================================
-- TESLA - Configuración de BD (proyecto fckbbohlxfqoyiomyxqm)
-- Ejecutar todo en: Supabase Dashboard > SQL Editor > New Query > Run
--
-- Crea/resetea el ADMIN con tu correo real para que la
-- recuperación de contraseña por email funcione.
--
--   Correo:   oyp.solucionesdeingenieria@gmail.com
--   Clave:    admin1234   (CAMBIALA luego de entrar por primera vez)
-- ============================================================

-- 1) Crear tabla leads (si no existe)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nombre text,
  telefono text,
  servicio_interes text,
  etapa text,
  ubicacion text,
  resumen_chat text,
  estado text DEFAULT 'Nuevo',
  contactado_whatsapp boolean DEFAULT false,
  fecha_contacto timestamptz,
  respondio_whatsapp boolean DEFAULT false,
  fecha_respuesta timestamptz,
  cita_agendada boolean DEFAULT false,
  fecha_cita timestamptz
);

-- 2) Activar Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3) Políticas de seguridad:
--    - Público (anon): SOLO puede INSERTAR leads (el chatbot guarda).
--    - Staff logueado (authenticated): puede LEER y EDITAR leads (dashboard).
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "leads_auth_select" ON public.leads;
CREATE POLICY "leads_auth_select" ON public.leads
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "leads_auth_update" ON public.leads;
CREATE POLICY "leads_auth_update" ON public.leads
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4) Crear o resetear el ADMIN con tu correo real
UPDATE auth.users
SET encrypted_password = crypt('admin1234', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'oyp.solucionesdeingenieria@gmail.com';

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
SELECT '00000000-0000-0000-0000-000000000000',
       gen_random_uuid(),
       'authenticated',
       'authenticated',
       'oyp.solucionesdeingenieria@gmail.com',
       crypt('admin1234', gen_salt('bf')),
       now(),
       '{"provider":"email","providers":["email"]}',
       '{}',
       now(),
       now(),
       '',
       '',
       '',
       ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'oyp.solucionesdeingenieria@gmail.com'
);

-- 5) Registrar la identidad del nuevo usuario (requerido en versiones recientes)
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, email)
SELECT gen_random_uuid()::text,
       u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email',
       now(),
       now(),
       now(),
       u.email
FROM auth.users u
WHERE u.email = 'oyp.solucionesdeingenieria@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id);

-- 6) Verificación:
--    Copia y pega este SELECT para confirmar que el usuario quedó creado:
--    SELECT id, email, email_confirmed_at FROM auth.users
--    WHERE email = 'oyp.solucionesdeingenieria@gmail.com';
--
--    Si el SQL del paso 4/5 falla por la versión de Supabase, hazlo por UI:
--    Authentication > Users > Add User
--    Email: oyp.solucionesdeingenieria@gmail.com
--    Password: admin1234
--    Marca "Auto-confirm user" > Create User.
