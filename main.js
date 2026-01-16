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

// Display Visual Solution Card (V4 Feature - Rich Content + Zoom + Visible Number)
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

    // Header Image/Gradient with ZOOM ICON
    const header = document.createElement('div');
    header.style.background = 'linear-gradient(135deg, #991B1B, #7f1d1d)'; // Tesla Red Dark
    header.style.padding = '20px';
    header.style.textAlign = 'center';
    header.style.position = 'relative'; // For absolute positioning
    header.innerHTML = `
        <div id="btn-zoom-card" style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: white; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 50%; font-size: 1.2rem;" title="Ampliar Ficha">
            🔍
        </div>
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

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; margin-bottom: 12px;">
            <a href="https://tesla-landing-self.vercel.app" target="_blank" style="text-decoration: none; display: flex;">
                <button class="option-button" style="width:100%; font-size: 0.9rem; background: #374151; border-color: #4B5563; display: flex; align-items: center; justify-content: center;">
                    🌐 Web
                </button>
            </a>
             <button class="option-button" id="btn-whatsapp-card" style="width:100%; font-size: 0.9rem; background: #25D366; border: none; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 8px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.4);">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 1.2rem;">💬</span>
                    <span style="font-weight: 800; text-transform: uppercase;">WhatsApp</span>
                </div>
                <span style="font-size: 1.1rem; font-weight: 900; margin-top: 2px;">906 315 961</span>
            </button>
        </div>
        
        <button class="option-button" id="btn-download-card" style="width:100%; font-size: 0.9rem; border: 1px solid #F59E0B; background: rgba(245, 158, 11, 0.1);">
            📸 Guardar Ficha (Imagen)
        </button>
    `;

    cardDiv.appendChild(body);

    // -- EVENTS -- 

    // Helper for capture (shared)
    function captureDOMElement(element, button) {
        if (typeof html2canvas === 'undefined') {
            alert('Librería de imagen no cargada.'); return;
        }

        if (button) {
            button.textContent = 'Generando...';
            button.disabled = true;
        }

        // Hide overlay controls if zoom
        const zoomIcon = element.querySelector('#btn-zoom-card');
        if (zoomIcon) zoomIcon.style.display = 'none';

        html2canvas(element, {
            scale: 3,
            backgroundColor: null,
            useCORS: true,
            logging: false,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Ficha_Tesla_${info.title.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            if (button) {
                button.textContent = '✅ Guardada';
                button.disabled = false;
                setTimeout(() => button.textContent = '📸 Guardar Ficha (Imagen)', 2500);
            }
            if (zoomIcon) zoomIcon.style.display = 'block';

        }).catch(err => {
            console.error(err);
            if (button) {
                button.textContent = '❌ Error';
                button.disabled = false;
            }
            if (zoomIcon) zoomIcon.style.display = 'block';
        });
    }


    // Zoom Logic (Lightbox Overlay)
    const zoomBtn = header.querySelector('#btn-zoom-card');
    zoomBtn.onclick = () => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.padding = '20px';
        overlay.style.backdropFilter = 'blur(5px)';

        // Explicit Close Button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕ Cerrar';
        closeBtn.className = 'option-button';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        closeBtn.style.maxWidth = '100px';
        closeBtn.style.fontSize = '0.8rem';
        closeBtn.onclick = () => overlay.remove();
        overlay.appendChild(closeBtn);

        // Close on background click
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };

        // Clone card
        const zoomedCard = cardDiv.cloneNode(true);
        zoomedCard.style.margin = '0';
        zoomedCard.style.maxWidth = '600px'; // Limit width nicely
        zoomedCard.style.width = '100%';
        zoomedCard.style.maxHeight = '85vh'; // Make room for close button
        zoomedCard.style.boxShadow = '0 0 50px rgba(245, 158, 11, 0.3)';
        zoomedCard.style.overflowY = 'auto'; // Scrollable if tall

        // Hide small zoom button in clone
        const zInner = zoomedCard.querySelector('#btn-zoom-card');
        if (zInner) zInner.remove(); // Remove icon from zoom view

        // Re-attach WhatsApp
        const waZ = zoomedCard.querySelector('#btn-whatsapp-card');
        if (waZ) waZ.onclick = () => window.open(`https://wa.me/51906315961?text=Hola,%20consulta%20sobre%20${encodeURIComponent(info.title)}`, '_blank');

        // Re-attach Download (Active in Zoom!)
        const downZ = zoomedCard.querySelector('#btn-download-card');
        if (downZ) {
            downZ.style.display = 'block'; // Ensure visible
            downZ.onclick = () => captureDOMElement(zoomedCard, downZ);
        }

        overlay.appendChild(zoomedCard);
        document.body.appendChild(overlay);
    };

    // WhatsApp Logic (Original Card)
    const waBtn = body.querySelector('#btn-whatsapp-card');
    if (waBtn) {
        waBtn.onclick = () => {
            window.open(`https://wa.me/51906315961?text=Hola,%20consulta%20sobre%20${encodeURIComponent(info.title)}`, '_blank');
        };
    }

    // Download Logic (Original Card)
    const btn = body.querySelector('#btn-download-card');
    if (btn) {
        btn.onclick = () => captureDOMElement(cardDiv, btn);
    }

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
        // Fallback check
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

