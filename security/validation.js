// Input Validation Utilities
// Prevents invalid data from breaking the app

class Validator {
    static validateMessage(message) {
        if (!message) throw new Error('Message is required');
        if (typeof message.text !== 'string') throw new Error('Message text must be a string');
        if (message.text.trim().length === 0) throw new Error('Message cannot be empty');
        if (message.text.length > 5000) throw new Error('Message too long (max 5000 chars)');
        if (typeof message.sender !== 'string') throw new Error('Invalid sender');
        if (!Number.isInteger(message.timestamp)) throw new Error('Invalid timestamp');
        return true;
    }

    static validateUsername(username) {
        if (!username || typeof username !== 'string') throw new Error('Username required');
        if (username.length < 2) throw new Error('Username too short (min 2 chars)');
        if (username.length > 50) throw new Error('Username too long (max 50 chars)');
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) throw new Error('Invalid characters in username');
        return true;
    }

    static validateEmail(email) {
        if (!email || typeof email !== 'string') throw new Error('Email required');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Invalid email format');
        return true;
    }

    static validatePassword(password) {
        if (!password || typeof password !== 'string') throw new Error('Password required');
        if (password.length < 8) throw new Error('Password too short (min 8 chars)');
        if (password.length > 128) throw new Error('Password too long (max 128 chars)');
        if (!/[A-Z]/.test(password)) throw new Error('Password must contain uppercase');
        if (!/[a-z]/.test(password)) throw new Error('Password must contain lowercase');
        if (!/[0-9]/.test(password)) throw new Error('Password must contain number');
        return true;
    }

    static validateConversationId(id) {
        if (!id || typeof id !== 'string') throw new Error('Conversation ID required');
        if (id.length < 2) throw new Error('Invalid conversation ID');
        return true;
    }
}

if (typeof module !== 'undefined') {
    module.exports = Validator;
}
