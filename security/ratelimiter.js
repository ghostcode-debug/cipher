// Rate Limiting
// Prevents DoS attacks and message flooding

class RateLimiter {
    constructor(maxRequests, timeWindowMs) {
        this.maxRequests = maxRequests;
        this.timeWindowMs = timeWindowMs;
        this.requests = [];
    }

    isAllowed() {
        const now = Date.now();

        this.requests = this.requests.filter(time => now - time < this.timeWindowMs);

        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }

        return false;
    }

    getRemainingTime() {
        if (this.requests.length === 0) return 0;
        const oldestRequest = this.requests[0];
        const elapsed = Date.now() - oldestRequest;
        return Math.max(0, this.timeWindowMs - elapsed);
    }

    reset() {
        this.requests = [];
    }
}

if (typeof module !== 'undefined') {
    module.exports = RateLimiter;
}
