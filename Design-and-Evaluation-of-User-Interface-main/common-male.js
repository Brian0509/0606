'use strict';
/* ════════════════════════════════════════════════════════════
   common-male.js  ——  男生版本（功能 / 數據導向）
   以原本 common.js 為基礎，依訪談結果做三項調整：
   (1) 進度條：明確標示為「閱讀進度」並顯示百分比，
       解決「看起來像讀取條、會在那邊等它跑完」的誤解。
   (2) 字體縮放：範圍由 ±15% 擴大為 −20%~+50%，
       解決「縮放範圍太小、體感沒什麼差」。
   (3) 其餘行為（導覽列、返回頂部、FAQ、Toast）與原版一致。
════════════════════════════════════════════════════════════ */

// ── 進度條（男版：加上文字標籤 + 百分比） ──────────────
const progressBar = document.getElementById('progress-bar');
let progressLabel = null;
if (progressBar) {
  // 動態建立一個百分比標籤，讓使用者一眼看出這是「捲動進度」而非載入中
  progressLabel = document.createElement('div');
  progressLabel.id = 'progress-label';
  progressLabel.innerHTML = '<span class="pl-icon">▽</span> 閱讀進度 <b>0%</b>';
  document.body.appendChild(progressLabel);
}
function updateProgress() {
  if (!progressBar) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = pct + '%';
  if (progressLabel) {
    progressLabel.querySelector('b').textContent = Math.round(pct) + '%';
    progressLabel.classList.toggle('done', pct > 99);
  }
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

// ── 字體大小（男版：範圍擴大，級距更明顯） ──────────────
const FONT_LEVELS = [80, 90, 100, 115, 130, 150];   // 原版為 [85,92,100,108,116]
let fontLevelIdx = 2;                                 // 預設 100%

function applyFontSize(idx, silent = false) {
  fontLevelIdx = Math.max(0, Math.min(FONT_LEVELS.length - 1, idx));
  document.documentElement.style.fontSize = FONT_LEVELS[fontLevelIdx] + '%';
  localStorage.setItem('fontLevelMale', fontLevelIdx);
  const dec = document.getElementById('fontDecrease');
  const inc = document.getElementById('fontIncrease');
  if (dec) dec.disabled = fontLevelIdx <= 0;
  if (inc) inc.disabled = fontLevelIdx >= FONT_LEVELS.length - 1;
  if (!silent) showToast('字體大小：' + FONT_LEVELS[fontLevelIdx] + '%');
}

(function initFontSize() {
  const saved = parseInt(localStorage.getItem('fontLevelMale'));
  applyFontSize(isNaN(saved) ? 2 : saved, true);
})();

document.getElementById('fontDecrease')?.addEventListener('click', () => applyFontSize(fontLevelIdx - 1));
document.getElementById('fontReset')?.addEventListener('click',    () => applyFontSize(2));
document.getElementById('fontIncrease')?.addEventListener('click', () => applyFontSize(fontLevelIdx + 1));

// ── 鍵盤快捷鍵（男版保留並強調） ───────────────────────────
document.addEventListener('keydown', e => {
  const inInput = e.target.matches('input, textarea, select');
  if (e.shiftKey && (e.code === 'Equal' || e.code === 'NumpadAdd') && !inInput) { e.preventDefault(); applyFontSize(fontLevelIdx + 1); }
  if (e.shiftKey && (e.code === 'Minus' || e.code === 'NumpadSubtract') && !inInput) { e.preventDefault(); applyFontSize(fontLevelIdx - 1); }
  if (e.shiftKey && e.code === 'Digit0' && !inInput) { e.preventDefault(); applyFontSize(2); }
  // 回到首頁快捷鍵：Shift + H
  if (e.shiftKey && (e.code === 'KeyH') && !inInput) {
    e.preventDefault();
    const home = document.querySelector('.nav-home-btn');
    window.location.href = home ? home.getAttribute('href') : 'index-male.html';
  }
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

// ── 站內搜尋（男版新增功能） ─────────────────────────────
//   在當前頁面內容中搜尋關鍵字，高亮所有命中並逐一跳轉，
//   類似大型校園官網的站內搜尋。搜尋欄由 build 注入於導覽列。
(function initSiteSearch() {
  const form  = document.getElementById('siteSearchForm');
  const input = document.getElementById('siteSearchInput');
  const count = document.getElementById('siteSearchCount');
  if (!form || !input) return;

  let hits = [];
  let cur = -1;

  function clearHighlights() {
    document.querySelectorAll('mark.search-hit').forEach(m => {
      const t = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(t, m);
    });
    // 合併被拆開的文字節點，避免影響後續搜尋
    document.querySelectorAll('.search-scope').forEach(s => s.normalize());
    hits = []; cur = -1;
  }

  // 只在主要內容區搜尋，避開導覽列 / footer / 搜尋欄自身
  function getScopes() {
    const scopes = document.querySelectorAll('section, footer .container');
    return scopes.length ? scopes : [document.body];
  }

  function highlight(term) {
    const lower = term.toLowerCase();
    const walkRoots = getScopes();
    walkRoots.forEach(root => {
      root.classList && root.classList.add('search-scope');
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.closest('#navbar, script, style, #progress-label, .site-search')) return NodeFilter.FILTER_REJECT;
          if (p.tagName === 'MARK') return NodeFilter.FILTER_REJECT;
          return node.nodeValue.toLowerCase().includes(lower)
            ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      const targets = [];
      while (walker.nextNode()) targets.push(walker.currentNode);
      targets.forEach(node => {
        const text = node.nodeValue;
        const frag = document.createDocumentFragment();
        let i = 0, idx;
        const low = text.toLowerCase();
        while ((idx = low.indexOf(lower, i)) !== -1) {
          if (idx > i) frag.appendChild(document.createTextNode(text.slice(i, idx)));
          const mark = document.createElement('mark');
          mark.className = 'search-hit';
          mark.textContent = text.slice(idx, idx + term.length);
          frag.appendChild(mark);
          i = idx + term.length;
        }
        if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
        node.parentNode.replaceChild(frag, node);
      });
    });
    hits = Array.from(document.querySelectorAll('mark.search-hit'));
  }

  function gotoHit(n) {
    if (!hits.length) return;
    hits.forEach(h => h.classList.remove('current'));
    cur = (n + hits.length) % hits.length;
    const el = hits[cur];
    el.classList.add('current');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (count) count.textContent = (cur + 1) + '/' + hits.length;
  }

  function runSearch() {
    const term = input.value.trim();
    clearHighlights();
    if (!term) { if (count) count.textContent = ''; return; }
    highlight(term);
    if (hits.length) {
      gotoHit(0);
      showToast('找到 ' + hits.length + ' 個「' + term + '」');
    } else {
      if (count) count.textContent = '0';
      showToast('找不到「' + term + '」');
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    // 已有結果且關鍵字未變 → 跳到下一個命中
    if (hits.length && input.value.trim()) gotoHit(cur + 1);
    else runSearch();
  });
  input.addEventListener('input', () => { if (!input.value.trim()) { clearHighlights(); if (count) count.textContent = ''; } });
})();

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
