class QuadKernLogger {
    constructor() {
        this.config = {
            isProduction: this.detectProduction(),
            enableConsole: !this.detectProduction(),
            enablePerformance: false
        };
    }
    detectProduction() {
        return window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1' &&
            !window.location.hostname.includes('dev');
    }
    log(message, ...args) {
        if (this.config.enableConsole) {
            console.log(`[QuadKern] ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        if (this.config.enableConsole) {
            console.warn(`[QuadKern] ${message}`, ...args);
        }
    }
    error(message, ...args) {
        if (this.config.enableConsole) {
            console.error(`[QuadKern] ${message}`, ...args);
        }
    }
    debug(message, ...args) {
        if (this.config.enableConsole && this.config.enablePerformance) {
            console.debug(`[QuadKern Debug] ${message}`, ...args);
        }
    }
    performance(message, ...args) {
        if (this.config.enableConsole && this.config.enablePerformance) {
            console.log(`[QuadKern Performance] ${message}`, ...args);
        }
    }
    critical(message, ...args) {
        console.error(`[QuadKern CRITICAL] ${message}`, ...args);
    }
    enablePerformanceLogging() {
        this.config.enablePerformance = true;
    }
    disableLogging() {
        this.config.enableConsole = false;
    }
}
export const logger = new QuadKernLogger();
export const log = (message, ...args) => logger.log(message, ...args);
export const warn = (message, ...args) => logger.warn(message, ...args);
export const error = (message, ...args) => logger.error(message, ...args);
export const debug = (message, ...args) => logger.debug(message, ...args);
export const performance = (message, ...args) => logger.performance(message, ...args);
export const critical = (message, ...args) => logger.critical(message, ...args);
