/**
 * QuadKern Main Application
 * Sistema principal que orquesta todos los módulos
 */

import { QuadKernEffects } from './effects';
import { QuadKernNavigation } from './navigation';
import { QuadKernPerformance } from './performance';
import { rateLimiter } from './security/rateLimiter';
import { apiProtection } from './security/endpointProtection';
import { logger } from './utils/logger';

interface QuadKernConfig {
  enableEffects: boolean;
  enableNavigation: boolean;
  enablePerformance: boolean;
  enableSecurity: boolean;
  debugMode: boolean;
  autoOptimize: boolean;
}

class QuadKernApp {
  private config: QuadKernConfig;
  private effects: QuadKernEffects | null = null;
  private navigation: QuadKernNavigation | null = null;
  private performance: QuadKernPerformance | null = null;
  private isInitialized = false;

  constructor(config: Partial<QuadKernConfig> = {}) {
    this.config = {
      enableEffects: true,
      enableNavigation: true,
      enablePerformance: true,
      enableSecurity: true,
      debugMode: false,
      autoOptimize: true,
      ...config
    };

    this.init();
  }

  private async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.log('Initializing QuadKern Application...');

      // Verificar rate limiting
      if (this.config.enableSecurity && !rateLimiter.checkRateLimit()) {
        logger.warn('Rate limit exceeded, applying restrictions');
        this.enableExtremePerformanceMode();
        return;
      }

      // Inicializar módulos según configuración
      if (this.config.enablePerformance) {
        this.performance = new QuadKernPerformance();
        await this.performance.init();
      }

      if (this.config.enableNavigation) {
        this.navigation = new QuadKernNavigation();
      }

      if (this.config.enableEffects) {
        this.effects = new QuadKernEffects();
      }

      // Configurar optimizaciones automáticas
      if (this.config.autoOptimize) {
        this.setupAutoOptimizations();
      }

      // Configurar debugging
      if (this.config.debugMode) {
        this.setupDebugMode();
      }

      // Configurar eventos globales
      this.setupGlobalEvents();

      this.isInitialized = true;
      logger.log('QuadKern Application initialized successfully!');

