document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------
    // 1. Custom Cursor Logic
    // --------------------------------------------------------
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });
    
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    const interactiveElements = document.querySelectorAll('a, .btn, .tool-icon, .skill-block, .switch, .profile-photo-container, .qa-toggle-container');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('expand');
            follower.classList.add('expand');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('expand');
            follower.classList.remove('expand');
        });
    });

    const portfolioCards = document.querySelectorAll('.project-card');
    portfolioCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursor.classList.add('expand');
            follower.classList.add('expand');
        });
        card.addEventListener('mouseleave', () => {
            cursor.classList.remove('expand');
            follower.classList.remove('expand');
        });
    });

    // --------------------------------------------------------
    // 2. GSAP Spatial Camera Setup (Desktop Only)
    // --------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // NON-OVERLAPPING GRID COORDINATES
    const waypoints = [
        { id: 'home', x: 0, y: 0 },
        { id: 'about', x: -100, y: 0 },
        { id: 'resume', x: -100, y: -100 },
        { id: 'skills', x: 0, y: -100 },
        { id: 'portfolio', x: 100, y: -100 }, 
        { id: 'testimonials', x: 100, y: 0 }, 
        { id: 'contact', x: 100, y: 100 } 
    ];

    const canvas = document.querySelector('.canvas');
    const scrollContainer = document.querySelector('.scroll-container');
    const artboardContents = document.querySelectorAll('.artboard-content');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let mm = gsap.matchMedia();

    // Straighten card when it's active
    function updateActiveCard(index) {
        artboardContents.forEach((card, i) => {
            if (i === index) {
                card.classList.add('is-active');
                if (i === 4) {
                    gsap.to('.project-card', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", overwrite: "auto" });
                }
            } else {
                card.classList.remove('is-active');
                if (i === 4) {
                    gsap.to('.project-card', { opacity: 0, y: 20, duration: 0.3, overwrite: "auto" });
                }
            }
        });
    }

    mm.add("(min-width: 1024px)", () => {
        // Initialize first card
        updateActiveCard(0);

        // Create Master Timeline for the Camera
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollContainer,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => updateActiveNav(self.progress)
            }
        });

        for (let i = 1; i < waypoints.length; i++) {
            const current = waypoints[i];
            tl.to(canvas, {
                x: `${current.x}vw`,
                y: `${current.y}vh`,
                duration: 1, 
                ease: "power2.inOut" 
            });
            if (i < waypoints.length - 1) tl.to({}, {duration: 0.3}); 
        }

        function updateActiveNav(progress) {
            const sectionsCount = waypoints.length;
            const totalUnits = (sectionsCount - 1) * 1 + (sectionsCount - 2) * 0.3;
            let currentUnit = progress * totalUnits;
            let currentIndex = 0;
            let accumulated = 0;
            for (let i = 0; i < sectionsCount - 1; i++) {
                if (currentUnit >= accumulated && currentUnit < accumulated + 1 + 0.15) {
                    currentIndex = i; 
                }
                accumulated += 1.3;
            }
            if (currentUnit >= accumulated - 0.6) currentIndex = sectionsCount - 1;
            
            navLinks.forEach((link, idx) => {
                link.classList.toggle('active', idx === currentIndex);
            });
            updateActiveCard(currentIndex);
        }

        // Smooth scroll to section when clicking nav link
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.getAttribute('data-index'));
                const totalScrollHeight = scrollContainer.scrollHeight - window.innerHeight;
                const sectionsCount = waypoints.length;
                const totalUnits = (sectionsCount - 1) * 1 + (sectionsCount - 2) * 0.3;
                let targetUnit = index > 0 ? index * 1.3 - 0.3 : 0;
                if (index === sectionsCount - 1) targetUnit = totalUnits;
                
                const targetScroll = (targetUnit / totalUnits) * totalScrollHeight;
                gsap.to(window, { scrollTo: targetScroll, duration: 1.5, ease: "power3.inOut" });
            });
        });

        return () => {
            // Cleanup on mobile breakpoint
            gsap.set(canvas, { clearProps: "all" });
            artboardContents.forEach(c => c.classList.remove('is-active'));
        };
    });

    // Mobile specific JS setup
    mm.add("(max-width: 1023px)", () => {
        // Simple scroll spy for mobile
        artboardContents.forEach(c => c.classList.add('is-active')); // Make them straight on mobile
        gsap.to('.project-card', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }); // Show projects

        const sections = document.querySelectorAll('.artboard');
        window.addEventListener('scroll', () => {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                gsap.to(window, { scrollTo: targetEl.offsetTop - 80, duration: 1, ease: "power2.out" });
            });
        });
    });
});
