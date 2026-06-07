'use strict';

// ── 進度條 ──────────────────────────────────
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ── 導覽列 ──────────────────────────────────
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
  // scrolled shadow
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // active link highlight
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute('href')?.replace('#', '');
    a.classList.toggle('active', href === current);
  });
}

// hamburger
const navToggle = document.getElementById('navToggle');
const navList   = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navList.classList.toggle('open'));
navList.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navList.classList.remove('open'));
});

// ── 返回頂部 ─────────────────────────────────
const backTop = document.getElementById('backTop');
function updateBackTop() {
  backTop.classList.toggle('show', window.scrollY > 400);
}
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── 打字機效果 ───────────────────────────────
const TYPEWRITER_TEXT = '益智遊戲怎麼選？';
const typeEl = document.getElementById('typewriterEl');
let typeIdx = 0;

function typeChar() {
  if (typeIdx <= TYPEWRITER_TEXT.length) {
    typeEl.textContent = TYPEWRITER_TEXT.slice(0, typeIdx);
    typeIdx++;
    setTimeout(typeChar, typeIdx === 1 ? 600 : 80);
  }
}
setTimeout(typeChar, 800);

// ── Scroll Reveal (Intersection Observer) ────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // 分數條動畫
      entry.target.querySelectorAll('.bar[data-w]').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 分數條單獨觀察（在 table 裡不一定在 .reveal 內）
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar[data-w]').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.score-table-wrap').forEach(el => barObserver.observe(el));

// ── Tab 切換 ─────────────────────────────────
document.querySelectorAll('.tabs').forEach(tabsEl => {
  tabsEl.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      // deactivate all tabs in this group
      tabsEl.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // find panels that belong to this tab group
      // each tab has data-target pointing to a panel id
      const targetId = btn.dataset.target;
      // hide all sibling panels (same section)
      const section = tabsEl.closest('.section');
      section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
});

// ── FAQ 手風琴 ───────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

// ── 聯絡表單驗證 ─────────────────────────────
const form       = document.getElementById('contactForm');
const nameInput  = document.getElementById('fname');
const emailInput = document.getElementById('femail');
const nameErr    = document.getElementById('fnameErr');
const emailErr   = document.getElementById('femailErr');
const formOk     = document.getElementById('formOk');

// 從 localStorage 讀回上次填過的姓名
const savedName = localStorage.getItem('contactName');
if (savedName) nameInput.value = savedName;

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function showErr(input, errEl, msg) {
  input.classList.add('err');
  errEl.textContent = '⚠ ' + msg;
}
function clearErr(input, errEl) {
  input.classList.remove('err');
  errEl.textContent = '';
}

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) clearErr(nameInput, nameErr);
});
emailInput.addEventListener('input', () => {
  if (validateEmail(emailInput.value.trim())) clearErr(emailInput, emailErr);
  else if (!emailInput.value.trim()) clearErr(emailInput, emailErr);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  if (!nameInput.value.trim()) {
    showErr(nameInput, nameErr, '請填寫姓名');
    valid = false;
  } else {
    clearErr(nameInput, nameErr);
  }

  const emailVal = emailInput.value.trim();
  if (!emailVal) {
    showErr(emailInput, emailErr, '請填寫 Email');
    valid = false;
  } else if (!validateEmail(emailVal)) {
    showErr(emailInput, emailErr, '請確認 Email 格式（例：abc@gmail.com）');
    valid = false;
  } else {
    clearErr(emailInput, emailErr);
  }

  if (valid) {
    localStorage.setItem('contactName', nameInput.value.trim());
    showToast('✅ 送出成功！感謝您的意見回饋。');
    form.reset();
    nameInput.value = localStorage.getItem('contactName') || '';
  }
});

