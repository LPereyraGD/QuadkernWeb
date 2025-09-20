class QuadKernRateLimiter {
    constructor(config = {}) {
        this.clients = new Map();
        this.blockedIPs = new Set();
        this.suspiciousIPs = new Set();
        this.config = {
            maxRequests: 100,
            windowMs: 60000,
            blockDurationMs: 300000,
            enableLogging: false,
            ...config
        };
        this.startCleanup();
    }
    getClientIP() {
        return this.generateFingerprint();
    }
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('QuadKern Security', 2, 2);
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    checkRateLimit() {
        const clientIP = this.getClientIP();
        const now = Date.now();
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
        client.requests = client.requests.filter(timestamp => now - timestamp < this.config.windowMs);
        if (client.requests.length >= this.config.maxRequests) {
            this.blockClient(clientIP, now);
            return false;
        }
        client.requests.push(now);
        return true;
    }
    blockClient(ip, now) {
        this.blockedIPs.add(ip);
        this.suspiciousIPs.add(ip);
        setTimeout(() => {
            this.blockedIPs.delete(ip);
        }, this.config.blockDurationMs);
        if (this.config.enableLogging) {
            console.warn(`🚨 Rate limit exceeded for client: ${ip}`);
        }
    }
    isBlocked() {
        const clientIP = this.getClientIP();
        return this.blockedIPs.has(clientIP);
    }
    getRemainingRequests() {
        const clientIP = this.getClientIP();
        const client = this.clients.get(clientIP);
        if (!client) {
            return this.config.maxRequests;
        }
        const now = Date.now();
        const recentRequests = client.requests.filter(timestamp => now - timestamp < this.config.windowMs);
        return Math.max(0, this.config.maxRequests - recentRequests.length);
    }
    getTimeUntilReset() {
        const clientIP = this.getClientIP();
        const client = this.clients.get(clientIP);
        if (!client || client.requests.length === 0) {
            return 0;
        }
        const oldestRequest = Math.min(...client.requests);
        return Math.max(0, this.config.windowMs - (Date.now() - oldestRequest));
    }
    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            const cutoff = now - (this.config.windowMs * 2);
            for (const [ip, client] of this.clients.entries()) {
                client.requests = client.requests.filter(timestamp => timestamp > cutoff);
                if (client.requests.length === 0) {
                    this.clients.delete(ip);
                }
            }
        }, 300000);
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getStats() {
        return {
            totalClients: this.clients.size,
            blockedIPs: this.blockedIPs.size,
            suspiciousIPs: this.suspiciousIPs.size,
            config: this.config
        };
    }
    clearBlockedIPs() {
        this.blockedIPs.clear();
        this.suspiciousIPs.clear();
    }
}
export const rateLimiter = new QuadKernRateLimiter({
    maxRequests: 50,
    windowMs: 60000,
    blockDurationMs: 600000,
    enableLogging: window.location.hostname === 'localhost'
});
export { QuadKernRateLimiter };
