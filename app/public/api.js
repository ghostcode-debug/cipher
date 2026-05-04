// RateLimiter class
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
}

// API Client
class CipherAPI {
    constructor(serverUrl = 'http://localhost:3000') {
        this.serverUrl = serverUrl;
        this.userId = null;
        this.username = null;
        this.ws = null;
    }

    async signup(username, email, password) {
        try {
            const response = await fetch(this.serverUrl + '/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.success) {
                this.userId = data.userId;
                this.username = data.username;
            }
            return data;
        } catch (error) {
            return { error: error.message };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(this.serverUrl + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                this.userId = data.userId;
                this.username = data.username;
                this.connectWebSocket();
            }
            return data;
        } catch (error) {
            return { error: error.message };
        }
    }

    async getUsers() {
        try {
            const response = await fetch(this.serverUrl + '/api/users');
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    async getMessages(otherUserId) {
        try {
            const response = await fetch(this.serverUrl + '/api/messages/' + this.userId + '/' + otherUserId);
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    async sendMessageREST(receiverId, text) {
        try {
            const response = await fetch(this.serverUrl + '/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId: this.userId, receiverId, text })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    connectWebSocket() {
        if (!this.userId) return;

        const wsUrl = this.serverUrl.replace('http', 'ws');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.ws.send(JSON.stringify({ type: 'login', userId: this.userId, username: this.username }));
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (window.onServerMessage) {
                window.onServerMessage(message);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
        };
    }

    sendMessageWebSocket(receiverId, text) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                senderId: this.userId,
                receiverId,
                senderUsername: this.username,
                text
            }));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'logout', userId: this.userId }));
            this.ws.close();
        }
    }
}

const api = new CipherAPI('http://localhost:3000');
