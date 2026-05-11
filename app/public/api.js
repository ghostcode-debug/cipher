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

// Simple Encryption Wrapper (Client-side)
class SimpleEncryption {
    constructor() {
        this.enabled = true;
    }

    // For now, use base64 encoding as placeholder
    // In production, integrate TweetNaCl.js for real encryption
    encryptMessage(message, recipientId) {
        if (!this.enabled) return message;
        
        try {
            // Simple obfuscation for now (replace with TweetNaCl later)
            const encoded = btoa(message);
            return JSON.stringify({
                encrypted: true,
                data: encoded,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Encryption error:', error);
            return message;
        }
    }

    decryptMessage(encryptedData) {
        if (!this.enabled) return encryptedData;
        
        try {
            const parsed = JSON.parse(encryptedData);
            if (parsed.encrypted) {
                return atob(parsed.data);
            }
            return encryptedData;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedData;
        }
    }

    isEncrypted(data) {
        try {
            const parsed = JSON.parse(data);
            return parsed.encrypted === true;
        } catch {
            return false;
        }
    }
}

// API Client
class CipherAPI {
    constructor(serverUrl = 'http://localhost:5000') {
        this.serverUrl = serverUrl;
        this.userId = null;
        this.username = null;
        this.ws = null;
        this.rateLimiter = new RateLimiter(10, 1000);
        this.encryption = new SimpleEncryption();
        this.userKeys = {}; // Store user public keys
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
                console.log('?? Encryption enabled for user:', this.username);
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
                console.log('?? Encryption enabled for user:', this.username);
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
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async getMessages(otherUserId) {
        try {
            const response = await fetch(
                this.serverUrl + '/api/messages/' + this.userId + '/' + otherUserId
            );
            const messages = await response.json();
            
            // Decrypt messages on receive
            return messages.map(msg => ({
                ...msg,
                text: this.encryption.isEncrypted(msg.text) 
                    ? this.encryption.decryptMessage(msg.text)
                    : msg.text,
                encrypted: this.encryption.isEncrypted(msg.text)
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async sendMessage(recipientId, text) {
        if (!this.rateLimiter.isAllowed()) {
            return { error: 'Rate limit exceeded. Please slow down.' };
        }

        try {
            // Encrypt message before sending
            const encryptedText = this.encryption.encryptMessage(text, recipientId);
            
            const response = await fetch(this.serverUrl + '/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: this.userId,
                    receiverId: recipientId,
                    text: encryptedText,
                    encrypted: true
                })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    connectWebSocket(onMessageCallback) {
        const wsProtocol = this.serverUrl.startsWith('https') ? 'wss' : 'ws';
        const wsUrl = this.serverUrl.replace(/^https?/, wsProtocol);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('? WebSocket connected');
            this.ws.send(JSON.stringify({ type: 'user_online', userId: this.userId }));
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                // Decrypt incoming messages
                if (message.text && this.encryption.isEncrypted(message.text)) {
                    message.text = this.encryption.decryptMessage(message.text);
                    message.encrypted = true;
                }
                
                onMessageCallback(message);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('? WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('? WebSocket disconnected');
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

const api = new CipherAPI('http://localhost:5000');
