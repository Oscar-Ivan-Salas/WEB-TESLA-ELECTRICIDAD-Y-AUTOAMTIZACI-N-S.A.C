// PILI Chatbot - Frontend Integration (V4 Enhanced)
// Connects existing chatbot UI with PILI backend

// Session management
function getSessionId() {
    let sessionId = localStorage.getItem('pili_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('pili_session_id', sessionId);
    }
    return sessionId;
}

// Send message to PILI backend
async function sendMessageToPILI(message) {
    const sessionId = getSessionId();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error comunicándose con PILI:', error);
        return {
            message: 'Lo siento, hubo un error de conexión. Por favor intenta nuevamente.',
            state: 'ERROR',
            requiresInput: true
        };
    }
}

// Display message in chat
function displayMessage(message, sender = 'pili') {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    // Convert newlines to breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    messageContent.innerHTML = formattedMessage;

    messageDiv.appendChild(messageContent);
    chatBody.appendChild(messageDiv);

    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Display options as buttons
function displayOptions(options) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody || !options || options.length === 0) return;

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'chat-options';

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleOptionClick(option);
        optionsDiv.appendChild(button);
    });

    chatBody.appendChild(optionsDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Handle option button click
async function handleOptionClick(option) {
    // Remove all option buttons to prevent multiple clicks
    const optionButtons = document.querySelectorAll('.chat-options');
    optionButtons.forEach(btn => btn.remove());

    // Display user's choice
    displayMessage(option, 'user');

    // Send to PILI
    await handleUserMessage(option);
}

// Display Visual Solution Card (V4 Feature - Rich Content)
function displaySolutionCard(data) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    // Service Content Dictionary
    const SERVICE_DETAILS = {
        "Electricidad": {
            icon: "⚡",
            title: "ELECTRICIDAD INDUSTRIAL Y COMERCIAL",
            desc: "Garantizamos un suministro estable y seguro. Nos encargamos desde el diseño de tableros hasta la certificación final.",
            bullets: ["✔ Tableros Eléctricos", "✔ Pozo a Tierra", "✔ Iluminación LED"]
        },
        "Sistemas contra incendios": {
            icon: "🚨",
            title: "SISTEMAS CONTRA INCENDIOS",
            desc: "Protección certificada para tu infraestructura. Cumplimos estrictamente las normativas INDECI y NFPA.",
            bullets: ["✔ Detección y Alarma", "✔ Red de Agua", "✔ Mantenimiento Preventivo"]
        },
        "Automatización / Domótica": {
            icon: "🤖",
            title: "AUTOMATIZACIÓN Y DOMÓTICA",
            desc: "Control total de tu planta o edificio. Optimiza procesos y ahorra energía con tecnología inteligente.",
            bullets: ["✔ Control de Accesos", "✔ BMS / Scada", "✔ Sensores IoT"]
        },
        "Seguridad electrónica": {
            icon: "🔐",
            title: "SEGURIDAD ELECTRÓNICA",
            desc: "Monitoreo avanzado 24/7. Integramos cámaras, accesos y alarmas en una sola plataforma.",
            bullets: ["✔ CCTV IP", "✔ Video Porteros", "✔ Central de Monitoreo"]
        },
        "Acabados técnicos": {
            icon: "🏗️",
            title: "ACABADOS TÉCNICOS",
            desc: "Detalles finales que marcan la diferencia. Drywall, pintura y estructuras metálicas de soporte.",
            bullets: ["✔ Estructuras Metálicas", "✔ Drywall y Pintura", "✔ Remodelación"]
        },
        "Solución integral TESLA": {
            icon: "🧩",
            title: "SOLUCIÓN LLAVE EN MANO",
            desc: "Nos encargamos de TODO. Un solo proveedor para Electricidad, Seguridad y Automatización.",
            bullets: ["✔ Gestión de Proyecto", "✔ Un solo responsable", "✔ Entrega Lista para Usar"]
        }
    };

    // Match service (rough match)
    let info = SERVICE_DETAILS["Solución integral TESLA"]; // Default
    if (data && data.service) {
        // Find best match key
        const key = Object.keys(SERVICE_DETAILS).find(k => data.service.includes(k) || k.includes(data.service));
        if (key) info = SERVICE_DETAILS[key];
    }

    const cardDiv = document.createElement('div');
    cardDiv.className = 'solution-card-container';
    cardDiv.style.background = 'linear-gradient(145deg, #111827, #000000)';
    cardDiv.style.border = '1px solid #F59E0B'; // Gold border
    cardDiv.style.borderRadius = '16px';
    cardDiv.style.padding = '0'; // Reset padding for header layout
    cardDiv.style.marginTop = '20px';
    cardDiv.style.textAlign = 'left';
    cardDiv.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
    cardDiv.style.position = 'relative';
    cardDiv.style.overflow = 'hidden';

    // Header Image/Gradient
    const header = document.createElement('div');
    header.style.background = 'linear-gradient(135deg, #991B1B, #7f1d1d)'; // Tesla Red Dark
    header.style.padding = '20px';
    header.style.textAlign = 'center';
    header.innerHTML = `
        <img src="assets/logo.png" alt="TESLA" style="height: 45px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <h3 style="color: #fff; margin-top: 10px; font-weight: 800; font-size: 1rem; letter-spacing: 1px; text-transform: uppercase;">FICHA DE ATENCIÓN TÉCNICA</h3>
    `;
    cardDiv.appendChild(header);

    // Context Data (Ficha Look)
    const projectType = data && data.projectType ? data.projectType : 'No especificado';
    const stage = data && data.stage ? data.stage : 'No especificado';

    // Body
    const body = document.createElement('div');
    body.style.padding = '20px';
    body.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0 0 5px 0; font-size: 0.8rem; color: #9ca3af; text-transform: uppercase;">PROYECTO / ETAPA</p>
            <p style="margin: 0; font-size: 0.95rem; color: #fff; font-weight: 600;">${projectType}</p>
            <p style="margin: 0; font-size: 0.9rem; color: #d1d5db;">En fase: ${stage}</p>
        </div>

        <p style="color: #F59E0B; font-size: 0.85rem; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${info.title}</p>
        <p style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">${info.desc}</p>
        
        <div style="margin-bottom: 20px;">
            ${info.bullets.map(b => `<p style="color: #cbd5e0; font-size: 0.85rem; margin: 4px 0;">${b}</p>`).join('')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <a href="https://tesla-landing-self.vercel.app" target="_blank" style="text-decoration: none;">
                <button class="option-button" style="width:100%; font-size: 0.8rem; background: #374151; border-color: #4B5563;">
                    🌐 Ver Web
                </button>
            </a>
             <button class="option-button" id="btn-whatsapp-card" style="width:100%; font-size: 0.8rem;">
                💬 WhatsApp
            </button>
        </div>
    `;

    cardDiv.appendChild(body);

    // Add WhatsApp click handler to button inside card
    const waBtn = body.querySelector('#btn-whatsapp-card');
    waBtn.onclick = () => {
        // Trigger the main whatsapp button logic or open generic
        // Ideally use the link from the response, but here we can generate a generic one or assume the main flow handles it.
        // Let's use the one generated by backend if possible, or generic.
        window.open('https://wa.me/51906315961?text=Hola,%20quisiera%20consultar%20sobre%20la%20solución%20TESLA.', '_blank');
    };

    chatBody.appendChild(cardDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Handle user message submission
async function handleUserMessage(message, loadingElement = null) {
    if (!message && !loadingElement) return;

    // Show loading indicator if not provided
    const chatBody = document.getElementById('chatbot-messages');
    let loadingDiv = loadingElement;

    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message pili loading';
        loadingDiv.innerHTML = '<div class="message-content">...</div>';
        chatBody.appendChild(loadingDiv);
    }

    // Send to PILI backend
    const response = await sendMessageToPILI(message || '');

    // Remove loading indicator
    if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.remove();
    }

    // Display PILI's response
    displayMessage(response.message, 'pili');

    // CHECK FOR VISUAL CARD TRIGGER (V4)
    // If backend sends cardData, use it. Fallback to generic if text triggers it.
    if (response.cardData) {
        displaySolutionCard(response.cardData);
    } else if (response.message && response.message.includes('Tarjeta Digital')) {
        // Fallback checks
        displaySolutionCard({ service: 'SOLUCIÓN TESLA', stage: 'Atención Prioritaria' });
    }

    // Display options if provided
    if (response.options && response.options.length > 0) {
        displayOptions(response.options);
    }

    // Handle Date/Time Input Request (New!)
    if (response.inputType === 'datetime-local') {
        displayDateTimePicker();
    }

    // Handle WhatsApp link if provided
    if (response.whatsappLink) {
        displayWhatsAppButton(response.whatsappLink);
    }
}

// Display Date Time Picker Native Control (Enhanced V4)
function displayDateTimePicker() {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    // Wrapper for better spacing and label
    const container = document.createElement('div');
    container.className = 'chat-datepicker-container';

    // Helper Label
    const label = document.createElement('div');
    label.className = 'chat-datepicker-label';
    label.textContent = '📅 Selecciona Fecha y Hora sugerida:';
    container.appendChild(label);

    // Native Date Picker with Enhanced CSS
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.className = 'chat-datepicker';
    container.appendChild(input);

    // Confirm Button
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.textContent = 'Confirmar Cita ✅';
    btn.style.marginTop = '10px';
    btn.style.width = '100%';

    btn.onclick = async () => {
        if (!input.value) {
            alert("Por favor selecciona una fecha y hora.");
            return;
        }

        // Visual feedback
        btn.disabled = true;
        btn.textContent = 'Agendando...';

        // Format date prettily
        const date = new Date(input.value);
        const formatted = date.toLocaleString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Send formatted date back to PILi
        // Remove picker
        container.remove();
        displayMessage(formatted, 'user');

        // Manual loading indicator handling
        const loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.className = 'chat-message pili loading';
        loading.innerHTML = '<div class="message-content">...</div>';
        chatBody.appendChild(loading);
        chatBody.scrollTop = chatBody.scrollHeight;

        await handleUserMessage(formatted, loading);
    };

    container.appendChild(btn);
    chatBody.appendChild(container); // Append wrapper
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Display WhatsApp contact button
function displayWhatsAppButton(link) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'chat-whatsapp';
    buttonDiv.innerHTML = `
        <a href="${link}" target="_blank" class="whatsapp-button">
            <i class="fas fa-brands fa-whatsapp"></i>
            Contactar Especialista
        </a>
    `;

    chatBody.appendChild(buttonDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Initialize chatbot when opened
function initializePILI() {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    // Clear previous messages
    chatBody.innerHTML = '';

    // Force new session ID for V4 testing logic (remove this in prod if persistence is preferred)
    // localStorage.removeItem('pili_session_id'); 

    // Send initial message to trigger INICIO state
    handleUserMessage('Hola');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Chatbot toggle
    const chatbotFab = document.querySelector('.chatbot-fab');
    const chatbotWidget = document.getElementById('chatbot-widget');

    if (chatbotFab && chatbotWidget) {
        chatbotFab.addEventListener('click', () => {
            const isHidden = chatbotWidget.classList.contains('chatbot-hidden');

            if (isHidden) {
                chatbotWidget.classList.remove('chatbot-hidden');
                // Initialize PILI on first open
                if (!chatbotWidget.dataset.initialized) {
                    initializePILI();
                    chatbotWidget.dataset.initialized = 'true';
                }
            } else {
                chatbotWidget.classList.add('chatbot-hidden');
            }
        });
    }

    // Send message button - FIX: Use IDs to match WebTesla.html
    const sendButton = document.getElementById('send-button');
    const inputField = document.getElementById('chat-input');

    if (sendButton && inputField) {
        sendButton.addEventListener('click', async () => {
            const message = inputField.value.trim();
            if (message) {
                displayMessage(message, 'user');
                inputField.value = '';
                await handleUserMessage(message);
            }
        });

        // Enter key to send
        inputField.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const message = inputField.value.trim();
                if (message) {
                    displayMessage(message, 'user');
                    inputField.value = '';
                    await handleUserMessage(message);
                }
            }
        });
    }

    // Close button
    const closeButton = document.querySelector('.chatbot-header button');
    if (closeButton && chatbotWidget) {
        closeButton.addEventListener('click', () => {
            chatbotWidget.classList.add('chatbot-hidden');
        });
    }
});
