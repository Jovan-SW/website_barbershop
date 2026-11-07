// INTRO PRELOADER — Lifecycle Controller //
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('intro-overlay');

    if (!overlay) return;

    // durasi animasi = animasi terakhir berakhir (delay 1.0s + duration 1.25s = 2.25s) + hold time (1.5s)
    const TOTAL_WAIT_MS = 3750;

    setTimeout(function () {
        // Trigger CSS exit transition (slide-up + fade)
        overlay.classList.add('intro-done');

        // After CSS transition completes, fully remove overlay from layout
        overlay.addEventListener('transitionend', function handleTransitionEnd(e) {
            // Only react to the transform transition (not opacity)
            if (e.propertyName !== 'transform') return;

            overlay.classList.add('intro-hidden');
            document.body.classList.remove('intro-active');

            // Clean up: remove will-change to free compositor memory
            overlay.style.willChange = 'auto';

            overlay.removeEventListener('transitionend', handleTransitionEnd);
        });
    }, TOTAL_WAIT_MS);
});


// Toggle class active untuk hamburger menu
const navbarNav = document.querySelector('.navbar-nav');
const hamburger = document.querySelector('#hamburger-menu');

hamburger.addEventListener('click', function (e) {
    navbarNav.classList.toggle('active');
    e.preventDefault();
});

// Klik di luar sidebar untuk menghilangkan nav
document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
});


/* SCROLL UP ANIMATION  */
(function () {
    const fadeEls = document.querySelectorAll('[data-fade-up]');
    if (!fadeEls.length) return;

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        }
    );

    fadeEls.forEach(function (el) {
        observer.observe(el);
    });
})();

// BOOKING FORM & POPUP LOGIC //
const bookingForm = document.getElementById('booking-form');
const bookingAuthNotice = document.getElementById('booking-auth-notice');
const successModal = document.getElementById('success-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalOverlay = document.getElementById('modal-overlay');

// Auth Required Modal Elements
const authModal = document.getElementById('auth-modal');
const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
const authModalOverlay = document.getElementById('auth-modal-overlay');

// Helper: Check if user is authenticated
const isUserLoggedIn = () => {
    return Boolean(localStorage.getItem('auth_session'));
};

// Open and Close Modals
const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
};

const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
};

// Modal Listeners
if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(successModal));
if (modalOverlay) modalOverlay.addEventListener('click', () => closeModal(successModal));

if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', () => closeModal(authModal));
if (authModalOverlay) authModalOverlay.addEventListener('click', () => closeModal(authModal));

// Validation Regex
const validationRules = {
    minNameLength: 3,
    phoneRegex: /^[0-9\-+\s]{10,15}$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Updates visual state of a form field
const setFieldValidationUI = (input, isValid, errorMsg = '') => {
    const group = input.closest('.booking__group');
    if (!group) return;
    const errorSpan = group.querySelector('.booking__field-error');

    if (isValid) {
        group.classList.remove('has-error');
        input.classList.remove('is-invalid');
    } else {
        group.classList.add('has-error');
        input.classList.add('is-invalid');
        if (errorSpan && errorMsg) {
            errorSpan.textContent = errorMsg;
        }
    }
};

// Validates a single booking input
const validateBookingField = (input) => {
    const val = input.value.trim();
    let isValid = false;
    let msg = '';

    switch (input.id) {
        case 'name':
            isValid = val.length >= validationRules.minNameLength;
            msg = 'Nama lengkap wajib diisi (minimal 3 huruf)';
            break;
        case 'phone':
            isValid = validationRules.phoneRegex.test(val);
            msg = 'Nomor telepon wajib diisi (10-15 digit angka)';
            break;
        case 'email':
            isValid = validationRules.emailRegex.test(val);
            msg = 'Format email tidak valid (contoh: name@example.com)';
            break;
        case 'service':
            isValid = val !== '';
            msg = 'Harap pilih salah satu layanan';
            break;
        case 'date':
            isValid = val !== '';
            msg = 'Tanggal booking wajib dipilih';
            break;
        case 'time':
            isValid = val !== '';
            msg = 'Jam booking wajib dipilih';
            break;
        case 'note':
            // Optional field: always valid
            isValid = true;
            break;
        default:
            isValid = true;
    }

    setFieldValidationUI(input, isValid, msg);
    return isValid;
};

// Synchronizes the booking form state with user's login status
const syncBookingFormAuthState = () => {
    if (!bookingForm) return;

    const loggedIn = isUserLoggedIn();
    const inputs = bookingForm.querySelectorAll('.booking__input');
    const submitBtn = document.getElementById('booking-submit-btn');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const authUserData = localStorage.getItem('auth_user');

    if (loggedIn) {
        // UNLOCKED: User is logged in
        if (bookingAuthNotice) bookingAuthNotice.style.display = 'none';
        bookingForm.classList.remove('is-locked');
        inputs.forEach(input => {
            input.disabled = false;
        });
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.cursor = 'pointer';
        }

        // Set minimum booking date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Auto-fill Name & Lock Email strictly to authenticated user
        if (authUserData) {
            try {
                const user = JSON.parse(authUserData);
                if (nameInput && !nameInput.value && user.name) {
                    nameInput.value = user.name;
                }
                if (emailInput && user.email) {
                    emailInput.value = user.email;
                    emailInput.readOnly = true;
                    emailInput.classList.add('is-readonly');
                }
            } catch (err) {
                console.error('Error reading auth_user:', err);
            }
        }
    } else {
        // LOCKED: User is NOT logged in or has logged out
        if (bookingAuthNotice) bookingAuthNotice.style.display = 'flex';
        bookingForm.classList.add('is-locked');
        inputs.forEach(input => {
            input.disabled = true;
            input.classList.remove('is-invalid');
            const group = input.closest('.booking__group');
            if (group) group.classList.remove('has-error');
        });
        if (emailInput) {
            emailInput.value = '';
            emailInput.readOnly = true;
            emailInput.classList.remove('is-readonly');
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.cursor = 'not-allowed';
        }
    }
};

