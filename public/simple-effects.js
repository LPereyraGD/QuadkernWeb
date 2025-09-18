// Efectos simples pero potentes para QuadKern - JavaScript puro
// Versión que funciona inmediatamente sin compilación

class SimpleQuadKernEffects {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.createInitialParticles();
        this.startAnimation();
        console.log('🎨 QuadKern Effects initialized!');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'quadkern-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '10';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.8';
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Efecto sutil al hacer hover en el logo (sin burst)
        const logo = document.querySelector('#inicio img');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                this.createSubtleLogoEffect();
            });
        }
        
        // Efectos en navegación
        const navLinks = document.querySelectorAll('header a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.createNavEffect();
            });
        });
    }
    
    createInitialParticles() {
        for (let i = 0; i < 25; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const colors = ['#3498db', '#2c3e50']; // Solo azul y gris oscuro
        
        this.particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.8, // Más lentas
            vy: (Math.random() - 0.5) * 0.8, // Más lentas
            size: Math.random() * 3 + 1, // Más pequeñas
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.3 + 0.4, // Un poco más visibles
            life: 0,
            maxLife: Math.random() * 500 + 400 // Viven más tiempo
        });
    }
    
    createSubtleLogoEffect() {
        // Efecto sutil y profesional al hacer hover en el logo
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 2 + 1,
                color: '#3498db',
                alpha: 0.6,
                life: 0,
                maxLife: 120
            });
        }
        
        console.log('✨ Subtle logo effect created!');
    }
    
    createNavEffect() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.mouseX,
                y: this.mouseY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1,
                color: '#2970ff',
                alpha: 0.6,
                life: 0,
                maxLife: 80
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            
            // Efecto de atracción sutil hacia el mouse
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100 && distance > 0) {
                const force = (100 - distance) / 100 * 0.05;
                p.vx += (dx / distance) * force;
                p.vy += (dy / distance) * force;
            }
            
            // Actualizar alpha
            p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
            
            // Remover partículas muertas
            if (p.life >= p.maxLife || p.x < -50 || p.x > window.innerWidth + 50 || p.y < -50 || p.y > window.innerHeight + 50) {
                this.particles.splice(i, 1);
            }
        }
        
        // Mantener partículas mínimas
        while (this.particles.length < 20) {
            this.createParticle();
        }
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.save();
            
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = p.size * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.05)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.globalAlpha = (150 - distance) / 150 * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.time++;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Dibujar efectos
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        // Debug info (menos frecuente)
        if (this.time % 300 === 0) { // Cada 5 segundos aprox
            console.log(`🎨 Particles: ${this.particles.length}`);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        this.animate();
    }
}

// Navegación mejorada simple
class SimpleNavigation {
    constructor() {
        this.setupSmoothScroll();
        this.setupActiveLinks();
        console.log('🧭 Navigation initialized!');
    }
    
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    console.log(`🎯 Navigating to: ${targetId}`);
                }
            });
        });
    }
    
    setupActiveLinks() {
        const sections = document.querySelectorAll('[id]');
        const navLinks = document.querySelectorAll('header a[href^="#"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    
                    // Remover active de todos
                    navLinks.forEach(link => {
                        link.classList.remove('text-[#2970ff]', 'font-bold');
                        link.classList.add('text-white');
                    });
                    
                    // Agregar active al actual
                    const activeLink = document.querySelector(`header a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.remove('text-white');
                        activeLink.classList.add('text-[#2970ff]', 'font-bold');
                    }
                    
                    console.log(`📍 Section in view: ${id}`);
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 QuadKern loading...');
    
    // Crear efectos
    const effects = new SimpleQuadKernEffects();
    const navigation = new SimpleNavigation();
    
    // Exponer globalmente para debugging
    window.quadkernEffects = effects;
    window.quadkernNavigation = navigation;
    
    console.log('✅ QuadKern loaded successfully!');
    console.log('🎮 Try: quadkernEffects.createBurst() in console');
    console.log('🔍 Debug: quadkernEffects.debugCanvas() to check canvas');
    
    // Función de debug
    effects.debugCanvas = function() {
        console.log('🎨 Canvas Debug Info:');
        console.log('Canvas exists:', !!this.canvas);
        console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
        console.log('Canvas visible:', this.canvas.style.opacity);
        console.log('Canvas z-index:', this.canvas.style.zIndex);
        console.log('Particles count:', this.particles.length);
        console.log('Animation running:', !!this.animationId);
        
        // Crear partícula de prueba SÚPER visible
        this.particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: 0,
            vy: 0,
            size: 50,
            color: '#ff0000',
            alpha: 1,
            life: 0,
            maxLife: 1000
        });
        
        // También crear algunas partículas moviéndose
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: 15,
                color: '#00ff00',
                alpha: 1,
                life: 0,
                maxLife: 500
            });
        }
        
        console.log('🔴 Created HUGE red test particle at center + 10 green particles');
    };
});

// Debug: Mostrar si el script se carga
console.log('📄 simple-effects.js loaded');
