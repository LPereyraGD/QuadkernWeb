/**
 * Sistema de Rate Limiting y Protección DDoS para QuadKern
 * Protege contra ataques de fuerza bruta y DDoS
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  enableLogging: boolean;
}

interface ClientInfo {
  ip: string;
  requests: number[];
  blocked: boolean;
  blockUntil: number;
}

class QuadKernRateLimiter {
  private config: RateLimitConfig;
  private clients: Map<string, ClientInfo> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Set<string> = new Set();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: 100, // Máximo 100 requests por ventana
      windowMs: 60000, // Ventana de 1 minuto
      blockDurationMs: 300000, // Bloquear por 5 minutos
      enableLogging: false, // Solo en desarrollo
      ...config
    };

    this.startCleanup();
  }

  private getClientIP(): string {
    // En GitHub Pages, no podemos obtener IP real, usar fingerprinting
    return this.generateFingerprint();
  }

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('QuadKern Security', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Hash simple del fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  public checkRateLimit(): boolean {
    const clientIP = this.getClientIP();
    const now = Date.now();

    // Si está en lista de bloqueados
    if (this.blockedIPs.has(clientIP)) {
      return false;
    }

    let client = this.clients.get(clientIP);
    
    if (!client) {
      client = {
        ip: clientIP,
        requests: [],
        blocked: false,
        blockUntil: 0
      };
      this.clients.set(clientIP, client);
    }

    // Limpiar requests antiguos
    client.requests = client.requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    // Verificar límite
    if (client.requests.length >= this.config.maxRequests) {
      this.blockClient(clientIP, now);
      return false;
    }

    // Agregar request actual
    client.requests.push(now);
    return true;
  }

  private blockClient(ip: string, now: number): void {
    this.blockedIPs.add(ip);
    this.suspiciousIPs.add(ip);
    
    // Auto-unblock después del tiempo configurado
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, this.config.blockDurationMs);

    if (this.config.enableLogging) {
      console.warn(`🚨 Rate limit exceeded for client: ${ip}`);
    }
  }

  public isBlocked(): boolean {
    const clientIP = this.getClientIP();
    return this.blockedIPs.has(clientIP);
  }

  public getRemainingRequests(): number {
    const clientIP = this.getClientIP();
    const client = this.clients.get(clientIP);
    
    if (!client) {
      return this.config.maxRequests;
    }

    const now = Date.now();
    const recentRequests = client.requests.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  public getTimeUntilReset(): number {
    const clientIP = this.getClientIP();
    const client = this.clients.get(clientIP);
    
    if (!client || client.requests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...client.requests);
    return Math.max(0, this.config.windowMs - (Date.now() - oldestRequest));
  }

  private startCleanup(): void {
    // Limpiar datos antiguos cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      const cutoff = now - (this.config.windowMs * 2);

      for (const [ip, client] of this.clients.entries()) {
        client.requests = client.requests.filter(timestamp => timestamp > cutoff);
        
        if (client.requests.length === 0) {
          this.clients.delete(ip);
        }
      }
    }, 300000); // 5 minutos
  }

  // Métodos públicos para configuración
  public updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getStats(): any {
    return {
      totalClients: this.clients.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      config: this.config
    };
  }

  public clearBlockedIPs(): void {
    this.blockedIPs.clear();
    this.suspiciousIPs.clear();
  }
}

// Instancia global
export const rateLimiter = new QuadKernRateLimiter({
  maxRequests: 50, // Más restrictivo para GitHub Pages
  windowMs: 60000, // 1 minuto
  blockDurationMs: 600000, // 10 minutos de bloqueo
  enableLogging: window.location.hostname === 'localhost'
});

export { QuadKernRateLimiter };
