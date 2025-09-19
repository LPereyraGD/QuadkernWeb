/**
 * QuadKern Main Application
 * Sistema principal que orquesta todos los módulos
 */
import { QuadKernEffects } from './effects';
import { QuadKernNavigation } from './navigation';
import { QuadKernPerformance } from './performance';
class QuadKernApp {
    constructor(config = {}) {
        this.effects = null;
        this.navigation = null;
        this.performance = null;
        this.isInitialized = false;
        this.config = {
            enableEffects: true,
            enableNavigation: true,
            enablePerformance: true,
            debugMode: false,
            autoOptimize: true,
            ...config
        };
        this.init();
    }
    async init() {
        if (this.isInitialized)
            return;
        try {
            console.log('🚀 Initializing QuadKern Application...');
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
            console.log('✅ QuadKern Application initialized successfully!');
            // Reportar métricas iniciales
            this.reportInitialMetrics();
        }
        catch (error) {
            console.error('❌ Error initializing QuadKern Application:', error);
        }
    }
    setupAutoOptimizations() {
        // Optimización automática basada en el dispositivo
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const isLowEnd = navigator.deviceMemory < 4;
        if (isMobile || isLowEnd) {
            console.log('📱 Mobile/Low-end device detected, applying optimizations...');
            if (this.effects) {
                this.effects.setIntensity(0.6);
                this.effects.setSpeed(0.8);
            }
            if (this.performance) {
                this.performance.enableLowPowerMode();
            }
        }
        // Optimización basada en conexión
        const connection = navigator.connection;
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            console.log('🐌 Slow connection detected, reducing effects...');
            if (this.effects) {
                this.effects.setIntensity(0.3);
                this.effects.setSpeed(0.5);
            }
        }
        // Optimización basada en batería
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                if (battery.level < 0.2) {
                    console.log('🔋 Low battery detected, enabling power saving mode...');
                    this.enablePowerSavingMode();
                }
            });
        }
    }
    setupDebugMode() {
        // Exponer controles de debugging en la consola
        window.QuadKernDebug = {
            effects: this.effects,
            navigation: this.navigation,
            performance: this.performance,
            config: this.config,
            // Métodos de debugging
            toggleEffects: () => this.effects?.toggleEffects(),
            setEffectIntensity: (intensity) => this.effects?.setIntensity(intensity),
            navigateTo: (section) => this.navigation?.navigateTo(section),
            getMetrics: () => this.performance?.getMetrics(),
            // Controles de navegación
            setScrollEasing: (easing) => this.navigation?.setEasingType(easing),
            setScrollVelocity: (velocity) => this.navigation?.setScrollVelocity(velocity),
            setScrollDuration: (duration) => this.navigation?.setScrollDuration(duration),
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
    setupGlobalEvents() {
        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseEffects();
            }
            else {
                this.resumeEffects();
            }
        });
        // Manejar cambios de tamaño
        let resizeTimeout;
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
    pauseEffects() {
        if (this.effects) {
            this.effects.pause();
        }
        console.log('⏸️ Effects paused (tab hidden)');
    }
    resumeEffects() {
        if (this.effects) {
            this.effects.resume();
        }
        console.log('▶️ Effects resumed (tab visible)');
    }
    handleResize() {
        // Recalcular layouts y optimizaciones
        if (this.navigation) {
            this.navigation.updateConfig({});
        }
        if (this.effects) {
            this.effects.resize();
        }
        console.log('📐 Layout recalculated for new viewport size');
    }
    handleError(error) {
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
    attemptRecovery() {
        // Estrategias de recuperación
        try {
            // Reducir efectos si hay problemas de performance
            if (this.effects) {
                this.effects.setIntensity(0.5);
            }
            // Habilitar modo de bajo consumo
            this.enablePowerSavingMode();
            console.log('🔄 Recovery measures applied');
        }
        catch (recoveryError) {
            console.error('❌ Recovery failed:', recoveryError);
        }
    }
    enablePowerSavingMode() {
        if (this.effects) {
            this.effects.setIntensity(0.4);
            this.effects.setSpeed(0.6);
        }
        if (this.performance) {
            this.performance.enableLowPowerMode();
        }
        console.log('🔋 Power saving mode enabled');
    }
    reportInitialMetrics() {
        if (!this.config.debugMode)
            return;
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
                memory: navigator.deviceMemory,
                platform: navigator.platform,
                isMobile: /Mobi|Android/i.test(navigator.userAgent)
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                saveData: navigator.connection.saveData
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
    getEffects() {
        return this.effects;
    }
    getNavigation() {
        return this.navigation;
    }
    getPerformance() {
        return this.performance;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.debugMode !== undefined) {
            if (newConfig.debugMode) {
                this.setupDebugMode();
            }
            else {
                delete window.QuadKernDebug;
            }
        }
    }
    destroy() {
        if (this.effects) {
            this.effects.destroy();
        }
        this.isInitialized = false;
        console.log('🗑️ QuadKern Application destroyed');
    }
}
// Inicializar aplicación cuando el DOM esté listo
let quadkernApp = null;
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
    window.QuadKern = quadkernApp;
});
// Exportar para uso en otros módulos
export { QuadKernApp };
export default QuadKernApp;