// Form submission handler
if (bookingForm) {
    const emailInput = document.getElementById('email');

    // Prevent direct typing / paste into locked email input
    if (emailInput) {
        emailInput.addEventListener('keydown', (e) => {
            if (emailInput.readOnly) e.preventDefault();
        });
        emailInput.addEventListener('paste', (e) => {
            if (emailInput.readOnly) e.preventDefault();
        });
    }

    // Real-time input validation on change/input
    const requiredInputs = bookingForm.querySelectorAll('.booking__input:not(#note)');
    requiredInputs.forEach(input => {
        input.addEventListener('input', () => validateBookingField(input));
        input.addEventListener('change', () => validateBookingField(input));
    });

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1. STRICT CHECK: User MUST be logged in to book!
        if (!isUserLoggedIn()) {
            openModal(authModal);
            return;
        }

        // 2. ANTI-TAMPER / ANTI-SPAM: Guarantee email strictly matches authenticated user email
        const authUserData = localStorage.getItem('auth_user');
        if (authUserData && emailInput) {
            try {
                const user = JSON.parse(authUserData);
                if (user.email) {
                    emailInput.value = user.email;
                    emailInput.readOnly = true;
                }
            } catch (err) {}
        }

        // 3. FORM VALIDATION: All required fields must be properly filled
        let isFormValid = true;
        let firstInvalidInput = null;

        requiredInputs.forEach(input => {
            const isValid = validateBookingField(input);
            if (!isValid) {
                isFormValid = false;
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        });

        // If any required field is empty or invalid, focus on the first error
        if (!isFormValid) {
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            return;
        }

        // 4. BOOKING SUCCESSFUL!
        openModal(successModal);

        // Reset variable fields except user's registered name & locked email
        const phoneInput = document.getElementById('phone');
        const serviceInput = document.getElementById('service');
        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        const noteInput = document.getElementById('note');

        if (phoneInput) phoneInput.value = '';
        if (serviceInput) serviceInput.selectedIndex = 0;
        if (dateInput) dateInput.value = '';
        if (timeInput) timeInput.value = '';
        if (noteInput) noteInput.value = '';

        // Re-lock and restore user's registered credentials
        if (authUserData) {
            try {
                const user = JSON.parse(authUserData);
                const nameInput = document.getElementById('name');
                if (user.email && emailInput) {
                    emailInput.value = user.email;
                    emailInput.readOnly = true;
                }
                if (user.name && nameInput) {
                    nameInput.value = user.name;
                }
            } catch (err) {}
        }

        // Clear error highlights
        requiredInputs.forEach(input => {
            input.classList.remove('is-invalid');
            const group = input.closest('.booking__group');
            if (group) group.classList.remove('has-error');
        });
    });
}

// Authentication State Synchronization & Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('auth_session');
    const authUserData = localStorage.getItem('auth_user');
    const loginBtn = document.querySelector('.navbar-login-btn');
    const userProfile = document.getElementById('userProfile');
    const avatarInitial = document.getElementById('avatarInitial');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const logoutBtn = document.getElementById('LogoutBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileDropdown = document.getElementById('profileDropdown');

    // UI State Toggling
    if (session) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'inline-flex';

        // Extract user email and set initial letter
        let email = '';
        if (authUserData) {
            try {
                const user = JSON.parse(authUserData);
                email = user.email || '';
            } catch (err) {
                console.error('Error reading auth_user:', err);
            }
        }

        // Set initial letter
        const initial = email ? email.trim().charAt(0).toUpperCase() : 'U';
        if (avatarInitial) avatarInitial.textContent = initial;
        if (dropdownEmail) dropdownEmail.textContent = email || 'User Account';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userProfile) userProfile.style.display = 'none';
    }

    // Synchronize booking appointment form state (Lock/Unlock)
    syncBookingFormAuthState();

    // Toggle dropdown on click (support for mobile & touch)
    if (profileAvatar && profileDropdown) {
        profileAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (userProfile && !userProfile.contains(e.target)) {
                profileDropdown.classList.remove('is-open');
            }
        });
    }

    // Logout Action Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_user');
            window.location.reload();
        });
    }
});
