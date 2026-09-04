-- ============================================================================
-- TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
-- Esquema operativo v1.0  —  PostgreSQL 15+ / Supabase
--
-- Ejecutar completo en el SQL Editor de Supabase.
-- Idempotente: puede reejecutarse sin destruir datos existentes.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists vector;

-- ============================================================================
-- 1. TIPOS
-- ============================================================================

do $$ begin
  create type estado_cotizacion as enum
    ('borrador','enviada','aceptada','rechazada','vencida','anulada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_orden as enum
    ('programada','en_ejecucion','ejecutada','anulada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_documento as enum
    ('borrador','en_revision','emitido','anulado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_documento as enum
    ('cert_sistema_electrico','cert_aire_acondicionado','cert_pozo_tierra',
     'cert_grupo_electrogeno','cert_luces_emergencia','informe_tecnico','cotizacion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type nivel_criticidad as enum ('critico','mayor','menor','observacion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type conformidad as enum
    ('conforme','conforme_con_observaciones','no_conforme');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rol_usuario as enum ('gerente','ingeniero','asesor','tecnico');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. FUNCIONES DE VALIDACIÓN
-- ============================================================================

-- Valida un RUC peruano con su dígito verificador (módulo 11).
-- Habría rechazado el 20801138787 que apareció en el contrato de Aymar.
create or replace function fn_ruc_valido(p_ruc text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_pesos int[] := array[5,4,3,2,7,6,5,4,3,2];
  v_suma  int := 0;
  v_i     int;
  v_dv    int;
begin
  if p_ruc is null or p_ruc !~ '^[0-9]{11}$' then
    return false;
  end if;

  -- Tipos válidos: 10 y 15/16/17 persona natural, 20 persona jurídica
  if left(p_ruc, 2) not in ('10','15','16','17','20') then
    return false;
  end if;

  for v_i in 1..10 loop
    v_suma := v_suma + (substr(p_ruc, v_i, 1))::int * v_pesos[v_i];
  end loop;

  v_dv := 11 - (v_suma % 11);
  if v_dv = 10 then v_dv := 0; end if;
  if v_dv = 11 then v_dv := 1; end if;

  return v_dv = substr(p_ruc, 11, 1)::int;
end;
$$;

comment on function fn_ruc_valido is
  'Valida RUC peruano por módulo 11. Verificado contra 20601138787 (Tesla), '
  '20492574652 (L&A Medic), 20551663401 (Aymar) y 20612301493 (Global Metric).';

-- ============================================================================
-- 3. USUARIOS Y ROLES
-- ============================================================================

create table if not exists perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nombres      text not null,
  rol          rol_usuario not null default 'asesor',
  telefono     text,
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);

-- Devuelve el rol del usuario autenticado. Se usa en las políticas RLS.
create or replace function fn_rol_actual()
returns rol_usuario
language sql
stable
security definer
set search_path = public
as $$
  select rol from perfiles where id = auth.uid();
$$;

-- ============================================================================
-- 4. CLIENTES
-- ============================================================================

create table if not exists clientes (
  id             uuid primary key default uuid_generate_v4(),
  razon_social   text not null,
  ruc            text not null unique,
  direccion_fiscal text,
  distrito       text,
  provincia      text,
  departamento   text default 'Lima',
  rubro          text,
  activo         boolean not null default true,
  creado_en      timestamptz not null default now(),
  creado_por     uuid references perfiles(id),
  constraint ck_clientes_ruc check (fn_ruc_valido(ruc))
);

create index if not exists ix_clientes_ruc on clientes(ruc);
create index if not exists ix_clientes_razon on clientes using gin (to_tsvector('spanish', razon_social));

-- Un cliente puede tener varios locales. Cada certificado se emite por local.
create table if not exists sedes (
  id            uuid primary key default uuid_generate_v4(),
  cliente_id    uuid not null references clientes(id) on delete cascade,
  nombre        text not null,
  direccion     text not null,
  distrito      text not null,
  departamento  text not null default 'Lima',
  tipo_local    text,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

create index if not exists ix_sedes_cliente on sedes(cliente_id);

create table if not exists contactos (
  id          uuid primary key default uuid_generate_v4(),
  cliente_id  uuid not null references clientes(id) on delete cascade,
  sede_id     uuid references sedes(id) on delete set null,
  nombres     text not null,
  cargo       text,
  telefono    text,
  email       text,
  principal   boolean not null default false,
  creado_en   timestamptz not null default now()
);

create index if not exists ix_contactos_cliente on contactos(cliente_id);

-- ============================================================================
-- 5. CATÁLOGO DE SERVICIOS Y PRECIOS
-- ============================================================================

-- Las 8 especialidades. Sustituyen a los 8 system prompts quemados en el código.
create table if not exists categorias_servicio (
  id          text primary key,
  nombre      text not null,
  descripcion text,
  orden       int not null default 0,
  activo      boolean not null default true
);

insert into categorias_servicio (id, nombre, orden) values
  ('ELECTRICIDAD',   'Infraestructura Eléctrica Integral', 1),
  ('AUTOMATIZACION', 'Automatización y BMS',               2),
  ('INCENDIOS',      'Sistemas Contra Incendios',          3),
  ('SEGURIDAD',      'Vigilancia y Control 24/7',          4),
  ('ACABADOS',       'Acabados Funcionales Integrados',    5),
  ('ITSE',           'Ingeniería y Defensa Civil ITSE',    6),
  ('BIM_MEP',        'Ingeniería y Coordinación BIM / MEP',7),
  ('INTEGRAL',       'Solución Integral Llave en Mano',    8)
on conflict (id) do nothing;

create table if not exists servicios (
  id              uuid primary key default uuid_generate_v4(),
  categoria_id    text not null references categorias_servicio(id),
  codigo          text unique,
  nombre          text not null,
  descripcion     text,
  unidad          text not null default 'Servicio',
  precio_base     numeric(12,2),
  requiere_visita boolean not null default true,
  genera_documento tipo_documento,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  constraint ck_servicios_precio check (precio_base is null or precio_base >= 0)
);

create index if not exists ix_servicios_categoria on servicios(categoria_id);

-- Historial de precios: nunca se pisa un precio, se cierra y se abre otro.
create table if not exists historial_precios (
  id             uuid primary key default uuid_generate_v4(),
  servicio_id    uuid not null references servicios(id) on delete cascade,
  precio         numeric(12,2) not null check (precio >= 0),
  vigente_desde  date not null default current_date,
  vigente_hasta  date,
  motivo         text,
  registrado_por uuid references perfiles(id),
  creado_en      timestamptz not null default now(),
  constraint ck_precios_rango check (vigente_hasta is null or vigente_hasta >= vigente_desde)
);

create index if not exists ix_precios_servicio on historial_precios(servicio_id, vigente_desde desc);

-- ============================================================================
-- 6. PROVEEDORES E INSUMOS
-- ============================================================================

create table if not exists proveedores (
  id          uuid primary key default uuid_generate_v4(),
  razon_social text not null,
  ruc         text unique,
  contacto    text,
  telefono    text,
  email       text,
  activo      boolean not null default true,
  constraint ck_proveedores_ruc check (ruc is null or fn_ruc_valido(ruc))
);

create table if not exists insumos (
  id          uuid primary key default uuid_generate_v4(),
  codigo      text unique,
  descripcion text not null,
  unidad      text not null default 'Unidad',
  marca       text,
  categoria_id text references categorias_servicio(id),
  activo      boolean not null default true
);

create table if not exists precios_proveedor (
  id                 uuid primary key default uuid_generate_v4(),
  proveedor_id       uuid not null references proveedores(id) on delete cascade,
  insumo_id          uuid not null references insumos(id) on delete cascade,
  precio             numeric(12,2) not null check (precio >= 0),
  moneda             char(3) not null default 'PEN',
  plazo_entrega_dias int,
  fecha_lista        date not null default current_date,
  vigente_hasta      date,
  fuente             text,
  creado_en          timestamptz not null default now()
);

create index if not exists ix_precprov_insumo on precios_proveedor(insumo_id, fecha_lista desc);

-- ============================================================================
-- 7. RECURSOS: PROFESIONALES E INSTRUMENTOS
-- ============================================================================

create table if not exists profesionales (
  id                       uuid primary key default uuid_generate_v4(),
  perfil_id                uuid references perfiles(id),
  nombres                  text not null,
  cip                      text not null unique,
  especialidad             text not null default 'Ingeniero Electricista',
  habilitado               boolean not null default false,
  fecha_verificacion       date,
  habilitacion_vigente_hasta date,
  firma_url                text,
  activo                   boolean not null default true,
  creado_en                timestamptz not null default now()
);

comment on column profesionales.fecha_verificacion is
  'Fecha en que se consultó el registro del CIP. Se imprime en el certificado.';

create table if not exists instrumentos (
  id        uuid primary key default uuid_generate_v4(),
  tipo      text not null,
  marca     text not null,
  modelo    text not null,
  serie     text not null unique,
  rango     text,
  activo    boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists calibraciones (
  id                 uuid primary key default uuid_generate_v4(),
  instrumento_id     uuid not null references instrumentos(id) on delete cascade,
  certificado_nro    text not null,
  laboratorio        text not null,
  laboratorio_ruc    text,
  fecha_calibracion  date not null,
  fecha_vencimiento  date not null,
  incertidumbre_k2   text,
  trazabilidad       text default 'Dirección de Metrología del INACAL',
  archivo_url        text,
  creado_en          timestamptz not null default now(),
  constraint ck_calib_fechas check (fecha_vencimiento > fecha_calibracion),
  constraint ck_calib_lab_ruc check (laboratorio_ruc is null or fn_ruc_valido(laboratorio_ruc))
);

create index if not exists ix_calib_instrumento on calibraciones(instrumento_id, fecha_vencimiento desc);

-- ¿El instrumento tenía calibración vigente en una fecha dada?
create or replace function fn_instrumento_vigente(p_instrumento uuid, p_fecha date)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from calibraciones c
    where c.instrumento_id = p_instrumento
      and p_fecha between c.fecha_calibracion and c.fecha_vencimiento
  );
$$;

comment on function fn_instrumento_vigente is
  'Detecta el conflicto encontrado en agosto de 2026: un certificado fechado '
  'antes de la calibración GM-345-2025 (16/09/2025) no tiene respaldo metrológico.';

-- ============================================================================
-- 8. COTIZACIONES  (FASE 1)
-- ============================================================================

create table if not exists cotizaciones (
  id              uuid primary key default uuid_generate_v4(),
  correlativo     text unique,
  cliente_id      uuid not null references clientes(id),
  sede_id         uuid references sedes(id),
  contacto_id     uuid references contactos(id),
  estado          estado_cotizacion not null default 'borrador',
  fecha_emision   date,
  validez_dias    int not null default 15 check (validez_dias > 0),
  fecha_vencimiento date generated always as (fecha_emision + validez_dias) stored,
  moneda          char(3) not null default 'PEN',
  subtotal        numeric(12,2) not null default 0,
  descuento_pct   numeric(5,4) not null default 0 check (descuento_pct between 0 and 1),
  descuento_monto numeric(12,2) not null default 0,
  valor_venta     numeric(12,2) not null default 0,
  igv_pct         numeric(5,4) not null default 0.18 check (igv_pct between 0 and 1),
  igv_monto       numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  condiciones     jsonb not null default '{}'::jsonb,
  archivo_url     text,
  creado_por      uuid references perfiles(id),
  aprobado_por    uuid references perfiles(id),
  aprobado_en     timestamptz,
  enviado_en      timestamptz,
  creado_en       timestamptz not null default now(),
  -- El correlativo solo existe cuando deja de ser borrador
  constraint ck_cot_correlativo check (
    (estado = 'borrador' and correlativo is null) or
    (estado <> 'borrador' and correlativo is not null and fecha_emision is not null)
  )
);

create index if not exists ix_cot_cliente on cotizaciones(cliente_id, creado_en desc);
create index if not exists ix_cot_estado  on cotizaciones(estado);

create table if not exists cotizacion_items (
  id              uuid primary key default uuid_generate_v4(),
  cotizacion_id   uuid not null references cotizaciones(id) on delete cascade,
  orden           int not null,
  servicio_id     uuid references servicios(id),
  descripcion     text not null,
  unidad          text not null default 'Servicio',
  cantidad        numeric(12,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  importe         numeric(12,2) generated always as (round(cantidad * precio_unitario, 2)) stored,
  unique (cotizacion_id, orden)
);

create index if not exists ix_coti_cot on cotizacion_items(cotizacion_id);

-- Recalcula los totales cada vez que cambian los ítems. La IA nunca calcula montos.
create or replace function fn_recalcular_cotizacion()
returns trigger
language plpgsql
as $$
declare
  v_cot uuid := coalesce(new.cotizacion_id, old.cotizacion_id);
  v_sub numeric(12,2);
begin
  select coalesce(sum(importe), 0) into v_sub
    from cotizacion_items where cotizacion_id = v_cot;

  update cotizaciones set
    subtotal        = v_sub,
    descuento_monto = round(v_sub * descuento_pct, 2),
    valor_venta     = round(v_sub - round(v_sub * descuento_pct, 2), 2),
    igv_monto       = round((v_sub - round(v_sub * descuento_pct, 2)) * igv_pct, 2),
    total           = round((v_sub - round(v_sub * descuento_pct, 2))
                            * (1 + igv_pct), 2)
  where id = v_cot;

  return null;
end;
$$;

drop trigger if exists tg_recalcular_cotizacion on cotizacion_items;
create trigger tg_recalcular_cotizacion
  after insert or update or delete on cotizacion_items
  for each row execute function fn_recalcular_cotizacion();

-- Correlativo por año: TESLA-COT-2026-001
create table if not exists correlativos (
  tipo   tipo_documento not null,
  anio   int not null,
  ultimo int not null default 0,
  primary key (tipo, anio)
);

create or replace function fn_siguiente_correlativo(p_tipo tipo_documento, p_prefijo text)
returns text
language plpgsql
as $$
declare
  v_anio int := extract(year from current_date);
  v_num  int;
begin
  insert into correlativos (tipo, anio, ultimo) values (p_tipo, v_anio, 1)
    on conflict (tipo, anio) do update set ultimo = correlativos.ultimo + 1
    returning ultimo into v_num;
  return format('TESLA-%s-%s-%s', p_prefijo, v_anio, lpad(v_num::text, 3, '0'));
end;
$$;

-- ============================================================================
-- 9. ÓRDENES DE TRABAJO Y MEDICIONES  (FASE 2)
-- ============================================================================

create table if not exists ordenes_trabajo (
  id              uuid primary key default uuid_generate_v4(),
  correlativo     text unique,
  cotizacion_id   uuid references cotizaciones(id),
  cliente_id      uuid not null references clientes(id),
  sede_id         uuid not null references sedes(id),
  estado          estado_orden not null default 'programada',
  fecha_programada date,
  fecha_ejecucion  date,
  tecnico_id      uuid references perfiles(id),
  profesional_id  uuid references profesionales(id),
  observaciones   text,
  creado_en       timestamptz not null default now()
);

create index if not exists ix_ot_cliente on ordenes_trabajo(cliente_id, fecha_ejecucion desc);

-- Doble entrada ciega: el técnico escribe primero, la IA lee después.
create table if not exists mediciones (
  id                uuid primary key default uuid_generate_v4(),
  orden_id          uuid not null references ordenes_trabajo(id) on delete cascade,
  tipo              text not null,
  punto             text not null,
  numero_lectura    int not null check (numero_lectura > 0),
  valor_tecnico     numeric(12,3) not null,
  valor_ia          numeric(12,3),
  valor_confirmado  numeric(12,3),
  unidad            text not null default 'Ω',
  instrumento_id    uuid not null references instrumentos(id),
  foto_url          text,
  coincide          boolean generated always as (
                      valor_ia is not null
                      and abs(valor_tecnico - valor_ia) < 0.05
                    ) stored,
  confirmado_por    uuid references perfiles(id),
  confirmado_en     timestamptz,
  medido_en         timestamptz not null default now(),
  unique (orden_id, punto, numero_lectura)
);

create index if not exists ix_med_orden on mediciones(orden_id);

comment on column mediciones.valor_tecnico is
  'Lo escribe el técnico ANTES de que la IA vea la foto. Orden obligatorio.';
comment on column mediciones.valor_ia is
  'Lectura propuesta por el modelo. Nunca sustituye al valor del técnico.';

create table if not exists fotos (
  id            uuid primary key default uuid_generate_v4(),
  orden_id      uuid not null references ordenes_trabajo(id) on delete cascade,
  medicion_id   uuid references mediciones(id) on delete set null,
  url           text not null,
  descripcion   text,
  criticidad    nivel_criticidad,
  tomada_en     timestamptz not null default now(),
  subida_por    uuid references perfiles(id)
);

-- ============================================================================
-- 10. DOCUMENTOS EMITIDOS Y VENCIMIENTOS
-- ============================================================================

create table if not exists documentos (
  id                uuid primary key default uuid_generate_v4(),
  correlativo       text unique,
  tipo              tipo_documento not null,
  orden_id          uuid references ordenes_trabajo(id),
  cliente_id        uuid not null references clientes(id),
  sede_id           uuid references sedes(id),
  estado            estado_documento not null default 'borrador',
  resultado         conformidad,
  fecha_inspeccion  date,
  fecha_emision     date,
  vigencia_meses    int not null default 12,
  fecha_vencimiento date,
  instrumento_id    uuid references instrumentos(id),
  profesional_id    uuid references profesionales(id),
  archivo_url       text,
  datos             jsonb not null default '{}'::jsonb,
  emitido_por       uuid references perfiles(id),
  firmado_en        timestamptz,
  creado_en         timestamptz not null default now()
);

create index if not exists ix_doc_venc on documentos(fecha_vencimiento)
  where estado = 'emitido';
create index if not exists ix_doc_cliente on documentos(cliente_id, tipo);

-- ---------------------------------------------------------------------------
-- REGLA CENTRAL: no se emite un documento sin respaldo.
-- Bloquea los tres errores reales encontrados en la auditoría de agosto 2026.
-- ---------------------------------------------------------------------------
create or replace function fn_validar_emision()
returns trigger
language plpgsql
as $$
declare
  v_prof profesionales%rowtype;
begin
  if new.estado <> 'emitido' then
    return new;
  end if;

  if new.fecha_inspeccion is null then
    raise exception 'No se puede emitir sin fecha de inspección.';
  end if;

  -- 1. Instrumento con calibración vigente a la fecha de la inspección
  if new.instrumento_id is not null then
    if not fn_instrumento_vigente(new.instrumento_id, new.fecha_inspeccion) then
      raise exception
        'El instrumento no tenía calibración vigente el %. No se puede emitir.',
        new.fecha_inspeccion;
    end if;
  end if;

  -- 2. Profesional colegiado y habilitado
  if new.profesional_id is not null then
    select * into v_prof from profesionales where id = new.profesional_id;
    if not found or not v_prof.habilitado then
      raise exception 'El profesional no está habilitado. No se puede emitir.';
    end if;
    if v_prof.habilitacion_vigente_hasta is not null
       and v_prof.habilitacion_vigente_hasta < new.fecha_inspeccion then
      raise exception 'La habilitación del CIP % venció el %.',
        v_prof.cip, v_prof.habilitacion_vigente_hasta;
    end if;
  end if;

  -- 3. Correlativo y vencimiento
  if new.correlativo is null then
    raise exception 'Un documento emitido debe tener correlativo.';
  end if;
  if new.fecha_emision is null then
    new.fecha_emision := current_date;
  end if;
  new.fecha_vencimiento := new.fecha_emision + (new.vigencia_meses || ' months')::interval;

  return new;
end;
$$;

drop trigger if exists tg_validar_emision on documentos;
create trigger tg_validar_emision
  before insert or update on documentos
  for each row execute function fn_validar_emision();

-- Vista comercial: qué vence y cuándo. Es el motor de ingresos recurrentes.
create or replace view v_vencimientos as
select
  d.id,
  d.correlativo,
  d.tipo,
  c.razon_social,
  c.ruc,
  s.nombre        as sede,
  s.distrito,
  d.fecha_emision,
  d.fecha_vencimiento,
  (d.fecha_vencimiento - current_date) as dias_restantes,
  case
    when d.fecha_vencimiento < current_date then 'vencido'
    when d.fecha_vencimiento <= current_date + 30 then 'por_vencer'
    else 'vigente'
  end as situacion,
  ct.telefono,
  ct.email
from documentos d
join clientes c on c.id = d.cliente_id
left join sedes s on s.id = d.sede_id
left join contactos ct on ct.cliente_id = c.id and ct.principal
where d.estado = 'emitido'
order by d.fecha_vencimiento;

-- ============================================================================
-- 11. BASE DE CONOCIMIENTO (RAG)
-- ============================================================================

create table if not exists kb_documentos (
  id           uuid primary key default uuid_generate_v4(),
  categoria_id text references categorias_servicio(id),
  titulo       text not null,
  contenido    text not null,
  fuente       text,
  version      int not null default 1,
  activo       boolean not null default true,
  actualizado_en timestamptz not null default now()
);

create table if not exists kb_chunks (
  id            uuid primary key default uuid_generate_v4(),
  documento_id  uuid not null references kb_documentos(id) on delete cascade,
  contenido     text not null,
  embedding     vector(768),
  creado_en     timestamptz not null default now()
);

create index if not exists ix_kb_embedding
  on kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function fn_buscar_conocimiento(
  p_embedding vector(768),
  p_categoria text default null,
  p_limite    int default 5
)
returns table (contenido text, titulo text, similitud float)
language sql
stable
as $$
  select k.contenido,
         d.titulo,
         1 - (k.embedding <=> p_embedding) as similitud
  from kb_chunks k
  join kb_documentos d on d.id = k.documento_id
  where d.activo
    and (p_categoria is null or d.categoria_id = p_categoria)
  order by k.embedding <=> p_embedding
  limit p_limite;
$$;

-- ============================================================================
-- 12. LEADS (canal público) Y AUDITORÍA
-- ============================================================================

create table if not exists leads (
  id            uuid primary key default uuid_generate_v4(),
  nombre        text,
  telefono      text not null,
  email         text,
  ubicacion     text,
  tipo_proyecto text,
  mensaje       text,
  canal         text not null default 'web',
  agente_id     text references categorias_servicio(id),
  cliente_id    uuid references clientes(id),
  atendido      boolean not null default false,
  creado_en     timestamptz not null default now()
);

create index if not exists ix_leads_fecha on leads(creado_en desc);

create table if not exists auditoria (
  id           bigserial primary key,
  tabla        text not null,
  registro_id  uuid,
  accion       text not null,
  usuario_id   uuid,
  datos_antes  jsonb,
  datos_despues jsonb,
  ocurrido_en  timestamptz not null default now()
);

create index if not exists ix_auditoria_tabla on auditoria(tabla, ocurrido_en desc);

create or replace function fn_auditar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into auditoria (tabla, registro_id, accion, usuario_id, datos_antes, datos_despues)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_auditar_documentos on documentos;
create trigger tg_auditar_documentos
  after insert or update or delete on documentos
  for each row execute function fn_auditar();

drop trigger if exists tg_auditar_mediciones on mediciones;
create trigger tg_auditar_mediciones
  after insert or update or delete on mediciones
  for each row execute function fn_auditar();

-- ============================================================================
-- 13. SEGURIDAD A NIVEL DE FILA (RLS)
--
-- Principio: el canal público SOLO puede insertar leads.
-- Todo lo demás exige sesión iniciada.
-- ============================================================================

alter table perfiles            enable row level security;
alter table clientes            enable row level security;
alter table sedes               enable row level security;
alter table contactos           enable row level security;
alter table categorias_servicio enable row level security;
alter table servicios           enable row level security;
alter table historial_precios   enable row level security;
alter table proveedores         enable row level security;
alter table insumos             enable row level security;
alter table precios_proveedor   enable row level security;
alter table profesionales       enable row level security;
alter table instrumentos        enable row level security;
alter table calibraciones       enable row level security;
alter table cotizaciones        enable row level security;
alter table cotizacion_items    enable row level security;
alter table ordenes_trabajo     enable row level security;
alter table mediciones          enable row level security;
alter table fotos               enable row level security;
alter table documentos          enable row level security;
alter table kb_documentos       enable row level security;
alter table kb_chunks           enable row level security;
alter table leads               enable row level security;
alter table auditoria           enable row level security;

-- Único permiso del canal anónimo: registrar un lead.
drop policy if exists pol_leads_insert_anon on leads;
create policy pol_leads_insert_anon on leads
  for insert to anon with check (true);

drop policy if exists pol_leads_lectura on leads;
create policy pol_leads_lectura on leads
  for select to authenticated using (true);

drop policy if exists pol_leads_update on leads;
create policy pol_leads_update on leads
  for update to authenticated using (true);

-- Catálogo público de servicios: solo lectura, y sin precios
-- (la vista de abajo es la que se expone al canal anónimo).
create or replace view v_catalogo_publico as
  select s.id, s.nombre, s.descripcion, s.unidad, c.nombre as categoria
  from servicios s
  join categorias_servicio c on c.id = s.categoria_id
  where s.activo and c.activo;

-- Lectura general para usuarios autenticados
do $$
declare t text;
begin
  foreach t in array array[
    'clientes','sedes','contactos','categorias_servicio','servicios',
    'historial_precios','proveedores','insumos','precios_proveedor',
    'profesionales','instrumentos','calibraciones','cotizaciones',
    'cotizacion_items','ordenes_trabajo','mediciones','fotos','documentos',
    'kb_documentos','kb_chunks','perfiles'
  ] loop
    execute format('drop policy if exists pol_%s_select on %I', t, t);
    execute format(
      'create policy pol_%s_select on %I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- Escritura para usuarios autenticados en las tablas operativas
do $$
declare t text;
begin
  foreach t in array array[
    'clientes','sedes','contactos','cotizaciones','cotizacion_items',
    'ordenes_trabajo','mediciones','fotos','documentos'
  ] loop
    execute format('drop policy if exists pol_%s_write on %I', t, t);
    execute format(
      'create policy pol_%s_write on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- Solo gerencia toca precios y recursos críticos
do $$
declare t text;
begin
  foreach t in array array[
    'servicios','historial_precios','proveedores','insumos','precios_proveedor',
    'profesionales','instrumentos','calibraciones','kb_documentos','kb_chunks'
  ] loop
    execute format('drop policy if exists pol_%s_admin on %I', t, t);
    execute format(
      'create policy pol_%s_admin on %I for all to authenticated '
      'using (fn_rol_actual() in (''gerente'',''ingeniero'')) '
      'with check (fn_rol_actual() in (''gerente'',''ingeniero''))', t, t);
  end loop;
end $$;

-- La auditoría no se edita ni se borra: solo se consulta.
drop policy if exists pol_auditoria_select on auditoria;
create policy pol_auditoria_select on auditoria
  for select to authenticated using (fn_rol_actual() = 'gerente');

-- ============================================================================
-- 14. DATOS INICIALES VERIFICADOS
-- ============================================================================

insert into instrumentos (tipo, marca, modelo, serie, rango)
values ('Telurómetro digital', 'TESTECH', 'KT-480D', '20048144',
        '20 Ω, 200 Ω y 2000 Ω — Earth voltage 0 a 200 VAC')
on conflict (serie) do nothing;

insert into calibraciones (
  instrumento_id, certificado_nro, laboratorio, laboratorio_ruc,
  fecha_calibracion, fecha_vencimiento, incertidumbre_k2)
select i.id, 'GM-345-2025', 'Global Metric Lab E.I.R.L.', '20612301493',
       date '2025-09-16', date '2026-09-16',
       '± 0,12 Ω a ± 0,13 Ω en el rango de 20 Ω'
from instrumentos i where i.serie = '20048144'
on conflict do nothing;

insert into profesionales (nombres, cip, especialidad, habilitado)
values ('Leslie Milton Reinoso Zamudio', '126355', 'Ingeniero Electricista', false)
on conflict (cip) do nothing;

-- Clientes existentes (RUC ya validados contra el algoritmo módulo 11)
insert into clientes (razon_social, ruc, distrito, departamento) values
  ('IMPORTACIONES L & A MEDIC S.A.C', '20492574652', 'San Martín de Porres', 'Lima'),
  ('DISTRIBUIDORA AYMAR MEDIC S.A.C', '20551663401', 'Carabayllo', 'Lima')
on conflict (ruc) do nothing;

-- ============================================================================
-- FIN DEL ESQUEMA
-- ============================================================================
