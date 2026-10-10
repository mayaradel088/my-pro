/* Portfolio behaviour — vanilla JS. Edit FORM_ENDPOINT / CONTACT_EMAIL below. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FORM_ENDPOINT = '';                 // e.g. a Formspree URL. Empty = mailto fallback.
  const CONTACT_EMAIL = 'your@email.com';   // used by the mailto fallback

  // Theme (saved in localStorage; initial value is set in <head>)
  $('#themeToggle')?.addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  });

  // Mobile menu
  const menu = $('#menu'), burger = $('#burger');
  const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
  burger?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu?.addEventListener('click', e => e.target.closest('a') && setMenu(false));

  // Missing images -> show the placeholder underneath
  $$('img[data-fallback]').forEach(img => {
    const hide = () => { img.hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && !img.naturalWidth) hide();
  });

  // Scroll reveal + active nav link
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .15 });
  $$('.reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 3) * .1 + 's'); io.observe(el); });
  const links = $$('#menu a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => spy.observe(s));

  // Experience cards
  $$('.more').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true')));

  // Projects: filter + modal
  const projs = $$('.proj');
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $$('.chip').forEach(x => x.classList.toggle('active', x === c));
    const f = c.dataset.filter;
    projs.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      if (show) { p.hidden = false; requestAnimationFrame(() => p.classList.remove('hide')); }
      else { p.classList.add('hide'); setTimeout(() => p.classList.contains('hide') && (p.hidden = true), reduced ? 0 : 350); }
    });
  }));
  const modal = $('#modal'); let opener = null;
  projs.forEach(p => p.addEventListener('click', () => {
    opener = p; const img = $('img', p);
    $('#mImg').src = img.src; $('#mImg').alt = img.alt; $('#mImg').hidden = img.hidden;
    $('#mCat').textContent = p.dataset.cat; $('#mTitle').textContent = $('strong', p).textContent; $('#mDesc').textContent = p.dataset.desc;
    modal.showModal(); document.body.style.overflow = 'hidden';
  }));
  const closeModal = () => modal.open && modal.close();
  $('.close', modal)?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => e.target === modal && closeModal());
  modal?.addEventListener('close', () => { document.body.style.overflow = ''; opener?.focus(); });

  // Testimonials slider
  const track = $('.track'), slides = $$('.slide'), dots = $('.dots'); let i = 0, timer;
  if (track && slides.length) {
    const go = (n, user) => {
      i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`;
      $$('button', dots).forEach((d, k) => d.setAttribute('aria-current', k === i));
      if (user) clearInterval(timer);
    };
    slides.forEach((_, n) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Go to testimonial ' + (n + 1)); b.addEventListener('click', () => go(n, true)); dots.append(b); });
    $('#prev').addEventListener('click', () => go(i - 1, true)); $('#next').addEventListener('click', () => go(i + 1, true));
    let x0 = 0; track.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1), true); }, { passive: true });
    go(0);
    if (!reduced) timer = setInterval(() => go(i + 1), 8000);
  }

  // Contact form: validation + honest submission
  const form = $('#form'), status = $('#status');
  const rules = { name: v => v.trim() ? '' : 'Please enter your name.', email: v => !v.trim() ? 'Please enter your email.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.', subject: v => v.trim() ? '' : 'Please enter a subject.', message: v => v.trim().length >= 10 ? '' : 'Please write at least 10 characters.' };
  const check = el => { const m = rules[el.name](el.value); $('#e-' + el.id).textContent = m; el.setAttribute('aria-invalid', !!m); return !m; };
  form?.addEventListener('input', e => e.target.getAttribute('aria-invalid') && check(e.target));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fields = $$('input,textarea', form), bad = fields.filter(f => !check(f));
    if (bad.length) { bad[0].focus(); status.textContent = 'Please fix the highlighted fields.'; return; }
    const btn = $('button[type=submit]', form); if (btn.disabled) return;
    const data = Object.fromEntries(new FormData(form));
    btn.disabled = true; status.textContent = 'Sending…';
    try {
      if (FORM_ENDPOINT) {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error(r.status);
        status.textContent = 'Thank you — your message was sent.'; form.reset();
      } else {  // no backend configured: open the visitor's email app (this site sends nothing)
        location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.message + '\n\n— ' + data.name + ' (' + data.email + ')')}`;
        status.textContent = 'Demo mode: opening your email app. No message has been sent by this website.';
      }
    } catch (err) { status.textContent = 'Sorry, something went wrong. Please try again or email me directly.'; }
    btn.disabled = false;
  });

  $('#year').textContent = new Date().getFullYear();
})();