      // Reportar métricas iniciales
      this.reportInitialMetrics();

    } catch (error) {
      logger.error('Error initializing QuadKern Application:', error);
    }
  }

  private setupAutoOptimizations(): void {
    // Optimización automática basada en el dispositivo
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isLowEnd = (navigator as any).deviceMemory < 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const isVeryLowEnd = (navigator as any).deviceMemory < 2 || hardwareConcurrency < 2;

    if (isVeryLowEnd) {
      console.log('🔋 Very low-end device detected, applying extreme optimizations...');
      document.documentElement.classList.add('performance-mode-extreme');
      
      if (this.effects) {
        this.effects.setIntensity(0.2);
        this.effects.setSpeed(0.3);
      }

      if (this.performance) {
        this.performance.enableLowPowerMode();
      }
    } else if (isMobile || isLowEnd) {
      console.log('📱 Mobile/Low-end device detected, applying optimizations...');
      document.documentElement.classList.add('low-power-mode');
      
      if (this.effects) {
        this.effects.setIntensity(0.6);
        this.effects.setSpeed(0.8);
      }

      if (this.performance) {
        this.performance.enableLowPowerMode();
      }
    }

    // Optimización basada en conexión
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      console.log('🐌 Slow connection detected, reducing effects...');
      
      if (this.effects) {
        this.effects.setIntensity(0.3);
        this.effects.setSpeed(0.5);
      }
    }

    // Optimización basada en batería
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          console.log('🔋 Low battery detected, enabling power saving mode...');
          this.enablePowerSavingMode();
        }
      });
    }
  }

  private setupDebugMode(): void {
    // Exponer controles de debugging en la consola
    (window as any).QuadKernDebug = {
      effects: this.effects,
      navigation: this.navigation,
      performance: this.performance,
      config: this.config,
      
      // Métodos de debugging
      toggleEffects: () => this.effects?.toggleEffects(),
      setEffectIntensity: (intensity: number) => this.effects?.setIntensity(intensity),
      navigateTo: (section: string) => this.navigation?.navigateTo(section),
      getMetrics: () => this.performance?.getMetrics(),
      
      // Controles de navegación
      setScrollEasing: (easing: 'elastic' | 'cubic' | 'linear') => this.navigation?.setEasingType(easing),
      setScrollVelocity: (velocity: number) => this.navigation?.setScrollVelocity(velocity),
      setScrollDuration: (duration: number) => this.navigation?.setScrollDuration(duration),
      stopScrolling: () => this.navigation?.stopScrolling(),
      
      // Utilidades
      enableHighPerformance: () => this.performance?.enableHighPerformanceMode(),
      enableLowPower: () => this.performance?.enableLowPowerMode(),
      enablePowerSaving: () => this.enablePowerSavingMode(),
      
      // Helpers
      help: () => {
        console.log(`
🎯 QuadKern Debug Controls:

📱 Navigation:
  navigateTo('servicios')     - Navegar a sección
  setScrollEasing('elastic')  - Cambiar animación (elastic/cubic/linear)
  setScrollVelocity(3.0)      - Cambiar velocidad (0.5-5.0)
  setScrollDuration(400)      - Cambiar duración (200-1500ms)
  stopScrolling()             - Detener animación en curso

🎨 Effects:
  toggleEffects()             - Activar/desactivar efectos
  setEffectIntensity(0.8)     - Cambiar intensidad (0-2)

⚡ Performance:
  enableHighPerformance()     - Modo alto rendimiento
  enableLowPower()            - Modo ahorro de energía
  getMetrics()                - Ver métricas

Ejemplos:
  QuadKernDebug.setScrollEasing('elastic')
  QuadKernDebug.setScrollVelocity(2.5)
  QuadKernDebug.navigateTo('equipo')
        `);
      }
    };

    console.log('🐛 Debug mode enabled. Use window.QuadKernDebug.help() for controls.');
  }

  private setupGlobalEvents(): void {
    // Manejar visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseEffects();
      } else {
        this.resumeEffects();
      }
    });

    // Manejar cambios de tamaño
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Manejar errores globales
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      this.handleError(event.error);
    });

    // Manejar errores de promesas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });
  }

  private pauseEffects(): void {
    if (this.effects) {
      this.effects.pause();
    }
    console.log('⏸️ Effects paused (tab hidden)');
  }

  private resumeEffects(): void {
    if (this.effects) {
      this.effects.resume();
    }
    console.log('▶️ Effects resumed (tab visible)');
  }

  private handleResize(): void {
    // Recalcular layouts y optimizaciones
    if (this.navigation) {
      this.navigation.updateConfig({});
    }

    if (this.effects) {
      this.effects.resize();
    }

    console.log('📐 Layout recalculated for new viewport size');
  }

  private handleError(error: Error): void {
    // Log del error para debugging
    if (this.config.debugMode) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    // Intentar recuperación automática
    this.attemptRecovery();
  }

  private attemptRecovery(): void {
    // Estrategias de recuperación
    try {
      // Reducir efectos si hay problemas de performance
      if (this.effects) {
        this.effects.setIntensity(0.5);
      }

      // Habilitar modo de bajo consumo
      this.enablePowerSavingMode();

      console.log('🔄 Recovery measures applied');
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
    }
  }

  private enablePowerSavingMode(): void {
    if (this.effects) {
      this.effects.setIntensity(0.4);
      this.effects.setSpeed(0.6);
    }

    if (this.performance) {
      this.performance.enableLowPowerMode();
    }

    // Aplicar clases CSS de optimización
    document.documentElement.classList.add('low-power-mode');

    console.log('🔋 Power saving mode enabled');
  }

  private enableExtremePerformanceMode(): void {
    if (this.effects) {
      this.effects.setIntensity(0.1);
      this.effects.setSpeed(0.2);
    }

    if (this.performance) {
      this.performance.enableLowPowerMode();
    }

    // Aplicar optimizaciones extremas
    document.documentElement.classList.add('performance-mode-extreme');

    console.log('🚀 Extreme performance mode enabled');
  }

  private reportInitialMetrics(): void {
    if (!this.config.debugMode) return;

    const metrics = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      device: {
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
        platform: navigator.platform,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        saveData: (navigator as any).connection.saveData
      } : null,
      modules: {
        effects: !!this.effects,
        navigation: !!this.navigation,
        performance: !!this.performance
      }
    };

    console.log('📊 QuadKern Initial Metrics:', metrics);
  }

  // Métodos públicos
  public getEffects(): QuadKernEffects | null {
    return this.effects;
  }

  public getNavigation(): QuadKernNavigation | null {
    return this.navigation;
  }

  public getPerformance(): QuadKernPerformance | null {
    return this.performance;
  }

  public updateConfig(newConfig: Partial<QuadKernConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.debugMode !== undefined) {
      if (newConfig.debugMode) {
        this.setupDebugMode();
      } else {
        delete (window as any).QuadKernDebug;
      }
    }
  }

  public destroy(): void {
    if (this.effects) {
      this.effects.destroy();
    }

    this.isInitialized = false;
    console.log('🗑️ QuadKern Application destroyed');
  }
}

// Inicializar aplicación cuando el DOM esté listo
let quadkernApp: QuadKernApp | null = null;

document.addEventListener('DOMContentLoaded', () => {
  // Detectar modo de desarrollo
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

  quadkernApp = new QuadKernApp({
    enableEffects: true,
    enableNavigation: true,
    enablePerformance: true,
    debugMode: isDevelopment,
    autoOptimize: true
  });

  // Exponer instancia global para debugging
  (window as any).QuadKern = quadkernApp;
});

// Exportar para uso en otros módulos
export { QuadKernApp };
export default QuadKernApp;