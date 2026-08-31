/**
 * Script de Verificación y Simulación de Catálogos Interactivos
 * Meta WhatsApp Cloud API (List Messages & CTA URL Buttons) y Telegram Bot API
 * TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.
 */

const {
    buildWhatsAppListPayload,
    buildWhatsAppCtaButtonPayload,
    buildTelegramKeyboardPayload
} = require('./lib/whatsapp-interactive-catalog.js');

const { getAgentForMessage, generatePiliResponse } = require('./lib/pili-multi-agent-rag.js');

console.log("================================================================================");
console.log("⚡ PRUEBA DE CATÁLOGOS INTERACTIVOS (WHATSAPP META API & TELEGRAM BOT)");
console.log("🏢 TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.");
console.log("================================================================================\n");

// 1. PRUEBA DE MENÚ DESPLEGABLE LISTA INTERACTIVA WHATSAPP
console.log("📌 1. PAYLOAD DE MENÚ DESPLEGABLE INTERACTIVO (WhatsApp List Message):");
const whatsappList = buildWhatsAppListPayload("+51906315961");
console.log(JSON.stringify(whatsappList, null, 2));

console.log("\n--------------------------------------------------------------------------------");

// 2. PRUEBA DE BOTÓN CTA CON LINK DE CADA SERVICIO A LA WEB
console.log("📌 2. PAYLOAD DE BOTÓN CTA DIRECTO A LA WEB POR SERVICIO (WhatsApp CTA URL Button):");
const agenteIncendios = getAgentForMessage("sistema de agua contra incendios nfpa");
const respuestaIncendios = generatePiliResponse(agenteIncendios, "sistema de agua contra incendios nfpa");
const whatsappCta = buildWhatsAppCtaButtonPayload("+51906315961", `🤖 [${agenteIncendios.name}]`, respuestaIncendios, '#projects');
console.log(JSON.stringify(whatsappCta, null, 2));

console.log("\n--------------------------------------------------------------------------------");

// 3. PRUEBA DE BOTONES DE TELEGAM (Telegram Inline Keyboard)
console.log("📌 3. PAYLOAD DE TELEGAM INLINE KEYBOARD (Botones Interactivos):");
const telegramKeyboard = buildTelegramKeyboardPayload("123456789", "Bienvenido al Bot de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.");
console.log(JSON.stringify(telegramKeyboard, null, 2));

console.log("\n================================================================================");
console.log("✅ VERIFICACIÓN DE ESTRUCTURAS INTERACTIVAS COMPLETADA CON ÉXITO");
console.log("================================================================================");
