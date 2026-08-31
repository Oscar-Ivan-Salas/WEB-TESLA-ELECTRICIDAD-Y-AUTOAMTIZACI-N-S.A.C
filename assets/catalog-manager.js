/**
 * TESLA VISUAL CATALOG MANAGER
 * Sistema centralizado de gestión de fotos y proyectos para Landing Page y Dashboard
 */

const STORAGE_KEY = 'tesla_visual_catalog_v4';

const DEFAULT_SERVICES = [
    { id: 's1', title: 'Infraestructura Eléctrica', image: 'assets/service_electricity.png', category: 'Eléctrica' },
    { id: 's2', title: 'Automatización y BMS', image: 'assets/service_automation.png', category: 'Automatización' },
    { id: 's3', title: 'Contra Incendios NFPA', image: 'assets/service_fire_safety.png', category: 'Incendios' },
    { id: 's4', title: 'Vigilancia & CCTV 24/7', image: 'assets/service_security.png', category: 'Seguridad' },
    { id: 's5', title: 'Acabados Funcionales', image: 'assets/service_finishes.png', category: 'Acabados' },
    { id: 's6', title: 'Certificado ITSE / INDECI', image: 'assets/service_itse.png', category: 'ITSE' },
    { id: 's7', title: 'Ingeniería BIM / MEP 3D', image: 'assets/service_bim_mep.png', category: 'BIM/MEP' },
    { id: 's8', title: 'Solución Llave en Mano', image: 'assets/service_integral.png', category: 'Integral' }
];

const DEFAULT_PROJECTS = [
    { id: 'p1', title: 'Complejos Inmobiliarios', badge: '⚡ Electrificación & BMS', desc: 'Gestión integral de instalaciones eléctricas y automatización en alta densidad. Personal equipado con cascos dieléctricos, chalecos reflectivos y EPPs con logo de TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_1.png' },
    { id: 'p2', title: 'Grandes Contratistas', badge: '🏗️ Suministros & Montaje', desc: 'Socio estratégico para proyectos de construcción civil. Técnicos de campo con uniforme normado, botas de seguridad 10kV y cascos con sello oficial TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_2.png' },
    { id: 'p3', title: 'Puesta a Tierra Industrial', badge: '📜 Medición & Protocolos CNE', desc: 'Diseño, instalación y certificación de mallas a tierra. Operadores con guantes dieléctricos Clase 0, arnés anticaídas y EPPs normados TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_3.png' },
    { id: 'p4', title: 'Edificios Inteligentes & IoT', badge: '🤖 SCADA & Control BMS', desc: 'Integración de domótica, SCADA y fibra óptica. Especialistas con uniforme institucional, visores de protección y cascos rotulados con logo TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_4.png' },
    { id: 'p5', title: 'Planta Minera & Industrial', badge: '🚨 Protección NFPA & Motores', desc: 'Automatización de motores y detección de incendios en minería. Personal con trajes ignífugos NFPA, cascos dieléctricos Clase E y EPPs pesados TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_5.png' },
    { id: 'p6', title: 'Data Centers & Racks IT', badge: '⚡ Energía Ininterrumpida UPS', desc: 'Infraestructura Tier III y UPS redundantes. Ingenieros de precisión vistiendo EPPs de sala limpia y uniformes corporativos oficial TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_6.png' },
    { id: 'p7', title: 'Centros Comerciales & Malls', badge: '❄️ Ductos HVAC & Bandejas', desc: 'Montaje de ductos mecánicos y bandejas porta-cables. Cuadrillas en altura con arnés de seguridad homologado, líneas de vida y cascos con logo TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_7.png' },
    { id: 'p8', title: 'Almacenes Logísticos', badge: '🚨 Detección de Humo por Haz', desc: 'Sistemas de iluminación LED a gran altura y detección óptica. Operadores sobre elevadores de tijera vistiendo EPPs completos y uniformes TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_8.png' },
    { id: 'p9', title: 'Hospitales & Clínicas', badge: '🏥 Sistemas Médicos Aislados', desc: 'Redes críticas y transformadores de aislamiento. Personal técnico capacitado operando con uniformes limpios, calzado aislante y EPPs normados TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_9.png' },
    { id: 'p10', title: 'Subestaciones Eléctricas', badge: '⚡ Media & Alta Tensión', desc: 'Montaje de celdas SF6 y transformadores de potencia. Linieros y maniobristas con trajes antiarco, caretas faciales 40 cal y cascos con el emblema TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_10.png' },
    { id: 'p11', title: 'Ingeniería BIM / MEP 3D', badge: '📐 Navisworks & Revit 3D', desc: 'Modelado 3D y auditoría en campo. Ingenieros de campo realizando supervisión con tabletas resistentes, cascos de protección e indumentaria TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_11.png' },
    { id: 'p12', title: 'Solución Llave en Mano 360°', badge: '🔑 Responsabilidad Técnica Total', desc: 'Entrega integral con puesta en marcha. Equipo multidisciplinario equipado al 100% con EPPs de última generación y vestimenta institucional TESLA ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.', image: 'assets/project_12.png' }
];

window.TeslaCatalog = {
    getCatalog: function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error al leer el catálogo visual de localStorage:', e);
        }
        const initial = { services: DEFAULT_SERVICES, projects: DEFAULT_PROJECTS };
        this.saveCatalog(initial);
        return initial;
    },

    saveCatalog: function(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error al guardar catálogo visual:', e);
        }
    },

    resetToFactory: function() {
        const initial = { services: DEFAULT_SERVICES, projects: DEFAULT_PROJECTS };
        this.saveCatalog(initial);
        return initial;
    },

    updateServiceImage: function(serviceId, newImageDataUrl) {
        const catalog = this.getCatalog();
        const s = catalog.services.find(item => item.id === serviceId);
        if (s) {
            s.image = newImageDataUrl;
            this.saveCatalog(catalog);
        }
    },

    updateProject: function(projectId, updatedData) {
        const catalog = this.getCatalog();
        const index = catalog.projects.findIndex(item => item.id === projectId);
        if (index !== -1) {
            catalog.projects[index] = { ...catalog.projects[index], ...updatedData };
            this.saveCatalog(catalog);
        }
    },

    addProject: function(newProject) {
        const catalog = this.getCatalog();
        const newId = 'p_' + Date.now();
        const projectObj = {
            id: newId,
            title: newProject.title || 'Nuevo Proyecto TESLA',
            badge: newProject.badge || '🏗️ Proyecto Realizado',
            desc: newProject.desc || 'Descripción técnica del proyecto.',
            image: newProject.image || 'assets/project_1.png'
        };
        catalog.projects.push(projectObj);
        this.saveCatalog(catalog);
        return projectObj;
    },

    deleteProject: function(projectId) {
        const catalog = this.getCatalog();
        catalog.projects = catalog.projects.filter(item => item.id !== projectId);
        this.saveCatalog(catalog);
    },

    bakeTeslaLogoOnCanvas: function(imageSrc, callback) {
        if (typeof callback === 'function') {
            callback(imageSrc);
        }
        return imageSrc;
    }
};
