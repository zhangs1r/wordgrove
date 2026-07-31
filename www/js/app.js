/* app.js — 入口 */
document.addEventListener('DOMContentLoaded', () => {
  TTS.init();
  API.loadConfig();
  UI.init();
  initVersion();

  // 复盘按钮
  document.getElementById('chatReviewBtn').addEventListener('click', () => UI.startReview());
});

/* 设置页版本号：从原生 app 信息读取，跟随 build.gradle 自动更新 */
function initVersion() {
  try {
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.getInfo().then(info => {
        const label = document.getElementById('versionLabel');
        if (label && info && info.version) label.textContent = 'v' + info.version;
      }).catch(() => {});
    }
  } catch {}
}

/* Android 键盘弹起/收起后布局恢复（WebView 视口高度 bug 兜底） */
function initKeyboardFix() {
  if (!('visualViewport' in window)) return;
  let lastVh = window.visualViewport.height;
  window.visualViewport.addEventListener('resize', () => {
    const vh = window.visualViewport.height;
    if (vh > lastVh + 80) {
      // 键盘收起：强制重排，恢复滚动位置
      document.body.style.height = '';
      const main = document.getElementById('main');
      if (main) main.style.height = '';
      const chatArea = document.getElementById('chatArea');
      if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }
    lastVh = vh;
  });
}

/* 状态栏高度兜底：edge-to-edge 下给 header 补上状态栏内边距 */
function initStatusBarPad() {
  try {
    if (window.Capacitor?.Plugins?.StatusBar) {
      window.Capacitor.Plugins.StatusBar.getInfo().then(info => {
        const h = info && info.height ? info.height : 0;
        if (h > 0) {
          document.documentElement.style.setProperty('--status-h', h + 'px');
          const header = document.querySelector('.app-header');
          if (header) header.style.paddingTop = `calc(${h}px + 10px)`;
        }
      }).catch(() => {});
    }
  } catch {}
}

initKeyboardFix();
initStatusBarPad();
