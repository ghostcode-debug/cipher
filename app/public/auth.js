// Auth Management with Enhanced UX
class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.setupEventListeners();
        this.loadRememberedEmail();
    }

    setupEventListeners() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

        // Password toggles
        document.getElementById('loginPasswordToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePasswordVisibility('loginPassword');
        });
        document.getElementById('signupPasswordToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePasswordVisibility('signupPassword');
        });
        document.getElementById('signupPasswordConfirmToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePasswordVisibility('signupPasswordConfirm');
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        document.getElementById('signupUsername').addEventListener('input', () => this.validateUsername());
        document.getElementById('signupEmail').addEventListener('input', () => this.validateEmail());
        document.getElementById('signupPassword').addEventListener('input', () => this.validatePassword());
        document.getElementById('signupPasswordConfirm').addEventListener('input', () => this.validatePasswordConfirm());

        document.getElementById('rememberMe').addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.setItem('rememberEmail', document.getElementById('loginEmail').value);
            } else {
                localStorage.removeItem('rememberEmail');
            }
        });
    }

    togglePasswordVisibility(fieldId) {
        const field = document.getElementById(fieldId);
        const toggle = document.querySelector([id="\Toggle"]);
        if (field.type === 'password') {
            field.type = 'text';
            toggle.textContent = '🙈';
        } else {
            field.type = 'password';
            toggle.textContent = '👁';
        }
    }

    loadRememberedEmail() {
        const remembered = localStorage.getItem('rememberEmail');
        if (remembered) {
            document.getElementById('loginEmail').value = remembered;
            document.getElementById('rememberMe').checked = true;
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        document.querySelectorAll('.auth-form').forEach(f => {
            f.classList.toggle('active', f.dataset.form === tab);
        });
        document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
        document.querySelectorAll('.form-input').forEach(i => i.classList.remove('error', 'success'));
        setTimeout(() => {
            if (tab === 'login') document.getElementById('loginEmail').focus();
            else document.getElementById('signupUsername').focus();
        }, 100);
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const button = document.getElementById('loginButton');

        if (!email || !password) {
            this.showError('loginEmailError', '⚠️ Please fill in all fields');
            return;
        }

        button.classList.add('loading');
        button.disabled = true;

        try {
            const result = await api.login(email, password);
            if (result.success) {
                document.getElementById('loginSuccessMessage').classList.add('show');
                setTimeout(() => {
                    document.getElementById('loginContainer').classList.add('hidden');
                    document.getElementById('mainContainer').style.display = 'flex';
                    initializeApp();
                }, 800);
            } else {
                this.showError('loginEmailError', '❌ ' + (result.error || 'Login failed'));
            }
        } catch (error) {
            this.showError('loginEmailError', '❌ Network error. Please try again.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const button = document.getElementById('signupButton');

        if (!this.validateAll(username, email, password, passwordConfirm)) return;

        button.classList.add('loading');
        button.disabled = true;

        try {
            const result = await api.signup(username, email, password);
            if (result.success) {
                document.getElementById('signupSuccessMessage').classList.add('show');
                setTimeout(async () => {
                    const loginResult = await api.login(email, password);
                    if (loginResult.success) {
                        document.getElementById('loginContainer').classList.add('hidden');
                        document.getElementById('mainContainer').style.display = 'flex';
                        initializeApp();
                    }
                }, 800);
            } else {
                this.showError('signupEmailError', '❌ ' + (result.error || 'Signup failed'));
            }
        } catch (error) {
            this.showError('signupEmailError', '❌ Network error. Please try again.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    validateUsername() {
        const input = document.getElementById('signupUsername');
        const value = input.value.trim();
        const error = document.getElementById('signupUsernameError');
        const success = document.getElementById('signupUsernameSuccess');

        error.classList.remove('show');
        success.classList.remove('show');
        input.classList.remove('error', 'success');

        if (!value) return true;
        if (value.length < 3) {
            this.showFieldError(input, error, '⚠️ Min 3 characters');
            return false;
        }
        if (value.length > 20) {
            this.showFieldError(input, error, '⚠️ Max 20 characters');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+\$/.test(value + '$')) {
            this.showFieldError(input, error, '⚠️ Letters, numbers, underscore only');
            return false;
        }
        this.showFieldSuccess(input, success, '✓ Available');
        return true;
    }

    validateEmail() {
        const input = document.getElementById('signupEmail');
        const value = input.value.trim();
        const error = document.getElementById('signupEmailError');
        const success = document.getElementById('signupEmailSuccess');

        error.classList.remove('show');
        success.classList.remove('show');
        input.classList.remove('error', 'success');

        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
        if (!emailRegex.test(value + '$')) {
            this.showFieldError(input, error, '⚠️ Invalid email');
            return false;
        }
        this.showFieldSuccess(input, success, '✓ Valid');
        return true;
    }

    validatePassword() {
        const input = document.getElementById('signupPassword');
        const value = input.value;
        const strength = document.getElementById('passwordStrength');
        const fill = document.getElementById('strengthFill');
        const text = document.getElementById('strengthText');

        if (!value) {
            strength.classList.remove('show');
            return true;
        }

        strength.classList.add('show');
        let score = 0;
        if (value.length >= 8) score++;
        if (value.length >= 12) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[@#\$%^&*]/.test(value)) score++;

        fill.className = 'strength-fill';
        if (score <= 2) {
            fill.classList.add('weak');
            text.textContent = '🔴 Weak';
            return false;
        } else if (score <= 3) {
            fill.classList.add('fair');
            text.textContent = '🟠 Fair';
            return false;
        } else if (score <= 4) {
            fill.classList.add('good');
            text.textContent = '🟡 Good';
            return false;
        } else {
            fill.classList.add('strong');
            text.textContent = '🟢 Strong';
            return true;
        }
    }

    validatePasswordConfirm() {
        const input = document.getElementById('signupPasswordConfirm');
        const password = document.getElementById('signupPassword').value;
        const error = document.getElementById('signupPasswordConfirmError');

        error.classList.remove('show');
        input.classList.remove('error', 'success');

        if (!input.value) return true;
        if (input.value !== password) {
            this.showFieldError(input, error, '⚠️ Passwords don\'t match');
            return false;
        }
        input.classList.add('success');
        return true;
    }

    validateAll(username, email, password, passwordConfirm) {
        let valid = true;
        if (!this.validateUsername()) valid = false;
        if (!this.validateEmail()) valid = false;
        if (!this.validatePassword()) valid = false;
        if (!this.validatePasswordConfirm()) valid = false;
        return valid;
    }

    showFieldError(input, errorEl, message) {
        input.classList.add('error');
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }

    showFieldSuccess(input, successEl, message) {
        input.classList.add('success');
        successEl.textContent = message;
        successEl.classList.add('show');
    }

    showError(fieldId, message) {
        const error = document.getElementById(fieldId);
        error.textContent = message;
        error.classList.add('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
