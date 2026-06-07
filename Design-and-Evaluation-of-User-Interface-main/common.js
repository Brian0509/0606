'use strict';

// ── 進度條 ──────────────────────────────
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  if (!progressBar) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
}

// ── 導覽列 scroll shadow ─────────────────
const navbar = document.getElementById('navbar');
function updateNav() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
}

// ── 返回頂部 ─────────────────────────────
const backTop = document.getElementById('backTop');
function updateBackTop() {
  if (backTop) backTop.classList.toggle('show', window.scrollY > 400);
}
if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── 統一 scroll ───────────────────────────
window.addEventListener('scroll', () => {
  updateProgress();
  updateNav();
  updateBackTop();
}, { passive: true });
window.addEventListener('resize', updateNav);
updateProgress(); updateNav(); updateBackTop();

// ── Reveal (IntersectionObserver) ─────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.bar[data-w]').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── 固定淺色模式 ───────────────────────────
document.documentElement.classList.add('light');

// ── 字體大小 ──────────────────────────────
const FONT_LEVELS = [85, 92, 100, 108, 116];
let fontLevelIdx = 2;

function applyFontSize(idx, silent = false) {
  fontLevelIdx = Math.max(0, Math.min(FONT_LEVELS.length - 1, idx));
  document.documentElement.style.fontSize = FONT_LEVELS[fontLevelIdx] + '%';
  localStorage.setItem('fontLevel', fontLevelIdx);
  const dec = document.getElementById('fontDecrease');
  const inc = document.getElementById('fontIncrease');
  if (dec) dec.disabled = fontLevelIdx <= 0;
  if (inc) inc.disabled = fontLevelIdx >= FONT_LEVELS.length - 1;
  if (!silent) showToast('字體大小：' + FONT_LEVELS[fontLevelIdx] + '%');
}

(function initFontSize() {
  const saved = parseInt(localStorage.getItem('fontLevel'));
  applyFontSize(isNaN(saved) ? 2 : saved, true);
})();

document.getElementById('fontDecrease')?.addEventListener('click', () => applyFontSize(fontLevelIdx - 1));
document.getElementById('fontReset')?.addEventListener('click',    () => applyFontSize(2));
document.getElementById('fontIncrease')?.addEventListener('click', () => applyFontSize(fontLevelIdx + 1));

// ── 鍵盤快捷鍵 ───────────────────────────
document.addEventListener('keydown', e => {
  const inInput = e.target.matches('input, textarea, select');
  if (e.shiftKey && (e.code === 'Equal' || e.code === 'NumpadAdd') && !inInput) { e.preventDefault(); applyFontSize(fontLevelIdx + 1); }
  if (e.shiftKey && (e.code === 'Minus' || e.code === 'NumpadSubtract') && !inInput) { e.preventDefault(); applyFontSize(fontLevelIdx - 1); }
  if (e.shiftKey && e.code === 'Digit0' && !inInput) { e.preventDefault(); applyFontSize(2); }
});

// ── Hamburger nav ─────────────────────────
const navToggle = document.getElementById('navToggle');
const navList   = document.getElementById('navLinks');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => navList.classList.toggle('open'));
  navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
}

// ── FAQ 手風琴 ────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Toast ─────────────────────────────────
function showToast(msg, duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 380); }, duration);
}
window.showToast = showToast;
