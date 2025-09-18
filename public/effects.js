// Efectos dinámicos para QuadKern
// Este script maneja efectos adicionales que requieren JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Crear partículas dinámicamente si es necesario
    function createDynamicParticles() {
        const container = document.querySelector('.floating-particles');
        if (!container) return;
        
        // Agregar más partículas dinámicamente si se necesita
        for (let i = 10; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = -Math.random() * 30 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }
    
    // Efectos de parallax en scroll
    function handleParallax() {
        const scrolled = window.pageYOffset;
        const shaderBg = document.querySelector('.shader-background');
        const waveEffect = document.querySelector('.wave-effect');
        const neuralNetwork = document.querySelector('.neural-network');
        
        if (shaderBg) {
            shaderBg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
        
        if (waveEffect) {
            waveEffect.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
        
        if (neuralNetwork) {
            neuralNetwork.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
    }
    
    // Efectos de hover en el logo
    function enhanceLogoEffects() {
        const logo = document.querySelector('#inicio img');
        if (!logo) return;
        
        logo.addEventListener('mouseenter', function() {
            // Intensificar efectos al hacer hover en el logo
            document.querySelector('.shader-background').style.animationDuration = '10s';
            document.querySelector('.wave-effect').style.opacity = '0.3';
        });
        
        logo.addEventListener('mouseleave', function() {
            // Volver a la normalidad
            document.querySelector('.shader-background').style.animationDuration = '20s';
            document.querySelector('.wave-effect').style.opacity = '';
        });
    }
    
    // Inicializar efectos
    createDynamicParticles();
    enhanceLogoEffects();
    
    // Agregar listener de scroll para parallax
    window.addEventListener('scroll', handleParallax, { passive: true });
    
    // Optimización de performance - pausar animaciones cuando no están visibles
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            } else {
                entry.target.style.animationPlayState = 'paused';
            }
        });
    }, observerOptions);
    
    // Observar elementos con animaciones
    document.querySelectorAll('.shader-background, .wave-effect, .neural-network, .matrix-rain').forEach(el => {
        observer.observe(el);
    });
});
