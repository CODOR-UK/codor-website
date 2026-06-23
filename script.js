document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  const yearEl = document.getElementById('year');
  const backToTopButton = document.getElementById('backToTop');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    header.classList.toggle('scrolled', scrolled);

    if (backToTopButton) {
      if (window.scrollY > 400) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && nav) {
    const links = nav.querySelectorAll('a');

    const closeNav = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.forEach((a) => {
      a.addEventListener('click', () => {
        // Close on selection for small screens
        closeNav();
      });
    });

    // Close if clicking outside when open
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const target = e.target;
      if (!nav.contains(target) && target !== navToggle) {
        closeNav();
      }
    });
  }

  // Scrollspy for nav links
  if (nav) {
    const sectionIds = ['about', 'solutions', 'approach', 'contact'];
    const idToLink = new Map();
    const links = nav.querySelectorAll('a');
    links.forEach((link) => {
      const hash = (link.getAttribute('href') || '').replace('#', '');
      if (hash) idToLink.set(hash, link);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = idToLink.get(id);
        if (!link) return;
        if (entry.isIntersecting) {
          nav.querySelectorAll('a').forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-50% 0px -40% 0px', threshold: [0, 1] });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll-reveal animations
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  reveals.forEach((el) => el.classList.add('reveal-init'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  reveals.forEach((el) => revealObserver.observe(el));

  // Energy canvas animation
  const canvas = document.getElementById('energyCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      r: 1 + Math.random() * 2,
    }));

    function step() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // glow background
      const gradient = ctx.createRadialGradient(w*0.2, h*0.2, 0, w*0.2, h*0.2, Math.max(w,h)*0.8);
      gradient.addColorStop(0, 'rgba(63,255,170,0.08)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = (p.x - q.x) * w;
          const dy = (p.y - q.y) * h;
          const dist2 = dx*dx + dy*dy;
          const maxDist = 140 * dpr;
          if (dist2 < maxDist * maxDist) {
            const alpha = 1 - Math.sqrt(dist2) / maxDist;
            ctx.strokeStyle = `rgba(63,255,170,${alpha*0.6})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(p.x * w, p.y * h);
            ctx.lineTo(q.x * w, q.y * h);
            ctx.stroke();
          }
        }
      }

      // draw nodes and update
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.fillStyle = 'rgba(63,255,170,0.9)';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  
  // Scroll-driven control word swap
  const controlWord = document.getElementById('controlWord');
  const panels = Array.from(document.querySelectorAll('.control-panel'));
  const controlGradient = document.querySelector('.control-gradient');
  if (controlWord && panels.length) {
    const swapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const word = entry.target.getAttribute('data-word') || 'Inventory';
        // animate swap
        controlWord.style.opacity = '0';
        controlWord.style.transform = 'translateY(8px) scale(0.98)';
        setTimeout(() => {
          controlWord.textContent = word;
          controlWord.style.opacity = '1';
          controlWord.style.transform = 'translateY(0) scale(1)';
        }, 140);
      });
    }, { root: null, rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
    panels.forEach((p) => swapObserver.observe(p));

    // parallax/opacity effect for gradient based on scroll position
    const onScrollControl = () => {
      const first = panels[0].getBoundingClientRect();
      const last = panels[panels.length - 1].getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const start = Math.min(viewportH, Math.max(0, viewportH - first.top));
      const end = Math.min(viewportH, Math.max(0, viewportH - last.top));
      const progress = Math.min(1, Math.max(0, (start - end) / viewportH));
      if (controlGradient) controlGradient.style.opacity = String(0.6 + progress * 0.4);
    };
    window.addEventListener('scroll', onScrollControl, { passive: true });
    onScrollControl();
  }

  // Bridge animation: Introducing (left) + CODOR (right) — smooth scroll-driven
  const introSection = document.getElementById('intro-bridge');
  const introLeft = document.querySelector('.intro-left');
  const introRight = document.querySelector('.intro-right');
  if (introSection && introLeft && introRight) {
    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const computeProgress = () => {
      const rect = introSection.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const raw = (vh - rect.top) / (vh + rect.height); // 0..1 through viewport
      return clamp01(raw);
    };

    const apply = (p) => {
      const eased = easeOutCubic(p);
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const maxTravel = Math.max(160, vw * 0.35);
      const dx = (1 - eased) * maxTravel;
      const opacity = Math.min(1, eased * 1.15);
      introLeft.style.opacity = String(opacity);
      introRight.style.opacity = String(opacity);
      introLeft.style.transform = `translate3d(${-dx}px,0,0)`;
      introRight.style.transform = `translate3d(${dx}px,0,0)`;
    };

    const step = () => {
      currentProgress += (targetProgress - currentProgress) * 0.15;
      apply(currentProgress);
      if (Math.abs(targetProgress - currentProgress) > 0.002) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = 0;
      }
    };

    const onScrollIntro = () => {
      targetProgress = computeProgress();
      if (!rafId) rafId = requestAnimationFrame(step);
    };

    window.addEventListener('scroll', onScrollIntro, { passive: true });
    window.addEventListener('resize', onScrollIntro);
    onScrollIntro();
  }
  // Interactive steps blob animation
    const stepsList = document.querySelector('.steps');
    const stepsBlob = document.getElementById('stepsBlob');
  if (stepsList && stepsBlob) {
    const items = Array.from(stepsList.querySelectorAll('li'));
    let activeIndex = 0;

    const moveBlobTo = (index) => {
      const target = items[index];
      if (!target) return;
      items.forEach((el, i) => el.classList.toggle('active', i === index));
      const rect = target.getBoundingClientRect();
      const containerRect = stepsList.getBoundingClientRect();
      const x = rect.left + rect.width - 24 - containerRect.left;
      const y = rect.top + 24 - containerRect.top;
      stepsBlob.style.left = `${x}px`;
      stepsBlob.style.top = `${y}px`;
      stepsBlob.style.opacity = '1';
    };

    // initial position
    setTimeout(() => moveBlobTo(0), 300);

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        activeIndex = i;
        moveBlobTo(activeIndex);
      });
      item.addEventListener('focusin', () => {
        activeIndex = i;
        moveBlobTo(activeIndex);
      });
    });

    // auto flow across items periodically
    let autoTimer = null;
    const startAuto = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        activeIndex = (activeIndex + 1) % items.length;
        moveBlobTo(activeIndex);
      }, 2200);
    };
    const stopAuto = () => clearInterval(autoTimer);
    startAuto();
    stepsList.addEventListener('mouseenter', stopAuto);
    stepsList.addEventListener('mouseleave', startAuto);
    window.addEventListener('resize', () => moveBlobTo(activeIndex));
  }

  // Contact form submit -> mailto fallback
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString();
      const email = (data.get('email') || '').toString();
      const company = (data.get('company') || '').toString();
      const role = (data.get('role') || '').toString();
      const topic = (data.get('topic') || '').toString();
      const message = (data.get('message') || '').toString().trim();
      if (!message) {
        formStatus.textContent = 'Please add a short message so we can route your enquiry.';
        return;
      }
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company}\nRole: ${role}\nTopic: ${topic}\n\n${message}`);
      const subject = encodeURIComponent(`Website enquiry — ${topic}`);
      const mailto = `mailto:info@codor.uk?subject=${subject}&body=${body}`;
      formStatus.textContent = 'Opening your email client...';
      window.location.href = mailto;
      setTimeout(() => { formStatus.textContent = 'If your email client did not open, please email info@codor.uk.'; }, 1200);
    });
  }
});


