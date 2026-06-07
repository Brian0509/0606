#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_variants.py (v2) — 從 5 個原始 HTML 產生男 / 女版本，原始檔不動。"""
import re, pathlib

BASE = pathlib.Path(__file__).parent
PAGES = ["index", "zhishiwang", "kahoot", "compare", "qa"]

SEARCH_BOX = '''<form class="site-search" id="siteSearchForm" role="search">
        <input id="siteSearchInput" type="search" placeholder="搜尋本頁關鍵字…" aria-label="站內搜尋" />
        <span class="search-count" id="siteSearchCount"></span>
        <button type="submit" aria-label="搜尋">🔍</button>
      </form>
      <div class="font-ctrl">'''

SHIFT_D_CARD = '''<div class="shortcut-card reveal">
          <div class="shortcut-key">Shift + D</div>
          <div class="shortcut-desc">
            <h4>切換深色 / 淺色主題</h4>
            <p>點擊右上角 🌙 按鈕，或按 Shift+D 快速切換，偏好會自動儲存。</p>
          </div>
        </div>'''
SEARCH_CARD = '''<div class="shortcut-card reveal">
          <div class="shortcut-key">🔍 站內搜尋</div>
          <div class="shortcut-desc">
            <h4>搜尋本頁關鍵字</h4>
            <p>於導覽列右上角的搜尋欄輸入關鍵字，頁面上所有相符文字會自動高亮；再次按下搜尋可逐一跳到下一個結果。</p>
          </div>
        </div>'''

STAT_BAND = {
    "zhishiwang": '''
      <div class="stat-band">
        <div class="stat-box"><div class="stat-num">70萬+</div><div class="stat-label">累積下載次數</div></div>
        <div class="stat-box alt"><div class="stat-num">10秒</div><div class="stat-label">每題限時搶答</div></div>
        <div class="stat-box"><div class="stat-num">6大</div><div class="stat-label">知識領域題庫</div></div>
        <div class="stat-box alt"><div class="stat-num">No.1</div><div class="stat-label">App Store 文字遊戲冠軍</div></div>
      </div>''',
    "kahoot": '''
      <div class="stat-band">
        <div class="stat-box alt"><div class="stat-num">3億+</div><div class="stat-label">全球註冊用戶</div></div>
        <div class="stat-box"><div class="stat-num">200+</div><div class="stat-label">支援國家地區</div></div>
        <div class="stat-box alt"><div class="stat-num">2013</div><div class="stat-label">創立於挪威</div></div>
        <div class="stat-box"><div class="stat-num">90M+</div><div class="stat-label">每月活躍課堂</div></div>
      </div>''',
}
HERO_SUB = {
    "zhishiwang": '全台最火熱的大腦競技場，由台灣獨立開發商 BRAVE KNIGHT 研發，累積下載超過 70 萬次',
    "kahoot":     '全球最受歡迎的遊戲化學習平台，2013 年創立於挪威，全球超過 3 億用戶',
}
HERO_SUB_FEMALE = {
    "zhishiwang": '一款結合即時對戰與多元知識的益智問答遊戲，用輕鬆有趣的搶答節奏，邊玩邊累積生活與學科知識。',
    "kahoot":     '把學習變成遊戲的互動問答平台，老師出題、大家用手機搶答，讓課堂與聚會都充滿參與感與樂趣。',
}

FULLCHAT_SECTION = '''<!-- 整頁真人客服 -->
  <section class="fullchat-section">
    <div class="fullchat-wrap">
      <div class="fullchat">
        <div class="fc-head">
          <div class="fc-avatar">🙋\u200d♀️</div>
          <div>
            <strong>真人客服 · 小知</strong>
            <span class="fc-status">● 線上服務中　|　平均回覆時間 1 分鐘</span>
          </div>
        </div>
        <div class="fc-body" id="fcBody">
          <div class="fc-msg fc-msg-bot">您好！我是真人客服小知 😊 關於《知識王 LIVE》與《Kahoot!》的任何問題，都可以直接問我，由真人為您一對一解答。</div>
          <div class="fc-quick">
            <button class="fc-chip">想了解兩款遊戲的差異</button>
            <button class="fc-chip">課堂使用建議</button>
            <button class="fc-chip">付費方案問題</button>
            <button class="fc-chip">如何開始遊玩</button>
          </div>
        </div>
        <form class="fc-input" id="fcForm">
          <input type="text" id="fcText" placeholder="輸入訊息，真人客服將為您回覆…" autocomplete="off" />
          <button type="submit" aria-label="送出">➤</button>
        </form>
      </div>
    </div>
  </section>

  '''
