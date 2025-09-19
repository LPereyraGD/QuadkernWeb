/**
 * QuadKern Navigation System
 * Sistema de navegación inteligente con TypeScript
 */
class QuadKernNavigation {
    constructor(config = {}) {
        this.config = {
            headerHeight: 80,
            smoothScrollDuration: 800,
            activeLinkClass: 'active-nav-link',
            offsetThreshold: 100,
            ...config
        };
        this.sections = [];
        this.navLinks = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
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
        this.isScrolling = true;
        // Calcular posición objetivo considerando el header fijo
        const targetPosition = Math.max(0, section.top - this.config.headerHeight);
        // Scroll suave con easing
        this.animateScroll(targetPosition);
        console.log(`📍 Scrolling to ${sectionId} at position ${targetPosition}`);
    }
    /**
     * Animación de scroll personalizada
     */
    animateScroll(targetPosition) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();
        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.config.smoothScrollDuration, 1);
            const easedProgress = easeInOutCubic(progress);
            const currentPosition = startPosition + (distance * easedProgress);
            window.scrollTo(0, currentPosition);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                this.isScrolling = false;
            }
        };
        requestAnimationFrame(animate);
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
            activeSection = this.sections.find(section => 
            scrollPosition >= section.top) || this.sections[0];
        }
        if (activeSection && this.navLinks) {
            // Encontrar el enlace correspondiente
            const activeLink = Array.from(this.navLinks).find(link => 
            link.getAttribute('href') === `#${activeSection.id}`);
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
}
// Inicializar navegación cuando el script se carga
const navigation = new QuadKernNavigation();
// Exportar para uso global
window.QuadKernNavigation = QuadKernNavigation;
window.navigation = navigation;
console.log('🚀 QuadKern Navigation System loaded');