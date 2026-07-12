// =========================================================
// Mani's Art — script.js
// Handles: mobile nav toggle, footer year, floating petal field
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    setFooterYear();
    initEmberField();
    initGalleryFilter();
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