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
const successModal = document.getElementById('success-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalOverlay = document.getElementById('modal-overlay');

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

// Validation Rules
const validationRules = {
    minNameLength: 3
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
            msg = 'Full name is required (at least 3 characters)';
            break;
        case 'barber':
            isValid = val !== '';
            msg = 'Please select a barber';
            break;
        case 'service':
            isValid = val !== '';
            msg = 'Please select a service';
            break;
        case 'date':
            isValid = val !== '';
            msg = 'Please select a booking date';
            break;
        case 'time':
            isValid = val !== '';
            msg = 'Please select a time slot';
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

// Form submission handler
if (bookingForm) {
    const timeInput = document.getElementById('time');
    const timeChips = document.querySelectorAll('.time-chip');
    const timeSelectContainer = document.getElementById('time-select-container');
    const timeTrigger = document.getElementById('time-picker-trigger');
    const timeTriggerText = document.getElementById('time-trigger-text');
    const dateInput = document.getElementById('date');
    const groupTime = document.getElementById('group-time');

    // Set minimum booking date to today
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    // Toggle Dropdown when clicking Time field trigger
    if (timeTrigger && timeSelectContainer) {
        timeTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = timeSelectContainer.classList.toggle('is-open');
            timeTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!timeSelectContainer.contains(e.target)) {
                timeSelectContainer.classList.remove('is-open');
                timeTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && timeSelectContainer.classList.contains('is-open')) {
                timeSelectContainer.classList.remove('is-open');
                timeTrigger.setAttribute('aria-expanded', 'false');
                timeTrigger.focus();
            }
        });
    }

    // Update time chips availability based on date (disable passed time for today)
    const updateTimeChipsAvailability = () => {
        if (!dateInput) return;
        const selectedDate = dateInput.value;
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const isToday = selectedDate === todayStr;
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        timeChips.forEach(chip => {
            const timeVal = chip.dataset.time;
            if (!timeVal) return;
            const [h, m] = timeVal.split(':').map(Number);
            const slotTotalMinutes = h * 60 + m;

            // If today and time has passed, disable
            if (isToday && slotTotalMinutes <= currentTotalMinutes) {
                chip.disabled = true;
                chip.classList.add('is-disabled');
                chip.setAttribute('aria-disabled', 'true');

                // If previously selected slot is now disabled, reset selection
                if (chip.classList.contains('is-selected')) {
                    chip.classList.remove('is-selected');
                    chip.setAttribute('aria-pressed', 'false');
                    if (timeInput) timeInput.value = '';
                    if (timeTriggerText) timeTriggerText.textContent = 'Select a time slot';
                    if (timeTrigger) timeTrigger.classList.remove('has-value');
                }
            } else {
                chip.disabled = false;
                chip.classList.remove('is-disabled');
                chip.removeAttribute('aria-disabled');
            }
        });
    };

    if (dateInput) {
        dateInput.addEventListener('change', updateTimeChipsAvailability);
        dateInput.addEventListener('input', updateTimeChipsAvailability);
        updateTimeChipsAvailability();
    }

    // Time Slot Chip Selection Listener
    timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (chip.disabled) return;

            // Remove selected class from all chips
            timeChips.forEach(c => {
                c.classList.remove('is-selected');
                c.setAttribute('aria-pressed', 'false');
            });

            // Mark clicked chip as selected
            chip.classList.add('is-selected');
            chip.setAttribute('aria-pressed', 'true');

            // Store chosen display value in hidden input and trigger display
            const chosenDisplay = chip.dataset.display || chip.textContent.trim();
            if (timeInput) {
                timeInput.value = chosenDisplay;
                validateBookingField(timeInput);
            }

            if (timeTriggerText) {
                timeTriggerText.textContent = chosenDisplay;
            }

            if (timeTrigger) {
                timeTrigger.classList.add('has-value');
            }

            // Close dropdown smoothly
            if (timeSelectContainer) {
                timeSelectContainer.classList.remove('is-open');
                timeTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Real-time input validation on change/input
    const requiredInputs = bookingForm.querySelectorAll('.booking__input:not(#note)');
    requiredInputs.forEach(input => {
        input.addEventListener('input', () => validateBookingField(input));
        input.addEventListener('change', () => validateBookingField(input));
    });

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Form Validation: All required fields must be properly filled
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
            if (firstInvalidInput === timeInput) {
                if (timeSelectContainer) {
                    timeSelectContainer.classList.add('is-open');
                    if (timeTrigger) timeTrigger.setAttribute('aria-expanded', 'true');
                }
                const firstAvailableChip = groupTime ? groupTime.querySelector('.time-chip:not(:disabled)') : null;
                if (firstAvailableChip) {
                    firstAvailableChip.focus();
                } else if (timeTrigger) {
                    timeTrigger.focus();
                }
                if (groupTime) {
                    groupTime.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            return;
        }

        // Booking Successful!
        openModal(successModal);

        // Reset form
        bookingForm.reset();

        // Reset time chips & trigger state
        timeChips.forEach(c => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-pressed', 'false');
        });
        if (timeInput) timeInput.value = '';
        if (timeTriggerText) timeTriggerText.textContent = 'Select a time slot';
        if (timeTrigger) timeTrigger.classList.remove('has-value');
        if (timeSelectContainer) {
            timeSelectContainer.classList.remove('is-open');
            if (timeTrigger) timeTrigger.setAttribute('aria-expanded', 'false');
        }

        // Re-check time chips availability
        updateTimeChipsAvailability();

        // Clear error highlights
        requiredInputs.forEach(input => {
            input.classList.remove('is-invalid');
            const group = input.closest('.booking__group');
            if (group) group.classList.remove('has-error');
        });
    });
}
