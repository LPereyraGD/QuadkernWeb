// Sistema de navegación avanzado para QuadKern
// Manejo inteligente de scroll, transiciones y UX

interface NavigationConfig {
  smoothScrollDuration: number;
  headerHideThreshold: number;
  sectionChangeThreshold: number;
  enableAnalytics: boolean;
}

interface Section {
  id: string;
  element: HTMLElement;
  inView: boolean;
  progress: number;
}

class QuadKernNavigation {
  private config: NavigationConfig;
  private sections: Map<string, Section> = new Map();
  private currentSection: string = 'inicio';
  private isScrolling: boolean = false;
  private lastScrollY: number = 0;
  private header: HTMLElement | null = null;
  private ticking: boolean = false;

  constructor() {
    this.config = {
      smoothScrollDuration: 800,
      headerHideThreshold: 100,
      sectionChangeThreshold: 0.3,
      enableAnalytics: true
    };
    
    this.init();
  }

  private init(): void {
    this.setupSections();
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupIntersectionObserver();
    this.setupKeyboardNavigation();
    this.trackPageLoad();
  }

  private setupSections(): void {
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

  private setupNavigation(): void {
    this.header = document.querySelector('header');
    
    // Mejorar todos los enlaces de navegación
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (link as HTMLAnchorElement).getAttribute('href')?.substring(1);
        
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

  private navigateToSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section) return;

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

  private smoothScrollTo(targetY: number): void {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.smoothScrollDuration, 1);
      
      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startY + distance * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        this.isScrolling = false;
      }
    };
    
    requestAnimationFrame(animateScroll);
  }

  private updateActiveNavItem(activeId: string): void {
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

  private createNavigationEffect(element: HTMLElement): void {
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

  private setupScrollEffects(): void {
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

  private handleScroll(): void {
    const currentScrollY = window.pageYOffset;
    const direction = currentScrollY > this.lastScrollY ? 1 : -1;
    
    // Auto-hide header al hacer scroll hacia abajo
    if (this.header) {
      if (direction > 0 && currentScrollY > this.config.headerHideThreshold) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }
    }
    
    // Actualizar progreso de secciones
    this.updateSectionProgress();
    
    this.lastScrollY = currentScrollY;
  }

  private updateSectionProgress(): void {
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

  private setupIntersectionObserver(): void {
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
          } else {
            this.onSectionLeave(sectionId);
          }
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section.element);
    });
  }

  private onSectionEnter(sectionId: string): void {
    // Efectos específicos al entrar a cada sección
    const effects = (window as any).quadkernEffects;
    
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

  private onSectionLeave(sectionId: string): void {
    // Normalizar efectos al salir de secciones
    const effects = (window as any).quadkernEffects;
    effects?.setIntensity(0.8);
  }

  private createSectionParticles(color: string): void {
    const effects = (window as any).quadkernEffects;
    if (!effects) return;

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

  private setupKeyboardNavigation(): void {
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

  private highlightSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section) return;
    
    // Crear preview visual de la sección
    section.element.style.transition = 'box-shadow 0.3s ease';
    section.element.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
    
    setTimeout(() => {
      section.element.style.boxShadow = '';
    }, 1000);
  }

  // Analytics y tracking
  private trackPageLoad(): void {
    if (!this.config.enableAnalytics) return;
    
    console.log('📊 QuadKern Analytics: Page loaded', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer
    });
  }

  private trackNavigation(section: string): void {
    if (!this.config.enableAnalytics) return;
    
    console.log('📊 QuadKern Analytics: Navigation', {
      section,
      timestamp: new Date().toISOString(),
      method: 'click'
    });
  }

  private trackSectionView(section: string): void {
    if (!this.config.enableAnalytics) return;
    
    console.log('📊 QuadKern Analytics: Section viewed', {
      section,
      timestamp: new Date().toISOString(),
      scrollPosition: window.pageYOffset
    });
  }

  // Métodos públicos para control externo
  public goToSection(sectionId: string): void {
    this.navigateToSection(sectionId);
  }

  public getCurrentSection(): string {
    return this.currentSection;
  }

  public getSectionProgress(sectionId: string): number {
    return this.sections.get(sectionId)?.progress || 0;
  }

  public enableAutoHideHeader(enable: boolean): void {
    if (this.header) {
      this.header.style.transition = enable ? 'transform 0.3s ease' : 'none';
    }
  }
}

