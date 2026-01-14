// Toggle Chatbot Visibility
function toggleChatbot() {
    const chat = document.getElementById('chatbot-widget');

    if (chat.classList.contains('chatbot-hidden')) {
        chat.classList.remove('chatbot-hidden');
    } else {
        chat.classList.add('chatbot-hidden');
    }
}

function openChatbot() {
    const chat = document.getElementById('chatbot-widget');
    if (chat.classList.contains('chatbot-hidden')) {
        toggleChatbot();
    }
    const input = chat.querySelector('input');
    if (input) input.focus();
}

function closeChatbot() {
    const chat = document.getElementById('chatbot-widget');
    chat.classList.add('chatbot-hidden');
}

// WhatsApp Integration
function sendToWhatsApp() {
    const input = document.querySelector('.chatbot-input input');
    const message = input.value.trim();

    if (message === "") return;

    // Configuration - Using the number from the user's uploaded image if available, else placeholder
    const phoneNumber = "51906315961";
    const encodedMessage = encodeURIComponent(`Hola TESLA, estoy interesado en: ${message}`);

    // UI Update
    const body = document.querySelector('.chatbot-body');
    body.innerHTML += `<div class="message user" style="align-self: flex-end; background: var(--accent-gold); color: black; margin-top: 10px; border-radius: 8px; padding: 12px 18px; max-width: 85%;">${message}</div>`;
    body.scrollTop = body.scrollHeight;

    // Redirect after slight delay
    setTimeout(() => {
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        input.value = "";
        closeChatbot();
    }, 1000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Chatbot listeners
    const sendBtn = document.querySelector('.chatbot-input button');
    const inputFn = document.querySelector('.chatbot-input input');

    if (sendBtn) sendBtn.addEventListener('click', sendToWhatsApp);
    if (inputFn) inputFn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendToWhatsApp();
    });

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.fade-in-up');
    elementsToAnimate.forEach(el => observer.observe(el));

    // Load saved theme on page load
    loadTheme();
});

// Theme Toggle Functions
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icon
    const icon = document.querySelector('#theme-toggle i');
    if (newTheme === 'light') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);

    // Update icon based on saved theme
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (savedTheme === 'light') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}
