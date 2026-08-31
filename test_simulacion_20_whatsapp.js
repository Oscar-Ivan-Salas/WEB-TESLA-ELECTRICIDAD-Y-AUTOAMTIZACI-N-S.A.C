/**
 * Script de Simulación del Flujo Conversacional Completo (Cliente ↔ PILi) en WhatsApp Business
 * TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
 * Teléfono WhatsApp Business: +51 906 315 961
 */

const { generateClientWhatsAppLink, generateWhatsAppLink } = require('./lib/whatsapp-notifier.js');
const { getAgentForMessage, generatePiliResponse } = require('./lib/pili-multi-agent-rag.js');

const CASOS_PRUEBA_CLIENTES = [
    { id: 1, cliente: "Ing. Carlos Mendoza (Mall Arequipa)", consulta: "Necesito cotización para tableros eléctricos y control BMS de climatización HVAC.", servicio: "Infraestructura Eléctrica & BMS" },
    { id: 2, cliente: "Arq. Sofía Benavides (Constructora Sur)", consulta: "Requiero modelado 3D BIM MEP LOD 350 para detectar interferencias antes de obra.", servicio: "Ingeniería BIM / MEP 3D" },
    { id: 3, cliente: "Lic. Fernando Quispe (Clínica San Pablo)", consulta: "Revisión de protocolo de pozo a tierra y transformador de aislamiento médico.", servicio: "Infraestructura Eléctrica" },
    { id: 4, cliente: "Marco Torres (Data Center Lince)", consulta: "Suministro e instalación de UPS redundante Tier III y aire de precisión.", servicio: "Energía Ininterrumpida UPS" },
    { id: 5, cliente: "Vanessa Delgado (Planta Industrial Callao)", consulta: "Sistema de detección de incendios con rociadores NFPA 13 y bomba UL/FM.", servicio: "Sistemas Contra Incendios NFPA" },
    { id: 6, cliente: "Dr. Roberto Paredes (Edificio Miraflores)", consulta: "Expediente técnico ITSE para municipalidad y levantamiento de observaciones.", servicio: "Certificación ITSE / INDECI" },
    { id: 7, cliente: "Jorge Huamán (Almacén Logístico Lurín)", consulta: "Instalación de cámaras CCTV IP 4K y cerco perimetral con detección por IA.", servicio: "Seguridad Electrónica 24/7" },
    { id: 8, cliente: "Lucía Morales (Centro Comercial Ate)", consulta: "Montaje de bandejas portacables y acabados técnicos en drywall resistente al fuego.", servicio: "Acabados Técnicos Integrados" },
    { id: 9, cliente: "Esteban Ríos (Minera Cerro Verde)", consulta: "Automatización de motores pesados con celdas de media tensión SF6.", servicio: "Subestaciones & Automatización" },
    { id: 10, cliente: "Patricia Gómez (Universidad San Marcos)", consulta: "Remodelación integral llave en mano de laboratorios eléctricos.", servicio: "Solución Llave en Mano 360°" },
    { id: 11, cliente: "Ing. Ricardo Salas (Hotel San Isidro)", consulta: "Sistema de iluminación inteligente DALI y control de accesos biométrico.", servicio: "Automatización & BMS" },
    { id: 12, cliente: "Dante Castro (Fábrica Textil Santa Anita)", consulta: "Medición con telurómetro de pozos a tierra con dosificación gel normado CNE.", servicio: "Medición Pozo a Tierra" },
    { id: 13, cliente: "Elena Vizcarra (Supermercado Trujillo)", consulta: "Gabinetes de mangueras contra incendios ACCI y sensores de flujo.", servicio: "Sistemas Contra Incendios" },
    { id: 14, cliente: "Hugo Navarro (Residencial San Borja)", consulta: "Licencia de funcionamiento municipal y plano de evacuación aforo.", servicio: "Certificación ITSE / Defensa Civil" },
    { id: 15, cliente: "Gisela Ramos (Planta Alimentos Huachipa)", consulta: "Tablero de transferencia automática TTA con grupo electrógeno.", servicio: "Infraestructura Eléctrica" },
    { id: 16, cliente: "Martín Alva (Edificio Corporativo San Isidro)", consulta: "Integración SCADA de medidores multifunción de energía.", servicio: "Automatización & BMS" },
    { id: 17, cliente: "Carmen Flores (Hospital Chimbote)", consulta: "Red contra incendios NFPA 20 con prueba hidrostática de tuberías.", servicio: "Sistemas Contra Incendios NFPA" },
    { id: 18, cliente: "Alonso Vega (Condominio Chiclayo)", consulta: "CCTV térmico y centrales de alarma contra robo 24/7.", servicio: "Seguridad Electrónica 24/7" },
    { id: 19, cliente: "Diana Gutiérrez (Boutique Jockey Plaza)", consulta: "Tablero eléctrico comercial normado y luces de emergencia LED.", servicio: "Infraestructura Eléctrica" },
    { id: 20, cliente: "Ing. Javier Bravo (Parque Industrial Piura)", consulta: "Coordinación de interferencias Navisworks BIM MEP para subestación.", servicio: "Ingeniería BIM / MEP 3D" }
];

console.log("================================================================================");
console.log("📲 SIMULACIÓN DE FLUJO CONVERSACIONAL BIDIRECCIONAL (CLIENTE ↔ PILi) EN WHATSAPP");
console.log("🏢 TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.");
console.log("📍 Número Destino WhatsApp Business: +51 906 315 961");
console.log("================================================================================\n");

CASOS_PRUEBA_CLIENTES.forEach((caso) => {
    const agente = getAgentForMessage(caso.consulta);
    const respuestaPili = generatePiliResponse(agente, caso.consulta, caso.cliente);

    console.log(`================================================================================`);
    console.log(`💬 INTERACCIÓN #${caso.id} | ${caso.cliente}`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`👤 CLIENTE (Entrante):`);
    console.log(`   "${caso.consulta}"`);
    console.log(``);
    console.log(`🤖 PILi - AGENTE IA EN WHATSAPP (Respuesta Saliente):`);
    console.log(respuestaPili);
    console.log(``);
});

console.log("================================================================================");
console.log("✅ SIMULACIÓN DEL FLUJO BIDIRECCIONAL COMPLETO EJECUTADA CON ÉXITO");
console.log("================================================================================");
