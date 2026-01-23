// ========================================
// TESLA Analytics - Lightweight Tracker
// ========================================
// Captura eventos de visitantes sin saturar la DB
// Usa localStorage para almacenamiento temporal
// ========================================

(function () {
    'use strict';

    // Configuración
    const ANALYTICS_KEY = 'tesla_analytics';
    const SESSION_KEY = 'tesla_session_id';

    // Generar ID de sesión único
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener o crear sesión
    function getSessionId() {
        let sessionId = sessionStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = generateSessionId();
            sessionStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    // Obtener datos de analytics desde localStorage
    function getAnalytics() {
        const data = localStorage.getItem(ANALYTICS_KEY);
        return data ? JSON.parse(data) : {
            totalVisits: 0,
            uniqueVisitors: new Set(),
            chatOpened: 0,
            chatCompleted: 0,
            lastVisit: null,
            sessions: []
        };
    }

    // Guardar datos de analytics
    function saveAnalytics(data) {
        // Convertir Set a Array para JSON
        const toSave = {
            ...data,
            uniqueVisitors: Array.from(data.uniqueVisitors)
        };
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(toSave));
    }

    // Detectar tipo de dispositivo
    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // Registrar visita a la página
    function trackPageView() {
        const analytics = getAnalytics();
        const sessionId = getSessionId();

        // Convertir array a Set si es necesario
        if (Array.isArray(analytics.uniqueVisitors)) {
            analytics.uniqueVisitors = new Set(analytics.uniqueVisitors);
        }

        analytics.totalVisits++;
        analytics.uniqueVisitors.add(sessionId);
        analytics.lastVisit = new Date().toISOString();

        // Registrar sesión
        const session = {
            id: sessionId,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            device: getDeviceType()
        };

        analytics.sessions.push(session);

        // Mantener solo últimas 50 sesiones
        if (analytics.sessions.length > 50) {
            analytics.sessions = analytics.sessions.slice(-50);
        }

        saveAnalytics(analytics);

        console.log('📊 [Analytics] Visita registrada:', {
            totalVisits: analytics.totalVisits,
            uniqueVisitors: analytics.uniqueVisitors.size,
            device: session.device
        });
    }

    // Registrar apertura de chat
    function trackChatOpened() {
        const analytics = getAnalytics();
        analytics.chatOpened++;
        saveAnalytics(analytics);

        console.log('💬 [Analytics] Chat abierto');
    }

    // Registrar chat completado (lead capturado)
    function trackChatCompleted() {
        const analytics = getAnalytics();
        analytics.chatCompleted++;
        saveAnalytics(analytics);

        console.log('✅ [Analytics] Chat completado - Lead capturado');
    }

    // Obtener métricas actuales
    function getMetrics() {
        const analytics = getAnalytics();

        // Convertir array a Set si es necesario
        if (Array.isArray(analytics.uniqueVisitors)) {
            analytics.uniqueVisitors = new Set(analytics.uniqueVisitors);
        }

        const uniqueVisitors = analytics.uniqueVisitors.size;
        const chatOpened = analytics.chatOpened;
        const chatCompleted = analytics.chatCompleted;

        return {
            totalVisits: analytics.totalVisits,
            uniqueVisitors: uniqueVisitors,
            chatOpened: chatOpened,
            chatCompleted: chatCompleted,
            conversionRate: uniqueVisitors > 0 ? ((chatCompleted / uniqueVisitors) * 100).toFixed(1) : 0,
            chatOpenRate: uniqueVisitors > 0 ? ((chatOpened / uniqueVisitors) * 100).toFixed(1) : 0,
            chatCompletionRate: chatOpened > 0 ? ((chatCompleted / chatOpened) * 100).toFixed(1) : 0
        };
    }

    // Resetear analytics (útil para testing)
    function resetAnalytics() {
        localStorage.removeItem(ANALYTICS_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        console.log('🔄 [Analytics] Datos reseteados');
    }

    // Exponer API global
    window.TeslaAnalytics = {
        trackPageView: trackPageView,
        trackChatOpened: trackChatOpened,
        trackChatCompleted: trackChatCompleted,
        getMetrics: getMetrics,
        reset: resetAnalytics
    };

    // Auto-track page view al cargar
    trackPageView();

    // Detectar apertura de chat PILi (cuando el iframe se hace visible)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const chatIframe = document.querySelector('iframe[src*="chat"]');
                if (chatIframe && chatIframe.style.display !== 'none') {
                    trackChatOpened();
                    observer.disconnect(); // Solo trackear una vez
                }
            }
        });
    });

    // Observar cambios en el DOM para detectar chat
    setTimeout(() => {
        const chatContainer = document.querySelector('#chat-container, .chat-widget, iframe[src*="chat"]');
        if (chatContainer) {
            observer.observe(chatContainer, { attributes: true, subtree: true });
        }
    }, 1000);

    console.log('📊 [Analytics] Sistema inicializado');
    console.log('📈 Métricas actuales:', getMetrics());

})();
