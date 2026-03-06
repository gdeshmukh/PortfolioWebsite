// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {


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
                if (window.innerWidth <= 768) return; // Disable 3D transforms on mobile

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
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
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
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
                startY = e.touches[0].clientY;
            }, { passive: true });

            wheelWrapper.addEventListener('touchmove', (e) => {
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
                e.preventDefault();
            }, { passive: false });

            wheelWrapper.addEventListener('touchend', (e) => {
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
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
                    // Prevent click if we were just dragging
                    if (isDragging) return;
                    activeIndex = index;
                    updateWheel();
                });
            });

            // Mouse Drag interaction
            let isDragging = false;
            let dragStartY = 0;
            let currentDragIndex = activeIndex;

            wheelWrapper.addEventListener('mousedown', (e) => {
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
                isDragging = true;
                dragStartY = e.clientY;
                currentDragIndex = activeIndex; // Track index at start of drag
                wheelWrapper.style.cursor = 'grabbing';
                // Slight optimization to prevent text selection while dragging
                document.body.style.userSelect = 'none';
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    // Add a tiny delay before resetting isDragging so click events can be blocked if a drag occurred.
                    // If no actual movement occurred, we immediately allow clicks.
                    setTimeout(() => {
                        isDragging = false;
                    }, 50);
                }
                wheelWrapper.style.cursor = 'grab';
                document.body.style.userSelect = '';
            });

            wheelWrapper.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return; // Let native swipe/scroll handle mobile
                if (!isDragging) return;

                const diff = dragStartY - e.clientY;
                const sensitivity = 40; // Pixels per item switch

                // Calculate how many items we should offset based on drag distance
                let steps = Math.floor(Math.abs(diff) / sensitivity);

                if (steps > 0) {
                    const direction = Math.sign(diff); // 1 for drag up (next items), -1 for drag down (prev items)

                    // Update active index based on drag direction and steps
                    activeIndex = (currentDragIndex + (direction * steps)) % total;
                    if (activeIndex < 0) {
                        activeIndex += total; // Handle negative modulo correctly
                    }

                    updateWheel();
                }
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

        const isScrollingUp = newIndex < currentSlideIndex;

        // All sections are now standard slides
        slides.forEach((slide, idx) => {
            if (idx === newIndex) {
                slide.classList.add('active-slide');
                slide.classList.remove('passed-slide');

                if (isScrollingUp) {
                    console.log(`[Scroll Fix] isScrollingUp=true. Target slide: ${slide.id}`);
                    // Scrolling UP into a section: start at the bottom of it
                    const startTime = performance.now();
                    const forceBottom = (now) => {
                        slide.scrollTop = 999999;
                        if (now - startTime < 850) {
                            requestAnimationFrame(forceBottom);
                        } else {
                            console.log(`[Scroll Fix] Finished forcing bottom. Final scrollTop: ${slide.scrollTop}, max possible: ${slide.scrollHeight - slide.clientHeight}`);
                        }
                    };
                    requestAnimationFrame(forceBottom);
                } else {
                    console.log(`[Scroll Fix] isScrollingUp=false. Target slide: ${slide.id}`);
                    slide.scrollTop = 0;
                }
            } else if (idx < newIndex) {
                // Slides before the current one should move up
                slide.classList.remove('active-slide');
                slide.classList.add('passed-slide');
            } else {
                // Slides after the current one should reset below
                slide.classList.remove('active-slide');
                slide.classList.remove('passed-slide');
            }
        });


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

    // Mobile Menu Toggle
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
        console.log("WHEEL DETECTED. deltaY:", e.deltaY, "target:", e.target, "currentSlideIndex:", currentSlideIndex);

        // Prevent sliding the page if user is scrolling inside the skills wheel
        if (e.target.closest('.skills-wheel-wrapper')) return;

        // If mobile viewport, let native scroll handle it
        if (window.innerWidth <= 768) return;

        if (isSlideAnimating) return;

        const activeSlide = slides[currentSlideIndex];

        if (e.deltaY > 20) {
            // Scroll down
            if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight) {
                const bottomValue = Math.ceil(activeSlide.scrollTop + activeSlide.clientHeight);
                console.log("Wheel Down:", {
                    scrollTop: activeSlide.scrollTop,
                    clientHeight: activeSlide.clientHeight,
                    scrollHeight: activeSlide.scrollHeight,
                    bottomValue: bottomValue
                });

                // Allow a tight 5px give for padding margin bounds
                if (bottomValue + 5 < activeSlide.scrollHeight) {
                    return;
                }
            }
            if (currentSlideIndex < slides.length - 1) {
                updateSlides(currentSlideIndex + 1);
            }
        } else if (e.deltaY < -20) {
            // Scroll up
            // Let native scroll happen if we haven't reached the top of an overflowing slide
            if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight) {
                console.log("Wheel Up:", { scrollTop: activeSlide.scrollTop });
                if (activeSlide.scrollTop > 5) {
                    return;
                }
            }
            if (currentSlideIndex > 0) {
                updateSlides(currentSlideIndex - 1);
            }
        }
    }, { passive: false });

    // Touch Events for Mobile Swipe
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.skills-wheel-wrapper')) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (e.target.closest('.skills-wheel-wrapper')) return;
        if (window.innerWidth <= 768) return; // Disable custom swipe transitions on mobile
        if (isSlideAnimating) return;

        const activeSlide = slides[currentSlideIndex];
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) { // minimum swipe threshold
            if (diff > 0) {
                // Swipe Up -> Scroll Down
                // Let native scroll happen if we haven't reached the bottom
                if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight) {
                    const bottomValue = Math.ceil(activeSlide.scrollTop + activeSlide.clientHeight);
                    if (bottomValue + 5 < activeSlide.scrollHeight) {
                        return;
                    }
                }
                if (currentSlideIndex < slides.length - 1) {
                    updateSlides(currentSlideIndex + 1);
                }
            } else {
                // Swipe Down -> Scroll Up
                // Let native scroll happen if we haven't reached the top
                if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight) {
                    if (activeSlide.scrollTop > 5) {
                        return;
                    }
                }
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
            // Only hijack the click to slide if we are on the main multi-slide page and NOT on mobile
            if (slides.length > 1 && window.innerWidth > 768) {
                e.preventDefault();
                const slideTarget = parseInt(link.getAttribute('data-slide'));
                if (!isNaN(slideTarget)) {
                    updateSlides(slideTarget);
                }
            }
        });
    });

    // Logo click returns to hero
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if (slides.length > 1 && window.innerWidth > 768) {
                e.preventDefault();
                updateSlides(0);
            }
        });
    }



    // --- 7. Mobile Footer Intersection Observer ---
    const footer = document.querySelector('.persistent-footer');
    const contactSection = document.getElementById('contact');

    if (footer && contactSection) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the screen is mobile sized...
                if (window.innerWidth <= 768) {
                    if (entry.isIntersecting) {
                        footer.classList.add('show-footer');
                    } else {
                        footer.classList.remove('show-footer');
                    }
                } else {
                    // Always remove the toggling class on Desktop so default visibility applies
                    footer.classList.remove('show-footer');
                }
            });
        }, {
            root: null, // observation is relative to the viewport
            threshold: 0.1 // 10% of contact section must be visible to trigger
        });

        footerObserver.observe(contactSection);

        // Fail-safe resize listener incase user rotates phone or resizes window actively
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                footer.classList.remove('show-footer');
            }
        });
    }

    // --- 8. Mobile Horizontal Wheel Drag-to-Scroll ---
    const wheelWrappers = document.querySelectorAll('.skills-wheel-wrapper');
    wheelWrappers.forEach(wrapper => {
        let isDownMobile = false;
        let startXMobile;
        let scrollLeftMobile;

        wrapper.addEventListener('mousedown', (e) => {
            if (window.innerWidth > 768) return; // Only apply on mobile horizontal mode
            isDownMobile = true;
            wrapper.style.cursor = 'grabbing';
            wrapper.style.userSelect = 'none';
            startXMobile = e.pageX - wrapper.offsetLeft;
            scrollLeftMobile = wrapper.scrollLeft;
        });

        wrapper.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) return;
            isDownMobile = false;
            wrapper.style.cursor = 'grab';
            wrapper.style.userSelect = '';
        });

        wrapper.addEventListener('mouseup', () => {
            if (window.innerWidth > 768) return;
            isDownMobile = false;
            wrapper.style.cursor = 'grab';
            wrapper.style.userSelect = '';
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) return;
            if (!isDownMobile) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startXMobile) * 2; // Scroll-fast multiplier
            wrapper.scrollLeft = scrollLeftMobile - walk;
        });
    });

});
