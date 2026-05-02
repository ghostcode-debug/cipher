// Input Sanitization - XSS Prevention
// Removes dangerous HTML/JavaScript from user input

class Sanitizer {
    static sanitizeHtml(input) {
        if (!input) return '';
        if (typeof input !== 'string') return '';

        let text = input;

        // Remove script tags
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers
        text = text.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        text = text.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

        // Remove dangerous HTML tags
        const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta', 'style'];
        dangerousTags.forEach(tag => {
            text = text.replace(new RegExp(<[^>]*>.*?</>, 'gi'), '');
        });

        // Use DOM to safely escape HTML
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static sanitizeInput(input) {
        if (!input) return '';
        return this.sanitizeHtml(input);
    }

    static sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return '';

        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return '';
            }
            return urlObj.toString();
        } catch (e) {
            return '';
        }
    }

    static sanitizeJson(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') return null;

        try {
            const obj = JSON.parse(jsonString);
            return this.sanitizeObject(obj);
        } catch (e) {
            return null;
        }
    }

    static sanitizeObject(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        } else if (obj !== null && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = this.sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        } else if (typeof obj === 'string') {
            return this.sanitizeHtml(obj);
        }
        return obj;
    }
}

if (typeof module !== 'undefined') {
    module.exports = Sanitizer;
}
