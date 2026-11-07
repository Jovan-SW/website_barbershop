/**
 * Barber'O Authentication Controller
 * Handles user registration (Sign Up), authentication verification (Login),
 * session management, and UI state synchronization.
 */

const AuthController = (() => {
    // Storage Keys
    const STORAGE_KEY_USERS = 'barber_users';
    const STORAGE_KEY_SESSION = 'auth_session';
    const STORAGE_KEY_USER = 'auth_user';
    const STORAGE_KEY_REMEMBER = 'remembered_email';

    // Default Seed Account (Available for immediate testing)
    const DEFAULT_USERS = [
        {
            name: 'Barber Customer',
            email: 'user@barber.com',
            password: 'password123'
        }
    ];

    // Validation Rules
    const config = {
        minPasswordLength: 8,
        minNameLength: 3,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    // DOM Elements Cache
    let elements = {};

    /**
     * Initializes the Registered Users database in LocalStorage
     */
    const initUserDatabase = () => {
        try {
            const existing = localStorage.getItem(STORAGE_KEY_USERS);
            if (!existing) {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
            }
        } catch (e) {
            console.error('LocalStorage access error:', e);
        }
    };

    /**
     * Retrieves all registered users
     * @returns {Array} Array of user objects
     */
    const getUsers = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY_USERS);
            return data ? JSON.parse(data) : [...DEFAULT_USERS];
        } catch (e) {
            console.error('Failed to parse users:', e);
            return [...DEFAULT_USERS];
        }
    };

    /**
     * Finds a user by email
     * @param {string} email
     * @returns {Object|null}
     */
    const findUser = (email) => {
        if (!email) return null;
        const users = getUsers();
        const cleanEmail = email.trim().toLowerCase();
        return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    };

    /**
     * Saves a new user to LocalStorage
     * @param {Object} user - { name, email, password }
     */
    const saveUser = (user) => {
        const users = getUsers();
        users.push({
            name: user.name.trim(),
            email: user.email.trim().toLowerCase(),
            password: user.password
        });
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    };

    /**
     * Bootstraps the Authentication Controller
     */
    const init = () => {
        initUserDatabase();

        // Cache DOM elements
        elements = {
            // Panels & Tabs
            tabLogin: document.getElementById('tab-login'),
            tabSignup: document.getElementById('tab-signup'),
            loginPanel: document.getElementById('login-panel'),
            signupPanel: document.getElementById('signup-panel'),
            authAlert: document.getElementById('auth-alert'),
            linkToSignup: document.getElementById('link-to-signup'),
            linkToLogin: document.getElementById('link-to-login'),

            // Login Form
            loginForm: document.getElementById('login-form'),
            loginEmail: document.getElementById('username'),
            loginPassword: document.getElementById('password'),
            loginPasswordToggle: document.getElementById('login-password-toggle'),
            loginSubmitBtn: document.getElementById('login-submit-btn'),
            rememberMe: document.getElementById('remember-me'),

            // Signup Form
            signupForm: document.getElementById('signup-form'),
            signupName: document.getElementById('signup-name'),
            signupEmail: document.getElementById('signup-email'),
            signupPassword: document.getElementById('signup-password'),
            signupConfirmPassword: document.getElementById('signup-confirm-password'),
            signupPasswordToggle: document.getElementById('signup-password-toggle'),
            signupSubmitBtn: document.getElementById('signup-submit-btn')
        };

        if (!elements.loginForm) return;

        checkActiveSession();
        loadRememberedEmail();
        attachEventListeners();
    };

    /**
     * Attaches DOM event listeners
     */
    const attachEventListeners = () => {
        // Tab switching
        elements.tabLogin.addEventListener('click', () => switchTab('login'));
        elements.tabSignup.addEventListener('click', () => switchTab('signup'));
        if (elements.linkToSignup) elements.linkToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('signup');
        });
        if (elements.linkToLogin) elements.linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('login');
        });

        // Password visibility toggles
        if (elements.loginPasswordToggle) {
            elements.loginPasswordToggle.addEventListener('click', () => {
                togglePasswordVisibility(elements.loginPassword, elements.loginPasswordToggle);
            });
        }
        if (elements.signupPasswordToggle) {
            elements.signupPasswordToggle.addEventListener('click', () => {
                togglePasswordVisibility(elements.signupPassword, elements.signupPasswordToggle);
            });
        }

        // Login field real-time validation
        elements.loginEmail.addEventListener('input', () => validateLoginField(elements.loginEmail));
        elements.loginPassword.addEventListener('input', () => validateLoginField(elements.loginPassword));
        elements.loginForm.addEventListener('submit', handleLoginSubmit);

        // Signup field real-time validation
        elements.signupName.addEventListener('input', () => validateSignupField(elements.signupName));
        elements.signupEmail.addEventListener('input', () => validateSignupField(elements.signupEmail));
        elements.signupPassword.addEventListener('input', () => {
            validateSignupField(elements.signupPassword);
            if (elements.signupConfirmPassword.value) {
                validateSignupField(elements.signupConfirmPassword);
            }
        });
        elements.signupConfirmPassword.addEventListener('input', () => validateSignupField(elements.signupConfirmPassword));
        elements.signupForm.addEventListener('submit', handleSignupSubmit);
    };

    /**
     * Checks if session already exists and redirects to index
     */
    const checkActiveSession = () => {
        if (localStorage.getItem(STORAGE_KEY_SESSION)) {
            window.location.replace('index.html');
        }
    };

    /**
     * Loads remembered email from LocalStorage
     */
    const loadRememberedEmail = () => {
        const savedEmail = localStorage.getItem(STORAGE_KEY_REMEMBER);
        if (savedEmail && elements.loginEmail) {
            elements.loginEmail.value = savedEmail;
            if (elements.rememberMe) elements.rememberMe.checked = true;
            validateLoginField(elements.loginEmail);
        }
    };

    /**
     * Switches between Login and Sign Up tabs
     * @param {'login'|'signup'} tab
     */
    const switchTab = (tab) => {
        hideAlert();
        clearFormErrors(elements.loginForm);
        clearFormErrors(elements.signupForm);

        if (tab === 'login') {
            elements.tabLogin.classList.add('active');
            elements.tabLogin.setAttribute('aria-selected', 'true');
            elements.tabSignup.classList.remove('active');
            elements.tabSignup.setAttribute('aria-selected', 'false');

            elements.loginPanel.style.display = 'block';
            elements.signupPanel.style.display = 'none';
        } else {
            elements.tabSignup.classList.add('active');
            elements.tabSignup.setAttribute('aria-selected', 'true');
            elements.tabLogin.classList.remove('active');
            elements.tabLogin.setAttribute('aria-selected', 'false');

            elements.signupPanel.style.display = 'block';
            elements.loginPanel.style.display = 'none';
        }
    };

    /**
     * Displays a notification alert
     * @param {string} message
     * @param {'error'|'success'|'info'} type
     * @param {boolean} showSignupAction - if true, shows a button to switch to signup
     */
    const showAlert = (message, type = 'error', showSignupAction = false) => {
        if (!elements.authAlert) return;
        elements.authAlert.className = `login__alert login__alert--${type}`;
        
        let html = `<span>${message}</span>`;
        if (showSignupAction) {
            html += `<button type="button" class="login__alert-btn" id="alert-action-btn">Sign Up Sekarang</button>`;
        }
        elements.authAlert.innerHTML = html;
        elements.authAlert.style.display = 'flex';

        if (showSignupAction) {
            const actionBtn = document.getElementById('alert-action-btn');
            if (actionBtn) {
                actionBtn.addEventListener('click', () => switchTab('signup'));
            }
        }
    };

    /**
     * Hides the notification alert
     */
    const hideAlert = () => {
        if (!elements.authAlert) return;
        elements.authAlert.style.display = 'none';
        elements.authAlert.innerHTML = '';
    };

    /**
     * Toggles password input type between text and password
     */
    const togglePasswordVisibility = (input, button) => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.classList.toggle('is-visible', isPassword);
    };

    /**
     * Updates visual state of form group (success / error)
     */
    const updateFieldUI = (field, isValid, message = '') => {
        const formGroup = field.closest('.login__form-group');
        if (!formGroup) return;
        const errorText = formGroup.querySelector('.login__error-text');

        if (isValid) {
            formGroup.classList.remove('has-error');
            formGroup.classList.add('has-success');
            if (errorText) errorText.textContent = '';
        } else {
            formGroup.classList.remove('has-success');
            formGroup.classList.add('has-error');
            if (errorText) errorText.textContent = message;
        }
    };

    /**
     * Clears validation styles from a form
     */
    const clearFormErrors = (form) => {
        if (!form) return;
        const groups = form.querySelectorAll('.login__form-group');
        groups.forEach(group => {
            group.classList.remove('has-error', 'has-success');
            const errorText = group.querySelector('.login__error-text');
            if (errorText) errorText.textContent = '';
        });
    };

    /**
     * Validates a single field on the Login form
     */
    const validateLoginField = (field) => {
        const val = field.value.trim();
        let isValid = false;
        let msg = '';

        if (val === '') {
            msg = 'Kolom ini wajib diisi';
        } else if (field.id === 'username') {
            isValid = config.emailRegex.test(val);
            msg = isValid ? '' : 'Format email tidak valid (contoh: name@example.com)';
        } else if (field.id === 'password') {
            isValid = val.length >= config.minPasswordLength;
            msg = isValid ? '' : `Password minimal ${config.minPasswordLength} karakter`;
        }

        updateFieldUI(field, isValid, msg);
        return isValid;
    };

    /**
     * Validates a single field on the Signup form
     */
    const validateSignupField = (field) => {
        const val = field.value.trim();
        let isValid = false;
        let msg = '';

        if (val === '') {
            msg = 'Kolom ini wajib diisi';
        } else if (field.id === 'signup-name') {
            isValid = val.length >= config.minNameLength;
            msg = isValid ? '' : `Nama minimal ${config.minNameLength} karakter`;
        } else if (field.id === 'signup-email') {
            isValid = config.emailRegex.test(val);
            msg = isValid ? '' : 'Format email tidak valid (contoh: name@example.com)';
        } else if (field.id === 'signup-password') {
            isValid = val.length >= config.minPasswordLength;
            msg = isValid ? '' : `Password minimal ${config.minPasswordLength} karakter`;
        } else if (field.id === 'signup-confirm-password') {
            const originalPass = elements.signupPassword.value;
            isValid = val === originalPass && val.length >= config.minPasswordLength;
            msg = isValid ? '' : 'Konfirmasi password tidak cocok';
        }

        updateFieldUI(field, isValid, msg);
        return isValid;
    };

    /**
     * Handles Login form submission
     */
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        hideAlert();

        const isEmailValid = validateLoginField(elements.loginEmail);
        const isPassValid = validateLoginField(elements.loginPassword);

        if (!isEmailValid || !isPassValid) {
            showAlert('Harap lengkapi semua data dengan benar.', 'error');
            return;
        }

        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;

        // 1. Check if user exists in registered database
        const user = findUser(email);

        if (!user) {
            // USER DOES NOT EXIST -> Cannot login, instruct to Sign Up!
            updateFieldUI(elements.loginEmail, false, 'Akun tidak terdaftar');
            showAlert(
                'Akun belum terdaftar! Anda belum memiliki akun. Silakan lakukan Sign Up / mendaftar terlebih dahulu.',
                'error',
                true
            );
            return;
        }

        // 2. Check if password matches
        if (user.password !== password) {
            updateFieldUI(elements.loginPassword, false, 'Password salah');
            showAlert('Password yang Anda masukkan salah. Silakan coba lagi.', 'error');
            return;
        }

        // 3. Login Successful!
        elements.loginSubmitBtn.classList.add('is-loading');
        elements.loginSubmitBtn.disabled = true;
        showAlert(`Selamat datang kembali, ${user.name}! Mengalihkan ke halaman utama...`, 'success');

        // Save session
        const sessionToken = 'barber_session_' + Date.now();
        localStorage.setItem(STORAGE_KEY_SESSION, sessionToken);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
            name: user.name,
            email: user.email
        }));

        // Handle Remember Me
        if (elements.rememberMe && elements.rememberMe.checked) {
            localStorage.setItem(STORAGE_KEY_REMEMBER, email);
        } else {
            localStorage.removeItem(STORAGE_KEY_REMEMBER);
        }

        setTimeout(() => {
            window.location.replace('index.html');
        }, 1200);
    };

    /**
     * Handles Sign Up form submission
     */
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        hideAlert();

        const isNameValid = validateSignupField(elements.signupName);
        const isEmailValid = validateSignupField(elements.signupEmail);
        const isPassValid = validateSignupField(elements.signupPassword);
        const isConfirmValid = validateSignupField(elements.signupConfirmPassword);

        if (!isNameValid || !isEmailValid || !isPassValid || !isConfirmValid) {
            showAlert('Harap lengkapi semua kolom pendaftaran dengan benar.', 'error');
            return;
        }

        const email = elements.signupEmail.value.trim();

        // Check if email already registered
        if (findUser(email)) {
            updateFieldUI(elements.signupEmail, false, 'Email ini sudah terdaftar');
            showAlert('Email sudah terdaftar! Silakan login menggunakan akun yang sudah ada.', 'error');
            return;
        }

        // Register new user
        elements.signupSubmitBtn.classList.add('is-loading');
        elements.signupSubmitBtn.disabled = true;

        saveUser({
            name: elements.signupName.value,
            email: email,
            password: elements.signupPassword.value
        });

        setTimeout(() => {
            elements.signupSubmitBtn.classList.remove('is-loading');
            elements.signupSubmitBtn.disabled = false;

            // Switch to Login tab and fill in registered email
            switchTab('login');
            elements.loginEmail.value = email;
            elements.loginPassword.value = '';
            validateLoginField(elements.loginEmail);

            showAlert(
                'Akun Anda berhasil didaftarkan! Silakan masukkan password Anda untuk login.',
                'success'
            );
        }, 800);
    };

    /**
     * Public Logout method
     */
    const logout = () => {
        localStorage.removeItem(STORAGE_KEY_SESSION);
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.replace('login.html');
    };

    return { init, logout };
})();

document.addEventListener('DOMContentLoaded', AuthController.init);
