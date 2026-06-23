(() => {
  let TAG_REGISTRY = {};
  let POSTS_INDEX = [];

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path} not found (${res.status})`);
    return res.json();
  }

  function formatDate(iso) {
    // "2026-01-12" -> "12 Jan 2026"
    const d = new Date(iso + "T00:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-GB", { month: "short" });
    const yr = d.getFullYear();
    return `${day} ${mon} ${yr}`;
  }

  function tagShort(id) {
    return TAG_REGISTRY[id]?.short || id;
  }

  function tagLabel(id) {
    return TAG_REGISTRY[id]?.label || id;
  }

  function hydrateBadges(root = document) {
    root.querySelectorAll(".badge[data-tag]").forEach((el) => {
      const id = el.getAttribute("data-tag");
      el.textContent = tagShort(id);
      el.setAttribute("title", tagLabel(id));
    });
  }

  function renderBlogList() {
    const grid = document.getElementById("postGrid");
    if (!grid) return;

    // newest first
    const posts = [...POSTS_INDEX].sort((a, b) => b.date.localeCompare(a.date));

    grid.innerHTML = posts.map((p) => {
      const badgeButtons = (p.tags || []).slice(0, 3).map((t) =>
        `<button class="badge badge-filter" type="button" data-tag="${t}"></button>`
      ).join("");

      return `
        <article class="card post-card" data-post-slug="${p.slug}">
          <div class="date">${formatDate(p.date)} · ${p.category}</div>
          <h3>
            <a href="/blog/${p.slug}.html">${p.title}</a>
          </h3>
          <p>${p.excerpt}</p>
          <div class="badges">
            ${badgeButtons}
          </div>
        </article>
      `;
    }).join("");

    hydrateBadges(grid);
  }

  function renderPostTagsFromIndex() {
    const slug = document.body.getAttribute("data-post-slug");
    if (!slug) return;

    const post = POSTS_INDEX.find(p => p.slug === slug);
    if (!post) return;

    const wrap = document.querySelector("[data-post-tags]");
    if (!wrap) return;

    wrap.innerHTML = (post.tags || []).slice(0, 6).map((t) =>
      `<span class="badge" data-tag="${t}"></span>`
    ).join("");

    hydrateBadges(wrap);
  }

  function renderPostNav() {
    const slug = document.body.getAttribute("data-post-slug");
    if (!slug) return;

    const article = document.querySelector("article.prose");
    if (!article) return;

    const posts = [...POSTS_INDEX].sort((a, b) => a.date.localeCompare(b.date));
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) return;

    const previous = posts[index - 1];
    const next = posts[index + 1];

    if (!previous && !next) return;

    const nav = document.createElement("nav");
    nav.className = "post-nav";
    nav.setAttribute("aria-label", "Post navigation");

    nav.innerHTML = `
      ${
        previous
          ? `<a href="/blog/${previous.slug}.html">
              <span>Previous</span>
              <strong>${previous.title}</strong>
            </a>`
          : `<span></span>`
      }

      ${
        next
          ? `<a href="/blog/${next.slug}.html">
              <span>Next</span>
              <strong>${next.title}</strong>
            </a>`
          : `<span></span>`
      }
    `;

    article.appendChild(nav);
  }

  function setupBlogFiltering() {
    const grid = document.getElementById("postGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".post-card"));
    const badgeButtons = Array.from(grid.querySelectorAll(".badge-filter[data-tag]"));
    const clearBtn = document.getElementById("clearFilters");
    const activeWrap = document.getElementById("activeFilters");
    const selected = new Set();

    function getCardTags(card) {
      return Array.from(card.querySelectorAll("[data-tag]")).map(el => el.getAttribute("data-tag"));
    }

    function apply() {
      cards.forEach(card => {
        const tags = getCardTags(card);
        const matches = selected.size === 0 || Array.from(selected).every(t => tags.includes(t));
        card.style.display = matches ? "" : "none";
      });

      badgeButtons.forEach(btn => {
        btn.classList.toggle("is-selected", selected.has(btn.dataset.tag));
      });

      if (clearBtn) clearBtn.hidden = selected.size === 0;

      if (activeWrap) {
        activeWrap.innerHTML = "";
        Array.from(selected).forEach((id) => {
          const chip = document.createElement("span");
          chip.className = "badge";
          chip.textContent = tagShort(id);
          chip.title = tagLabel(id);
          activeWrap.appendChild(chip);
        });
      }

      const url = new URL(window.location.href);
      if (selected.size === 0) url.searchParams.delete("tag");
      else url.searchParams.set("tag", Array.from(selected).join(","));
      window.history.replaceState({}, "", url);
    }

    badgeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.tag;
        if (selected.has(t)) selected.delete(t);
        else selected.add(t);
        apply();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        selected.clear();
        apply();
      });
    }

    const url = new URL(window.location.href);
    const initial = url.searchParams.get("tag");
    if (initial) {
      initial.split(",").map(s => s.trim()).filter(Boolean).forEach(t => selected.add(t));
    }

    apply();
  }

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Back to top
  const back = document.getElementById("backToTop");
  if (back) {
    const onScroll = () => back.classList.toggle("is-visible", window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    back.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ========== Cookie consent ==========
  const CONSENT_KEY = "codor_cookie_consent"; // "all" | "essential"
    // ========== Reset cookie preferences ==========
  function setupCookieReset() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-reset-cookies]");
      if (!btn) return;

      localStorage.removeItem(CONSENT_KEY);
      window.location.reload();
    });
  }

  function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
  }
  function setConsent(val) {
    localStorage.setItem(CONSENT_KEY, val);
  }

  // Put any non-essential script enabling inside here (analytics, hotjar, etc.)
  function enableNonEssential() {
    // Example pattern (leave empty until you actually add analytics):
    // const s = document.createElement("script");
    // s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXX";
    // s.async = true;
    // document.head.appendChild(s);
  }

  function ensureCookieBanner() {
    const consent = getConsent();
    if (consent === "all") {
      enableNonEssential();
      return;
    }
    if (consent === "essential") return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <div class="row">
        <p>
          We use essential cookies to make this site work.
          We’d also like to use analytics cookies to understand what’s useful.
          <a class="cookie-link" href="/privacy.html">Privacy</a>
        </p>
        <div class="cookie-actions">
          <button type="button" class="cookie-btn" data-consent="essential">Reject</button>
          <button type="button" class="cookie-btn primary" data-consent="all">Accept</button>
        </div>
      </div>
    `;

    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-consent]");
      if (!btn) return;
      const val = btn.getAttribute("data-consent");
      setConsent(val);
      if (val === "all") enableNonEssential();
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  ensureCookieBanner();
  setupCookieReset();

  // Boot
  Promise.all([
    loadJSON("/tags.json"),
    loadJSON("/blog/posts.json")
  ])
    .then(([tags, posts]) => {
      TAG_REGISTRY = tags;
      POSTS_INDEX = posts;

      // Hydrate any existing badges already in HTML (works everywhere)
      hydrateBadges(document);

      // Populate blog list (blog.html)
      renderBlogList();

      // Populate post tags (post pages)
      renderPostTagsFromIndex();

      // Populate previous / next links (post pages)
      renderPostNav();

      // Setup filtering (blog.html)
      setupBlogFiltering();
    })
    .catch((err) => console.error("Site bootstrap failed:", err));
    
    // Expandable images
document.querySelectorAll(".expandable-image").forEach((img) => {
  img.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.innerHTML = `
      <button type="button" aria-label="Close image">×</button>
      <img src="${img.src}" alt="${img.alt}">
    `;

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.tagName === "BUTTON") {
        modal.remove();
      }
    });

    document.addEventListener("keydown", function closeOnEscape(e) {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", closeOnEscape);
      }
    });

    document.body.appendChild(modal);
  });
});
})();
