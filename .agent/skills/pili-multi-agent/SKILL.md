---
name: pili-multi-agent
description: Arquitectura Multi-Agente RAG con 6 Perfiles Especialistas para PILi Chatbot (TESLA Electricidad & Automatización).
---

# PILi Multi-Agent RAG Framework

Este Skill documenta la arquitectura conversacional multi-agente de PILi en TESLA Electricidad y Automatización.

## 🤖 Los 6 Agentes Especialistas

1. **`ELECTRICIDAD` (PILi - Especialista en Infraestructura Eléctrica)**
   - Focus: Tableros NEMA/IEC, pozos a tierra con bentonita/gel, transformadores, certificación CNE.
2. **`INCENDIOS` (PILi - Especialista en Contra Incendios & ITSE)**
   - Focus: Detección NFPA 72, alarmas, rociadores, expedientes técnicos INDECI / Defensa Civil.
3. **`AUTOMATIZACION` (PILi - Especialista en Domótica & BMS)**
   - Focus: BMS (Schneider/Siemens), BACnet/Modbus, control de accesos, eficiencia energética.
4. **`BIM_MEP` (PILi - Especialista en Ingeniería & Coordinación BIM / MEP 3D)**
   - Focus: Revit, Navisworks, Clash Detection, cómputos métricos, 0% retrabajos en obra.
5. **`ACABADOS_SEGURIDAD` (PILi - Especialista en Acabados Técnicos & Seguridad 24/7)**
   - Focus: CCTV IP 4K, monitoreo perimetral, drywallRF, acabados industriales.
6. **`COORDINADORA` (PILi - Coordinadora Senior & Asesora de Visitas)**
   - Focus: Soluciones Llave en Mano, agendamiento de visitas presenciales a obra con ingenieros humanos.

## 🔄 Enrutamiento RAG
El módulo `lib/pili-multi-agent-rag.js` inspecciona las intenciones del usuario y despacha automáticamente el **System Prompt RAG** del especialista activo hacia Gemini AI (`gemini-flash-latest`).