// ── 雷達圖 (Chart.js) ─────────────────────────
function initChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx || typeof Chart === 'undefined') return;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['易用性', '效率', '學習性', '記憶性', '滿意度', '功能性', '安全性'],
      datasets: [
        {
          label: '🧠 知識王 LIVE',
          data: [7.0, 8.0, 7.0, 6.5, 8.0, 7.5, 6.5],
          backgroundColor: 'rgba(33,150,243,0.18)',
          borderColor: '#2196f3',
          borderWidth: 2,
          pointBackgroundColor: '#2196f3',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2196f3',
          pointRadius: 5,
        },
        {
          label: '🎯 Kahoot!',
          data: [9.0, 8.0, 9.0, 8.0, 8.5, 9.0, 8.5],
          backgroundColor: 'rgba(156,77,255,0.18)',
          borderColor: '#9c4dff',
          borderWidth: 2,
          pointBackgroundColor: '#9c4dff',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#9c4dff',
          pointRadius: 5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          labels: {
            color: '#eeeeff',
            font: { family: "'Noto Sans TC', sans-serif", size: 12, weight: '600' },
            padding: 20,
            usePointStyle: true,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13,13,38,0.92)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          titleColor: '#eeeeff',
          bodyColor: '#aaaacc',
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label.replace(/^[^\s]+ /, '')}：${ctx.raw} / 10`
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#55556a',
            backdropColor: 'transparent',
            font: { size: 10 }
          },
          grid:        { color: 'rgba(255,255,255,0.07)' },
          angleLines:  { color: 'rgba(255,255,255,0.07)' },
          pointLabels: {
            color: '#aaaacc',
            font: { family: "'Noto Sans TC', sans-serif", size: 12, weight: '600' }
          }
        }
      }
    }
  });
}

// 圖表滾動到視野才初始化，確保動畫看得到
const chartEl = document.getElementById('radarChart');
if (chartEl) {
  const chartObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initChart();
      chartObs.disconnect();
    }
  }, { threshold: 0.3 });
  chartObs.observe(chartEl);
}

// ── Modal 資料 ────────────────────────────────
const MODAL_DATA = {
  h1: {
    badge: 'H1', en: 'Visibility of System Status', cn: '系統的可見度',
    desc: '系統應持續向使用者回饋目前狀態，使使用者能掌握操作進度與系統回應，讓人清楚知道「現在發生了什麼」。',
    points: [
      { icon: '📊', title: '頂部閱讀進度條', detail: '頁面最頂端有一條彩色漸層細線（藍→紫→青），隨著使用者向下捲動即時更新寬度，直觀反映閱讀進度百分比。' },
      { icon: '🔦', title: '導覽列區塊高亮', detail: '捲動頁面時，導覽列中對應目前所在區塊的連結自動變白、加粗，讓使用者隨時知道自己在「知識王 LIVE」還是「比較分析」等哪個章節。' },
      { icon: '🟣', title: 'Tab 選取高亮', detail: '點選「遊戲介紹」「玩法介紹」「遊戲模式」任一 Tab 後，按鈕立即切換為藍紫漸層背景色，清楚標示目前選取的頁籤狀態。' },
    ]
  },
  h2: {
    badge: 'H2', en: 'Match Between System and Real World', cn: '接近生活的系統',
    desc: '介面應使用使用者熟悉的語言、概念與情境，而非系統導向的技術術語，降低理解門檻並提升閱讀效率。',
    points: [
      { icon: '😀', title: 'Emoji 圖示分類', detail: '每張資訊卡片以 🏢📱🎓💰⬇️🌏 等 Emoji 標示類別，符合使用者的直覺聯想，即使不讀標題文字也能辨認各格子代表什麼資訊。' },
      { icon: '📡', title: '雷達圖比較視覺', detail: '比較分析採用雷達圖搭配評分條，這是學術報告與產品評鑑的常見視覺格式，符合有報告閱讀經驗的使用者的認知習慣，不需額外解釋如何閱讀。' },
      { icon: '📝', title: '日常化導覽標籤', detail: '導覽列使用「知識王 LIVE」「比較分析」「常見問題」等日常語言命名，避免使用「Section A」「Module 3」等技術性術語，降低認知負擔。' },
    ]
  },
  h3: {
    badge: 'H3', en: 'User Control and Freedom', cn: '控制權與自由度',
    desc: '使用者應可自由導航並隨時返回或更改行為，避免被系統限制在單一路徑上，讓使用者感受到「我在主導這個頁面」。',
    points: [
      { icon: '📌', title: 'Sticky 固定導覽列', detail: '導覽列始終固定在頁面頂部，使用者無論捲動到哪個區塊，隨時可以點選任意連結跳轉，不被限制在線性閱讀流程中。' },
      { icon: '⬆️', title: '返回頂部按鈕', detail: '捲動超過 400px 後，右下角出現返回頂部按鈕，讓使用者一鍵回到頁面起點重新選擇閱讀路徑，而不必長時間向上捲動。' },
      { icon: '🔀', title: 'Tab 自由切換', detail: '遊戲介紹、玩法介紹、遊戲模式三個 Tab 可隨時任意點選，不強制依序閱讀，使用者可隨時切回先前看過的 Tab 重新瀏覽。' },
    ]
  },
  h4: {
    badge: 'H4', en: 'Consistency and Standards', cn: '一致性與標準化',
    desc: '介面應遵循一致的設計規範與互動模式，避免使用者在不同位置遇到相同功能卻有不同外觀或操作方式的困惑。',
    points: [
      { icon: '🪞', title: '兩款遊戲完全對稱的版型', detail: '知識王 LIVE 與 Kahoot! 兩個介紹區塊採用完全相同的 HTML 結構：section-label → 標題 → 副標 → 三個 Tab → 內容卡片，使用者學會操作一個後，另一個不需重新學習。' },
      { icon: '🎨', title: '全站統一色彩語義', detail: '藍色系（#2196F3）全程代表知識王 LIVE，紫色系（#9c4dff）全程代表 Kahoot!，任何出現這兩種顏色的元素（卡片邊框、圖表線條、分析卡片）意義始終一致。' },
      { icon: '📦', title: '統一的卡片互動行為', detail: '分析卡片、遊戲模式卡片、比較說明卡片均使用相同的圓角（14px）、內距與 hover 上浮效果，使用者一旦理解卡片的互動行為，此認知在全站通用。' },
    ]
  },
  h5: {
    badge: 'H5', en: 'Error Prevention', cn: '錯誤預防',
    desc: '比起在錯誤發生後才提示，更好的設計是從一開始就避免錯誤發生，透過清楚的標示與即時驗證防患未然。',
    points: [
      { icon: '✳️', title: '必填欄位標記 *', detail: '聯絡表單的姓名與 Email 欄位旁標有紫色 *，在使用者開始填寫前就明確告知哪些欄位不可省略，防止遺漏後才發現無法送出的挫折感。' },
      { icon: '📧', title: 'Email 即時格式驗證', detail: 'Email 欄位在使用者輸入時即以 regex 即時判斷格式（是否含 @ 與網域），讓使用者在完成整張表單前就能即時發現錯誤並修正。' },
      { icon: '🚫', title: '錯誤時阻止送出', detail: '若姓名未填或 Email 格式不正確，點擊送出時表單不會提交任何資料，同時欄位邊框立即變紅，確保不會送出無效的問題諮詢。' },
    ]
  },
  h6: {
    badge: 'H6', en: 'Recognition Rather Than Recall', cn: '辨識而非回想',
    desc: '系統應盡量讓使用者透過眼前可見的視覺線索做出判斷，而非要求使用者從記憶中提取資訊，降低認知負擔。',
    points: [
      { icon: '🏷️', title: 'Emoji 圖示標識卡片', detail: '資訊卡片以 🏢📱🎓 等 Emoji 作為視覺標識，使用者掃視時無需閱讀標題文字就能辨識各格子的類別，Emoji 的直觀語義自動承擔記憶工作。' },
      { icon: '🔵🟣', title: '雙色系持續編碼', detail: '全站以藍色代表知識王、紫色代表 Kahoot!，使用者在比較表格、分析卡片任何地方都能依顏色立即辨識哪個數據屬於哪款遊戲，無需記憶欄位順序。' },
      { icon: '🧭', title: '固定可見的導覽入口', detail: '導覽列始終固定在頁面頂端，使用者不需要記住「比較分析在第幾屏」，只要視線移至頂部就能找到所有章節入口，無需依賴空間記憶。' },
    ]
  },
  h7: {
    badge: 'H7', en: 'Flexibility and Efficiency of Use', cn: '靈活度與使用效率',
    desc: '介面應同時照顧初次使用的新手與已熟悉內容的進階使用者，讓兩者都能以適合自己的方式高效使用。',
    points: [
      { icon: '🏎️', title: '導覽列快速跳轉', detail: '熟悉頁面架構的使用者（如課堂展示需要直接展示比較分析）可點選導覽列一鍵到達目標區塊；初次訪客則可從 Hero「開始探索 ↓」按鈕循序閱讀。' },
      { icon: '📂', title: 'Tab 跳過機制', detail: '遊戲介紹下的三個 Tab 讓目的明確的使用者直接跳至「遊戲模式」，略過已知的「遊戲介紹」內容，不必強制看完每一頁。' },
      { icon: '📊', title: '雙層次比較資訊', detail: '比較分析同時提供雷達圖（快速整體印象）與評分表（逐項精確數據），淺層使用者掃圖即可，深度使用者細讀表格，兩種閱讀需求皆滿足。' },
    ]
  },
  h8: {
    badge: 'H8', en: 'Aesthetic and Minimalist Design', cn: '簡約的設計美學',
    desc: '介面應避免呈現不相關或很少用到的資訊，每一個額外的視覺元素都會稀釋最重要內容的能見度。',
    points: [
      { icon: '🌑', title: '深色極簡背景', detail: '頁面採用深色背景（#07071a），消除視覺噪音，讓彩色卡片、圖表、文字成為視覺焦點，避免使用者視線被雜亂的背景色分散。' },
      { icon: '📁', title: 'Tab 折疊次要內容', detail: '遊戲介紹、玩法介紹、遊戲模式三個子頁面透過 Tab 折疊，每次只呈現使用者選擇的那個面板，避免所有內容同時堆疊造成資訊過載。' },
      { icon: '🎨', title: '限制色彩數量', detail: '全站僅使用三種強調色（藍 #2196F3 / 紫 #9c4dff / 青 #00d4c8），加上深色背景與近白色文字，色彩簡潔有序，不造成視覺混亂。' },
    ]
  },
  h9: {
    badge: 'H9', en: 'Help Users Recognize, Diagnose, and Recover from Errors', cn: '幫助使用者辨識與回復錯誤',
    desc: '當錯誤無法完全避免時，應提供清楚易懂的錯誤訊息，具體說明問題所在，並引導使用者知道如何修正。',
    points: [
      { icon: '🔴', title: '欄位邊框即時變紅', detail: '送出表單時若姓名未填或 Email 格式錯誤，對應欄位邊框立即變為紅色，使用者一眼即可辨識哪個欄位有問題，不需逐一猜測。' },
      { icon: '💬', title: '具體的錯誤說明文字', detail: '錯誤訊息出現在欄位正下方，文字具體說明問題（例如「請確認 Email 格式（例：abc@gmail.com）」），並以實際範例引導使用者知道正確格式為何。' },
      { icon: '✅', title: '送出成功確認訊息', detail: '表單正確送出後，顯示綠色成功訊息「✅ 送出成功！感謝您的意見回饋。」5 秒後自動消失，消除使用者「不確定是否真的送出了」的疑慮。' },
    ]
  },
  h10: {
    badge: 'H10', en: 'Help and Documentation', cn: '幫助與輔助文件',
    desc: '雖然最好的設計無需說明書，但系統應提供必要的輔助說明，讓使用者在遇到困難時有清楚的求助管道。',
    points: [
      { icon: '❓', title: 'FAQ 手風琴區塊', detail: '「常見問題」區塊整理兩款遊戲的高頻疑問，以手風琴折疊形式呈現，使用者可快速展開自己的問題，無需閱讀全文。' },
      { icon: '✉️', title: '聯絡表單支援管道', detail: '提供姓名、Email 與意見欄位的聯絡表單，讓使用者在 FAQ 找不到答案時有明確的一對一求助管道，降低無助感。' },
      { icon: '👆', title: 'Hero 引導入口與副標說明', detail: '頁面頂端的「開始探索 ↓」按鈕指引初次訪客如何開始瀏覽；每個 section-desc 副標也在各區塊說明該章節的目的，持續引導使用者理解當前內容。' },
    ]
  },
  r1: {
    badge: 'R1', en: 'Strive for Consistency', cn: '追求一致性',
    desc: '相同的操作在不同情境應產生相同的結果；相同類型的介面元素應有相同的外觀，讓使用者的過往經驗可以套用。',
    points: [
      { icon: '🪞', title: '兩款遊戲完全對稱的架構', detail: '知識王 LIVE 與 Kahoot! 兩個介紹區塊採用完全相同的 HTML 結構與 CSS 樣式（section-label → 標題 → 三個 Tab → 卡片），使用者進入第二款遊戲介紹時，所有操作無需重新學習。' },
      { icon: '🎨', title: '統一的互動視覺反饋', detail: '全站所有 Tab 按鈕、所有卡片的 hover 上浮行為、所有 FAQ 的展開/收合動畫，視覺外觀與操作方式保持一致，降低認知跳轉成本。' },
      { icon: '🔵🟣', title: '一致的色彩語義系統', detail: '藍色永遠代表知識王，紫色永遠代表 Kahoot!，青色作為設計說明強調色，這套規則在比較表格、雷達圖、分析卡片、導覽列中始終不變。' },
    ]
  },
  r2: {
    badge: 'R2', en: 'Seek Universal Usability', cn: '追求普遍可用性',
    desc: '設計應考慮不同使用者的需求差異，包含不同裝置、不同螢幕尺寸、不同使用習慣，確保廣泛的可用性。',
    points: [
      { icon: '📱', title: '響應式設計（RWD）', detail: 'CSS Grid 搭配 auto-fill 與 minmax，加上三個 @media breakpoints（900px / 760px / 480px），確保在手機、平板、桌機上都有適當的版面。' },
      { icon: '🔡', title: '自適應字體大小', detail: '標題使用 clamp() 函式隨螢幕寬度縮放（2rem～3rem），正文統一使用 .88rem～.95rem，各裝置上均保持良好的可讀性與視覺層級。' },
      { icon: '⚡', title: '高對比配色', detail: '深色背景（#07071a）搭配近白色文字（#eeeeff），對比度符合 WCAG AA 標準。彩色強調元素（藍/紫/青）在深色底上高度突出，視覺可及性良好。' },
    ]
  },
  r3: {
    badge: 'R3', en: 'Offer Informative Feedback', cn: '提供有意義的回饋',
    desc: '每一個使用者操作都應有對應的回饋，讓使用者確認系統接收到了他們的操作，並知道操作的結果。',
    points: [
      { icon: '✨', title: '卡片 Hover 上浮效果', detail: '滑鼠移至任何卡片時，卡片上浮 4-5px 並加深邊框顏色，Nielsen 和 Shneiderman 的卡片還會出現「點擊查看設計說明 →」提示，告知使用者此元素可互動。' },
      { icon: '📈', title: '圖表與評分條進場動畫', detail: '雷達圖在捲動進入畫面時才觸發 1.2 秒漸入動畫；評分條從 0% 延伸至對應分數值，讓使用者明確感知「這筆資料正在呈現」，而非靜態載入。' },
      { icon: '🔴✅', title: '表單即時驗證回饋', detail: '送出失敗時欄位立即變紅並顯示說明文字；送出成功時出現綠色確認訊息，每個表單操作都有清楚的視覺結果，使用者不需猜測操作是否生效。' },
    ]
  },
  r4: {
    badge: 'R4', en: 'Design Dialogs to Yield Closure', cn: '設計有始有終的對話',
    desc: '操作序列應被組織成有明確開頭、中間與結尾的流程，讓使用者在完成一段操作後有明確的「完成感」。',
    points: [
      { icon: '✅', title: '表單送出成功確認', detail: '聯絡表單正確送出後，顯示綠色「✅ 送出成功！感謝您的意見回饋。」讓使用者明確知道這段「填寫→送出」的操作流程已完成，5 秒後自動消失。' },
      { icon: '📐', title: '明確的區塊邊界', detail: '每個 Section 有 section-label + section-title 作為起始點，充足的底部間距（100px）作為結束分隔，使用者在捲動時能感知到「這個主題結束了，下一個主題開始了」。' },
      { icon: '🎯', title: 'Tab 切換即時完成感', detail: '點選 Tab 後，舊面板立即消失，新面板帶有 fadeIn 動畫（0.35 秒）出現，明確的切換效果讓使用者感知「已完成切換到新內容」，不是模糊的狀態轉換。' },
    ]
  },
  r5: {
    badge: 'R5', en: 'Prevent Errors', cn: '預防錯誤',
    desc: '介面設計應積極避免使用者犯錯，透過清楚的標示、即時的格式驗證，讓錯誤在發生前就被阻止。',
    points: [
      { icon: '✳️', title: '必填欄位標記 *', detail: '聯絡表單的姓名與 Email 旁有紫色 * 標記必填，在使用者開始填寫前就告知哪些欄位不可省略，預防填到一半才發現漏填的挫折感。' },
      { icon: '🔍', title: 'Email 格式即時驗證', detail: '輸入 Email 時系統即時以 regex 判斷格式，使用者在完成整張表單前就能發現錯誤並修正，不必等到按送出後才知道格式不對。' },
      { icon: '🔒', title: 'Tab 互斥狀態控制', detail: '點選任一 Tab 時，程式先關閉所有其他 Tab 再開啟目標 Tab，確保同一時間永遠只有一個頁籤處於 active 狀態，防止介面出現兩個面板同時顯示的非法狀態。' },
    ]
  },
  r6: {
    badge: 'R6', en: 'Permit Easy Reversal of Actions', cn: '允許輕鬆反轉操作',
    desc: '使用者應能輕鬆取消或撤銷操作，這能降低使用者探索介面的焦慮，因為知道錯誤操作是可以復原的。',
    points: [
      { icon: '🔀', title: 'Tab 可無限次來回切換', detail: '三個 Tab 頁籤可隨時切換，沒有「只能往前」的限制，使用者想重看「遊戲介紹」隨時可切回，不需擔心切換後找不到原來的內容。' },
      { icon: '⬆️', title: '返回頂部按鈕', detail: '捲動超過 400px 後右下角出現返回頂部按鈕，讓使用者一鍵回到頁面起點重新選擇閱讀路徑，任何時候都能「從頭來過」。' },
      { icon: '📌', title: 'Sticky 全域導覽列', detail: '導覽列始終固定於頂部，任何時刻點選都能跳轉至任意區塊，使用者永遠不會「困在」某個地方，隨時可以撤銷當前位置並前往任何章節。' },
    ]
  },
  r7: {
    badge: 'R7', en: 'Keep Users in Control', cn: '讓使用者掌握主導權',
    desc: '使用者應感覺到自己在主導系統，而非被系統主導。避免任何強迫性的自動行為，讓使用者決定何時做什麼。',
    points: [
      { icon: '🖱️', title: '完全自由的捲動瀏覽', detail: '整個網頁採標準垂直捲動，無自動播放、強制跳轉或閱讀時間限制。使用者完全決定自己的閱讀速度與停留時間，系統不主導任何行為。' },
      { icon: '🚫', title: '無強制彈窗', detail: '頁面不會主動彈出任何覆蓋性廣告或提示，唯一的 Modal（本設計說明彈窗）完全由使用者主動點擊才開啟，且任何時候都可以用 ✕ 或點擊背景關閉。' },
      { icon: '📂', title: '使用者主導 Tab 內容', detail: '遊戲介紹的三個子頁面預設顯示第一個，使用者自行決定是否切換，系統不會自動輪播或強迫切換，確保使用者對看到的內容有完整控制權。' },
    ]
  },
  r8: {
    badge: 'R8', en: 'Reduce Short-Term Memory Load', cn: '降低短期記憶負荷',
    desc: '使用者的短期記憶有限，介面設計應盡量讓相關資訊同時可見，避免要求使用者記住某處的資訊後再應用到另一處。',
    points: [
      { icon: '🔵🟣', title: '持續性色彩編碼', detail: '藍色=知識王、紫色=Kahoot! 的規則在全站始終一致，使用者一旦建立此對應關係，在比較表格、評分條、分析卡片邊框等任何位置都能立即辨識，無需反覆確認。' },
      { icon: '😀', title: 'Emoji 降低認知負擔', detail: '資訊卡片以 Emoji 作為視覺標識（🏢=開發商、💰=商業模式），使用者掃視時無需記住「第幾格是什麼」，Emoji 的直觀語義自動承擔了記憶工作。' },
      { icon: '📍', title: '固定可見的導覽指引', detail: '導覽列始終固定在頁面頂端，使用者不需記住「比較分析在第幾屏」或「Shneiderman 在哪裡」，視線移至頂部即可找到所有入口，大幅降低空間記憶需求。' },
    ]
  },
};

// ── Modal 開關邏輯 ────────────────────────────
const overlay   = document.getElementById('modalOverlay');
const modalBox  = document.getElementById('modalBox');
const modalClose = document.getElementById('modalClose');

function openModal(key) {
  const data = MODAL_DATA[key];
  if (!data) return;

  document.getElementById('modalBadge').textContent = data.badge;
  document.getElementById('modalTitle').textContent = data.en;
  document.getElementById('modalCn').textContent    = data.cn;
  document.getElementById('modalDesc').textContent  = data.desc;

  const pts = document.getElementById('modalPoints');
  pts.innerHTML = data.points.map(p => `
    <div class="modal-point">
      <div class="modal-point-icon">${p.icon}</div>
      <div>
        <div class="modal-point-title">${p.title}</div>
        <p class="modal-point-detail">${p.detail}</p>
      </div>
    </div>
  `).join('');

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // reset scroll
  modalBox.scrollTop = 0;
}

function closeModal() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// 綁定 h-card
document.querySelectorAll('.h-card').forEach((card, i) => {
  const key = `h${i + 1}`;
  card.addEventListener('click', () => openModal(key));
});

// 綁定 rule-card
document.querySelectorAll('.rule-card').forEach((card, i) => {
  const key = `r${i + 1}`;
  card.addEventListener('click', () => openModal(key));
});

// ── 主題切換 ─────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
(function initTheme() {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
    themeToggle.textContent = '☀️';
  }
})();

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
themeToggle.addEventListener('click', toggleTheme);

// ── Toast 通知 ────────────────────────────────
function showToast(msg, duration = 3500) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 380);
  }, duration);
}

// ── 兩欄比較選擇器（分段按鈕）────────────────────
const segCtrlA    = document.querySelector('.seg-ctrl[data-panel="a"]');
const segCtrlB    = document.querySelector('.seg-ctrl[data-panel="b"]');
const sevenCriteria = document.querySelector('.seven-criteria');
const scoreRows   = document.querySelectorAll('.score-table tbody tr');

function getPanelVal(ctrl) {
  return ctrl.querySelector('.seg-btn.active').dataset.val;
}

// Cache initial cell HTML (g1 = col index 1, g2 = col index 2)
const rowData = [];
scoreRows.forEach(row => {
  rowData.push({ g1: row.cells[1].innerHTML, g2: row.cells[2].innerHTML });
});

function applyPanels(updateTable) {
  const a = getPanelVal(segCtrlA);
  const b = getPanelVal(segCtrlB);

  if (updateTable) {
    scoreRows.forEach((row, i) => {
      row.cells[1].innerHTML = rowData[i][a];
      row.cells[2].innerHTML = rowData[i][b];
      row.cells[1].querySelectorAll('.bar[data-w]').forEach(bar => { bar.style.width = bar.dataset.w + '%'; });
      row.cells[2].querySelectorAll('.bar[data-w]').forEach(bar => { bar.style.width = bar.dataset.w + '%'; });
    });
  }

  sevenCriteria.classList.remove('layout-default', 'layout-swap', 'layout-g1-only', 'layout-g2-only');
  if      (a === 'g1' && b === 'g2') sevenCriteria.classList.add('layout-default');
  else if (a === 'g2' && b === 'g1') sevenCriteria.classList.add('layout-swap');
  else if (a === 'g1' && b === 'g1') sevenCriteria.classList.add('layout-g1-only');
  else                                sevenCriteria.classList.add('layout-g2-only');
}

// 歷史記錄，支援 Ctrl+Z 退回
const panelHistory = [{ a: 'g1', b: 'g2' }];
const undoPanelBtn = document.getElementById('undoPanel');

// 綁定每個 seg-ctrl 的按鈕
[segCtrlA, segCtrlB].forEach(ctrl => {
  ctrl.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panelHistory.push({ a: getPanelVal(segCtrlA), b: getPanelVal(segCtrlB) });
      undoPanelBtn.disabled = false;
      applyPanels(true);
    });
  });
});

function undoPanels() {
  if (panelHistory.length <= 1) return;
  panelHistory.pop();
  const prev = panelHistory[panelHistory.length - 1];
  segCtrlA.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === prev.a));
  segCtrlB.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === prev.b));
  undoPanelBtn.disabled = panelHistory.length <= 1;
  applyPanels(true);
  showToast('↩ 已退回上一步');
}
undoPanelBtn.addEventListener('click', undoPanels);

applyPanels(false); // 初始套用版型，不重新注入 DOM（讓 barObserver 動畫正常播放）

// ── 字體大小調節 ──────────────────────────────
const FONT_LEVELS = [85, 92, 100, 108, 116];
let fontLevelIdx = 2; // 預設 100%

function applyFontSize(idx) {
  const next = Math.max(0, Math.min(FONT_LEVELS.length - 1, idx));
  const changed = next !== fontLevelIdx;
  fontLevelIdx = next;
  document.documentElement.style.fontSize = FONT_LEVELS[fontLevelIdx] + '%';
  localStorage.setItem('fontLevel', fontLevelIdx);
  document.getElementById('fontDecrease').disabled = fontLevelIdx <= 0;
  document.getElementById('fontIncrease').disabled = fontLevelIdx >= FONT_LEVELS.length - 1;
  if (changed && fontLevelIdx !== 2) showToast(`字體大小：${FONT_LEVELS[fontLevelIdx]}%`);
}

(function initFontSize() {
  const saved = parseInt(localStorage.getItem('fontLevel'));
  applyFontSize(isNaN(saved) ? 2 : saved);
})();

document.getElementById('fontDecrease').addEventListener('click', () => applyFontSize(fontLevelIdx - 1));
document.getElementById('fontIncrease').addEventListener('click', () => applyFontSize(fontLevelIdx + 1));

// ── 全域鍵盤快捷鍵 ────────────────────────────
document.addEventListener('keydown', e => {
  const inInput = e.target.matches('input, textarea, select');
  if (e.shiftKey && e.code === 'KeyD' && !inInput) {
    e.preventDefault();
    toggleTheme();
  }
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !inInput) {
    e.preventDefault();
    undoPanels();
  }
  // 字體大小：Shift+= 放大、Shift+- 縮小、Shift+0 重設
  if (e.shiftKey && (e.code === 'Equal' || e.code === 'NumpadAdd') && !inInput) {
    e.preventDefault();
    applyFontSize(fontLevelIdx + 1);
  }
  if (e.shiftKey && (e.code === 'Minus' || e.code === 'NumpadSubtract') && !inInput) {
    e.preventDefault();
    applyFontSize(fontLevelIdx - 1);
  }
  if (e.shiftKey && e.code === 'Digit0' && !inInput) {
    e.preventDefault();
    applyFontSize(2);
    showToast('字體大小已重設');
  }
});

// ── 統一滾動事件 ─────────────────────────────
function onScroll() {
  updateProgress();
  updateNav();
  updateBackTop();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateNav);

// 初始化
onScroll();

