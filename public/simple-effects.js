class SimpleQuadKernEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastEffectTime = 0;
        this.effectCooldown = 500; // Aumentado a 500ms para evitar spam
        
        this.init();
    }
    
    init() {
        // Crear canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10';
        this.canvas.style.opacity = '0.8';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Seguimiento del mouse
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Crear partículas iniciales
        this.createInitialParticles();
        
        // Configurar efectos en elementos
        this.setupEffects();
        
        // Iniciar animación
        this.animate();
        
        console.log('🎨 QuadKern Effects initialized!');
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEffects() {
        // Efecto sutil en logo (reducido drásticamente)
        const logo = document.querySelector('.hero-logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                // Solo 8 partículas pequeñas y lentas
                for (let i = 0; i < 8; i++) {
                    this.particles.push({
                        x: this.mouseX + (Math.random() - 0.5) * 30,
                        y: this.mouseY + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: (Math.random() - 0.5) * 0.8,
                        size: Math.random() * 1.5 + 0.5,
                        color: '#74b9ff',
                        alpha: 0.4,
                        life: 0,
                        maxLife: 40
                    });
                }
            });
        }
        
        // Efectos en navegación + funcionalidad smooth scroll
        const navLinks = document.querySelectorAll('header a[href^="#"], .hero-btn-primary, .hero-btn-secondary, .projects-cta-btn');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.createNavEffect();
            });
            
            // Agregar funcionalidad de smooth scroll
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerHeight = 80; // Altura del header fijo
                        const targetPosition = targetElement.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        console.log(`🧭 Navegando a: ${targetId}`);
                    } else {
                        console.warn(`⚠️ No se encontró elemento con ID: ${targetId}`);
                    }
                }
            });
        });
        
        // Efectos en servicios
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const serviceType = card.getAttribute('data-service');
                this.createServiceEffect(serviceType);
            });
        });
        
        // Efectos en proyectos
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const projectType = card.getAttribute('data-type');
                this.createProjectEffect(projectType);
            });
        });
        
        // Efectos en equipo
        const teamMembers = document.querySelectorAll('.team-member');
        teamMembers.forEach((member, index) => {
            member.addEventListener('mouseenter', () => {
                const memberNames = ['augusto', 'lautaro', 'nicolas', 'mateo'];
                const memberName = memberNames[index] || 'default';
                this.createTeamEffect(memberName);
            });
        });
        
        // Efectos en contacto
        const contactInputs = document.querySelectorAll('.form-input, .form-textarea');
        contactInputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.createContactEffect();
            });
        });
        
        const submitBtn = document.querySelector('.form-submit');
        if (submitBtn) {
            submitBtn.addEventListener('mouseenter', () => {
                this.createContactEffect();
            });
        }
    }
    
    createInitialParticles() {
        // Crear 25 partículas iniciales (mínimo 20)
        const count = Math.max(25, 20);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#3498db' : '#2c3e50',
                alpha: Math.random() * 0.3 + 0.4,
                life: Math.random() * 100,
                maxLife: 200 + Math.random() * 100
            });
        }
    }
    
    createNavEffect() {
        // Control de cooldown para evitar spam
        const now = Date.now();
        if (now - this.lastEffectTime < this.effectCooldown) {
            return;
        }
        this.lastEffectTime = now;
        
        // Solo 3 partículas muy sutiles para navegación
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 20,
                y: this.mouseY + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                size: Math.random() * 1.5 + 0.5,
                color: '#74b9ff',
                alpha: 0.3,
                life: 0,
                maxLife: 30
            });
        }
    }
    
    createServiceEffect(serviceType) {
        // Control de cooldown para evitar spam
        const now = Date.now();
        if (now - this.lastEffectTime < this.effectCooldown) {
            return;
        }
        this.lastEffectTime = now;
        
        const colors = {
            'mobile': '#3498db',
            'games': '#6c5ce7', 
            'backend': '#2ecc71',
            'consulting': '#f39c12'
        };
        
        const color = colors[serviceType] || '#3498db';
        
        // Reducido a 4 partículas (ultra sutil)
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 40,
                y: this.mouseY + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 2 + 1,
                color: color,
                alpha: 0.3,
                life: 0,
                maxLife: 60
            });
        }
        
        console.log(`✨ ${serviceType} service effect created!`);
    }
    
    createProjectEffect(projectType) {
        // Control de cooldown para evitar spam
        const now = Date.now();
        if (now - this.lastEffectTime < this.effectCooldown) {
            return;
        }
        this.lastEffectTime = now;
        
        const colors = {
            'game': '#6c5ce7',     // Violeta para juegos
            'app': '#2ecc71',      // Verde para apps
            'web': '#e74c3c'       // Rojo para web
        };
        
        const color = colors[projectType] || '#3498db';
        
        // Reducido a 5 partículas sutiles
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 50,
                y: this.mouseY + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 2.5 + 1,
                color: color,
                alpha: 0.4,
                life: 0,
                maxLife: 70
            });
        }
        
        console.log(`🎮 ${projectType} project effect created!`);
    }
    
    createTeamEffect(memberName) {
        // Control de cooldown para evitar spam
        const now = Date.now();
        if (now - this.lastEffectTime < this.effectCooldown) {
            return;
        }
        this.lastEffectTime = now;
        
        const colors = {
            'augusto': '#3498db',   // Azul para CEO
            'lautaro': '#2ecc71',   // Verde para CTO
            'nicolas': '#f39c12',   // Naranja para Backend
            'mateo': '#e74c3c'      // Rojo para "el único que labura"
        };
        
        const color = colors[memberName] || '#74b9ff';
        
        // Reducido a 4 partículas sutiles
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 45,
                y: this.mouseY + (Math.random() - 0.5) * 45,
                vx: (Math.random() - 0.5) * 1.8,
                vy: (Math.random() - 0.5) * 1.8,
                size: Math.random() * 2 + 1,
                color: color,
                alpha: 0.35,
                life: 0,
                maxLife: 65
            });
        }
        
        console.log(`👨‍💻 ${memberName} team effect created!`);
    }
    
    createContactEffect() {
        // Control de cooldown para evitar spam
        const now = Date.now();
        if (now - this.lastEffectTime < this.effectCooldown) {
            return;
        }
        this.lastEffectTime = now;
        
        // Solo 3 partículas muy sutiles para contacto
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 35,
                y: this.mouseY + (Math.random() - 0.5) * 35,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                size: Math.random() * 1.8 + 0.8,
                color: '#74b9ff',
                alpha: 0.3,
                life: 0,
                maxLife: 50
            });
        }
        
        console.log('📧 Contact effect created!');
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Actualizar vida
            particle.life++;
            
            // Fade out gradual
            particle.alpha = Math.max(0, particle.alpha - (1 / particle.maxLife));
            
            // Eliminar partículas muertas
            if (particle.life >= particle.maxLife || particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Mantener un mínimo de partículas de fondo
        if (this.particles.length < 20) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#3498db' : '#2c3e50',
                alpha: Math.random() * 0.3 + 0.4,
                life: 0,
                maxLife: 200 + Math.random() * 100
            });
        }
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar partículas
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Dibujar conexiones entre partículas cercanas
        this.drawConnections();
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.05;
                    this.ctx.strokeStyle = '#74b9ff';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
    
    debugCanvas() {
        console.log('🔍 Canvas Debug Info:');
        console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
        console.log('Canvas style:', this.canvas.style.cssText);
        console.log('Particles count:', this.particles.length);
        
        // Crear una partícula de prueba grande y roja
        this.particles.push({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: 0,
            vy: 0,
            size: 20,
            color: '#ff0000',
            alpha: 1,
            life: 0,
            maxLife: 300
        });
        
        // Crear 10 partículas verdes en el centro
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 100,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 8,
                color: '#00ff00',
                alpha: 0.8,
                life: 0,
                maxLife: 200
            });
        }
        
        console.log('🎯 Test particles created!');
    }
}

// Inicializar efectos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.quadkernEffects = new SimpleQuadKernEffects();
});