FULLCHAT_SCRIPT = '''<script>
    'use strict';
    (function () {
      const body = document.getElementById('fcBody');
      const form = document.getElementById('fcForm');
      const input = document.getElementById('fcText');
      function add(text, who) {
        const m = document.createElement('div');
        m.className = 'fc-msg ' + (who === 'user' ? 'fc-msg-user' : 'fc-msg-bot');
        m.textContent = text;
        body.appendChild(m);
        body.scrollTop = body.scrollHeight;
      }
      function userSay(text) {
        add(text, 'user');
        setTimeout(() => add('收到您的問題！真人客服將盡快為您個人化回覆 🙏（此為展示用對話）', 'bot'), 700);
      }
      document.querySelectorAll('.fc-chip').forEach(c =>
        c.addEventListener('click', () => userSay(c.textContent)));
      form.addEventListener('submit', e => {
        e.preventDefault();
        const v = input.value.trim();
        if (!v) return;
        userSay(v);
        input.value = '';
      });
    })();
  </script>'''

def rewrite_links(html, v):
    for p in PAGES:
        html = html.replace(f'href="{p}.html"', f'href="{p}-{v}.html"')
    return html
def add_html_class(html, v):
    return html.replace('<html lang="zh-TW" class="light">', f'<html lang="zh-TW" class="light {v}">')
def inject_theme_css(html, v):
    return html.replace('<link rel="stylesheet" href="style.css" />',
        f'<link rel="stylesheet" href="style.css" />\n  <link rel="stylesheet" href="theme-{v}.css" />')
def swap_js(html, v):
    return html.replace('<script src="common.js"></script>', f'<script src="common-{v}.js"></script>')
def add_version_banner(html, v):
    label = "♂ 男生版（功能 / 數據導向）" if v == "male" else "♀ 女生版（美觀 / 簡潔導向）"
    bg = "#1565d8" if v == "male" else "linear-gradient(90deg,#2196f3,#9c4dff)"
    banner = (f'<div style="position:fixed;left:12px;bottom:12px;z-index:1500;font-size:.72rem;'
              f'font-weight:700;color:#fff;background:{bg};padding:6px 14px;border-radius:20px;'
              f'box-shadow:0 4px 16px rgba(0,0,0,.25);">{label}</div>')
    return html.replace('</body>', banner + '\n</body>')
def remove_shortcut_section(html):
    return re.sub(r'\s*<!-- ── 快捷功能指南 ── -->.*?</section>', '', html, count=1, flags=re.DOTALL)

def build(page, v):
    html = (BASE / f"{page}.html").read_text(encoding="utf-8")
    html = rewrite_links(html, v); html = add_html_class(html, v)
    html = inject_theme_css(html, v); html = swap_js(html, v)
    if v == "male":
        html = html.replace('<div class="font-ctrl">', SEARCH_BOX, 1)
        if page == "index":
            html = html.replace(SHIFT_D_CARD, SEARCH_CARD, 1)
        if page in STAT_BAND:
            sub = f'<p class="page-hero-sub">{HERO_SUB[page]}</p>'
            html = html.replace(sub, sub + STAT_BAND[page], 1)
    if v == "female":
        if page == "index":
            html = remove_shortcut_section(html)
        if page in HERO_SUB_FEMALE:
            html = html.replace(HERO_SUB[page], HERO_SUB_FEMALE[page], 1)
        if page == "qa":
            html = html.replace('有任何關於兩款遊戲的問題？查看常見問題或直接留言給我們',
                                '有任何關於兩款遊戲的問題？直接與真人客服對話，我們即時為您一對一解答')
            html = re.sub(r'<!-- Q&A Section -->.*?(?=<!-- Footer -->)', FULLCHAT_SECTION, html, count=1, flags=re.DOTALL)
            html = re.sub(r'<!-- 確認送出 Modal -->.*?(?=<div id="toastContainer">)', '', html, count=1, flags=re.DOTALL)
            html = re.sub(r"<script>\s*\n\s*'use strict';.*?</script>", lambda m: FULLCHAT_SCRIPT, html, count=1, flags=re.DOTALL)
    html = add_version_banner(html, v)
    dest = BASE / f"{page}-{v}.html"
    dest.write_text(html, encoding="utf-8")
    return dest.name, len(html)

if __name__ == "__main__":
    for v in ("male", "female"):
        for page in PAGES:
            name, size = build(page, v)
            print(f"  ✓ {name:28s} ({size:,} bytes)")
    print("done.")
