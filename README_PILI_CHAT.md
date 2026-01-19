🤖 PILI CHAT – README TÉCNICO
TESLA Electricidad y Automatización S.A.C.
1️⃣ OBJETIVO DEL SISTEMA

PILI Chat es un asistente conversacional basado en reglas, diseñado para:

Atender clientes desde la web

Guiar la conversación paso a paso

Filtrar clientes reales

Recopilar datos clave

Coordinar una cita técnica

Notificar al responsable vía WhatsApp

Guardar toda la conversación en formato JSON

⚠️ No usa IA en esta versión.
Todo funciona con lógica determinística.

2️⃣ ARQUITECTURA GENERAL
[ Frontend (Web) ]
        |
        | POST /chat
        |
[ Backend PILI ]
        |
        ├── Lógica conversacional
        ├── Gestión de estados
        ├── Base de datos (JSON / SQLite)
        └── Notificación WhatsApp

3️⃣ CONCEPTO CLAVE: ESTADO DE CONVERSACIÓN

Cada cliente tiene un estado.

START
  ↓
ASK_PROJECT_TYPE
  ↓
ASK_STAGE
  ↓
ASK_SERVICES
  ↓
FILTER_SERIOUS
  ↓
ASK_CONTACT_DATA
  ↓
ASK_APPOINTMENT
  ↓
CONFIRM_APPOINTMENT
  ↓
LEAD_CONFIRMED


El backend nunca improvisa.
Solo responde según el estado actual.

4️⃣ MODELO DE DATOS (BD)
Estructura mínima del cliente
{
  "session_id": "uuid",
  "nombre": null,
  "telefono": null,
  "correo": null,
  "tipo_proyecto": null,
  "etapa": null,
  "servicios": [],
  "cita": {
    "fecha": null,
    "hora": null
  },
  "estado": "START",
  "historial_chat": []
}

5️⃣ ENDPOINT PRINCIPAL
POST /chat

Request:

{
  "session_id": "uuid",
  "message": "Texto del cliente"
}


Response:

{
  "reply": "Respuesta de PILI"
}

6️⃣ LÓGICA PRINCIPAL (PSEUDOCÓDIGO)
def handle_message(session_id, message):
    cliente = load_cliente(session_id)

    save_to_history(cliente, "cliente", message)

    if cliente.estado == "START":
        reply = saludo()
        cliente.estado = "ASK_PROJECT_TYPE"

    elif cliente.estado == "ASK_PROJECT_TYPE":
        cliente.tipo_proyecto = parse_project_type(message)
        reply = ask_stage()
        cliente.estado = "ASK_STAGE"

    elif cliente.estado == "ASK_STAGE":
        cliente.etapa = parse_stage(message)
        reply = ask_services()
        cliente.estado = "ASK_SERVICES"

    elif cliente.estado == "ASK_SERVICES":
        cliente.servicios = parse_services(message)
        reply = filter_serious()
        cliente.estado = "FILTER_SERIOUS"

    elif cliente.estado == "FILTER_SERIOUS":
        if is_serious(message):
            reply = ask_contact_data()
            cliente.estado = "ASK_CONTACT_DATA"
        else:
            reply = polite_exit()
            cliente.estado = "END"

    elif cliente.estado == "ASK_CONTACT_DATA":
        save_contact_data(cliente, message)
        reply = ask_appointment()
        cliente.estado = "ASK_APPOINTMENT"

    elif cliente.estado == "ASK_APPOINTMENT":
        cliente.cita = parse_appointment(message)
        reply = confirm_appointment(cliente.cita)
        cliente.estado = "CONFIRM_APPOINTMENT"

    elif cliente.estado == "CONFIRM_APPOINTMENT":
        if confirm_yes(message):
            notify_whatsapp(cliente)
            reply = closing_message()
            cliente.estado = "LEAD_CONFIRMED"
        else:
            reply = reschedule()

    save_cliente(cliente)
    save_to_history(cliente, "pili", reply)

    return reply

7️⃣ RESPUESTAS PREDEFINIDAS (COPY)
Saludo
Hola, soy PILI, asistente técnica de TESLA Electricidad y Automatización.
Puedo ayudarte a evaluar tu proyecto y coordinar una cita técnica.
¿En qué tipo de proyecto estás trabajando?

Filtro
¿Estás buscando solo información general o una evaluación técnica para tu proyecto?

Cierre
Gracias. El especialista de TESLA se comunicará contigo para confirmar la evaluación técnica.

8️⃣ NOTIFICACIÓN WHATSAPP
Trigger

Cuando estado == LEAD_CONFIRMED

Mensaje enviado:
🔔 PILI – Nuevo cliente interesado
Nombre: {{nombre}}
Proyecto: {{tipo_proyecto}}
Etapa: {{etapa}}
Servicios: {{servicios}}
Cita: {{fecha}} {{hora}}
Teléfono: {{telefono}}


👉 Se envía vía:

API WhatsApp

o webhook interno

o integración simple (fase actual)

9️⃣ HISTORIAL DE CHAT (JSON)

Cada mensaje se guarda así:

{
  "emisor": "cliente | pili",
  "mensaje": "texto",
  "timestamp": "ISO-8601"
}


Esto permite:

auditoría

mejora futura

IA más adelante

🔟 REGLAS DE SEGURIDAD Y NEGOCIO

PILI nunca da precios

PILI nunca cotiza

PILI no opina

PILI no discute

PILI siempre busca ordenar y cerrar cita

1️⃣1️⃣ RECONEXIÓN DE SESIÓN

Si session_id existe:

Hola {{nombre}}, retomamos la evaluación de tu proyecto.
¿Deseas continuar?

1️⃣2️⃣ QUÉ NO HACE PILI (IMPORTANTE)

❌ No usa IA
❌ No responde fuera del flujo
❌ No responde sin estado
❌ No guarda datos innecesarios

1️⃣3️⃣ ESCALABILIDAD (CUANDO CREZCA)

Este diseño permite:

agregar IA sin reescribir lógica

migrar BD

cambiar proveedor WhatsApp

añadir dashboard

1️⃣4️⃣ CONCLUSIÓN TÉCNICA

Este README define un sistema:

Simple

Controlable

Profesional

Escalable

Realista

👉 No es un juguete
👉 Es un sistema de negocio

✅ FIN DEL README

Este archivo es suficiente para implementar PILI hoy.
No depende de IA, no depende de humo, no depende de terceros.

Cuando quieras, el siguiente paso natural es:

convertir esto en código real (Node o Python)

o generar diagramas visuales

o conectar el frontend

Tú mandas, socio ⚡