// Display Date Time Picker Native Control (Enhanced)
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

        // Disable to prevent double click
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

        // Show typing indicator
        const loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.className = 'chat-message bot loading';
        loading.innerHTML = '<div class="message-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
        chatBody.appendChild(loading);
        chatBody.scrollTop = chatBody.scrollHeight;

        await handleUserMessage(formatted, loading);
    };

    container.appendChild(btn);
    chatBody.appendChild(container);
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

    // Send initial message to trigger INICIO state
    handleUserMessage('Hola');
}

// --- RESTORED LEGACY SIDEBAR LOGIC (V5 BRAIN) ---

// Global Toggle Function (Exposed for HTML onclick)
// Maps legacy 'toggleChat()' calls to this logic
window.toggleChat = function (initialMessage = null) {
    const sidebar = document.getElementById('chat-sidebar'); // Legacy ID
    const fab = document.getElementById('chatbot-fab');
    if (!sidebar) return;

    const isHidden = sidebar.classList.contains('translate-x-full'); // Legacy class logic

    if (isHidden) {
        sidebar.classList.remove('translate-x-full');
        if (fab) fab.style.display = 'none'; // Hide FAB when chat opens

        // Initialize PILI on first open
        if (!sidebar.dataset.initialized) {
            initializePILI();
            sidebar.dataset.initialized = 'true';
        }

        // If an initial message is passed
        if (initialMessage) {
            setTimeout(() => {
                handleUserMessage(initialMessage);
            }, 500);
        }
    } else {
        sidebar.classList.add('translate-x-full');
        if (fab) fab.style.display = 'flex'; // Show FAB when chat closes
    }
};

// Alias for compatibility if needed
window.toggleChatbot = window.toggleChat;
window.openChatbot = window.toggleChat; // For 'Evaluación Técnica' buttons in navbar/hero
window.openChat = window.toggleChat; // For Modal buttons

// Close function
window.closeChat = function () {
    const sidebar = document.getElementById('chat-sidebar');
    const fab = document.getElementById('chatbot-fab');
    if (sidebar) sidebar.classList.add('translate-x-full');
    if (fab) fab.style.display = 'flex'; // Show FAB when chat closes
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Chatbot FAB Click
    const chatbotFab = document.getElementById('chatbot-fab');
    if (chatbotFab) {
        chatbotFab.addEventListener('click', (e) => {
            // Prevent default if it's a link (just in case)
            e.preventDefault();
            window.toggleChat();
        });
    }

    // Send message button
    const sendButton = document.getElementById('send-button');
    const inputField = document.getElementById('chat-input');

    // ... rest of event listeners ...
    if (sendButton && inputField) {
        // Remove old listeners to avoid duplicates if re-running
        // (Not strictly necessary in page reload context but good practice)

        sendButton.onclick = async () => {
            const message = inputField.value.trim();
            if (message) {
                displayMessage(message, 'user');
                inputField.value = '';
                await handleUserMessage(message);
            }
        };

        inputField.onkeypress = async (e) => {
            if (e.key === 'Enter') {
                const message = inputField.value.trim();
                if (message) {
                    displayMessage(message, 'user');
                    inputField.value = '';
                    await handleUserMessage(message);
                }
            }
        };
    }

    // Close button inside sidebar
    const closeBtn = document.querySelector('#chat-sidebar button[onclick="closeChat()"]');
    if (closeBtn) {
        closeBtn.onclick = window.closeChat;
    }

});

// Load theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('themeMode') || 'normal';
    try {
        const html = document.documentElement;
        html.setAttribute('data-contrast', savedTheme);
    } catch (e) { console.log("Theme err"); }
}
document.addEventListener('DOMContentLoaded', loadTheme);
