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
    // 2. GSAP Spatial Camera Setup
    // --------------------------------------------------------
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // NON-OVERLAPPING GRID COORDINATES (150vw/vh for extra spacing to prevent rotation overlaps on mobile)
    const waypoints = [
        { id: 'home', x: 0, y: 0 },
        { id: 'about', x: -150, y: 0 },
        { id: 'resume', x: -150, y: -150 },
        { id: 'skills', x: 0, y: -150 },
        { id: 'portfolio', x: 150, y: -150 }, 
        { id: 'testimonials', x: 150, y: 0 }, 
        { id: 'contact', x: 150, y: 150 } 
    ];

    const canvas = document.querySelector('.canvas');
    const scrollContainer = document.querySelector('.scroll-container');
    const artboardContents = document.querySelectorAll('.artboard-content');
    const navLinks = document.querySelectorAll('.nav-links a');
    
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
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            const navLinksContainer = document.querySelector('.nav-links');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navLinksContainer.classList.remove('nav-open');
            }

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

    // Cursor color inversion on dark background (Contact section)
    const contactSection = document.getElementById('contact');
    setInterval(() => {
        const rect = contactSection.getBoundingClientRect();
        const center_y = window.innerHeight / 2;
        const center_x = window.innerWidth / 2;
        
        if (rect.top < center_y && rect.bottom > center_y && rect.left < center_x && rect.right > center_x) {
            cursor.classList.add('light-mode');
            follower.classList.add('light-mode');
        } else {
            cursor.classList.remove('light-mode');
            follower.classList.remove('light-mode');
        }
    }, 100);

    // --------------------------------------------------------
    // Mobile Hamburger Menu
    // --------------------------------------------------------
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinksContainer.classList.toggle('nav-open');
        });
    }
});
