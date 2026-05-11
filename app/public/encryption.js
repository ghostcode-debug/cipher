// Simple Encryption for Browser (using base64)
class CipherEncryption {
    constructor() {
        this.enabled = true;
    }

    encryptMessage(message, recipientId) {
        if (!this.enabled) return message;
        try {
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
