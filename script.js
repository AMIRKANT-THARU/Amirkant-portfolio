/* =========================================================
   AMIRKANT CHAUDHARY — PORTFOLIO SCRIPT
   Sections:
   1. Utilities
   2. Theme toggle
   3. Navbar scroll state + mobile menu
   4. Scroll progress bar
   5. Active nav link on scroll
   6. Smooth scroll (native + fallback)
   7. Reveal on scroll (Intersection Observer)
   8. Animated counters
   9. Typewriter role text
   10. Terminal card tilt + magnetic buttons
   11. Project card mouse spotlight
   12. Project details modal
   13. Interactive terminal
   14. Contact form validation + toast
   15. Back to top + footer year
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Open fresh visits at Home while preserving links to specific sections.
  if (!window.location.hash) {
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const welcomeIntro = document.querySelector('.welcome-intro');
  welcomeIntro?.addEventListener('animationend', (event) => {
    if (event.animationName === 'intro-depart') welcomeIntro.remove();
  });

  /* ---------- 1. Utilities ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 2. Theme toggle ---------- */
  const THEME_KEY = 'portfolio-theme';
  const themeToggle = $('#themeToggle');

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch { /* Storage may be disabled. */ }
    applyTheme(saved === 'light' ? 'light' : 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Keep the theme for this visit. */ }
  });

  initTheme();

  /* ---------- 3. Navbar scroll state + mobile menu ---------- */
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');

  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    document.body.classList.toggle('menu-open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileMenu();
      hamburger.focus();
    }
  });
  window.matchMedia('(max-width: 1100px)').addEventListener('change', closeMobileMenu);

  /* ---------- 4. Scroll progress bar ---------- */
  const scrollProgress = $('#scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ---------- 5. Active nav link on scroll ---------- */
  const sections = $$('main section[id]');
  const navLinkMap = new Map($$('.nav-link').map((a) => [a.getAttribute('href').slice(1), a]));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          $$('.nav-link').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ---------- 6. Smooth scroll for in-page links ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      history.pushState(null, '', id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 7. Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            setTimeout(() => el.classList.add('is-visible'), delay);
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => {
      el.classList.add('reveal-pending');
      revealObserver.observe(el);
    });
  }

  /* ---------- 8. Animated counters ---------- */
  const counters = $$('.stat-number');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
        } else {
          const duration = 1200;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- 9. Typewriter role text ---------- */
  const roles = [
    'Computer Engineering Student',
    'Aspiring DevOps Engineer',
    'Full-Stack Developer',
    'Networking Enthusiast',
    'Automation Learner'
  ];
  const roleTextEl = $('#roleText');

  function typewriter() {
    if (prefersReducedMotion) {
      roleTextEl.textContent = roles[0];
      return;
    }
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function step() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleTextEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(step, 1500);
          return;
        }
      } else {
        charIndex--;
        roleTextEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(step, deleting ? 35 : 65);
    }
    step();
  }
  typewriter();

  /* ---------- 10. Terminal tilt + magnetic buttons ---------- */
  const tiltCard = $('#tiltCard');
  if (tiltCard && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    tiltCard.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  }

  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------- 11. Project card spotlight ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.project-card[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* ---------- 12. Project details modal ---------- */
  const projectDetails = {
    ids: {
      title: 'Hybrid Intrusion Detection Method',
      body: 'A hybrid intrusion detection system combining rule-based detection concepts with machine-learning-based analysis, built as a final-year academic project. It covers detection scenarios including brute-force attacks, SQL injection, rapid requests, duplicate voting, suspicious IP activity, and admin-based rules.'
    },
    school: {
      title: 'School Management System',
      body: 'A responsive school management website built with React.js, featuring reusable frontend components. It includes interfaces for the homepage, facilities, gallery, contact, and authentication-related functionality, with a focus on responsive design, usability, and organized frontend architecture.'
    },
    springboot: {
      title: 'Spring Boot Project',
      body: 'A Java 17 web application using Spring Boot and Maven. The repository includes Spring Web dependencies, a Dockerfile for container packaging, and a Jenkinsfile for the build pipeline. It brings backend development and DevOps configuration together in one project.'
    },
    devopsfullstack: {
      title: 'DevOps Full Stack Project',
      body: 'A full-stack application with a React frontend built using Vite and a separate backend codebase. The repository includes Docker Compose configuration to organize the application services, bringing frontend development, backend code, and container configuration together.'
    },
    rtms: {
      title: 'RTMS — Real Time Management System',
      body: 'A web-based management system with real-time data processing and monitoring functionality, built with HTML, CSS, and JavaScript on the frontend and Django handling backend architecture and application logic. It includes dashboards and management features to support efficient information handling and decision-making.'
    }
  };

  const modalBackdrop = $('#modalBackdrop');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const modalClose = $('#modalClose');
  let lastFocusedEl = null;

  function openModal(key) {
    const data = projectDetails[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalBody.textContent = data.body;
    lastFocusedEl = document.activeElement;
    modalBackdrop.hidden = false;
    modalClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  $$('[data-details]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-details')));
  });
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
    if (e.key === 'Tab' && !modalBackdrop.hidden) {
      e.preventDefault();
      modalClose.focus();
    }
  });

  /* ---------- 13. Interactive terminal ---------- */
  const terminalOutput = $('#terminalOutput');
  const terminalInput = $('#terminalInput');

  const terminalResponses = {
    help: 'Available commands: about, skills, projects, experience, devops, contact, github, clear',
    about: 'Amirkant Chaudhary — Computer Engineering student at Nepal Engineering College, focused on DevOps, full-stack development, and networking.',
    skills: 'Core areas: JavaScript, Python, React.js, Django, Node.js, Express.js, MySQL, PostgreSQL, MongoDB, Docker, Git, Jenkins fundamentals, CI/CD fundamentals, AWS basics, Linux, and networking fundamentals (TCP/IP, subnetting, routing, switching).',
    projects: 'Projects: Hybrid Intrusion Detection Method, RTMS - Real Time Management System, School Management System, Spring Boot Project, DevOps Full Stack Project, Personal Portfolio Website. Scroll to the Projects section for details.',
    experience: 'Networking internship completed at NREN (27 Apr – 14 Aug 2026) and DevOps Training completed at Texis Institute.',
    devops: 'Pipeline: Code → Git → GitHub → Build → Test → Docker → CI/CD → Deploy → Monitor.',
    contact: 'Email: amirkantchy383@gmail.com | Phone: +977-9744338664 | LinkedIn: linkedin.com/in/amirkant-chaudhary-792a4133a',
    github: 'Opening GitHub profile: github.com/AMIRKANT-THARU'
  };

  function printLine(text, isOutput) {
    const p = document.createElement('p');
    p.className = isOutput ? 'line out' : 'line';
    p.textContent = text;
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function runCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    printLine('visitor@portfolio:~$ ' + rawCmd, false);

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }
    if (cmd === 'github') {
      printLine(terminalResponses.github, true);
      window.open('https://github.com/AMIRKANT-THARU', '_blank', 'noopener');
      return;
    }
    if (Object.hasOwn(terminalResponses, cmd)) {
      printLine(terminalResponses[cmd], true);
    } else {
      printLine(`Command not found: "${cmd}". Type "help" to see available commands.`, true);
    }
  }

  $('#terminalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(terminalInput.value);
    terminalInput.value = '';
    terminalInput.focus();
  });

  $('#interactiveTerminalWrap').addEventListener('click', (e) => {
    if (e.target.closest('input, button') || window.getSelection().toString()) return;
    terminalInput.focus();
  });

  /* ---------- 14. Contact form validation + toast ---------- */
  const contactForm = $('#contactForm');
  const toast = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function setFieldError(fieldId, errorId, message) {
    const field = $('#' + fieldId);
    const errorEl = $('#' + errorId);
    const row = field.closest('.form-row');
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) {
      row.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  contactForm.noValidate = true;
  const contactStatus = $('#contactStatus');
  const sendButton = contactForm.querySelector('[type="submit"]');
  let sendingMessage = false;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sendingMessage || contactForm.elements._honey.value) return;
    contactStatus.textContent = '';

    const name = $('#cf-name').value.trim();
    const email = $('#cf-email').value.trim();
    const subject = $('#cf-subject').value.trim();
    const message = $('#cf-message').value.trim();

    let valid = true;

    if (!name) { setFieldError('cf-name', 'err-name', 'Please enter your name.'); valid = false; }
    else setFieldError('cf-name', 'err-name', '');

    if (!email) { setFieldError('cf-email', 'err-email', 'Please enter your email.'); valid = false; }
    else if (!isValidEmail(email)) { setFieldError('cf-email', 'err-email', 'Please enter a valid email.'); valid = false; }
    else setFieldError('cf-email', 'err-email', '');

    if (!subject) { setFieldError('cf-subject', 'err-subject', 'Please add a subject.'); valid = false; }
    else setFieldError('cf-subject', 'err-subject', '');

    if (!message) { setFieldError('cf-message', 'err-message', 'Please write a short message.'); valid = false; }
    else setFieldError('cf-message', 'err-message', '');

    if (!valid) {
      contactForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    sendingMessage = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending…';
    contactForm.setAttribute('aria-busy', 'true');
    contactStatus.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(contactForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject, message, _subject: subject, _honey: '' }),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Submission was not accepted');
      }
      contactStatus.textContent = 'Thank you! Your message has been submitted.';
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = error.name === 'AbortError'
        ? 'The request timed out, so delivery could not be confirmed. Your message is still here. Try again later or email amirkantchy383@gmail.com.'
        : 'Your message could not be submitted. Please try again or email amirkantchy383@gmail.com.';
    } finally {
      clearTimeout(timeout);
      sendingMessage = false;
      sendButton.disabled = false;
      sendButton.textContent = 'Send message';
      contactForm.removeAttribute('aria-busy');
    }
  });

  /* ---------- 15. Back to top + footer year ---------- */
  const backToTop = $('#backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  $('#footerYear').textContent = new Date().getFullYear();

})();
