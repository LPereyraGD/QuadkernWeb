/**
 * Sistema de logging optimizado para QuadKern
 * Elimina logs en producción para mejor performance
 */

interface LoggerConfig {
  isProduction: boolean;
  enableConsole: boolean;
  enablePerformance: boolean;
}

class QuadKernLogger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      isProduction: this.detectProduction(),
      enableConsole: !this.detectProduction(),
      enablePerformance: false // Solo en desarrollo
    };
  }

  private detectProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('dev');
  }

  // Métodos de logging que se eliminan en producción
  public log(message: string, ...args: any[]): void {
    if (this.config.enableConsole) {
      console.log(`[QuadKern] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.config.enableConsole) {
      console.warn(`[QuadKern] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.config.enableConsole) {
      console.error(`[QuadKern] ${message}`, ...args);
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.config.enableConsole && this.config.enablePerformance) {
      console.debug(`[QuadKern Debug] ${message}`, ...args);
    }
  }

  public performance(message: string, ...args: any[]): void {
    if (this.config.enableConsole && this.config.enablePerformance) {
      console.log(`[QuadKern Performance] ${message}`, ...args);
    }
  }

  // Métodos que siempre funcionan (críticos)
  public critical(message: string, ...args: any[]): void {
    console.error(`[QuadKern CRITICAL] ${message}`, ...args);
  }

  public enablePerformanceLogging(): void {
    this.config.enablePerformance = true;
  }

  public disableLogging(): void {
    this.config.enableConsole = false;
  }
}

// Instancia global
export const logger = new QuadKernLogger();

// Métodos directos para uso fácil
export const log = (message: string, ...args: any[]) => logger.log(message, ...args);
export const warn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const error = (message: string, ...args: any[]) => logger.error(message, ...args);
export const debug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const performance = (message: string, ...args: any[]) => logger.performance(message, ...args);
export const critical = (message: string, ...args: any[]) => logger.critical(message, ...args);
