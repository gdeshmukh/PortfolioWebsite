// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // --- 3. Old Intersection Observer removed ---
    // CSS transitions now trigger directly based on `.active-slide` class and `.contact-active` body class.

    // --- 4. Skills Wheel ---
    const wheels = document.querySelectorAll('.skills-wheel');
    wheels.forEach(wheel => {
        const wheelWrapper = wheel.closest('.skills-wheel-wrapper');
        if (wheel && wheelWrapper) {
            const items = Array.from(wheel.querySelectorAll('.skill-item'));
            let activeIndex = 0;
            let isScrolling = false;
            const total = items.length;

            function updateWheel() {
                items.forEach((item, index) => {
                    item.classList.remove('active');

                    let diff = (index - activeIndex) % total;
                    // Normalize diff to be between -total/2 and total/2
                    if (diff > total / 2) diff -= total;
                    if (diff < -total / 2) diff += total;

                    const absDiff = Math.abs(diff);
                    const sign = Math.sign(diff);

                    if (diff === 0) {
                        item.classList.add('active');
                        item.style.transform = `translateY(0) scale(1.15) perspective(600px) rotateX(0deg)`;
                        item.style.opacity = '1';
                        item.style.zIndex = '10';
                        item.style.filter = 'blur(0px)';
                    } else {
                        if (absDiff <= 3) {
                            const translateY = sign * (absDiff * 60);
                            const scale = Math.max(0.7, 1 - (absDiff * 0.15));
                            const rotateX = sign * (absDiff * 25);
                            const opacity = Math.max(0, 1 - (absDiff * 0.3));

                            item.style.transform = `translateY(${translateY}px) scale(${scale}) perspective(600px) rotateX(${rotateX}deg)`;
                            item.style.opacity = opacity.toString();
                            item.style.zIndex = (10 - absDiff).toString();
                            item.style.filter = `blur(${absDiff * 0.5}px)`;
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = `translateY(${sign * 200}px) scale(0.5)`;
                            item.style.zIndex = '0';
                            item.style.filter = 'blur(5px)';
                        }
                    }
                });
            }

            // Initialize wheel
            updateWheel();

            // Mouse wheel interaction
            wheelWrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (isScrolling) return;

                isScrolling = true;
                if (e.deltaY > 0) {
                    // scroll down (next)
                    activeIndex = (activeIndex + 1) % total;
                } else {
                    // scroll up (prev)
                    activeIndex = (activeIndex - 1 + total) % total;
                }
                updateWheel();

                setTimeout(() => {
                    isScrolling = false;
                }, 150); // small throttle for smooth feeling
            }, { passive: false });

            // Touch swipe interaction for mobile
            let startY = 0;
            wheelWrapper.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });

            wheelWrapper.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });

            wheelWrapper.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                const diff = startY - endY;

                if (Math.abs(diff) > 30) {
                    if (diff > 0) {
                        activeIndex = (activeIndex + 1) % total;
                    } else {
                        activeIndex = (activeIndex - 1 + total) % total;
                    }
                    updateWheel();
                }
            });

            // Click interaction
            items.forEach((item, index) => {
                item.addEventListener('click', () => {
                    activeIndex = index;
                    updateWheel();
                });
            });
        }
    });

    // --- 5. Fading Slide Scroll Logic ---
    const slides = Array.from(document.querySelectorAll('.slide-section'));
    let currentSlideIndex = 0;
    let isSlideAnimating = false;
    const scrollCooldown = 900; // Reduced from 1200ms for a smoother, slightly faster feel

    function updateSlides(newIndex) {
        if (newIndex < 0 || newIndex >= slides.length) return;
        if (newIndex === currentSlideIndex) return;

        isSlideAnimating = true;

        // All sections are now standard slides
        slides.forEach((slide, idx) => {
            if (idx === newIndex) {
                slide.classList.add('active-slide');
            } else {
                slide.classList.remove('active-slide');
            }
        });

        // (Navbar Scroll Effect Removed to keep header transparent)

        currentSlideIndex = newIndex;

        // Close mobile menu if it's open
        const navLinksElement = document.querySelector('.nav-links');
        if (navLinksElement && navLinksElement.style.display === 'flex' && window.innerWidth <= 768) {
            navLinksElement.style.display = 'none';
        }

        setTimeout(() => {
            isSlideAnimating = false;
        }, scrollCooldown);
    }

    // Re-bind Mobile Menu Toggle (Basic) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(17, 24, 39, 0.95)';
                navLinks.style.backdropFilter = 'blur(10px)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            }
        });
    }

    // Wheel Event Listener
    window.addEventListener('wheel', (e) => {
        // Prevent sliding the page if user is scrolling inside the skills wheel
        if (e.target.closest('.skills-wheel-wrapper')) return;

        if (isSlideAnimating) return;
        if (e.deltaY > 50) {
            // Scroll down
            if (currentSlideIndex < slides.length - 1) {
                updateSlides(currentSlideIndex + 1);
            }
        } else if (e.deltaY < -50) {
            // Scroll up
            if (currentSlideIndex > 0) {
                updateSlides(currentSlideIndex - 1);
            }
        }
    }, { passive: true });

    // Touch Events for Mobile Swipe
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.skills-wheel-wrapper')) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (e.target.closest('.skills-wheel-wrapper')) return;
        if (isSlideAnimating) return;

        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) { // minimum swipe threshold
            if (diff > 0) {
                // Swipe Up -> Scroll Down
                if (currentSlideIndex < slides.length - 1) {
                    updateSlides(currentSlideIndex + 1);
                }
            } else {
                // Swipe Down -> Scroll Up
                if (currentSlideIndex > 0) {
                    updateSlides(currentSlideIndex - 1);
                }
            }
        }
    }, { passive: true });

    // Generic Slide Links handling (Navbar + CTA Buttons)
    const slideLinks = document.querySelectorAll('a[data-slide]');
    slideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const slideTarget = parseInt(link.getAttribute('data-slide'));
            if (!isNaN(slideTarget)) {
                updateSlides(slideTarget);
            }
        });
    });

    // Logo click returns to hero
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        updateSlides(0);
    });
});
