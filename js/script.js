// =========================================================
// Mani's Art — script.js
// Handles: mobile nav toggle, footer year, floating petal field
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    setFooterYear();
    initEmberField();
    initGalleryFilter();
    initLightbox();
});

/* ---------- mobile nav ---------- */
function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
}

/* ---------- footer year ---------- */
function setFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

/* ---------- floating embers ----------
   Small glowing dots drifting upward with a subtle flicker —
   reads as candlelight/firefly light rather than an ambiguous shape.
   Respects prefers-reduced-motion, capped count.
*/
function initEmberField() {
    const field = document.getElementById('ember-field');
    if (!field) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const EMBER_COUNT = 22;
    const colors = ['#d97a3d', '#9b59b6', '#f0a868'];

    for (let i = 0; i < EMBER_COUNT; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember';

        const size = 2 + Math.random() * 3;
        const left = Math.random() * 100;
        const riseDuration = 10 + Math.random() * 10;
        const riseDelay = Math.random() * 18;
        const flickerDuration = 1.2 + Math.random() * 1.8;
        const drift = (Math.random() - 0.5) * 90;
        const color = colors[Math.floor(Math.random() * colors.length)];

        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${left}%`;
        ember.style.setProperty('--drift', `${drift}px`);
        ember.style.animationDuration = `${riseDuration}s`;
        ember.style.animationDelay = `${riseDelay}s`;

        const glow = document.createElement('div');
        glow.className = 'ember-glow';
        glow.style.background = color;
        glow.style.boxShadow = `0 0 ${size * 3}px ${size}px ${color}`;
        glow.style.animationDuration = `${flickerDuration}s`;
        glow.style.animationDelay = `${Math.random() * 2}s`;

        ember.appendChild(glow);
        field.appendChild(ember);
    }
}
/* ---------- gallery filter (gallery.html only) ----------
   Filters the portfolio grid by character using the
   data-filter / data-character attributes. No-op on pages
   without a filter bar.
*/
function initGalleryFilter() {
    const filterBar = document.querySelector('.filter-bar');
    const grid = document.getElementById('portfolioGrid');
    if (!filterBar || !grid) return;

    const buttons = filterBar.querySelectorAll('.filter-btn');
    const cards = grid.querySelectorAll('.work-card');
    const emptyState = document.getElementById('emptyState');

    filterBar.addEventListener('click', (event) => {
        const btn = event.target.closest('.filter-btn');
        if (!btn) return;

        buttons.forEach((b) => {
            b.classList.remove('is-active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;
        let visibleCount = 0;

        cards.forEach((card) => {
            const matches = filter === 'all' || card.dataset.character === filter;
            card.classList.toggle('is-hidden', !matches);
            if (matches) visibleCount += 1;
        });

        if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
}
/* ---------- lightbox ----------
   Click any portfolio image (anything inside .work-frame) to
   view it larger in a modal overlay. Builds the modal markup
   once on first use, so no HTML changes are needed on any
   page — works on index.html, gallery.html, or any future
   page that uses the same .work-frame pattern.
*/
function initLightbox() {
    const images = document.querySelectorAll('.work-frame img');
    if (images.length === 0) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Enlarged artwork');
    lightbox.innerHTML = `
        <div class="lightbox-inner">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <img class="lightbox-image" src="" alt="">
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        // clear the src after the fade-out finishes, so a large image
        // isn't held in memory/decoded while the modal is closed
        setTimeout(() => {
            if (!lightbox.classList.contains('is-open')) lightboxImg.src = '';
        }, 250);
    }

    images.forEach((img) => {
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    closeBtn.addEventListener('click', closeLightbox);

    // clicking the dimmed backdrop (but not the image itself) closes it
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });
}