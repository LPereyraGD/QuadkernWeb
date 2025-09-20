class QuadKernEndpointProtection {
    constructor(config = {}) {
        this.endpoints = new Map();
        this.cache = new Map();
        this.requestQueue = new Map();
        this.config = {
            baseUrl: '',
            timeout: 10000,
            retries: 3,
            enableCache: true,
            cacheTimeout: 300000,
            ...config
        };
        this.setupDefaultEndpoints();
        this.startCacheCleanup();
    }
    setupDefaultEndpoints() {
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
    obfuscateUrl(url) {
        const encoded = btoa(encodeURIComponent(url));
        return `https://proxy.quadkern.com/api/${encoded}`;
    }
    generateApiKey() {
        const timestamp = Math.floor(Date.now() / 3600000);
        const fingerprint = this.getBrowserFingerprint();
        const key = `${timestamp}_${fingerprint}`;
        return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
    }
    getBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('QuadKern API', 2, 2);
        return btoa(canvas.toDataURL()).substring(0, 16);
    }
    registerEndpoint(endpoint) {
        this.endpoints.set(endpoint.id, endpoint);
    }
    async makeRequest(endpointId, data, options) {
        const endpoint = this.endpoints.get(endpointId);
        if (!endpoint) {
            throw new Error(`Endpoint ${endpointId} not found`);
        }
        const requestKey = `${endpointId}_${Date.now()}`;
        if (this.requestQueue.has(requestKey)) {
            return this.requestQueue.get(requestKey);
        }
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
            if (this.config.enableCache && endpoint.method === 'GET') {
                this.setCache(endpointId, data, result);
            }
            return result;
        }
        finally {
            this.requestQueue.delete(requestKey);
        }
    }
    async executeRequest(endpoint, data, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        const requestOptions = {
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
        let lastError;
        for (let attempt = 1; attempt <= this.config.retries; attempt++) {
            try {
                const response = await fetch(endpoint.url, requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                clearTimeout(timeoutId);
                return result;
            }
            catch (error) {
                lastError = error;
                if (attempt < this.config.retries) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        clearTimeout(timeoutId);
        throw lastError;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getFromCache(endpointId, data) {
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
    setCache(endpointId, data, result) {
        const cacheKey = `${endpointId}_${JSON.stringify(data || {})}`;
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
    }
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, cached] of this.cache.entries()) {
                if (now - cached.timestamp > this.config.cacheTimeout) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }
    getEndpointInfo(endpointId) {
        if (window.location.hostname === 'localhost') {
            return this.endpoints.get(endpointId) || null;
        }
        return null;
    }
    getCacheStats() {
        if (window.location.hostname === 'localhost') {
            return {
                cacheSize: this.cache.size,
                queueSize: this.requestQueue.size,
                endpoints: this.endpoints.size
            };
        }
        return null;
    }
    clearCache() {
        this.cache.clear();
    }
}
export const apiProtection = new QuadKernEndpointProtection({
    baseUrl: '',
    timeout: 8000,
    retries: 2,
    enableCache: true,
    cacheTimeout: 300000
});
export { QuadKernEndpointProtection };
