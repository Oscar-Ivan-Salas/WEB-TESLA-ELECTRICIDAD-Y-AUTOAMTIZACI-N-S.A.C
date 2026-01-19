// Display Visual Solution Card (V4 Feature - Rich Content + Zoom + Visible Number)
function displaySolutionCard(data) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const info = {
        title: data.title || 'Solución TESLA',
        desc: data.description || 'Solución técnica personalizada',
        services: data.services || [],
        contact: data.contact || '+51 906315961'
    };

    const cardDiv = document.createElement('div');
    cardDiv.className = 'solution-card';
    cardDiv.style.cssText = `
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
        border: 2px solid rgba(245, 158, 11, 0.3);
        border-radius: 16px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    cardDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <h3 style="color: #F59E0B; font-size: 1.1rem; font-weight: 700; margin: 0;">${info.title}</h3>
            <button class="zoom-card-btn" style="background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #F59E0B; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">
                🔍 Ver detalle
            </button>
        </div>
        <p style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">${info.desc}</p>
        <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <p style="color: #FCD34D; font-size: 0.85rem; font-weight: 600; margin: 0;">📞 Contacto directo:</p>
            <p style="color: #fff; font-size: 1rem; font-weight: 900; margin-top: 5px;">${info.contact}</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="option-button" style="flex: 1; min-width: 120px; background: #374151; border: 1px solid #F59E0B;">
                📱 Llamar ahora
            </button>
            <button class="option-button" style="flex: 1; min-width: 120px; background: #059669; border: 1px solid #10b981;">
                💬 WhatsApp
            </button>
        </div>
    `;

    const zoomBtn = cardDiv.querySelector('.zoom-card-btn');
    zoomBtn.onclick = (e) => {
        e.stopPropagation();
        showCardZoom(cardDiv.cloneNode(true), info);
    };

    chatBody.appendChild(cardDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Show card in zoom/overlay mode
function showCardZoom(cardElement, info) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        backdrop-filter: blur(5px);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✖ Cerrar';
    closeBtn.className = 'option-button';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        max-width: 100px;
        font-size: 0.8rem;
    `;
    closeBtn.onclick = () => overlay.remove();

    overlay.appendChild(closeBtn);
    overlay.appendChild(cardElement);

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
}
