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

// Display Visual Solution Card (V4 Feature - Dynamic)
function displaySolutionCard(data) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    // Defaults if data is missing (fallback)
    const serviceTitle = data && data.service ? data.service : 'SOLUCIÓN INTEGRA TESLA';
    const subTitle = data && data.stage ? `Plan de Acción: ${data.stage}` : 'Garantía Técnica Tesla';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'solution-card-container';
    // Premium Card Styling
    cardDiv.style.background = 'linear-gradient(145deg, #1A202C, #000000)';
    cardDiv.style.border = '1px solid #F59E0B';
    cardDiv.style.borderRadius = '16px';
    cardDiv.style.padding = '20px';
    cardDiv.style.marginTop = '15px';
    cardDiv.style.textAlign = 'center';
    cardDiv.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    cardDiv.style.position = 'relative';
    cardDiv.style.overflow = 'hidden';

    // Gold accent top bar
    const accent = document.createElement('div');
    accent.style.position = 'absolute';
    accent.style.top = '0';
    accent.style.left = '0';
    accent.style.width = '100%';
    accent.style.height = '4px';
    accent.style.background = 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)';
    cardDiv.appendChild(accent);

    cardDiv.innerHTML += `
        <div style="margin-bottom: 12px; margin-top: 10px;">
            <img src="assets/logo.png" alt="TESLA" style="height: 35px; object-fit: contain; filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));">
        </div>
        <h3 style="color: #fff; font-weight: 800; margin-bottom: 5px; font-size: 1.2rem; letter-spacing: 0.5px; text-transform: uppercase;">${serviceTitle}</h3>
        <p style="color: #cbd5e0; font-size: 0.85rem; margin-bottom: 15px; font-style: italic;">"${subTitle}"</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
             <p style="color: #F59E0B; font-size: 0.8rem; margin:0;">✅ Ingeniería Validada</p>
             <p style="color: #F59E0B; font-size: 0.8rem; margin:0;">✅ Soporte Especializado</p>
        </div>

        <button class="option-button" style="width:100%; font-size: 0.85rem; min-height: 40px; border: 1px solid #F59E0B;">💾 Guardar Tarjeta</button>
    `;

    // Add functionality to "Download" button
    const btn = cardDiv.querySelector('button');
    btn.onclick = () => {
        btn.textContent = '✅ Guardada en Dispositivo';
        btn.style.background = '#059669'; // Green
        btn.style.borderColor = '#059669';
        btn.style.color = '#fff';
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
