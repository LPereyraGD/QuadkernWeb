// Sistema de efectos avanzados para QuadKern en TypeScript
// Efectos más sofisticados usando Canvas y WebGL

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

interface ShaderConfig {
  intensity: number;
  speed: number;
  colors: string[];
  enabled: boolean;
}

class QuadKernEffects {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number = 0;
  private config: ShaderConfig;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private time: number = 0;

  constructor() {
    this.config = {
      intensity: 0.8,
      speed: 1.0,
      colors: ['#3498db', '#9b59b6', '#2ecc71', '#e74c3c'],
      enabled: true
    };
    
    this.init();
  }

  private init(): void {
    this.createCanvas();
    this.setupEventListeners();
    this.createParticleSystem();
    this.startAnimation();
  }

  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'quadkern-effects';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '1';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.opacity = '0.6';
    
    document.body.insertBefore(this.canvas, document.body.firstChild);
    
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resizeCanvas());
    
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Efectos especiales al hacer hover en el logo
    const logo = document.querySelector('#inicio img') as HTMLImageElement;
    if (logo) {
      logo.addEventListener('mouseenter', () => {
        this.config.intensity = 1.5;
        this.config.speed = 2.0;
        this.createBurstEffect();
      });

      logo.addEventListener('mouseleave', () => {
        this.config.intensity = 0.8;
        this.config.speed = 1.0;
      });
    }

    // Intensificar efectos en diferentes secciones
    const sections = ['#servicios', '#proyectos', '#equipo', '#contacto'];
    sections.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.createSectionEffect(selector);
            }
          });
        }, { threshold: 0.3 });
        observer.observe(element);
      }
    });
  }

  private createParticleSystem(): void {
    for (let i = 0; i < 50; i++) {
      this.createParticle();
    }
  }

  private createParticle(): void {
    const particle: Particle = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 1,
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
    
    this.particles.push(particle);
  }

  private createBurstEffect(): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = Math.random() * 5 + 3;
      
      const particle: Particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 2,
        color: '#3498db',
        alpha: 0.8,
        life: 0,
        maxLife: 60,
        rotation: angle,
        rotationSpeed: 0.1
      };
      
      this.particles.push(particle);
    }
  }

  private createSectionEffect(section: string): void {
    const colors: { [key: string]: string } = {
      '#servicios': '#3498db',
      '#proyectos': '#9b59b6', 
      '#equipo': '#2ecc71',
      '#contacto': '#e74c3c'
    };

    for (let i = 0; i < 10; i++) {
      const particle: Particle = {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 2,
        size: Math.random() * 3 + 1,
        color: colors[section] || '#3498db',
        alpha: 0.6,
        life: 0,
        maxLife: 100,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.05
      };
      
      this.particles.push(particle);
    }
  }

  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Actualizar posición
      p.x += p.vx * this.config.speed;
      p.y += p.vy * this.config.speed;
      p.rotation += p.rotationSpeed;
      p.life++;

      // Efecto de atracción hacia el mouse
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        p.vx += (dx / distance) * force * 0.1;
        p.vy += (dy / distance) * force * 0.1;
      }

      // Actualizar alpha basado en la vida
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

      // Remover partículas muertas
      if (p.life >= p.maxLife || p.x < -50 || p.x > window.innerWidth + 50 || p.y < -50 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
      }
    }

    // Mantener un número mínimo de partículas
    while (this.particles.length < 30) {
      this.createParticle();
    }
  }

  private drawParticles(): void {
    this.particles.forEach(p => {
      this.ctx.save();
      
      // Configurar el estilo
      this.ctx.globalAlpha = p.alpha * this.config.intensity;
      this.ctx.fillStyle = p.color;
      
      // Crear efecto de glow
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = p.size * 3;
      
      // Dibujar partícula con rotación
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      
      // Dibujar diferentes formas según el tamaño
      if (p.size < 2) {
        this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
  }

  private drawConnections(): void {
    this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          this.ctx.globalAlpha = (150 - distance) / 150 * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }

  private drawWaveShader(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
    
    // Crear gradiente dinámico basado en el tiempo
    const hue1 = (this.time * 0.5) % 360;
    const hue2 = (this.time * 0.3 + 120) % 360;
    const hue3 = (this.time * 0.4 + 240) % 360;
    
    gradient.addColorStop(0, `hsla(${hue1}, 70%, 60%, 0.05)`);
    gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 60%, 0.08)`);
    gradient.addColorStop(1, `hsla(${hue3}, 70%, 60%, 0.05)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    this.time++;
    
    // Limpiar canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    if (this.config.enabled) {
      // Dibujar efectos en orden
      this.drawWaveShader();
      this.drawConnections();
      this.updateParticles();
      this.drawParticles();
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private startAnimation(): void {
    this.animate();
  }

  // Métodos públicos para controlar los efectos
  public setIntensity(intensity: number): void {
    this.config.intensity = Math.max(0, Math.min(2, intensity));
  }

  public setSpeed(speed: number): void {
    this.config.speed = Math.max(0.1, Math.min(3, speed));
  }

  public toggleEffects(): void {
    this.config.enabled = !this.config.enabled;
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const effects = new QuadKernEffects();
  
  // Exponer controles para debugging (opcional)
  (window as any).quadkernEffects = effects;
  
  // Efectos adicionales específicos para QuadKern
  initializeQuadKernSpecificEffects();
});

function initializeQuadKernSpecificEffects(): void {
  // Efecto de typing en el título
  const title = document.querySelector('h1');
  if (title) {
    animateTyping(title);
  }

  // Efectos de scroll mejorados
  setupAdvancedScrollEffects();
  
  // Efectos de hover en las tarjetas del equipo
  setupTeamCardEffects();
}

function animateTyping(element: Element): void {
  const text = element.textContent || '';
  element.textContent = '';
  
  let i = 0;
  const typeInterval = setInterval(() => {
    element.textContent += text[i];
    i++;
    
    if (i >= text.length) {
      clearInterval(typeInterval);
    }
  }, 100);
}

function setupAdvancedScrollEffects(): void {
  let ticking = false;
  
  function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrolled / maxScroll;
    
    // Efecto parallax en diferentes elementos
    const logo = document.querySelector('#inicio img') as HTMLElement;
    if (logo) {
      logo.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 + scrollProgress * 0.1})`;
    }
    
    // Cambiar intensidad de efectos según el scroll
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(0.5 + scrollProgress * 0.8);
    }
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });
}

function setupTeamCardEffects(): void {
  const teamMembers = document.querySelectorAll('[id="equipo"] .flex.flex-col.gap-3.text-center.pb-3');
  
  teamMembers.forEach((member, index) => {
    member.addEventListener('mouseenter', () => {
      // Crear efecto de partículas específico para cada miembro
      const colors = ['#3498db', '#9b59b6', '#2ecc71', '#e74c3c'];
      const memberColor = colors[index % colors.length];
      
      createMemberEffect(member as HTMLElement, memberColor);
    });
  });
}

function createMemberEffect(element: HTMLElement, color: string): void {
  const rect = element.getBoundingClientRect();
  const effects = (window as any).quadkernEffects;
  
  if (effects) {
    // Crear partículas específicas para este miembro del equipo
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        effects.createParticle({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          color: color
        });
      }, i * 50);
    }
  }
}

// Utilidades para efectos matemáticos avanzados
class MathUtils {
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }
  
  static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
  
  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  static noise(x: number, y: number, time: number): number {
    // Implementación simple de ruido para efectos orgánicos
    return Math.sin(x * 0.01 + time * 0.01) * Math.cos(y * 0.01 + time * 0.01);
  }
}

// Exportar para uso en otros módulos si es necesario
export { QuadKernEffects, MathUtils };
