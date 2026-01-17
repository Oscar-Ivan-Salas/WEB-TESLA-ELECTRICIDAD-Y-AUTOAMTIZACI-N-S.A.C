# Manual de Diseño Frontend - TESLA Landing Page

> **Guía de Diseño y Desarrollo Frontend**  
> Versión: 1.0  
> Fecha: Enero 2026  
> Equipo: TESLA Electricidad y Automatización S.A.C.

---

## 📋 Tabla de Contenidos

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Sistema de Diseño](#sistema-de-diseño)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Componentes UI](#componentes-ui)
5. [Responsive Design](#responsive-design)
6. [Animaciones y Efectos](#animaciones-y-efectos)
7. [Accesibilidad y SEO](#accesibilidad-y-seo)
8. [Guía de Implementación](#guía-de-implementación)

---

## 🎨 Filosofía de Diseño

### Principios Fundamentales

#### 1. **Premium y Profesional**
La identidad visual debe transmitir:
- ✨ **Excelencia técnica** - Diseño pulido y atención al detalle
- 🏆 **Confiabilidad** - Empresa seria y establecida
- ⚡ **Energía** - Dinamismo y modernidad
- 🎯 **Claridad** - Mensaje directo y sin ambigüedades

#### 2. **Dark Mode First**
- Fondo oscuro como predeterminado (industria eléctrica)
- Contraste alto para legibilidad
- Acentos dorados que destacan sobre negro
- Opción de modo claro disponible

#### 3. **Mobile First**
- 70% del tráfico es móvil
- Diseño optimizado para pantallas pequeñas primero
- Progressive enhancement para desktop

#### 4. **Conversión Orientada**
- CTAs visibles y accesibles
- Flujo claro hacia contacto
- Mínima fricción para conversión

---

## 🎨 Sistema de Diseño

### Paleta de Colores

#### Colores Principales

```css
:root {
    /* TESLA Brand Colors */
    --primary-red: #DC2626;        /* Rojo TESLA principal */
    --primary-red-dark: #991B1B;   /* Rojo oscuro */
    --primary-red-glow: #EF4444;   /* Rojo brillante para efectos */
    
    --accent-gold: #F59E0B;        /* Dorado TESLA */
    --accent-gold-bright: #FBBF24; /* Dorado brillante */
    
    /* Backgrounds */
    --bg-dark-1: #2d3748;          /* Gris carbón claro */
    --bg-dark-2: #1a202c;          /* Gris carbón medio */
    --bg-dark-3: #0f1419;          /* Gris carbón oscuro */
    
    /* Text */
    --text-white: #FFFFFF;
    --text-gray: #E5E7EB;
    --text-dark: #1F2937;
}
```

#### Uso de Colores

| Color | Uso Principal | Ejemplos |
|-------|---------------|----------|
| **Rojo TESLA** | CTAs, acentos críticos | Botones principales, bordes importantes |
| **Dorado TESLA** | Highlights, iconos | Títulos, iconos de servicios, hover states |
| **Gris Carbón** | Fondos, contenedores | Background general, cards, modales |
| **Blanco** | Texto principal | Títulos, párrafos, contenido |
| **Gris Claro** | Texto secundario | Descripciones, subtítulos |

#### Gradientes

```css
/* Gradiente de fondo dinámico */
background: linear-gradient(135deg, 
    var(--bg-dark-1) 0%, 
    var(--bg-dark-2) 50%, 
    var(--bg-dark-3) 100%
);
background-size: 400% 400%;
animation: gradientShift 15s ease infinite;

/* Gradiente de botón */
background: linear-gradient(135deg, 
    var(--primary-red) 0%, 
    var(--primary-red-glow) 100%
);

/* Gradiente de texto */
background: linear-gradient(to right, 
    var(--accent-gold), 
    #fff
);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Tipografía

#### Familia de Fuentes

```css
font-family: 'Inter', sans-serif;
```

**Inter** - Fuente moderna, legible y profesional
- Diseñada para interfaces digitales
- Excelente legibilidad en pantallas
- Amplio rango de pesos (300-900)
- Soporte completo de caracteres latinos

#### Escala Tipográfica

| Elemento | Tamaño Desktop | Tamaño Mobile | Peso | Uso |
|----------|----------------|---------------|------|-----|
| **Hero Title** | 3.8rem (60.8px) | 2.5rem (40px) | 900 | Título principal |
| **Section Title** | 2.8rem (44.8px) | 2rem (32px) | 700 | Títulos de sección |
| **Card Title** | 1.5rem (24px) | 1.3rem (20.8px) | 600 | Títulos de tarjetas |
| **Body Large** | 1.3rem (20.8px) | 1.1rem (17.6px) | 400 | Texto destacado |
| **Body** | 1rem (16px) | 0.95rem (15.2px) | 400 | Texto normal |
| **Small** | 0.85rem (13.6px) | 0.8rem (12.8px) | 400 | Texto secundario |

#### Jerarquía Visual

```css
/* Hero Title - Máximo impacto */
.hero-title {
    font-size: 3.8rem;
    font-weight: 900;
    line-height: 1.1;
    text-transform: uppercase;
    background: linear-gradient(to right, #ffffff 30%, var(--accent-gold) 50%, #ffffff 70%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 4s linear infinite;
}

/* Section Title - Estructura clara */
.section-title {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 15px;
    background: linear-gradient(to right, var(--accent-gold), #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Body Text - Legibilidad */
body {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-gray);
}
```

### Espaciado y Grid

#### Sistema de Espaciado

Basado en múltiplos de 4px:

```css
/* Espaciado base */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

#### Grid System

```css
/* Container principal */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Grid de 4 columnas (Modelo TESLA) */
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
}

/* Grid de 3 columnas (Servicios) */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
    .grid-4 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
}
```

### Iconografía

#### Font Awesome 6.4.0

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

#### Iconos Principales

| Servicio | Icono | Código |
|----------|-------|--------|
| **Ingeniería** | 🧠 | `<i class="fas fa-brain"></i>` |
| **Suministro** | 📦 | `<i class="fas fa-boxes"></i>` |
| **Ejecución** | 👷 | `<i class="fas fa-hard-hat"></i>` |
| **Integración** | 🔗 | `<i class="fas fa-network-wired"></i>` |
| **Electricidad** | ⚡ | `<i class="fas fa-bolt"></i>` |
| **Automatización** | 🤖 | `<i class="fas fa-robot"></i>` |
| **Contra Incendios** | 🧯 | `<i class="fas fa-fire-extinguisher"></i>` |
| **Seguridad** | 📹 | `<i class="fas fa-video"></i>` |

#### Estilo de Iconos

```css
.icon-gold {
    font-size: 3.5rem;
    color: var(--accent-gold);
    filter: drop-shadow(0 0 15px rgba(255, 234, 0, 0.6));
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: static-charge 4s infinite;
}

.card:hover .icon-gold {
    transform: scale(1.15) rotate(-5deg);
    color: #fff;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) 
            drop-shadow(0 0 40px rgba(255, 100, 0, 0.6));
    animation: electric-shock 0.3s infinite;
}
```

---

## 📁 Estructura de Archivos

### Organización del Proyecto

```
tesla-landing/
├── index.html              # Página principal (1580 líneas)
├── styles.css              # Estilos globales (2095 líneas)
├── main.js                 # Lógica frontend (620 líneas)
├── assets/
│   ├── logo.png            # Logo TESLA
│   ├── pili_avatar.png     # Avatar de PILi
│   ├── model_engineering.png
│   ├── model_supply.png
│   ├── model_installation.png
│   ├── model_integration.png
│   ├── service_electricity.png
│   ├── service_automation.png
│   ├── service_fire_safety.png
│   ├── service_security.png
│   └── ...
├── api/
│   └── chat.js             # Backend serverless
├── lib/
│   ├── pili-brain.js
│   ├── pili-memory.js
│   └── whatsapp-notifier.js
└── vercel.json             # Configuración de deployment
```

### Estructura del HTML

```html
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <!-- Meta tags -->
    <!-- Tailwind CSS CDN -->
    <!-- Google Fonts -->
    <!-- Font Awesome -->
    <!-- Custom CSS -->
    <!-- Inline critical styles -->
</head>
<body class="text-white dark">
    <!-- Header (Fixed) -->
    <header>...</header>
    
    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="hero">...</section>
        
        <!-- El Modelo TESLA -->
        <section id="solucion">...</section>
        
        <!-- Servicios -->
        <section id="servicios">...</section>
        
        <!-- Experiencia -->
        <section id="experiencia">...</section>
    </main>
    
    <!-- Footer -->
    <footer>...</footer>
    
    <!-- Chat Sidebar (PILi) -->
    <div id="chat-sidebar">...</div>
    
    <!-- FAB Button -->
    <div id="fab-container">...</div>
    
    <!-- Scripts -->
    <script src="main.js"></script>
</body>
</html>
```

---

## 🧩 Componentes UI

### 1. Header (Navegación Fija)

```html
<header class="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md z-50 border-b border-tesla-red/20">
    <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center gap-4">
                <img src="assets/logo.png" alt="TESLA Logo" class="h-20 md:h-24">
                <div>
                    <h1 class="text-xl md:text-2xl font-bold">TESLA</h1>
                    <p class="text-sm md:text-base text-tesla-gold">Electricidad y Automatización S.A.C.</p>
                </div>
            </div>
            
            <!-- Navigation -->
            <nav class="hidden md:flex items-center gap-6">
                <a href="#solucion">Solución</a>
                <a href="#servicios">Servicios</a>
                <a href="#experiencia">Experiencia</a>
                <button id="site-theme-toggle">
                    <i class="fas fa-sun text-tesla-gold"></i>
                </button>
                <button onclick="openChat()">Evaluación Técnica</button>
            </nav>
        </div>
    </div>
</header>
```

**Características:**
- ✅ Posición fija con backdrop blur
- ✅ Logo grande y visible
- ✅ Navegación con smooth scroll
- ✅ Toggle de tema claro/oscuro
- ✅ CTA prominente

### 2. Hero Section

```html
<section class="min-h-screen flex items-center justify-center pt-32 pb-20 px-4">
    <div class="container mx-auto text-center max-w-4xl">
        <!-- Desktop Version -->
        <div class="desktop-only">
            <h1 class="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span class="bg-gradient-to-r from-white via-tesla-gold to-white bg-clip-text text-transparent glow-text">
                    Integrador estratégico de soluciones técnicas para tu proyecto
                </span>
            </h1>
            <p class="text-base md:text-lg text-tesla-gold uppercase tracking-wider mb-6">
                Unificamos ingeniería, ejecución y responsabilidad técnica en un solo equipo
            </p>
            <a href="https://wa.me/51906315961?text=..." class="btn-primary btn-lg">
                Solicitar evaluación técnica
            </a>
        </div>
        
        <!-- Mobile Version -->
        <div class="mobile-only">
            <h1 class="text-3xl font-black mb-6">
                <span class="bg-gradient-to-r from-white via-tesla-gold to-white bg-clip-text text-transparent">
                    Te quitamos el problema técnico de tu obra
                </span>
            </h1>
            <a href="https://wa.me/51906315961?text=..." class="btn-primary">
                Hablar con PILi ahora
            </a>
        </div>
    </div>
</section>
```

**Características:**
- ✅ Versiones separadas desktop/mobile
- ✅ Título con gradiente animado
- ✅ Propuesta de valor clara
- ✅ CTA directo a WhatsApp

### 3. Service Card (Acordeón Visual)

```html
<div class="rounded-xl overflow-hidden border border-gray-700 hover:border-tesla-gold transition-all duration-300">
    <!-- Card Header (Imagen) -->
    <div onclick="toggleAccordion('accordion-electricidad')" class="group relative h-80 md:h-96 cursor-pointer">
        <img src="assets/service_electricity.png" alt="Electricidad" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <div class="absolute bottom-0 left-0 right-0 p-6">
                <div class="text-tesla-gold text-3xl mb-3 electric-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Electricidad Confiable</h3>
                <p class="text-gray-400 text-xs flex items-center gap-2">
                    Click para ver más <i class="fas fa-chevron-down"></i>
                </p>
            </div>
        </div>
    </div>
    
    <!-- Expandable Content -->
    <div id="accordion-electricidad" class="hidden bg-gray-800/50 p-6 border-t border-tesla-gold/30">
        <p class="text-gray-300 mb-4">
            Diseñamos, ejecutamos y certificamos sistemas eléctricos robustos...
        </p>
        <div class="bg-gray-900/50 p-4 rounded-lg border border-tesla-gold/20 mb-4">
            <h4 class="text-tesla-gold font-bold mb-2 text-sm">✓ Beneficio</h4>
            <p class="text-gray-300 text-sm">Funcionamiento seguro, estable y conforme a normas</p>
        </div>
        <button onclick="openChat()" class="w-full btn-primary">
            Solicitar Evaluación
        </button>
    </div>
</div>
```

**Características:**
- ✅ Imagen de fondo con overlay
- ✅ Hover effect con zoom
- ✅ Acordeón expandible
- ✅ CTA integrado

### 4. Chat Sidebar (PILi)

```html
<div id="chat-sidebar" class="fixed top-0 right-0 h-full w-full md:w-96 bg-gray-900 shadow-2xl z-50 transform translate-x-full transition-transform duration-300">
    <!-- Header -->
    <div class="bg-gradient-to-r from-tesla-red to-tesla-red-glow p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <img src="assets/pili_avatar.png" alt="PILi" class="w-12 h-12 rounded-full border-2 border-tesla-gold avatar-glow">
            <div>
                <h3 class="font-bold text-white">PILi</h3>
                <p class="text-xs text-gray-200">Asistente Técnica TESLA</p>
            </div>
        </div>
        <button onclick="closeChat()" class="text-white hover:text-tesla-gold">
            <i class="fas fa-times text-xl"></i>
        </button>
    </div>
    
    <!-- Messages Container -->
    <div id="chatbot-messages" class="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll" style="height: calc(100vh - 140px);">
        <!-- Messages appear here -->
    </div>
    
    <!-- Input Area -->
    <div class="p-4 bg-gray-800 border-t border-gray-700">
        <div class="flex gap-2">
            <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." class="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg">
            <button id="send-button" class="px-4 py-2 bg-tesla-red hover:bg-tesla-red-glow rounded-lg">
                <i class="fas fa-paper-plane text-white"></i>
            </button>
        </div>
    </div>
</div>
```

**Características:**
- ✅ Sidebar deslizable desde la derecha
- ✅ Avatar de PILi con glow animado
- ✅ Área de mensajes scrollable
- ✅ Input con botón de envío

### 5. Option Buttons (Chat)

```html
<div class="chat-options">
    <button class="option-button">🏗️ Obra en ejecución</button>
    <button class="option-button">🏢 Proyecto nuevo</button>
    <button class="option-button">🔧 Mantenimiento</button>
</div>
```

```css
.chat-options {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    margin: 12px 0 !important;
}

.option-button {
    background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%) !important;
    border: 1px solid rgba(245, 158, 11, 0.4) !important;
    color: #fff !important;
    padding: 14px 12px !important;
    border-radius: 12px !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
    min-height: 56px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
}

.option-button:hover {
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
    border-color: #FCD34D !important;
    color: #000 !important;
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3) !important;
}
```

**Características:**
- ✅ Grid de 2 columnas
- ✅ Efecto shine en hover
- ✅ Transición suave
- ✅ Feedback visual claro

### 6. Solution Card (Visual)

```javascript
function displaySolutionCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'solution-card-container';
    cardDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #991B1B, #7f1d1d); padding: 20px; text-align: center; position: relative;">
            <div id="btn-zoom-card" style="position: absolute; top: 10px; right: 10px; cursor: pointer;">🔍</div>
            <img src="assets/logo.png" alt="TESLA" style="height: 45px;">
            <h3 style="color: #fff; margin-top: 10px; font-weight: 800;">FICHA DE ATENCIÓN TÉCNICA</h3>
        </div>
        <div style="padding: 20px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                <p style="font-size: 0.8rem; color: #9ca3af;">PROYECTO / ETAPA</p>
                <p style="font-size: 0.95rem; color: #fff; font-weight: 600;">${data.projectType}</p>
            </div>
            <button id="btn-whatsapp-card" style="background: #25D366;">
                💬 WhatsApp<br>906 315 961
            </button>
            <button id="btn-download-card">📸 Guardar Ficha</button>
        </div>
    `;
    chatBody.appendChild(cardDiv);
}
```

**Características:**
- ✅ Diseño tipo "ficha técnica"
- ✅ Botón de zoom para ampliar
- ✅ Descarga como imagen (html2canvas)
- ✅ WhatsApp directo con datos

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (< 600px) - Default */
/* Smartphones en portrait */

/* Small (600px - 768px) */
@media (min-width: 600px) {
    /* Tablets pequeñas */
}

/* Medium (768px - 1024px) */
@media (min-width: 768px) {
    /* Tablets y laptops pequeñas */
}

/* Large (1024px - 1200px) */
@media (min-width: 1024px) {
    /* Laptops */
}

/* Extra Large (> 1200px) */
@media (min-width: 1200px) {
    /* Desktops */
}
```

### Estrategias Responsive

#### 1. **Typography Scaling**

```css
/* Mobile */
.hero-title {
    font-size: 2.5rem;
}

/* Desktop */
@media (min-width: 768px) {
    .hero-title {
        font-size: 3.8rem;
    }
}
```

#### 2. **Grid Adaptation**

```css
/* Mobile: 1 columna */
.grid-4 {
    grid-template-columns: 1fr;
}

/* Tablet: 2 columnas */
@media (min-width: 768px) {
    .grid-4 {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop: 4 columnas */
@media (min-width: 1024px) {
    .grid-4 {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

#### 3. **Navigation Adaptation**

```css
/* Mobile: Botón WhatsApp */
.mobile-nav {
    display: block;
}
.desktop-nav {
    display: none;
}

/* Desktop: Menú completo */
@media (min-width: 768px) {
    .mobile-nav {
        display: none;
    }
    .desktop-nav {
        display: flex;
    }
}
```

#### 4. **Chat Sidebar**

```css
/* Mobile: Full screen */
#chat-sidebar {
    width: 100%;
}

/* Desktop: 384px sidebar */
@media (min-width: 768px) {
    #chat-sidebar {
        width: 384px;
    }
}
```

---

## ✨ Animaciones y Efectos

### 1. **Gradient Shift (Background)**

```css
@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

body {
    background: linear-gradient(135deg, var(--bg-dark-1) 0%, var(--bg-dark-2) 50%, var(--bg-dark-3) 100%);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
}
```

### 2. **Text Shine (Hero Title)**

```css
@keyframes shine {
    to {
        background-position: 200% center;
    }
}

.hero-title {
    background: linear-gradient(to right, #ffffff 30%, var(--accent-gold) 50%, #ffffff 70%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 4s linear infinite;
}
```

### 3. **Electric Spark (Icons)**

```css
@keyframes electricSpark {
    0%, 100% {
        text-shadow: 0 0 5px #F59E0B, 0 0 10px #F59E0B;
        transform: scale(1);
    }
    50% {
        text-shadow: 0 0 20px #FBBF24, 0 0 30px #FBBF24, 0 0 40px #F59E0B;
        transform: scale(1.1);
    }
}

.electric-icon {
    animation: electricSpark 2s ease-in-out infinite;
}
```

### 4. **Avatar Glow (PILi)**

```css
@keyframes avatarGlow {
    0%, 100% {
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.5),
                    0 0 20px rgba(245, 158, 11, 0.3),
                    0 0 30px rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.8);
    }
    50% {
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.8),
                    0 0 40px rgba(245, 158, 11, 0.6),
                    0 0 60px rgba(251, 191, 36, 0.4);
        border-color: rgba(251, 191, 36, 1);
    }
}

.avatar-glow {
    animation: avatarGlow 2s ease-in-out infinite;
}
```

### 5. **Card Hover**

```css
.card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.card:hover {
    transform: translateY(-15px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    background: rgba(40, 40, 40, 0.7);
    border-color: rgba(197, 160, 89, 0.3);
}
```

### 6. **Button Shine Effect**

```css
.btn-primary::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: 0.5s;
}

.btn-primary:hover::after {
    left: 100%;
}
```

---

## ♿ Accesibilidad y SEO

### Accesibilidad (WCAG 2.1 AA)

#### 1. **Contraste de Color**

✅ **Ratio mínimo 4.5:1** para texto normal
- Blanco (#FFFFFF) sobre Gris Oscuro (#1a202c): 15.8:1 ✓
- Dorado (#F59E0B) sobre Negro (#000000): 8.2:1 ✓

#### 2. **Navegación por Teclado**

```html
<!-- Todos los elementos interactivos son accesibles -->
<button tabindex="0" aria-label="Abrir chat con PILi">
    <i class="fas fa-comments"></i>
</button>
```

#### 3. **ARIA Labels**

```html
<nav aria-label="Navegación principal">
    <a href="#solucion" aria-label="Ir a sección Solución">Solución</a>
</nav>

<button aria-label="Cambiar tema a modo claro" id="theme-toggle">
    <i class="fas fa-sun" aria-hidden="true"></i>
</button>
```

#### 4. **Texto Alternativo**

```html
<img src="assets/logo.png" alt="Logo de TESLA Electricidad y Automatización">
<img src="assets/service_electricity.png" alt="Servicio de electricidad industrial">
```

### SEO

#### 1. **Meta Tags**

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TESLA Electricidad y Automatización S.A.C | Integradores Estratégicos</title>
    <meta name="description" content="Diseño, suministro, instalación e integración de sistemas eléctricos y automatización. Un solo integrador, tranquilidad total.">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://tesla-landing-self.vercel.app/">
    <meta property="og:title" content="TESLA Electricidad y Automatización S.A.C">
    <meta property="og:description" content="Diseño, suministro, instalación e integración de sistemas eléctricos y automatización.">
    <meta property="og:image" content="https://tesla-landing-self.vercel.app/assets/logo.png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://tesla-landing-self.vercel.app/">
    <meta property="twitter:title" content="TESLA Electricidad y Automatización S.A.C">
</head>
```

#### 2. **Estructura Semántica**

```html
<header>
    <nav>...</nav>
</header>

<main>
    <section id="hero">
        <h1>Título Principal</h1>
    </section>
    
    <section id="solucion">
        <h2>El Modelo TESLA</h2>
        <article>...</article>
    </section>
</main>

<footer>
    <address>...</address>
</footer>
```

#### 3. **Performance**

- ✅ **Lazy loading** de imágenes
- ✅ **CDN** para recursos externos
- ✅ **Minificación** de CSS/JS en producción
- ✅ **Cache headers** configurados en Vercel

```html
<img src="assets/service_electricity.png" loading="lazy" alt="...">
```

---

## 🛠️ Guía de Implementación

### Setup Inicial

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd tesla-landing

# 2. Instalar dependencias
npm install

# 3. Ejecutar localmente
npm start

# 4. Abrir en navegador
http://localhost:3000
```

### Agregar Nuevo Servicio

1. **Agregar imagen** a `/assets/service_nuevo.png`

2. **Agregar HTML** en `index.html`:

```html
<div class="rounded-xl overflow-hidden border border-gray-700 hover:border-tesla-gold transition-all duration-300">
    <div onclick="toggleAccordion('accordion-nuevo')" class="group relative h-80 md:h-96 cursor-pointer">
        <img src="assets/service_nuevo.png" alt="Nuevo Servicio">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <div class="absolute bottom-0 left-0 right-0 p-6">
                <div class="text-tesla-gold text-3xl mb-3 electric-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Nuevo Servicio</h3>
            </div>
        </div>
    </div>
    <div id="accordion-nuevo" class="hidden bg-gray-800/50 p-6">
        <p class="text-gray-300 mb-4">Descripción del servicio...</p>
        <button onclick="openChat()">Solicitar Evaluación</button>
    </div>
</div>
```

3. **Agregar función toggle** en `main.js`:

```javascript
function toggleAccordion(id) {
    const element = document.getElementById(id);
    element.classList.toggle('hidden');
}
```

### Personalizar Colores

Editar variables en `styles.css`:

```css
:root {
    --primary-red: #DC2626;      /* Cambiar rojo */
    --accent-gold: #F59E0B;      /* Cambiar dorado */
    --bg-dark-2: #1a202c;        /* Cambiar fondo */
}
```

### Agregar Nueva Animación

```css
@keyframes nuevaAnimacion {
    0% { /* estado inicial */ }
    100% { /* estado final */ }
}

.elemento {
    animation: nuevaAnimacion 2s ease infinite;
}
```

---

## 📚 Recursos y Referencias

### Herramientas de Diseño

- **Figma** - Diseño de mockups
- **ColorHunt** - Paletas de colores
- **Google Fonts** - Tipografía
- **Font Awesome** - Iconos

### Inspiración

- **Awwwards** - Diseño web premium
- **Dribbble** - UI/UX inspiration
- **CodePen** - Efectos y animaciones

### Testing

- **Chrome DevTools** - Debugging
- **Lighthouse** - Performance y SEO
- **WAVE** - Accesibilidad
- **BrowserStack** - Cross-browser testing

---

**Documento preparado para el equipo de desarrollo**  
**TESLA Electricidad y Automatización S.A.C.**