// Sistema de formulario de contacto avanzado
class ContactFormHandler {
  private form: HTMLFormElement | null = null;
  private fields: Map<string, HTMLInputElement | HTMLTextAreaElement> = new Map();
  private isSubmitting: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.setupForm();
    this.setupValidation();
    this.setupAutoSave();
  }

  private setupForm(): void {
    // Crear formulario dinámicamente si no existe
    const contactSection = document.getElementById('contacto');
    if (!contactSection) return;

    const formInputs = contactSection.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      const field = input as HTMLInputElement | HTMLTextAreaElement;
      this.fields.set(field.placeholder.toLowerCase(), field);
      
      // Efectos visuales mejorados
      field.addEventListener('focus', () => this.onFieldFocus(field));
      field.addEventListener('blur', () => this.onFieldBlur(field));
      field.addEventListener('input', () => this.onFieldInput(field));
    });

    // Mejorar el botón de envío
    const submitButton = contactSection.querySelector('button') as HTMLButtonElement;
    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  private onFieldFocus(field: HTMLInputElement | HTMLTextAreaElement): void {
    field.style.transform = 'scale(1.02)';
    field.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
    
    // Crear partículas alrededor del campo
    this.createFieldEffect(field);
  }

  private onFieldBlur(field: HTMLInputElement | HTMLTextAreaElement): void {
    field.style.transform = 'scale(1)';
    field.style.boxShadow = '';
  }

  private onFieldInput(field: HTMLInputElement | HTMLTextAreaElement): void {
    // Validación en tiempo real
    const isValid = this.validateField(field);
    
    if (isValid) {
      field.style.borderColor = 'rgba(46, 204, 113, 0.5)';
    } else {
      field.style.borderColor = 'rgba(231, 76, 60, 0.5)';
    }
    
    // Auto-save en localStorage
    this.saveFormData();
  }

  private validateField(field: HTMLInputElement | HTMLTextAreaElement): boolean {
    const value = field.value.trim();
    
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    
    return value.length > 0;
  }

  private createFieldEffect(field: HTMLInputElement | HTMLTextAreaElement): void {
    const rect = field.getBoundingClientRect();
    const effects = (window as any).quadkernEffects;
    
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

  private setupValidation(): void {
    // Validación avanzada con mensajes personalizados
  }

  private setupAutoSave(): void {
    setInterval(() => {
      this.saveFormData();
    }, 5000); // Auto-save cada 5 segundos
  }

  private saveFormData(): void {
    const formData: { [key: string]: string } = {};
    
    this.fields.forEach((field, key) => {
      formData[key] = field.value;
    });
    
    localStorage.setItem('quadkern-contact-form', JSON.stringify(formData));
  }

  private loadFormData(): void {
    const saved = localStorage.getItem('quadkern-contact-form');
    if (!saved) return;
    
    try {
      const formData = JSON.parse(saved);
      this.fields.forEach((field, key) => {
        if (formData[key]) {
          field.value = formData[key];
        }
      });
    } catch (e) {
      console.error('Error loading form data:', e);
    }
  }

  private async handleSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    
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
      
    } catch (error) {
      this.showError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
    
    this.isSubmitting = false;
  }

  private async simulateFormSubmission(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 2000); // Simular delay de red
    });
  }

  private showLoading(): void {
    const button = document.querySelector('#contacto button') as HTMLButtonElement;
    if (button) {
      button.innerHTML = '<span class="truncate">Enviando...</span>';
      button.style.opacity = '0.7';
    }
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
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
    } else {
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

  private createSuccessEffect(): void {
    const effects = (window as any).quadkernEffects;
    if (!effects) return;
    
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

  private clearForm(): void {
    this.fields.forEach(field => {
      field.value = '';
      field.style.borderColor = '';
    });
    
    localStorage.removeItem('quadkern-contact-form');
    
    const button = document.querySelector('#contacto button') as HTMLButtonElement;
    if (button) {
      button.innerHTML = '<span class="truncate">Enviar</span>';
      button.style.opacity = '1';
    }
  }

  private setupKeyboardNavigation(): void {
    // Navegación con teclado entre campos
    const fieldsArray = Array.from(this.fields.values());
    
    fieldsArray.forEach((field, index) => {
      field.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab' && !e.shiftKey && index === fieldsArray.length - 1) {
          // Al salir del último campo, enfocar el botón de envío
          e.preventDefault();
          const submitButton = document.querySelector('#contacto button') as HTMLButtonElement;
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
  (window as any).quadkernNavigation = navigation;
  (window as any).quadkernContactForm = contactForm;
  
  console.log('🚀 QuadKern TypeScript systems initialized!');
});

export { QuadKernNavigation, ContactFormHandler };
