/* ==========================================
   GLOBAL INTERCONNECT — main.js
   ========================================== */

// --- Nav: scroll effect ---
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// --- Nav: mobile toggle ---
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  // Animate hamburger → X
  navToggle.classList.toggle('active', isOpen);
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Contact form ---
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    // Email format check
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // Show loading state
    submitBtn.querySelector('.btn-text').hidden = true;
    submitBtn.querySelector('.btn-loading').hidden = false;
    submitBtn.disabled = true;

    // Build form data
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      // TODO: Replace this URL with your actual form endpoint (e.g. Formspree, Netlify Forms, or custom API)
      // const res = await fetch('YOUR_FORM_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) throw new Error('Network response was not ok');

      // For now, simulate a successful submission (remove this line once real endpoint is wired up)
      await new Promise(resolve => setTimeout(resolve, 900));

      form.reset();
      successMsg.hidden = false;
      submitBtn.hidden = true;

    } catch (err) {
      console.error('Form submission error:', err);
      submitBtn.querySelector('.btn-text').hidden = false;
      submitBtn.querySelector('.btn-loading').hidden = true;
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or email us directly at info@globalinterconnect.com');
    }
  });

  // Remove error class on input
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

// --- Scroll-reveal animation ---
const revealEls = document.querySelectorAll(
  '.cap-card, .cert-card, .resource-card, .advantage-item, .stat-item'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach((el, i) => {
  el.style.setProperty('--reveal-delay', `${(i % 6) * 80}ms`);
  el.classList.add('reveal-ready');
  revealObserver.observe(el);
});

// --- Nav hamburger CSS (injected for simplicity) ---
const style = document.createElement('style');
style.textContent = `
  .reveal-ready {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s ease var(--reveal-delay, 0ms),
                transform 0.55s ease var(--reveal-delay, 0ms);
  }
  .revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .form-group input.error,
  .form-group textarea.error {
    border-color: #e05252;
    box-shadow: 0 0 0 3px rgba(224,82,82,.12);
  }
  .nav-toggle.active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .nav-toggle.active span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
  }
  .nav-toggle.active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
`;
document.head.appendChild(style);
