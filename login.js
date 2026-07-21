/**
 * Login Controller
 * Modular implementation for authentication UI & simulation.
 */

const LoginController = (() => {
    // DOM Elements
    const elements = {
        form: document.querySelector('.login__form'),
        email: document.getElementById('username'), // Reusing username field for email
        password: document.getElementById('password'),
        togglePasswordBtn: document.querySelector('.login__password-toggle'),
        submitBtn: document.querySelector('.login__btn'),
        rememberMe: document.querySelector('input[name="remember"]')
    };

    // Configuration & State
    const config = {
        minPasswordLength: 8,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };
    let isSubmitting = false;

    /**
     * Bootstraps the Login Controller
     */
    const init = () => {
        if (!elements.form) return;
        
        checkActiveSession();
        loadRememberedEmail();
        attachEventListeners();
        validateForm(); // Initial button state
    };

    /**
      Attaches all DOM event listeners
     */
    const attachEventListeners = () => {
        elements.email.addEventListener('input', handleInput);
        elements.password.addEventListener('input', handleInput);
        elements.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
        elements.form.addEventListener('submit', handleSubmit);
    };

    /**
     * Checks if a session already exists and redirects if true
     */
    const checkActiveSession = () => {
        if (localStorage.getItem('auth_session')) {
            window.location.replace('index.html');
        }
    };

    /*
     Loads remembered email from LocalStorage
     */
    const loadRememberedEmail = () => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            elements.email.value = savedEmail;
            elements.rememberMe.checked = true;
            validateField(elements.email);
        }
    };

    /**
     * Handles real-time input validation
     */
    const handleInput = (e) => {
        const field = e.target;
        
        // Auto-trim spaces
        if (field.value.startsWith(' ') || field.value.endsWith(' ')) {
            field.value = field.value.trim();
        }
        
        validateField(field);
        validateForm();
    };

    /**
     * Validates a single input field and updates UI
     * @param {HTMLElement} field - The input element
     */
    const validateField = (field) => {
        const formGroup = field.closest('.login__form-group');
        const errorText = formGroup.querySelector('.login__error-text');
        
        let isValid = false;
        let errorMessage = '';

        if (field.value === '') {
            errorMessage = 'This field is required';
        } else if (field.id === 'username') { // Treating 'username' as email
            isValid = config.emailRegex.test(field.value);
            errorMessage = isValid ? '' : 'Please enter a valid email address';
        } else if (field.id === 'password') {
            isValid = field.value.length >= config.minPasswordLength;
            errorMessage = isValid ? '' : `Password must be at least ${config.minPasswordLength} characters`;
        }

        updateFieldUI(formGroup, errorText, isValid, errorMessage);
        return isValid;
    };

    /**
     * Updates the visual state of a form field
     */
    const updateFieldUI = (formGroup, errorElement, isValid, errorMessage) => {
        if (isValid) {
            formGroup.classList.remove('has-error');
            formGroup.classList.add('has-success');
            if (errorElement) errorElement.textContent = '';
        } else {
            formGroup.classList.remove('has-success');
            formGroup.classList.add('has-error');
            if (errorElement) errorElement.textContent = errorMessage;
        }
    };

    /**
     * Validates entire form to enable/disable submit button
     */
    const validateForm = () => {
        const isEmailValid = config.emailRegex.test(elements.email.value);
        const isPasswordValid = elements.password.value.length >= config.minPasswordLength;
        
        const isFormValid = isEmailValid && isPasswordValid;
        
        // Enable or disable the button based on validation
        elements.submitBtn.disabled = !isFormValid;
        
        if (!isFormValid) {
            elements.submitBtn.style.opacity = '0.5';
            elements.submitBtn.style.cursor = 'not-allowed';
        } else {
            elements.submitBtn.style.opacity = '1';
            elements.submitBtn.style.cursor = 'pointer';
        }
        
        return isFormValid;
    };

    /**
     * Toggles password visibility
     */
    const togglePasswordVisibility = () => {
        const isPassword = elements.password.type === 'password';
        elements.password.type = isPassword ? 'text' : 'password';
        
        // Visual feedback on the toggle button itself can be handled via CSS using this class
        elements.togglePasswordBtn.classList.toggle('is-visible');
    };

    /**
     * Sets button to loading state
     */
    const setLoadingState = (isLoading) => {
        isSubmitting = isLoading;
        if (isLoading) {
            elements.submitBtn.classList.add('is-loading');
            elements.submitBtn.disabled = true;
            elements.submitBtn.style.opacity = '0.8';
        } else {
            elements.submitBtn.classList.remove('is-loading');
            elements.submitBtn.disabled = false;
            elements.submitBtn.style.opacity = '1';
        }
    };

    /**
     * Simulates backend authentication delay
     */
    const authenticate = async (email, password) => {
        return new Promise((resolve) => {
            // Simulate 1.5s network delay
            setTimeout(() => {
                resolve({ success: true, token: 'simulated_jwt_token_777' });
            }, 1500);
        });
    };

    /**
     * Handles form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent double click or submission of invalid form
        if (isSubmitting || !validateForm()) return;
        
        setLoadingState(true);
        
        try {
            // Using async/await simulation for future API readiness
            const response = await authenticate(elements.email.value, elements.password.value);
            
            if (response.success) {
                handleLoginSuccess(response.token);
            }
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            // Normally setLoadingState(false) happens here, but since we redirect on success, 
            // it's only strictly necessary on error. Added for safety.
            setLoadingState(false);
        }
    };

    /**
     * Processes successful login
     */
    const handleLoginSuccess = (token) => {
        // Save session locally
        localStorage.setItem('auth_session', token);
        
        // Process Remember Me
        if (elements.rememberMe.checked) {
            localStorage.setItem('remembered_email', elements.email.value);
        } else {
            localStorage.removeItem('remembered_email');
        }
        
        // Optional: show a success message briefly before redirecting
        const submitText = elements.submitBtn.textContent;
        elements.submitBtn.textContent = 'Success!';
        elements.submitBtn.classList.remove('is-loading');
        
        // Redirect to dashboard/home
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1500);
    };

    /**
     * Public API (Used for Logout globally)
     */
    const logout = () => {
        localStorage.removeItem('auth_session');
        window.location.replace('login.html');
    };

    // Expose public methods
    return { init, logout };
})();

// Bootstrap the module on DOM content loaded
document.addEventListener('DOMContentLoaded', LoginController.init);
