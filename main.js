// PILI Chatbot - Frontend Integration
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
    messageContent.textContent = message;

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
    // Remove all option buttons
    const optionButtons = document.querySelectorAll('.chat-options');
    optionButtons.forEach(btn => btn.remove());

    // Display user's choice
    displayMessage(option, 'user');

    // Send to PILI
    await handleUserMessage(option);
}

// Handle user message submission
async function handleUserMessage(message) {
    if (!message || message.trim() === '') return;

    // Show loading indicator
    const chatBody = document.getElementById('chatbot-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message pili loading';
    loadingDiv.innerHTML = '<div class="message-content">...</div>';
    chatBody.appendChild(loadingDiv);

    // Send to PILI backend
    const response = await sendMessageToPILI(message);

    // Remove loading indicator
    loadingDiv.remove();

    // Display PILI's response
    displayMessage(response.message, 'pili');

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

// Display Date Time Picker Native Control
function displayDateTimePicker() {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const container = document.createElement('div');
    container.className = 'chat-options'; // Re-use options styling container for alignment

    // Native Date Picker
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.className = 'chat-datepicker';
    input.style.width = '100%';
    input.style.padding = '10px';
    input.style.borderRadius = '10px';
    input.style.border = '2px solid var(--accent-gold)';
    input.style.marginBottom = '10px';
    input.style.fontSize = '1rem';

    // Confirm Button
    const btn = document.createElement('button');
    btn.className = 'option-button'; // Re-use styling
    btn.textContent = 'Confirmar Cita 📅';
    btn.style.width = '100%';
    btn.style.textAlign = 'center';
    btn.onclick = async () => {
        if (!input.value) return;

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

        // Remove picker
        container.remove();

        // Display choice
        displayMessage(formatted, 'user');

        // Send to PILI (raw value or formatted? Formatted is better for chat logic)
        await handleUserMessage(formatted);
    };

    container.appendChild(input);
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
            Contactar Ingeniero
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

// Theme toggle functionality (existing code)
function toggleTheme() {
    const html = document.documentElement;
    const currentContrast = html.getAttribute('data-contrast') || 'normal';
    const newContrast = currentContrast === 'normal' ? 'high' : 'normal';

    html.setAttribute('data-contrast', newContrast);
    localStorage.setItem('themeMode', newContrast);

    // Update icon
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (newContrast === 'high') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-adjust');
        } else {
            icon.classList.remove('fa-adjust');
            icon.classList.add('fa-sun');
        }
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('themeMode') || 'normal';
    const html = document.documentElement;
    html.setAttribute('data-contrast', savedTheme);

    // Update icon based on saved theme
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (savedTheme === 'high') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-adjust');
        } else {
            icon.classList.remove('fa-adjust');
            icon.classList.add('fa-sun');
        }
    }
}

// Load theme on page load
document.addEventListener('DOMContentLoaded', loadTheme);
