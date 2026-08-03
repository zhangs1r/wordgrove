/* app.js — 入口 */
document.addEventListener('DOMContentLoaded', () => {
  TTS.init();
  API.loadConfig();
  UI.init();
  // 🔴 v1.2.1：等原生版本号就绪再自动检查更新（否则读 HTML 初始版本号误报"有新版本"）
  initVersion().then(() => UI.checkUpdate(true));

  // 复盘按钮
  document.getElementById('chatReviewBtn').addEventListener('click', () => UI.startReview());
});

/* 设置页版本号：从原生 app 信息读取，跟随 build.gradle 自动更新
   🔴 v1.2.1：返回 Promise——checkUpdate 必须等版本号就绪再比较（否则读到 HTML 初始值会误报更新） */
function initVersion() {
  return new Promise((resolve) => {
    try {
      if (window.Capacitor?.Plugins?.App) {
        window.Capacitor.Plugins.App.getInfo().then(info => {
          const label = document.getElementById('versionLabel');
          if (label && info && info.version) label.textContent = 'v' + info.version;
          resolve();
        }).catch(() => resolve());
        return;
      }
    } catch {}
    resolve();
  });
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
    } else if (vh < lastVh - 80) {
      // 键盘弹起：聊天区滚到最新消息
      const chatArea = document.getElementById('chatArea');
      if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }
    lastVh = vh;
  });
  // 输入框聚焦时也滚到最新
  document.addEventListener('focusin', (e) => {
    if (e.target && e.target.id === 'chatInput') {
      const chatArea = document.getElementById('chatArea');
      if (chatArea) setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 300);
    }
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
