// Sistema de optimización de performance para QuadKern
// Optimizaciones específicas para GitHub Pages
class QuadKernPerformance {
    constructor() {
        this.observers = new Map();
        this.config = {
            enableLazyLoading: true,
            enableImageOptimization: true,
            enableResourcePreloading: true,
            enableAnalytics: true,
            maxParticles: this.getOptimalParticleCount(),
            reducedMotion: this.prefersReducedMotion()
        };
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0,
            memoryUsage: 0
        };
        this.initPrivate();
    }
    async init() {
        this.measureLoadTime();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourcePreloading();
        this.setupPerformanceMonitoring();
        this.optimizeForGitHubPages();
    }
    initPrivate() {
        this.measureLoadTime();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourcePreloading();
        this.setupPerformanceMonitoring();
        this.optimizeForGitHubPages();
    }
    getOptimalParticleCount() {
        // Detectar capacidad del dispositivo
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
            return Math.min(20, hardwareConcurrency * 3);
        }
        if (memory >= 8) {
            return 50; // Dispositivos potentes
        }
        else if (memory >= 4) {
            return 35; // Dispositivos medios
        }
        else {
            return 20; // Dispositivos básicos
        }
    }
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    measureLoadTime() {
        const startTime = performance.now();
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - startTime;
            this.reportMetrics();
        });
    }
    setupLazyLoading() {
        if (!this.config.enableLazyLoading)
            return;
        // Lazy loading para imágenes
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        // Observar todas las imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        this.observers.set('images', imageObserver);
    }
    setupImageOptimization() {
        if (!this.config.enableImageOptimization)
            return;
        // Optimizar imágenes según el viewport
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Agregar loading="lazy" si no está presente
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            // Optimizar tamaño según DPR
            const dpr = window.devicePixelRatio || 1;
            if (dpr > 1) {
                img.style.imageRendering = 'crisp-edges';
            }
        });
    }
    setupResourcePreloading() {
        if (!this.config.enableResourcePreloading)
            return;
        // Preload recursos críticos
        const criticalResources = [
            './QuadkernLogo.png',
            'https://fonts.googleapis.com/css2?display=swap&family=Noto+Sans:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;700'
        ];
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            if (resource.includes('.png')) {
                link.as = 'image';
            }
            else if (resource.includes('fonts.googleapis.com')) {
                link.as = 'style';
            }
            document.head.appendChild(link);
        });
    }
    setupPerformanceMonitoring() {
        // Monitorear performance en tiempo real
        let frameCount = 0;
        let lastTime = performance.now();
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                // Ajustar efectos según FPS
                if (fps < 30) {
                    this.reduceEffects();
                }
                else if (fps > 50) {
                    this.enhanceEffects();
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);
    }
    reduceEffects() {
        const effects = window.quadkernEffects;
        if (effects) {
            effects.setIntensity(0.5);
            effects.setSpeed(0.7);
        }
        console.log('⚡ Performance: Reducing effects due to low FPS');
    }
    enhanceEffects() {
        const effects = window.quadkernEffects;
        if (effects) {
            effects.setIntensity(1.0);
            effects.setSpeed(1.0);
        }
    }
    optimizeForGitHubPages() {
        // Optimizaciones específicas para GitHub Pages
        // 1. Comprimir recursos dinámicamente
        this.setupResourceCompression();
        // 2. Cachear recursos en localStorage
        this.setupLocalStorageCache();
        // 3. Optimizar para CDN de GitHub
        this.optimizeForCDN();
        // 4. Detectar y manejar conexiones lentas
        this.handleSlowConnections();
    }
    setupResourceCompression() {
        // Comprimir datos que se guardan en localStorage
        const compress = (data) => {
            // Implementación simple de compresión
            return btoa(encodeURIComponent(data));
        };
        const decompress = (data) => {
            return decodeURIComponent(atob(data));
        };
        window.quadkernCompress = { compress, decompress };
    }
    setupLocalStorageCache() {
        const cacheKey = 'quadkern-cache';
        const cacheVersion = '1.0.0';
        // Verificar si hay cache válido
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const cacheData = JSON.parse(cached);
                if (cacheData.version === cacheVersion) {
                    console.log('📦 Loading from cache');
                    return;
                }
            }
            catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }
        // Crear nuevo cache
        const cacheData = {
            version: cacheVersion,
            timestamp: Date.now(),
            resources: {}
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    optimizeForCDN() {
        // GitHub Pages usa CDN, optimizar para eso
        const links = document.querySelectorAll('link[href^="http"]');
        links.forEach(link => {
            link.setAttribute('crossorigin', 'anonymous');
        });
    }
    handleSlowConnections() {
        // Detectar conexión lenta usando Network Information API
        const connection = navigator.connection;
        if (connection) {
            const isSlowConnection = connection.effectiveType === 'slow-2g' ||
                connection.effectiveType === '2g' ||
                connection.saveData;
            if (isSlowConnection) {
                console.log('🐌 Slow connection detected, optimizing...');
                this.enableLowBandwidthMode();
            }
        }
    }
    enableLowBandwidthMode() {
        // Reducir efectos para conexiones lentas
        const effects = window.quadkernEffects;
        if (effects) {
            effects.setIntensity(0.3);
            effects.setSpeed(0.5);
        }
        // Reducir calidad de imágenes
        document.querySelectorAll('img').forEach(img => {
            img.style.imageRendering = 'pixelated';
        });
    }
    reportMetrics() {
        if (!this.config.enableAnalytics)
            return;
        console.log('📊 QuadKern Performance Metrics:', {
            loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
            deviceInfo: {
                cores: navigator.hardwareConcurrency,
                memory: navigator.deviceMemory,
                platform: navigator.platform,
                isMobile: /Mobi|Android/i.test(navigator.userAgent)
            },
            optimizations: {
                particleCount: this.config.maxParticles,
                reducedMotion: this.config.reducedMotion,
                lazyLoading: this.config.enableLazyLoading
            }
        });
    }
    // Métodos públicos
    getMetrics() {
        return { ...this.metrics };
    }
    enableLowPowerMode() {
        this.config.maxParticles = Math.floor(this.config.maxParticles / 2);
        this.config.reducedMotion = true;
        const effects = window.quadkernEffects;
        if (effects) {
            effects.setIntensity(0.4);
            effects.setSpeed(0.6);
        }
    }
    enableHighPerformanceMode() {
        this.config.maxParticles = this.getOptimalParticleCount() * 1.5;
        this.config.reducedMotion = false;
        const effects = window.quadkernEffects;
        if (effects) {
            effects.setIntensity(1.2);
            effects.setSpeed(1.3);
        }
    }
}
// Inicializar optimizaciones
document.addEventListener('DOMContentLoaded', () => {
    const performance = new QuadKernPerformance();
    window.quadkernPerformance = performance;
});
export { QuadKernPerformance };
