// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });

            // close mobile menu when link clicked

            const navLinks = document.querySelector('.nav-links');
            const hamburger = document.querySelector('.hamburger');
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                hamburger.classList.remove('active');
            }   
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    }
});

// Hamburger toggle

const hamburger = document.querySelector('.hamburger');
const navlinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navlinks.classList.toggle('active');
});