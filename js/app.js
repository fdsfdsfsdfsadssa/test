// ============================================================
//  Room Alone — app.js  (shared utilities)
// ============================================================

const NAV_HTML = `
<nav class="navbar" id="mainNav">
  <a href="index.html" class="nav-brand">
    <img src="assets/logo.png" alt="Room Alone" class="nav-logo">
  </a>
  <ul class="nav-links" id="navLinks">
    <li><a href="index.html"    data-page="index">الرئيسية</a></li>
    <li><a href="menu.html"     data-page="menu">المنيو</a></li>
    <li><a href="booking.html"  data-page="booking">الحجز</a></li>
    <li><a href="order.html"    data-page="order" class="nav-cta">🛒 اطلب الآن</a></li>
  </ul>
  <button class="nav-toggle" onclick="toggleMobileNav()" aria-label="القائمة">
    <span></span><span></span><span></span>
  </button>
</nav>`;

let _toastEl;

document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) placeholder.innerHTML = NAV_HTML;

    const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
        if (a.dataset.page === page) a.classList.add('active');
    });

    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    });

    _toastEl = document.createElement('div');
    _toastEl.className = 'toast-container';
    document.body.appendChild(_toastEl);
});

function toggleMobileNav() {
    const links = document.getElementById('navLinks');
    const btn   = document.querySelector('.nav-toggle');
    links?.classList.toggle('open');
    btn?.classList.toggle('open');
}

function showToast(msg, type = 'info', duration = 3000) {
    if (!_toastEl) {
        _toastEl = document.createElement('div');
        _toastEl.className = 'toast-container';
        document.body.appendChild(_toastEl);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    _toastEl.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, duration);
}

function formatPrice(p) { return p.toLocaleString('ar-EG') + ' ج.م'; }
function formatTime(ts) { return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); }
function formatDateTime(ts) {
    return new Date(ts).toLocaleString('ar-EG', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function genOrderId() { return '#' + Math.floor(1000 + Math.random() * 9000); }

// ── Smooth section entrance (Fixed) ─────────────────────────
const _obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            _obs.unobserve(e.target);
        }
    });
}, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => _obs.observe(el));
    
    // Fallback: يضمن ظهور جميع العناصر حتى لو تأخر التمرير (يحل مشكلة الصفحات الفارغة)
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => el.classList.add('visible'));
    }, 800);
});
