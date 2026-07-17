/* INTRO PRELOADER — Lifecycle Controller */
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
