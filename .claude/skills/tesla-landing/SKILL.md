---
name: tesla-landing
description: Trabajo en el proyecto TESLA Landing (landing page + chatbot PILi de TESLA Electricidad y Automatización S.A.C.). Úsalo para cualquier tarea de desarrollo, debug, deploy o revisión dentro de la carpeta tesla-landing — frontend (index.html/main.js), backend serverless (api/, lib/), Supabase, o deploy a Vercel.
---

# TESLA Landing — Skill de trabajo

Este skill delimita el trabajo al proyecto **TESLA Landing** (carpeta `tesla-landing/`, repo Git propio).

## Reglas de alcance

1. Trabaja **únicamente** dentro de `tesla-landing/`. Las carpetas hermanas (`OYP_LANDIG_PAGE/`, `remix-tesla-bim-mep-portfolio/`, `docs/`) son proyectos distintos — no los edites ni los uses como referencia salvo que el usuario lo pida explícitamente.
2. Antes de dar por bueno un cambio de frontend, verifícalo levantando el preview local (`server-local.js`, puerto 3001) y probando en el navegador — no te quedes solo con la lectura del código.
3. Antes de desplegar a producción (`vercel --prod`), confírmalo con el usuario salvo que lo haya pedido explícitamente en ese mismo turno.

## Contexto del proyecto

Ver [`CLAUDE.md`](../../CLAUDE.md) en la raíz de `tesla-landing/` para: arquitectura (frontend vanilla JS + Tailwind, backend serverless Vercel, Supabase, chatbot PILi multi-agente con Gemini), estado del deploy (proyecto Vercel, dominio de producción, que el push a GitHub NO auto-despliega), e historial de bugs arreglados.

## Memoria de trabajo

Las decisiones y el progreso de este proyecto también se guardan en la memoria persistente de Claude (tipo `project` y `feedback`), para que sesiones futuras —incluso fuera de esta carpeta— recuerden el contexto. Revisa esa memoria al empezar una tarea aquí.
