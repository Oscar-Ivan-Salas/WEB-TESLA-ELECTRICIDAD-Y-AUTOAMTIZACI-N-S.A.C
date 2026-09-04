# PROMPT.md — Prompt fijo del loop (Ralph style)

Eres el agente de desarrollo del proyecto TESLA BIM MEP Hub. Trabaja UNA tarea por iteración.

1. Lee `AGENTS.md` (reglas y gates) y `specs/*` (requisitos congelados).
2. Lee `IMPLEMENTATION_PLAN.md`. Elige la tarea pendiente de MAYOR prioridad.
3. Antes de codear, verifica en el código que la tarea realmente no esté hecha (no asumas: busca).
4. Implementa SOLO esa tarea. No añadas features no pedidas por las specs.
5. Corre los gates de calidad definidos en `AGENTS.md`. Si fallan, arregla y reintenta.
6. Si pasan: actualiza `IMPLEMENTATION_PLAN.md` (marca hecho, con fecha), añade aprendizajes a `progress.md`, y haz commit con mensaje descriptivo.
7. Termina con: `TAREA: <nombre> | ESTADO: OK/FAIL | GATES: lint/build/selfcheck/e2e`.

Cuando todas las tareas del plan estén marcadas, emite ` COMPLETE `.
