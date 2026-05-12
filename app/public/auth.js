class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.setupTabs();
        this.setupLoginForm();
        this.setupSignupForm();
        this.loadRememberedEmail();
    }

    setupTabs() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const formName = e.target.dataset.tab;
                this.switchForm(formName);
            });
        });
    }

    switchForm(formName) {
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        
        document.querySelector(`[data-form="${formName}"]`).classList.add('active');
        document.querySelector(`[data-tab="${formName}"]`).classList.add('active');
        this.currentForm = formName;
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const submitBtn = document.getElementById('loginButton');

        document.getElementById('loginPasswordToggle').addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            e.target.textContent = isPassword ? '🙈' : '👁';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(emailInput.value, passwordInput.value, submitBtn);
        });
    }

    setupSignupForm() {
        const form = document.getElementById('signupForm');
        const usernameInput = document.getElementById('signupUsername');
        const emailInput = document.getElementById('signupEmail');
        const passwordInput = document.getElementById('signupPassword');
        const passwordConfirmInput = document.getElementById('signupPasswordConfirm');
        const submitBtn = document.getElementById('signupButton');

        passwordInput.addEventListener('input', () => {
            this.checkPasswordStrength(passwordInput.value);
        });

        document.getElementById('signupPasswordToggle').addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            e.target.textContent = isPassword ? '🙈' : '👁';
        });

        document.getElementById('signupPasswordConfirmToggle').addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = passwordConfirmInput.type === 'password';
            passwordConfirmInput.type = isPassword ? 'text' : 'password';
            e.target.textContent = isPassword ? '🙈' : '👁';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(usernameInput.value, emailInput.value, passwordInput.value, passwordConfirmInput.value, submitBtn);
        });
    }

    checkPasswordStrength(password) {
        const strengthContainer = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@#$%^&*]/.test(password)) score++;

        strengthContainer.classList.add('show');
        strengthFill.className = 'strength-fill';

        if (score <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Password strength: Weak 🔴';
        } else if (score <= 3) {
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Password strength: Fair 🟠';
        } else if (score <= 4) {
            strengthFill.classList.add('good');
            strengthText.textContent = 'Password strength: Good 🟡';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Password strength: Strong 🟢';
        }
    }

    async handleLogin(email, password, button) {
        if (!email || !password) {
            this.showError('loginEmailError', '⚠️ Please fill in all fields');
            return;
        }

        button.classList.add('loading');
        button.disabled = true;

        try {
            const result = await api.login(email, password);
            if (result.success) {
                if (document.getElementById('rememberMe').checked) {
                    localStorage.setItem('rememberedEmail', email);
                }
                document.getElementById('loginSuccessMessage').classList.add('show');
                setTimeout(() => {
                    document.getElementById('loginContainer').classList.add('hidden');
                    document.getElementById('mainContainer').style.display = 'flex';
                    setTimeout(() => {
                        initializeApp();
                    }, 100);
                }, 800);
            } else {
                this.showError('loginEmailError', '❌ ' + (result.error || 'Login failed'));
            }
        } catch (error) {
            this.showError('loginEmailError', '❌ Connection error: ' + error.message);
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    async handleSignup(username, email, password, passwordConfirm, button) {
        if (!username || !email || !password || !passwordConfirm) {
            this.showError('signupUsernameError', '⚠️ Please fill in all fields');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('signupPasswordConfirmError', '❌ Passwords do not match');
            return;
        }

        if (password.length < 8) {
            this.showError('signupPasswordError', '❌ Password must be at least 8 characters');
            return;
        }

        button.classList.add('loading');
        button.disabled = true;

        try {
            const result = await api.signup(username, email, password);
            if (result.success) {
                document.getElementById('signupSuccessMessage').classList.add('show');
                setTimeout(() => {
                    document.getElementById('loginContainer').classList.add('hidden');
                    document.getElementById('mainContainer').style.display = 'flex';
                    setTimeout(() => {
                        initializeApp();
                    }, 100);
                }, 1500);
            } else {
                this.showError('signupUsernameError', '❌ ' + (result.error || 'Signup failed'));
            }
        } catch (error) {
            this.showError('signupUsernameError', '❌ Connection error: ' + error.message);
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    loadRememberedEmail() {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            document.getElementById('loginEmail').value = remembered;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

const authManager = new AuthManager();
