// Session Management
// Handles user session timeout and security

class SessionManager {
    constructor(timeoutMinutes = 30) {
        this.timeoutMs = timeoutMinutes * 60 * 1000;
        this.lastActivityTime = Date.now();
        this.sessionId = this.generateSessionId();
        this.isActive = true;

        if (typeof document !== 'undefined') {
            this.setupListeners();
        }
    }

    generateSessionId() {
        const array = new Uint8Array(16);
        if (typeof crypto !== 'undefined') {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }

    setupListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, () => this.recordActivity(), true);
        });

        this.checkInterval = setInterval(() => this.checkSessionTimeout(), 60000);
    }

    recordActivity() {
        this.lastActivityTime = Date.now();
    }

    checkSessionTimeout() {
        const elapsed = Date.now() - this.lastActivityTime;

        if (elapsed > this.timeoutMs) {
            this.logout('Session expired due to inactivity');
        }
    }

    getSessionStatus() {
        const elapsed = Date.now() - this.lastActivityTime;
        const remaining = Math.max(0, this.timeoutMs - elapsed);

        return {
            sessionId: this.sessionId,
            isActive: this.isActive,
            remainingMs: remaining,
            remainingMinutes: Math.ceil(remaining / 60000)
        };
    }

    logout(reason = 'User logout') {
        this.isActive = false;

        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }

        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
        }

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        console.log('Session ended:', reason);
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = SessionManager;
}
