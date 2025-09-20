/**
 * Sistema de Protección de Endpoints y Queries para QuadKern
 * Ofusca y protege llamadas a APIs externas
 */

interface EndpointConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  enableCache: boolean;
  cacheTimeout: number;
}

interface ProtectedEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  rateLimit: number;
}

class QuadKernEndpointProtection {
  private config: EndpointConfig;
  private endpoints: Map<string, ProtectedEndpoint> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: Partial<EndpointConfig> = {}) {
    this.config = {
      baseUrl: '',
      timeout: 10000, // 10 segundos
      retries: 3,
      enableCache: true,
      cacheTimeout: 300000, // 5 minutos
      ...config
    };

    this.setupDefaultEndpoints();
    this.startCacheCleanup();
  }

  private setupDefaultEndpoints(): void {
    // Endpoints ofuscados - estos NO son reales, son ejemplos
    this.registerEndpoint({
      id: 'analytics',
      url: this.obfuscateUrl('https://api.quadkern.com/analytics'),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QuadKern-Key': this.generateApiKey()
      },
      rateLimit: 10
    });

    this.registerEndpoint({
      id: 'contact',
      url: this.obfuscateUrl('https://api.quadkern.com/contact'),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QuadKern-Key': this.generateApiKey()
      },
      rateLimit: 5
    });

    this.registerEndpoint({
      id: 'projects',
      url: this.obfuscateUrl('https://api.quadkern.com/projects'),
      method: 'GET',
      headers: {
        'X-QuadKern-Key': this.generateApiKey()
      },
      rateLimit: 20
    });
  }

  private obfuscateUrl(url: string): string {
    // Ofuscación básica de URL
    const encoded = btoa(encodeURIComponent(url));
    return `https://proxy.quadkern.com/api/${encoded}`;
  }

  private generateApiKey(): string {
    // Generar clave API dinámica basada en timestamp y fingerprint
    const timestamp = Math.floor(Date.now() / 3600000); // Cambia cada hora
    const fingerprint = this.getBrowserFingerprint();
    
    const key = `${timestamp}_${fingerprint}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
  }

  private getBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('QuadKern API', 2, 2);
    
    return btoa(canvas.toDataURL()).substring(0, 16);
  }

  public registerEndpoint(endpoint: ProtectedEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
  }

  public async makeRequest(
    endpointId: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<any> {
    const endpoint = this.endpoints.get(endpointId);
    
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }

    // Verificar rate limiting
    const requestKey = `${endpointId}_${Date.now()}`;
    
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // Verificar cache
    if (this.config.enableCache && endpoint.method === 'GET') {
      const cached = this.getFromCache(endpointId, data);
      if (cached) {
        return cached;
      }
    }

    const requestPromise = this.executeRequest(endpoint, data, options);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Guardar en cache si es GET
      if (this.config.enableCache && endpoint.method === 'GET') {
        this.setCache(endpointId, data, result);
      }
      
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeRequest(
    endpoint: ProtectedEndpoint, 
    data?: any, 
    options?: RequestInit
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const requestOptions: RequestInit = {
      method: endpoint.method,
      headers: {
        ...endpoint.headers,
        ...options?.headers
      },
      signal: controller.signal,
      ...options
    };

    if (data && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(endpoint.url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        clearTimeout(timeoutId);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retries) {
          // Esperar antes del siguiente intento
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFromCache(endpointId: string, data?: any): any | null {
    const cacheKey = `${endpointId}_${JSON.stringify(data || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCache(endpointId: string, data: any, result: any): void {
    const cacheKey = `${endpointId}_${JSON.stringify(data || {})}`;
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > this.config.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Limpiar cada minuto
  }

  // Métodos públicos para debugging (solo en desarrollo)
  public getEndpointInfo(endpointId: string): ProtectedEndpoint | null {
    if (window.location.hostname === 'localhost') {
      return this.endpoints.get(endpointId) || null;
    }
    return null;
  }

  public getCacheStats(): any {
    if (window.location.hostname === 'localhost') {
      return {
        cacheSize: this.cache.size,
        queueSize: this.requestQueue.size,
        endpoints: this.endpoints.size
      };
    }
    return null;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

// Instancia global protegida
export const apiProtection = new QuadKernEndpointProtection({
  baseUrl: '',
  timeout: 8000,
  retries: 2,
  enableCache: true,
  cacheTimeout: 300000
});

export { QuadKernEndpointProtection };
