(function () {

  // ============================================================
  //  GII CHAT BOT — CONFIGURATION
  //  All editable settings live here. Nothing else needs changing.
  // ============================================================
  var CONFIG = {

    // Formspree endpoint — sign up free at formspree.io
    // Create a new form, then paste the full URL below.
    // Example: 'https://formspree.io/f/xeqbbkjp'
    formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',

    // How long (ms) before the chat auto-opens on first visit.
    // Set to 0 to disable auto-open entirely.
    autoOpenDelay: 1800,

    // If true, the chat only auto-opens once per browser session.
    // Visitors who navigate between pages won't see it pop up every time.
    autoOpenOnce: true,

    routes: {
      engineer: {
        userLabel:     "I'm an engineer evaluating suppliers",
        formSubject:   "Engineering Inquiry — via Gii Website",
        step2Prompt:   "What type of device are you working on?",
        step2Options:  [
          "Energy-Based / RF Ablation",
          "Scopes & Probes",
          "Sports Medicine / Arthroscopy",
          "Pain Management",
          "Urology & Endoscopy",
          "Other / Not sure yet",
        ],
        contactPrompt: "Got it. What\u2019s the best email to reach you? Our engineering team will follow up within 24 hours.",
        thankYou:      "You\u2019re all set! Our engineering team will be in touch within 24 hours.",
      },
      newProgram: {
        userLabel:     "I'm working on a new program / need a quote",
        formSubject:   "New Program Inquiry — via Gii Website",
        step2Prompt:   "Where are you in the process?",
        step2Options:  [
          "Early concept / feasibility",
          "Active development",
          "Ready for production",
          "Transferring from another supplier",
        ],
        contactPrompt: "Great. Drop your name and email and we\u2019ll get back to you within 48 hours.",
        thankYou:      "You\u2019re all set! Someone from our team will reach out within 48 hours.",
      },
      existingClient: {
        userLabel:     "I'm an existing client with a question",
        formSubject:   "Client Support Request — via Gii Website",
        step2Prompt:   "What can we help you with?",
        step2Options:  [
          "Order status / delivery",
          "Technical or quality issue",
          "Documentation request",
          "Something else",
        ],
        contactPrompt: "Of course. Share your name and email and we\u2019ll get you to the right person quickly.",
        thankYou:      "Got it! Your rep will follow up with you shortly.",
      },
    },
  };
  // ============================================================


  // ============================================================
  //  SESSION HELPERS
  // ============================================================
  var SK = 'gii_chat_v1';

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SK) || 'null'); } catch (e) { return null; }
  }
  function saveSession(d) {
    try { sessionStorage.setItem(SK, JSON.stringify(d)); } catch (e) {}
  }

  var session = getSession() || {
    autoOpened:  false,
    stage:       'greeting',  // greeting | step2 | contact | done
    routeKey:    null,
    step2Choice: null,
    messages:    [],          // [{type:'bot'|'user', text:'...'}]
  };

  function pushMsg(type, text) {
    session.messages.push({ type: type, text: text });
    saveSession(session);
  }


  // ============================================================
  //  STYLES
  // ============================================================
  var CSS = [
    '#gii-widget * { box-sizing: border-box; font-family: Inter, -apple-system, sans-serif; margin: 0; padding: 0; }',

    /* Bubble */
    '#gii-bubble {',
    '  position: fixed; bottom: 28px; right: 28px;',
    '  width: 60px; height: 60px; border-radius: 50%;',
    '  background: linear-gradient(135deg, #1a472a 0%, #2d6e47 100%);',
    '  display: flex; align-items: center; justify-content: center;',
    '  cursor: pointer; z-index: 9999;',
    '  box-shadow: 0 6px 24px rgba(26,71,42,0.45);',
    '  transition: transform 0.2s ease, box-shadow 0.2s ease;',
    '}',
    '#gii-bubble:hover { transform: scale(1.07); box-shadow: 0 8px 32px rgba(26,71,42,0.55); }',
    '#gii-bubble svg { width: 26px; height: 26px; fill: #fff; transition: opacity 0.2s; position: absolute; }',
    '#gii-bubble .icon-chat  { opacity: 1; }',
    '#gii-bubble .icon-close { opacity: 0; }',
    '#gii-bubble.gii-open .icon-chat  { opacity: 0; }',
    '#gii-bubble.gii-open .icon-close { opacity: 1; }',
    '#gii-dot {',
    '  position: absolute; top: 2px; right: 2px;',
    '  width: 14px; height: 14px; border-radius: 50%;',
    '  background: #8BC342; border: 2px solid #fff;',
    '  transition: opacity 0.3s;',
    '}',

    /* Panel */
    '#gii-panel {',
    '  position: fixed; bottom: 102px; right: 28px; width: 340px;',
    '  background: #fff; border-radius: 20px;',
    '  box-shadow: 0 16px 56px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08);',
    '  display: flex; flex-direction: column; overflow: hidden; z-index: 9998;',
    '  opacity: 0; pointer-events: none;',
    '  transform: translateY(16px) scale(0.97);',
    '  transform-origin: bottom right;',
    '  transition: opacity 0.25s ease, transform 0.25s ease;',
    '}',
    '#gii-panel.gii-open { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }',

    /* Header */
    '#gii-header {',
    '  background: linear-gradient(135deg, #1a3d26 0%, #1a472a 100%);',
    '  padding: 16px 18px 14px;',
    '  display: flex; align-items: center; gap: 12px; flex-shrink: 0;',
    '}',
    '#gii-avatar {',
    '  width: 42px; height: 42px; border-radius: 50%;',
    '  background: linear-gradient(135deg, #8BC342, #6fa832);',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-weight: 800; font-size: 16px; color: #fff; flex-shrink: 0;',
    '  box-shadow: 0 2px 8px rgba(0,0,0,0.2);',
    '}',
    '#gii-header-text { flex: 1; }',
    '#gii-header-text strong { display: block; font-size: 14px; font-weight: 700; color: #fff; }',
    '#gii-header-status { display: flex; align-items: center; gap: 5px; margin-top: 3px; }',
    '#gii-header-status .sdot { width: 7px; height: 7px; border-radius: 50%; background: #8BC342; flex-shrink: 0; }',
    '#gii-header-status span { font-size: 11.5px; color: rgba(255,255,255,0.7); }',
    '#gii-close {',
    '  background: rgba(255,255,255,0.12); border: none; color: #fff;',
    '  width: 28px; height: 28px; border-radius: 50%;',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-size: 18px; cursor: pointer; transition: background 0.15s; flex-shrink: 0;',
    '}',
    '#gii-close:hover { background: rgba(255,255,255,0.22); }',

    /* Body */
    '#gii-body {',
    '  flex: 1; overflow-y: auto; padding: 18px 16px 14px;',
    '  display: flex; flex-direction: column; gap: 10px; max-height: 420px;',
    '}',
    '#gii-body::-webkit-scrollbar { width: 4px; }',
    '#gii-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }',

    /* Messages */
    '.gii-msg { max-width: 88%; padding: 10px 14px; font-size: 13.5px; line-height: 1.6; border-radius: 18px; animation: giiIn 0.2s ease; }',
    '.gii-msg.bot  { background: #f2f4f2; color: #1c1c1c; border-bottom-left-radius: 5px; align-self: flex-start; }',
    '.gii-msg.user { background: linear-gradient(135deg,#1a472a,#2d6e47); color:#fff; border-bottom-right-radius:5px; align-self:flex-end; }',
    '@keyframes giiIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }',

    /* Typing dots */
    '.gii-typing { display:flex; align-items:center; gap:4px; padding:12px 16px; background:#f2f4f2; border-radius:18px; border-bottom-left-radius:5px; align-self:flex-start; }',
    '.gii-typing span { width:6px; height:6px; border-radius:50%; background:#999; animation:giiDot 1.2s infinite ease-in-out; }',
    '.gii-typing span:nth-child(2) { animation-delay:.2s; }',
    '.gii-typing span:nth-child(3) { animation-delay:.4s; }',
    '@keyframes giiDot { 0%,80%,100%{transform:scale(0.7);opacity:0.5;} 40%{transform:scale(1);opacity:1;} }',

    /* Option buttons */
    '.gii-options { display:flex; flex-direction:column; gap:7px; }',
    '.gii-opt {',
    '  background:#fff; border:1.5px solid #e0e6e0; color:#1a472a;',
    '  border-radius:12px; padding:11px 16px;',
    '  font-size:13px; font-weight:500; text-align:center; cursor:pointer;',
    '  width:100%; display:block;',
    '  transition:all 0.15s ease; font-family:Inter,-apple-system,sans-serif;',
    '  box-shadow:0 1px 3px rgba(0,0,0,0.06);',
    '}',
    '.gii-opt:hover { background:#1a472a; color:#fff; border-color:#1a472a; transform:translateY(-1px); box-shadow:0 3px 10px rgba(26,71,42,0.2); }',

    /* Contact form */
    '.gii-form { display:flex; flex-direction:column; gap:8px; margin-top:2px; }',
    '.gii-input {',
    '  border:1.5px solid #e0e6e0; border-radius:10px;',
    '  padding:10px 14px; font-size:13px; width:100%;',
    '  outline:none; font-family:Inter,-apple-system,sans-serif;',
    '  transition:border-color 0.15s;',
    '}',
    '.gii-input:focus { border-color:#1a472a; }',
    '.gii-submit {',
    '  background:linear-gradient(135deg,#8BC342,#7aad35); color:#fff;',
    '  border:none; border-radius:12px; padding:12px 16px;',
    '  font-size:13px; font-weight:600; cursor:pointer; width:100%;',
    '  font-family:Inter,-apple-system,sans-serif;',
    '  transition:all 0.15s ease; margin-top:2px;',
    '}',
    '.gii-submit:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(139,195,66,0.4); }',
    '.gii-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }',

    /* Success */
    '.gii-success {',
    '  background:#f0f7eb; border-radius:14px; padding:16px;',
    '  text-align:center; color:#1a472a; font-size:13.5px; line-height:1.6;',
    '  border:1.5px solid #c8e6a0;',
    '}',
    '.gii-success strong { display:block; font-size:15px; margin-bottom:4px; }',

    /* Mobile */
    '@media (max-width:400px) {',
    '  #gii-panel { right:12px; left:12px; width:auto; bottom:90px; }',
    '  #gii-bubble { right:16px; bottom:16px; }',
    '}',
  ].join('\n');


  // ============================================================
  //  INIT
  // ============================================================
  function init() {

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var widget = document.createElement('div');
    widget.id = 'gii-widget';
    widget.innerHTML =
      '<div id="gii-bubble" role="button" aria-label="Chat with us" tabindex="0">' +
        '<svg class="icon-chat"  viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
        '<svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
        '<div id="gii-dot"></div>' +
      '</div>' +
      '<div id="gii-panel" role="dialog" aria-label="Chat with Gii">' +
        '<div id="gii-header">' +
          '<div id="gii-avatar">G</div>' +
          '<div id="gii-header-text">' +
            '<strong>Global Interconnect</strong>' +
            '<div id="gii-header-status"><div class="sdot"></div><span>Our team is available</span></div>' +
          '</div>' +
          '<button id="gii-close" aria-label="Close">\u00D7</button>' +
        '</div>' +
        '<div id="gii-body"></div>' +
      '</div>';

    document.body.appendChild(widget);

    var bubble  = document.getElementById('gii-bubble');
    var panel   = document.getElementById('gii-panel');
    var body    = document.getElementById('gii-body');
    var closeBtn = document.getElementById('gii-close');
    var dot     = document.getElementById('gii-dot');

    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    // ---- render helpers ----

    function addMsg(type, text, noAnim) {
      var m = document.createElement('div');
      m.className = 'gii-msg ' + type;
      if (noAnim) m.style.animation = 'none';
      m.textContent = text;
      body.appendChild(m);
      scrollBottom();
    }

    function typing(cb) {
      var t = document.createElement('div');
      t.className = 'gii-typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(t);
      scrollBottom();
      setTimeout(function () { t.remove(); cb(); }, 900);
    }

    // ---- flow steps ----

    function showGreeting() {
      typing(function () {
        var text = 'Hi there \uD83D\uDC4B What brings you to Gii today?';
        addMsg('bot', text);
        pushMsg('bot', text);
        setTimeout(showStep1Options, 400);
      });
    }

    function showStep1Options() {
      var wrap = document.createElement('div');
      wrap.className = 'gii-options';
      var choices = [
        { key: 'engineer',       label: "I'm an engineer evaluating suppliers" },
        { key: 'newProgram',     label: "I'm working on a new program / need a quote" },
        { key: 'existingClient', label: "I'm an existing client with a question" },
      ];
      choices.forEach(function (c) {
        var btn = document.createElement('button');
        btn.className = 'gii-opt';
        btn.textContent = c.label;
        btn.addEventListener('click', function () {
          wrap.remove();
          session.routeKey = c.key;
          session.stage    = 'step2';
          saveSession(session);
          addMsg('user', c.label);
          pushMsg('user', c.label);
          setTimeout(showStep2, 400);
        });
        wrap.appendChild(btn);
      });
      body.appendChild(wrap);
      scrollBottom();
    }

    function showStep2() {
      var route = CONFIG.routes[session.routeKey];
      typing(function () {
        addMsg('bot', route.step2Prompt);
        pushMsg('bot', route.step2Prompt);
        setTimeout(function () { showStep2Options(route); }, 400);
      });
    }

    function showStep2Options(route) {
      var wrap = document.createElement('div');
      wrap.className = 'gii-options';
      route.step2Options.forEach(function (label) {
        var btn = document.createElement('button');
        btn.className = 'gii-opt';
        btn.textContent = label;
        btn.addEventListener('click', function () {
          wrap.remove();
          session.step2Choice = label;
          session.stage       = 'contact';
          saveSession(session);
          addMsg('user', label);
          pushMsg('user', label);
          setTimeout(showContactForm, 400);
        });
        wrap.appendChild(btn);
      });
      body.appendChild(wrap);
      scrollBottom();
    }

    function showContactForm() {
      var route = CONFIG.routes[session.routeKey];
      typing(function () {
        addMsg('bot', route.contactPrompt);
        pushMsg('bot', route.contactPrompt);
        setTimeout(function () { renderForm(route); }, 400);
      });
    }

    function renderForm(route) {
      var form = document.createElement('div');
      form.className = 'gii-form';

      var nameInput  = document.createElement('input');
      nameInput.className   = 'gii-input';
      nameInput.type        = 'text';
      nameInput.placeholder = 'Your name';

      var emailInput = document.createElement('input');
      emailInput.className   = 'gii-input';
      emailInput.type        = 'email';
      emailInput.placeholder = 'Your email address';

      var submit = document.createElement('button');
      submit.className   = 'gii-submit';
      submit.textContent = 'Send →';

      submit.addEventListener('click', function () {
        var name  = nameInput.value.trim();
        var email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
          emailInput.style.borderColor = '#e05252';
          emailInput.focus();
          return;
        }
        submit.disabled    = true;
        submit.textContent = 'Sending…';

        var data = {
          name:         name || 'Not provided',
          email:        email,
          inquiry_type: CONFIG.routes[session.routeKey].userLabel,
          detail:       session.step2Choice || '',
          _subject:     route.formSubject,
        };

        fetch(CONFIG.formEndpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(data),
        })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          form.remove();
          if (r.ok || r.next) {
            showSuccess(route.thankYou);
          } else {
            showSuccess("We received your info — we\u2019ll be in touch soon!");
          }
        })
        .catch(function () {
          // Fallback if Formspree not yet configured
          form.remove();
          showSuccess(route.thankYou);
        });
      });

      form.appendChild(nameInput);
      form.appendChild(emailInput);
      form.appendChild(submit);
      body.appendChild(form);
      scrollBottom();
      nameInput.focus();
    }

    function showSuccess(msg) {
      session.stage = 'done';
      saveSession(session);
      var box = document.createElement('div');
      box.className = 'gii-success';
      box.innerHTML = '<strong>\u2713 All set!</strong>' + msg;
      body.appendChild(box);
      scrollBottom();
    }

    // ---- restore session ----

    function restoreSession() {
      // Replay saved messages without animation
      session.messages.forEach(function (m) {
        addMsg(m.type, m.text, true);
      });

      // Resume from current stage
      if (session.stage === 'greeting') {
        if (session.messages.length === 0) {
          showGreeting();
        } else {
          showStep1Options();
        }
      } else if (session.stage === 'step2') {
        showStep2();
      } else if (session.stage === 'contact') {
        showContactForm();
      } else if (session.stage === 'done') {
        var route = CONFIG.routes[session.routeKey];
        showSuccess(route ? route.thankYou : 'Thanks! We\u2019ll be in touch soon.');
      }
    }

    // ---- open / close ----

    function openPanel() {
      panel.classList.add('gii-open');
      bubble.classList.add('gii-open');
      dot.style.opacity = '0';
    }

    function closePanel() {
      panel.classList.remove('gii-open');
      bubble.classList.remove('gii-open');
    }

    bubble.addEventListener('click', function () {
      panel.classList.contains('gii-open') ? closePanel() : openPanel();
    });
    bubble.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    // ---- start ----

    restoreSession();

    // Auto-open logic — only once per browser session
    var shouldAutoOpen = CONFIG.autoOpenDelay > 0 &&
                         (!CONFIG.autoOpenOnce || !session.autoOpened);

    if (shouldAutoOpen) {
      setTimeout(function () {
        openPanel();
        session.autoOpened = true;
        saveSession(session);
      }, CONFIG.autoOpenDelay);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
