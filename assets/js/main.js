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
// Set FORM_ENDPOINT to the lead destination (e.g. a Formspree or CRM form URL) to submit
// directly. While it is empty, the forms open a pre-filled email to FORM_FALLBACK_EMAIL.
const FORM_ENDPOINT = '';
const FORM_FALLBACK_EMAIL = 'info@globalinterconnect.com';
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');

function showFormMessage(msgHtml) {
  const icon = successMsg.querySelector('svg');
  successMsg.innerHTML = '';
  if (icon) successMsg.appendChild(icon);
  const span = document.createElement('span');
  span.innerHTML = msgHtml;
  successMsg.appendChild(span);
  successMsg.hidden = false;
  submitBtn.hidden = true;
}

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

    try {
      if (FORM_ENDPOINT) {
        // Real submission (FormData so file attachments on the quote form are included)
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error('Network response was not ok');
        form.reset();
        showFormMessage(successMsg.dataset.sent || "Thank you! We'll be in touch shortly.");
      } else {
        // No endpoint configured yet: hand the request to the visitor's email app
        // so no inquiry is silently lost.
        const lines = [];
        data.forEach((value, key) => {
          if (value instanceof File) return;
          const v = String(value).trim();
          if (!v) return;
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          lines.push(label + ': ' + v);
        });
        const hasFiles = [...data.values()].some(v => v instanceof File && v.size > 0);
        if (hasFiles) lines.push('', '(Please attach your drawings/specs to this email.)');
        const subject = (form.classList.contains('quote-form') ? 'Quote request' : 'Website inquiry') +
          ' — ' + (data.get('company') || ((data.get('first_name') || '') + ' ' + (data.get('last_name') || '')).trim());
        window.location.href = 'mailto:' + FORM_FALLBACK_EMAIL +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(lines.join('\n'));
        showFormMessage('Your email app should open with your request filled in — just press send. ' +
          'If it didn\'t open, email us at <a href="mailto:' + FORM_FALLBACK_EMAIL + '">' + FORM_FALLBACK_EMAIL + '</a>.');
      }
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
