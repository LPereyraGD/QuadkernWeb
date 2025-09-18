// Sistema de navegación avanzado para QuadKern
// Manejo inteligente de scroll, transiciones y UX
class QuadKernNavigation {
    constructor() {
        this.sections = new Map();
        this.currentSection = 'inicio';
        this.isScrolling = false;
        this.lastScrollY = 0;
        this.header = null;
        this.ticking = false;
        this.config = {
            smoothScrollDuration: 800,
            headerHideThreshold: 100,
            sectionChangeThreshold: 0.3,
            enableAnalytics: true
        };
        this.init();
    }
    init() {
        this.setupSections();
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupIntersectionObserver();
        this.setupKeyboardNavigation();
        this.trackPageLoad();
    }
    setupSections() {
        const sectionIds = ['inicio', 'servicios', 'proyectos', 'equipo', 'contacto'];
        sectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.sections.set(id, {
                    id,
                    element,
                    inView: false,
                    progress: 0
                });
            }
        });
    }
    setupNavigation() {
        this.header = document.querySelector('header');
        // Mejorar todos los enlaces de navegación
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                if (targetId) {
                    this.navigateToSection(targetId);
                    this.trackNavigation(targetId);
                }
            });
            // Efectos visuales en hover
            link.addEventListener('mouseenter', () => {
                this.highlightSection(link.getAttribute('href')?.substring(1) || '');
            });
        });
    }
    navigateToSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section)
            return;
        this.isScrolling = true;
        this.currentSection = sectionId;
        // Calcular posición con offset para el header
        const headerHeight = this.header?.offsetHeight || 0;
        const targetY = section.element.offsetTop - headerHeight;
        // Smooth scroll personalizado con easing
        this.smoothScrollTo(targetY);
        // Actualizar estado activo en navegación
        this.updateActiveNavItem(sectionId);
        // Efecto visual especial al navegar
        this.createNavigationEffect(section.element);
    }
    smoothScrollTo(targetY) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.config.smoothScrollDuration, 1);
            // Easing function (ease-out-cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, startY + distance * easeProgress);
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
            else {
                this.isScrolling = false;
            }
        };
        requestAnimationFrame(animateScroll);
    }
    updateActiveNavItem(activeId) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('header a').forEach(link => {
            link.classList.remove('text-[#2970ff]', 'font-bold');
            link.classList.add('text-white');
        });
        // Agregar clase activa al enlace actual
        const activeLink = document.querySelector(`header a[href="#${activeId}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-white');
            activeLink.classList.add('text-[#2970ff]', 'font-bold');
        }
    }
    createNavigationEffect(element) {
        // Crear efecto de "spotlight" en la sección
        const spotlight = document.createElement('div');
        spotlight.style.position = 'absolute';
        spotlight.style.top = '0';
        spotlight.style.left = '0';
        spotlight.style.width = '100%';
        spotlight.style.height = '100%';
        spotlight.style.background = 'radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)';
        spotlight.style.pointerEvents = 'none';
        spotlight.style.zIndex = '10';
        spotlight.style.opacity = '0';
        spotlight.style.transition = 'opacity 0.5s ease';
        element.style.position = 'relative';
        element.appendChild(spotlight);
        // Animar spotlight
        setTimeout(() => {
            spotlight.style.opacity = '1';
        }, 100);
        setTimeout(() => {
            spotlight.style.opacity = '0';
            setTimeout(() => {
                if (spotlight.parentNode) {
                    spotlight.parentNode.removeChild(spotlight);
                }
            }, 500);
        }, 1500);
    }
    setupScrollEffects() {
        let lastDirection = 0;
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }
    handleScroll() {
        const currentScrollY = window.pageYOffset;
        const direction = currentScrollY > this.lastScrollY ? 1 : -1;
        // Auto-hide header al hacer scroll hacia abajo
        if (this.header) {
            if (direction > 0 && currentScrollY > this.config.headerHideThreshold) {
                this.header.style.transform = 'translateY(-100%)';
            }
            else {
                this.header.style.transform = 'translateY(0)';
            }
        }
        // Actualizar progreso de secciones
        this.updateSectionProgress();
        this.lastScrollY = currentScrollY;
    }
    updateSectionProgress() {
        this.sections.forEach((section, id) => {
            const rect = section.element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Calcular qué tan visible está la sección
            const visibleTop = Math.max(0, -rect.top);
            const visibleBottom = Math.min(rect.height, windowHeight - rect.top);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            section.progress = visibleHeight / rect.height;
            section.inView = section.progress > this.config.sectionChangeThreshold;
            // Actualizar sección actual
            if (section.inView && section.progress > 0.5) {
                if (this.currentSection !== id && !this.isScrolling) {
                    this.currentSection = id;
                    this.updateActiveNavItem(id);
                    this.trackSectionView(id);
                }
            }
        });
    }
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '-50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                const section = this.sections.get(sectionId);
                if (section) {
                    section.inView = entry.isIntersecting;
                    // Efectos especiales al entrar/salir de vista
                    if (entry.isIntersecting) {
                        this.onSectionEnter(sectionId);
                    }
                    else {
                        this.onSectionLeave(sectionId);
                    }
                }
            });
        }, observerOptions);
        this.sections.forEach(section => {
            observer.observe(section.element);
        });
    }
    onSectionEnter(sectionId) {
        // Efectos específicos al entrar a cada sección
        const effects = window.quadkernEffects;
        switch (sectionId) {
            case 'servicios':
                effects?.setIntensity(1.2);
                this.createSectionParticles('#3498db');
                break;
            case 'proyectos':
                effects?.setIntensity(1.0);
                this.createSectionParticles('#9b59b6');
                break;
            case 'equipo':
                effects?.setIntensity(1.5);
                this.createSectionParticles('#2ecc71');
                break;
            case 'contacto':
                effects?.setIntensity(0.8);
                this.createSectionParticles('#e74c3c');
                break;
        }
    }
    onSectionLeave(sectionId) {
        // Normalizar efectos al salir de secciones
        const effects = window.quadkernEffects;
        effects?.setIntensity(0.8);
    }
    createSectionParticles(color) {
        const effects = window.quadkernEffects;
        if (!effects)
            return;
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                // Crear partículas desde los bordes de la pantalla
                const side = Math.floor(Math.random() * 4);
                let x, y, vx, vy;
                switch (side) {
                    case 0: // Top
                        x = Math.random() * window.innerWidth;
                        y = -10;
                        vx = (Math.random() - 0.5) * 2;
                        vy = Math.random() * 2 + 1;
                        break;
                    case 1: // Right
                        x = window.innerWidth + 10;
                        y = Math.random() * window.innerHeight;
                        vx = -Math.random() * 2 - 1;
                        vy = (Math.random() - 0.5) * 2;
                        break;
                    case 2: // Bottom
                        x = Math.random() * window.innerWidth;
                        y = window.innerHeight + 10;
                        vx = (Math.random() - 0.5) * 2;
                        vy = -Math.random() * 2 - 1;
                        break;
                    default: // Left
                        x = -10;
                        y = Math.random() * window.innerHeight;
                        vx = Math.random() * 2 + 1;
                        vy = (Math.random() - 0.5) * 2;
                }
                effects.createCustomParticle({ x, y, vx, vy, color });
            }, i * 100);
        }
    }
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const sectionIds = Array.from(this.sections.keys());
            const currentIndex = sectionIds.indexOf(this.currentSection);
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        this.navigateToSection(sectionIds[currentIndex - 1]);
                    }
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < sectionIds.length - 1) {
                        this.navigateToSection(sectionIds[currentIndex + 1]);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    this.navigateToSection('inicio');
                    break;
                case 'End':
                    e.preventDefault();
                    this.navigateToSection('contacto');
                    break;
            }
        });
    }
    highlightSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section)
            return;
        // Crear preview visual de la sección
        section.element.style.transition = 'box-shadow 0.3s ease';
        section.element.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
        setTimeout(() => {
            section.element.style.boxShadow = '';
        }, 1000);
    }
    // Analytics y tracking
    trackPageLoad() {
        if (!this.config.enableAnalytics)
            return;
        console.log('📊 QuadKern Analytics: Page loaded', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer
        });
    }
    trackNavigation(section) {
        if (!this.config.enableAnalytics)
            return;
        console.log('📊 QuadKern Analytics: Navigation', {
            section,
            timestamp: new Date().toISOString(),
            method: 'click'
        });
    }
    trackSectionView(section) {
        if (!this.config.enableAnalytics)
            return;
        console.log('📊 QuadKern Analytics: Section viewed', {
            section,
            timestamp: new Date().toISOString(),
            scrollPosition: window.pageYOffset
        });
    }
    // Métodos públicos para control externo
    goToSection(sectionId) {
        this.navigateToSection(sectionId);
    }
    getCurrentSection() {
        return this.currentSection;
    }
    getSectionProgress(sectionId) {
        return this.sections.get(sectionId)?.progress || 0;
    }
    enableAutoHideHeader(enable) {
        if (this.header) {
            this.header.style.transition = enable ? 'transform 0.3s ease' : 'none';
        }
    }
}
// Sistema de formulario de contacto avanzado
class ContactFormHandler {
    constructor() {
        this.form = null;
        this.fields = new Map();
        this.isSubmitting = false;
        this.init();
    }
    init() {
        this.setupForm();
        this.setupValidation();
        this.setupAutoSave();
    }
    setupForm() {
        // Crear formulario dinámicamente si no existe
        const contactSection = document.getElementById('contacto');
        if (!contactSection)
            return;
        const formInputs = contactSection.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            const field = input;
            this.fields.set(field.placeholder.toLowerCase(), field);
            // Efectos visuales mejorados
            field.addEventListener('focus', () => this.onFieldFocus(field));
            field.addEventListener('blur', () => this.onFieldBlur(field));
            field.addEventListener('input', () => this.onFieldInput(field));
        });
        // Mejorar el botón de envío
        const submitButton = contactSection.querySelector('button');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }
    onFieldFocus(field) {
        field.style.transform = 'scale(1.02)';
        field.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
        // Crear partículas alrededor del campo
        this.createFieldEffect(field);
    }
    onFieldBlur(field) {
        field.style.transform = 'scale(1)';
        field.style.boxShadow = '';
    }
    onFieldInput(field) {
        // Validación en tiempo real
        const isValid = this.validateField(field);
        if (isValid) {
            field.style.borderColor = 'rgba(46, 204, 113, 0.5)';
        }
        else {
            field.style.borderColor = 'rgba(231, 76, 60, 0.5)';
        }
        // Auto-save en localStorage
        this.saveFormData();
    }
    validateField(field) {
        const value = field.value.trim();
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
        return value.length > 0;
    }
    createFieldEffect(field) {
        const rect = field.getBoundingClientRect();
        const effects = window.quadkernEffects;
        if (effects) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    effects.createCustomParticle({
                        x: rect.left + Math.random() * rect.width,
                        y: rect.top + Math.random() * rect.height,
                        color: '#3498db'
                    });
                }, i * 100);
            }
        }
    }
    setupValidation() {
        // Validación avanzada con mensajes personalizados
    }
    setupAutoSave() {
        setInterval(() => {
            this.saveFormData();
        }, 5000); // Auto-save cada 5 segundos
    }
    saveFormData() {
        const formData = {};
        this.fields.forEach((field, key) => {
            formData[key] = field.value;
        });
        localStorage.setItem('quadkern-contact-form', JSON.stringify(formData));
    }
    loadFormData() {
        const saved = localStorage.getItem('quadkern-contact-form');
        if (!saved)
            return;
        try {
            const formData = JSON.parse(saved);
            this.fields.forEach((field, key) => {
                if (formData[key]) {
                    field.value = formData[key];
                }
            });
        }
        catch (e) {
            console.error('Error loading form data:', e);
        }
    }
    async handleSubmit() {
        if (this.isSubmitting)
            return;
        this.isSubmitting = true;
        // Validar todos los campos
        let isValid = true;
        this.fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        if (!isValid) {
            this.showError('Por favor, completa todos los campos correctamente.');
            this.isSubmitting = false;
            return;
        }
        // Simular envío (GitHub Pages no puede procesar formularios)
        this.showLoading();
        try {
            // Aquí podrías integrar con servicios como Formspree, Netlify Forms, etc.
            await this.simulateFormSubmission();
            this.showSuccess('¡Mensaje enviado correctamente! Te contactaremos pronto.');
            this.clearForm();
            this.createSuccessEffect();
        }
        catch (error) {
            this.showError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
        }
        this.isSubmitting = false;
    }
    async simulateFormSubmission() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // Simular delay de red
        });
    }
    showLoading() {
        const button = document.querySelector('#contacto button');
        if (button) {
            button.innerHTML = '<span class="truncate">Enviando...</span>';
            button.style.opacity = '0.7';
        }
    }
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    showError(message) {
        this.showNotification(message, 'error');
    }
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'transform 0.3s ease';
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        }
        else {
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        }
        notification.textContent = message;
        document.body.appendChild(notification);
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    createSuccessEffect() {
        const effects = window.quadkernEffects;
        if (!effects)
            return;
        // Crear celebración de partículas
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                effects.createCustomParticle({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    color: '#2ecc71',
                    size: Math.random() * 5 + 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10
                });
            }, i * 50);
        }
    }
    clearForm() {
        this.fields.forEach(field => {
            field.value = '';
            field.style.borderColor = '';
        });
        localStorage.removeItem('quadkern-contact-form');
        const button = document.querySelector('#contacto button');
        if (button) {
            button.innerHTML = '<span class="truncate">Enviar</span>';
            button.style.opacity = '1';
        }
    }
    setupKeyboardNavigation() {
        // Navegación con teclado entre campos
        const fieldsArray = Array.from(this.fields.values());
        fieldsArray.forEach((field, index) => {
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && !e.shiftKey && index === fieldsArray.length - 1) {
                    // Al salir del último campo, enfocar el botón de envío
                    e.preventDefault();
                    const submitButton = document.querySelector('#contacto button');
                    if (submitButton) {
                        submitButton.focus();
                    }
                }
            });
        });
    }
}
// Inicializar sistemas
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new QuadKernNavigation();
    const contactForm = new ContactFormHandler();
    // Exponer para debugging
    window.quadkernNavigation = navigation;
    window.quadkernContactForm = contactForm;
    console.log('🚀 QuadKern TypeScript systems initialized!');
});
export { QuadKernNavigation, ContactFormHandler };
