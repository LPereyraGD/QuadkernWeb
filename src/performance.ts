// Sistema de optimización de performance para QuadKern
// Optimizaciones específicas para GitHub Pages

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
}

interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableResourcePreloading: boolean;
  enableAnalytics: boolean;
  maxParticles: number;
  reducedMotion: boolean;
}

class QuadKernPerformance {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor() {
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

  public async init(): Promise<void> {
    this.measureLoadTime();
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupResourcePreloading();
    this.setupPerformanceMonitoring();
    this.optimizeForGitHubPages();
  }

  private initPrivate(): void {
    this.measureLoadTime();
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupResourcePreloading();
    this.setupPerformanceMonitoring();
    this.optimizeForGitHubPages();
  }

  private getOptimalParticleCount(): number {
    // Detectar capacidad del dispositivo
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isLowEnd = memory < 4 || hardwareConcurrency < 4;
    
    // Detectar si el usuario prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return 5; // Mínimo absoluto
    }
    
    if (isMobile || isLowEnd) {
      return Math.min(15, hardwareConcurrency * 2); // Dispositivos móviles/básicos
    }
    
    if (memory >= 8 && hardwareConcurrency >= 6) {
      return 50; // Dispositivos potentes
    } else if (memory >= 4 && hardwareConcurrency >= 4) {
      return 30; // Dispositivos medios
    } else {
      return 20; // Dispositivos básicos
    }
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private measureLoadTime(): void {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now() - startTime;
      this.reportMetrics();
    });
  }

  private setupLazyLoading(): void {
    if (!this.config.enableLazyLoading) return;

    // Lazy loading para imágenes
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
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

  private setupImageOptimization(): void {
    if (!this.config.enableImageOptimization) return;

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

  private setupResourcePreloading(): void {
    if (!this.config.enableResourcePreloading) return;

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
      } else if (resource.includes('fonts.googleapis.com')) {
        link.as = 'style';
      }
      
      document.head.appendChild(link);
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitorear performance en tiempo real
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Ajustar efectos según FPS - más agresivo
        if (fps < 30) {
          lowFpsCount++;
          this.reduceEffects();
          
          // Si hay FPS bajo persistente, aplicar optimizaciones más agresivas
          if (lowFpsCount >= 3) {
            this.enableAggressiveOptimizations();
            lowFpsCount = 0; // Reset counter
          }
        } else if (fps > 50) {
          lowFpsCount = 0; // Reset counter
          this.enhanceEffects();
        } else {
          lowFpsCount = Math.max(0, lowFpsCount - 1); // Gradual recovery
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  private reduceEffects(): void {
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(0.5);
      effects.setSpeed(0.7);
    }
    
    console.log('⚡ Performance: Reducing effects due to low FPS');
  }

  private enhanceEffects(): void {
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(1.0);
      effects.setSpeed(1.0);
    }
  }

  private enableAggressiveOptimizations(): void {
    console.log('🚀 Enabling aggressive optimizations due to persistent low FPS');
    
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(0.3);
      effects.setSpeed(0.5);
    }
    
    // Reducir aún más partículas
    this.config.maxParticles = Math.max(5, Math.floor(this.config.maxParticles * 0.5));
    
    // Deshabilitar efectos no críticos
    this.config.enableLazyLoading = false;
    this.config.enableResourcePreloading = false;
    
    // Aplicar optimizaciones de CSS
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }

  private optimizeForGitHubPages(): void {
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

  private setupResourceCompression(): void {
    // Comprimir datos que se guardan en localStorage
    const compress = (data: string): string => {
      // Implementación simple de compresión
      return btoa(encodeURIComponent(data));
    };
    
    const decompress = (data: string): string => {
      return decodeURIComponent(atob(data));
    };
    
    (window as any).quadkernCompress = { compress, decompress };
  }

  private setupLocalStorageCache(): void {
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
      } catch (e) {
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

  private optimizeForCDN(): void {
    // GitHub Pages usa CDN, optimizar para eso
    const links = document.querySelectorAll('link[href^="http"]');
    links.forEach(link => {
      link.setAttribute('crossorigin', 'anonymous');
    });
  }

  private handleSlowConnections(): void {
    // Detectar conexión lenta usando Network Information API
    const connection = (navigator as any).connection;
    
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

  private enableLowBandwidthMode(): void {
    // Reducir efectos para conexiones lentas
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(0.3);
      effects.setSpeed(0.5);
    }
    
    // Reducir calidad de imágenes
    document.querySelectorAll('img').forEach(img => {
      img.style.imageRendering = 'pixelated';
    });
  }

  private reportMetrics(): void {
    if (!this.config.enableAnalytics) return;
    
    console.log('📊 QuadKern Performance Metrics:', {
      loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
      deviceInfo: {
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
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
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public enableLowPowerMode(): void {
    this.config.maxParticles = Math.floor(this.config.maxParticles / 2);
    this.config.reducedMotion = true;
    
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(0.4);
      effects.setSpeed(0.6);
    }
  }

  public enableHighPerformanceMode(): void {
    this.config.maxParticles = this.getOptimalParticleCount() * 1.5;
    this.config.reducedMotion = false;
    
    const effects = (window as any).quadkernEffects;
    if (effects) {
      effects.setIntensity(1.2);
      effects.setSpeed(1.3);
    }
  }
}

// Inicializar optimizaciones
document.addEventListener('DOMContentLoaded', () => {
  const performance = new QuadKernPerformance();
  (window as any).quadkernPerformance = performance;
});

export { QuadKernPerformance };
