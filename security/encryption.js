// Data Encryption/Decryption
// Encrypts sensitive data at rest

class Encryption {
    static generateKey() {
        if (typeof navigator !== 'undefined') {
            return 'cipher-' + navigator.userAgent.substring(0, 32);
        }
        return 'cipher-default-key';
    }

    static async encrypt(data, key = null) {
        try {
            key = key || this.generateKey();
            const stringData = typeof data === 'string' ? data : JSON.stringify(data);

            const keyBuffer = new TextEncoder().encode(key);
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
            const hashHex = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 32);

            let encrypted = '';
            for (let i = 0; i < stringData.length; i++) {
                const charCode = stringData.charCodeAt(i);
                const keyCharCode = hashHex.charCodeAt(i % hashHex.length);
                encrypted += String.fromCharCode(charCode ^ keyCharCode);
            }

            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    static async decrypt(encryptedData, key = null) {
        try {
            key = key || this.generateKey();

            let encrypted = atob(encryptedData);

            const keyBuffer = new TextEncoder().encode(key);
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
            const hashHex = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 32);

            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted.charCodeAt(i);
                const keyCharCode = hashHex.charCodeAt(i % hashHex.length);
                decrypted += String.fromCharCode(charCode ^ keyCharCode);
            }

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    static generateSecureId() {
        const array = new Uint8Array(16);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

if (typeof module !== 'undefined') {
    module.exports = Encryption;
}
