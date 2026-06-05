const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const revealItems = document.querySelectorAll('.reveal');

function closeMenu() {
    if (!hamburger || !navLinks) {
        return;
    }

    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMenu();
    });
});

function updateNavbar() {
    if (!navbar) {
        return;
    }

    navbar.classList.toggle('scrolled', window.scrollY > 40);
}

function setTheme(mode) {
    const isLight = mode === 'light';

    document.body.classList.toggle('light-mode', isLight);

    if (themeIcon) {
        themeIcon.classList.toggle('fa-sun', isLight);
        themeIcon.classList.toggle('fa-moon', !isLight);
    }

    localStorage.setItem('theme', mode);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}

function initializeReveal() {
    if (!('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('in-view'));
        return;
    }

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -60px'
    });

    revealItems.forEach(item => revealObserver.observe(item));
}

function initializeActiveLinks() {
    const sections = Array.from(sectionLinks)
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) {
        return;
    }

    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            sectionLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, {
        threshold: 0.5
    });

    sections.forEach(section => navObserver.observe(section));
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        setTheme(currentMode === 'light' ? 'dark' : 'light');
    });
}

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });
}

initializeTheme();
initializeReveal();
initializeActiveLinks();
