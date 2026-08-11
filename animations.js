/* ============================================================
   React Bits → JS puro
   1) AnimatedNumber: contador animado (easeOutCubic)
   2) ScrollProgress: barra de progreso de scroll dorada
   3) MagneticButton: botones que siguen suavemente el cursor
   ============================================================ */

(function () {
    'use strict';

    // ============ 1) AnimatedNumber ============
    window.animateNumber = function (el, target, duration) {
        if (!el) return;
        duration = duration || 900;
        const from = parseInt(String(el.textContent || '0').replace(/[^0-9]/g, ''), 10) || 0;
        if (from === target) {
            el.textContent = target;
            return;
        }
        const startTime = performance.now();
        const easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
        const step = function (now) {
            const p = Math.min((now - startTime) / duration, 1);
            el.textContent = Math.round(from + (target - from) * easeOutCubic(p));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // ============ 2) ScrollProgress ============
    window.initScrollProgress = function (barId) {
        const bar = document.getElementById(barId || 'scroll-progress');
        if (!bar) return;
        const update = function () {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            const p = max > 0 ? (doc.scrollTop / max) * 100 : 0;
            bar.style.width = p + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    };

    // ============ 3) MagneticButton ============
    window.initMagnetic = function (selector, strength) {
        strength = strength || 24;
        const els = document.querySelectorAll(selector);
        els.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = 'translate(' + (x / r.width) * strength + 'px,' + (y / r.height) * strength + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    };
})();
