// Password Utilities
// Handles secure password hashing and verification

class PasswordUtils {
    static async hashPassword(password) {
        try {
            const bcrypt = require('bcrypt');
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        } catch (error) {
            console.error('Password hashing failed:', error);
            return null;
        }
    }

    static async verifyPassword(password, hash) {
        try {
            const bcrypt = require('bcrypt');
            const isMatch = await bcrypt.compare(password, hash);
            return isMatch;
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }

    static async clientHashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);

            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            return hashHex;
        } catch (error) {
            console.error('Client-side password hashing failed:', error);
            return null;
        }
    }

    static validatePasswordStrength(password) {
        const score = {
            length: password.length >= 8 ? 1 : 0,
            uppercase: /[A-Z]/.test(password) ? 1 : 0,
            lowercase: /[a-z]/.test(password) ? 1 : 0,
            numbers: /[0-9]/.test(password) ? 1 : 0,
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 1 : 0
        };

        const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

        return {
            score: totalScore,
            strength: totalScore <= 2 ? 'Weak' : totalScore <= 4 ? 'Medium' : 'Strong',
            feedback: this.getPasswordFeedback(score, password)
        };
    }

    static getPasswordFeedback(score, password) {
        const feedback = [];

        if (score.length === 0) feedback.push('Add more characters (min 8)');
        if (score.uppercase === 0) feedback.push('Add uppercase letters');
        if (score.lowercase === 0) feedback.push('Add lowercase letters');
        if (score.numbers === 0) feedback.push('Add numbers');
        if (score.special === 0) feedback.push('Add special characters');

        return feedback;
    }
}

if (typeof module !== 'undefined') {
    module.exports = PasswordUtils;
}
