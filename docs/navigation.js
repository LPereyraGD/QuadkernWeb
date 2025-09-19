/**
 * QuadKern Navigation System
 * Sistema de navegación inteligente con TypeScript
 */
class QuadKernNavigation {
    constructor(config = {}) {
        this.sections = [];
        this.navLinks = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.currentAnimationId = null;
        this.config = {
            headerHeight: 80,
            smoothScrollDuration: 400, // Más rápido para evitar lag
            activeLinkClass: 'active-nav-link',
            offsetThreshold: 100,
            scrollVelocity: 3.0, // Velocidad más alta
            easingType: 'cubic', // Cubic por defecto (más suave)
            ...config
        };
        this.init();
    }
    /**
     * Inicializa el sistema de navegación
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        }
        else {
            this.setup();
        }
    }
    /**
     * Configura todos los event listeners y elementos
     */
    setup() {
        this.collectSections();
        this.setupNavigationLinks();
        this.setupScrollListener();
        this.setupKeyboardNavigation();
        console.log('🧭 QuadKern Navigation initialized with', this.sections.length, 'sections');
    }
    /**
     * Recopila todas las secciones con IDs
     */
    collectSections() {
        const sectionIds = ['inicio', 'servicios', 'proyectos', 'equipo', 'contacto'];
        this.sections = sectionIds
            .map(id => {
            const element = document.getElementById(id);
            if (element) {
                return {
                    id,
                    element,
                    top: 0,
                    bottom: 0
                };
            }
            return null;
        })
            .filter((section) => section !== null);
        this.updateSectionPositions();
    }
    /**
     * Actualiza las posiciones de las secciones
     */
    updateSectionPositions() {
        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            section.top = window.scrollY + rect.top;
            section.bottom = window.scrollY + rect.bottom;
        });
    }
    /**
     * Configura los enlaces de navegación
     */
    setupNavigationLinks() {
        // Buscar todos los enlaces de navegación
        this.navLinks = document.querySelectorAll('a[href^="#"]');
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e));
            // Agregar clase para estilos
            link.classList.add('nav-link');
        });
        console.log('🔗 Found', this.navLinks.length, 'navigation links');
    }
    /**
     * Maneja los clics en enlaces de navegación
     */
    handleNavigationClick(event) {
        event.preventDefault();
        const target = event.currentTarget;
        const href = target.getAttribute('href');
        if (!href || !href.startsWith('#'))
            return;
        const targetId = href.substring(1);
        this.smoothScrollTo(targetId);
        // Actualizar enlace activo
        this.updateActiveLink(target);
    }
    /**
     * Scroll suave a una sección específica
     */
    smoothScrollTo(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.warn(`⚠️ Section "${sectionId}" not found`);
            return;
        }
        // Cancelar animación anterior si existe
        if (this.currentAnimationId) {
            cancelAnimationFrame(this.currentAnimationId);
            this.currentAnimationId = null;
        }
        this.isScrolling = true;
        // Calcular posición objetivo considerando el header fijo
        const targetPosition = Math.max(0, section.top - this.config.headerHeight);
        // Scroll suave con easing
        this.animateScroll(targetPosition);
        console.log(`📍 Scrolling to ${sectionId} at position ${targetPosition}`);
    }
    /**
     * Animación de scroll con velocidad fija y easing elástico
     */
    animateScroll(targetPosition) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const direction = distance > 0 ? 1 : -1;
        const distanceAbs = Math.abs(distance);
        // Calcular duración basada en velocidad fija
        const duration = Math.max(300, Math.min(800, distanceAbs / this.config.scrollVelocity));
        const startTime = performance.now();
        // Función de easing elástica suave (sin jitter)
        const elasticEaseOut = (t) => {
            if (t === 0)
                return 0;
            if (t === 1)
                return 1;
            // Easing más suave para evitar jitter
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        };
        // Función de easing cúbica suave
        const cubicEaseOut = (t) => {
            return 1 - Math.pow(1 - t, 3);
        };
        // Función de easing lineal
        const linearEase = (t) => {
            return t;
        };
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            let easedProgress;
            // Aplicar el tipo de easing seleccionado
            switch (this.config.easingType) {
                case 'elastic':
                    easedProgress = elasticEaseOut(progress);
                    break;
                case 'cubic':
                    easedProgress = cubicEaseOut(progress);
                    break;
                case 'linear':
                default:
                    easedProgress = linearEase(progress);
                    break;
            }
            const currentPosition = startPosition + (distance * easedProgress);
            window.scrollTo(0, Math.round(currentPosition));
            if (progress < 1) {
                this.currentAnimationId = requestAnimationFrame(animate);
            }
            else {
                // Asegurar que llegamos exactamente a la posición objetivo
                window.scrollTo(0, targetPosition);
                this.isScrolling = false;
                this.currentAnimationId = null;
            }
        };
        this.currentAnimationId = requestAnimationFrame(animate);
    }
    /**
     * Actualiza el enlace activo
     */
    updateActiveLink(activeLink) {
        if (!this.navLinks)
            return;
        // Remover clase activa de todos los enlaces
        this.navLinks.forEach(link => {
            link.classList.remove(this.config.activeLinkClass);
        });
        // Agregar clase activa al enlace especificado
        if (activeLink) {
            activeLink.classList.add(this.config.activeLinkClass);
        }
    }
    /**
     * Configura el listener de scroll para detectar sección activa
     */
    setupScrollListener() {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (!this.isScrolling) {
                        this.updateActiveSection();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Actualizar posiciones en resize
        window.addEventListener('resize', () => {
            this.updateSectionPositions();
        });
    }
    /**
     * Actualiza la sección activa basada en el scroll
     */
    updateActiveSection() {
        const scrollPosition = window.scrollY + this.config.headerHeight + this.config.offsetThreshold;
        let activeSection = null;
        for (const section of this.sections) {
            if (scrollPosition >= section.top && scrollPosition < section.bottom) {
                activeSection = section;
                break;
            }
        }
        // Si no encontramos sección activa, usar la primera visible
        if (!activeSection) {
            activeSection = this.sections.find(section => scrollPosition >= section.top) || this.sections[0];
        }
        if (activeSection && this.navLinks) {
            // Encontrar el enlace correspondiente
            const activeLink = Array.from(this.navLinks).find(link => link.getAttribute('href') === `#${activeSection.id}`);
            if (activeLink) {
                this.updateActiveLink(activeLink);
            }
        }
    }
    /**
     * Configura navegación con teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Solo procesar si no estamos en un input
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement) {
                return;
            }
            switch (event.key) {
                case 'Home':
                    event.preventDefault();
                    this.smoothScrollTo('inicio');
                    break;
                case 'End':
                    event.preventDefault();
                    this.smoothScrollTo('contacto');
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateToAdjacentSection(-1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.navigateToAdjacentSection(1);
                    break;
            }
        });
    }
    /**
     * Navega a la sección adyacente
     */
    navigateToAdjacentSection(direction) {
        const currentScroll = window.scrollY + this.config.headerHeight + this.config.offsetThreshold;
        let targetSection = null;
        if (direction > 0) {
            // Navegar hacia abajo
            targetSection = this.sections.find(section => section.top > currentScroll);
        }
        else {
            // Navegar hacia arriba
            targetSection = [...this.sections]
                .reverse()
                .find(section => section.top < currentScroll);
        }
        if (targetSection) {
            this.smoothScrollTo(targetSection.id);
        }
    }
    /**
     * Método público para navegar programáticamente
     */
    navigateTo(sectionId) {
        this.smoothScrollTo(sectionId);
    }
    /**
     * Método público para obtener secciones
     */
    getSections() {
        return [...this.sections];
    }
    /**
     * Método público para actualizar configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.updateSectionPositions();
    }
    /**
     * Cambiar el tipo de easing del scroll
     */
    setEasingType(easingType) {
        this.config.easingType = easingType;
        console.log(`🎯 Scroll easing changed to: ${easingType}`);
    }
    /**
     * Cambiar la velocidad del scroll
     */
    setScrollVelocity(velocity) {
        this.config.scrollVelocity = Math.max(0.5, Math.min(5, velocity));
        console.log(`⚡ Scroll velocity set to: ${this.config.scrollVelocity}`);
    }
    /**
     * Cambiar la duración máxima del scroll
     */
    setScrollDuration(duration) {
        this.config.smoothScrollDuration = Math.max(200, Math.min(1500, duration));
        console.log(`⏱️ Scroll duration set to: ${this.config.smoothScrollDuration}ms`);
    }
    /**
     * Detener cualquier animación en curso
     */
    stopScrolling() {
        if (this.currentAnimationId) {
            cancelAnimationFrame(this.currentAnimationId);
            this.currentAnimationId = null;
        }
        this.isScrolling = false;
        console.log('🛑 Scroll animation stopped');
    }
    /**
     * Destruir la instancia de navegación
     */
    destroy() {
        this.stopScrolling();
        // Remover event listeners
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                link.removeEventListener('click', this.handleNavigationClick);
            });
        }
        console.log('🗑️ Navigation destroyed');
    }
}
// Exportar para uso en otros módulos
export { QuadKernNavigation };
// Inicializar navegación cuando el script se carga (solo si no es importado)
if (typeof window !== 'undefined') {
    const navigation = new QuadKernNavigation();
    window.QuadKernNavigation = QuadKernNavigation;
    window.navigation = navigation;
    console.log('🚀 QuadKern Navigation System loaded');
}
