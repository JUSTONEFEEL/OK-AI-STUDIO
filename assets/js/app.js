/* ============================================================
   AI Workspace — shared application behaviours
   Handles: theme persistence, mobile sidebar drawer, active nav
   highlighting, notification dropdown, and small interactions
   shared across every page.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'ai-workspace-theme';

  /* ---------- Theme (dark default per design) ---------- */
  function applyTheme(theme) {
    var html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    } else {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    }
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? '切换到深色模式' : '切换到浅色模式');
      var sun = btn.querySelector('[data-theme-icon-sun]');
      var moon = btn.querySelector('[data-theme-icon-moon]');
      if (sun && moon) {
        sun.style.display = theme === 'light' ? 'none' : 'inline-flex';
        moon.style.display = theme === 'light' ? 'inline-flex' : 'none';
      }
    }
  }

  function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    // Default to dark (matches the design spec)
    applyTheme(saved === 'light' ? 'light' : 'dark');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      });
    }
  }

  /* ---------- Mobile sidebar drawer ---------- */
  function initDrawer() {
    var sidebar = document.getElementById('app-sidebar');
    var backdrop = document.getElementById('app-backdrop');
    var toggle = document.getElementById('menu-toggle');
    if (!sidebar || !backdrop || !toggle) return;

    function open() {
      sidebar.classList.add('is-open');
      backdrop.classList.add('is-visible');
      toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function isOpen() { return sidebar.classList.contains('is-open'); }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close();
    });
    // Close drawer after navigating on small screens
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a[data-nav-key]') && window.innerWidth < 1024) close();
    });
    // Reset on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && isOpen()) close();
    });
  }

  /* ---------- Active nav highlighting ---------- */
  function initActiveNav() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    var links = document.querySelectorAll('a[data-nav-key]');
    links.forEach(function (a) {
      if (a.getAttribute('data-nav-key') === page) {
        a.setAttribute('data-active', 'true');
      } else {
        a.removeAttribute('data-active');
      }
    });
  }

  /* ---------- Notification dropdown ---------- */
  function initNotifications() {
    var btn = document.getElementById('notif-btn');
    var dropdown = document.getElementById('notif-dropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });
  }

  /* ---------- Header search (cosmetic focus, no real index) ---------- */
  function initSearch() {
    var inputs = document.querySelectorAll('input[data-role="search"]');
    inputs.forEach(function (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var val = input.value.trim();
          if (!val) return;
          // No backend; surface a transient hint instead.
          input.blur();
          if (window.awShowToast) window.awShowToast('搜索：' + val);
        }
      });
    });
  }

  /* ---------- Lightweight toast ---------- */
  window.awShowToast = function (msg) {
    var existing = document.getElementById('aw-toast');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 'aw-toast';
    el.textContent = msg;
    el.setAttribute('role', 'status');
    el.style.cssText =
      'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);' +
      'background:var(--surface-elevated);color:var(--text-heading);' +
      'border:1px solid var(--border-default);border-radius:var(--radius-md);' +
      'padding:10px 16px;font-size:13px;font-family:var(--font-heading);' +
      'box-shadow:var(--shadow-float);z-index:100;opacity:0;' +
      'transition:opacity 200ms ease, transform 200ms ease;';
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(-4px)';
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(function () { el.remove(); }, 220);
    }, 1800);
  };

  /* ---------- Card click → toast (for clickable cards without href) ---------- */
  function initCardClicks() {
    document.querySelectorAll('[data-clickable]').forEach(function (el) {
      el.addEventListener('click', function () {
        var label = el.getAttribute('data-clickable');
        if (label) window.awShowToast(label);
      });
    });
  }

  /* ---------- User profile dropdown ---------- */
  var userDropdown = null;
  var userDropdownTimeout = null;
  var logoutModal = null;

  function getUserInfo() {
    var name = localStorage.getItem('user_name') || '创作者小明';
    var uid = localStorage.getItem('user_id') || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    return { name: name, uid: uid };
  }

  function formatBalance(data) {
    if (!data) return '¥0.00';
    var balance = data.balance !== undefined ? data.balance : (data.data && data.data.balance !== undefined ? data.data.balance : null);
    if (balance === null || balance === undefined) {
      if (typeof data === 'number') return '¥' + data.toFixed(2);
      return '¥0.00';
    }
    return '¥' + Number(balance).toFixed(2);
  }

  function createUserDropdown(triggerBtn) {
    var info = getUserInfo();
    var dropdown = document.createElement('div');
    dropdown.id = 'user-dropdown';
    dropdown.style.cssText =
      'position:absolute;top:calc(100% + 8px);right:0;min-width:280px;' +
      'background:var(--surface-elevated);border:1px solid var(--border-default);' +
      'border-radius:var(--radius-lg);box-shadow:var(--shadow-float);' +
      'z-index:50;opacity:0;pointer-events:none;' +
      'transform:translateY(-4px);transition:opacity 150ms ease, transform 150ms ease;';

    dropdown.innerHTML =
      '<div style="padding:20px;border-bottom:1px solid var(--border-subtle);">' +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">' +
      '<div style="width:56px;height:56px;border-radius:50%;background:var(--color-primary-light);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;font-family:var(--font-heading);flex-shrink:0;">' + info.name.charAt(0).toUpperCase() + '</div>' +
      '<div style="min-width:0;">' +
      '<p style="font-size:18px;font-weight:600;font-family:var(--font-heading);color:var(--text-heading);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + info.name + '</p>' +
      '</div></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface-inset);border-radius:var(--radius-md);">' +
      '<span id="user-uid" style="font-size:13px;font-family:monospace;color:var(--text-muted);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + info.uid.slice(0, 24) + '...</span>' +
      '<button id="copy-uid-btn" title="复制" style="background:none;border:none;cursor:pointer;padding:4px;border-radius:4px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;" onmouseover="this.style.backgroundColor=\'var(--surface-hover)\'" onmouseout="this.style.backgroundColor=\'transparent\'">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      '</button></div></div>' +
      '<div style="padding:12px 20px;border-bottom:1px solid var(--border-subtle);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '<span style="font-size:14px;font-family:var(--font-body);color:var(--text-secondary);">个人钱包剩余</span>' +
      '<span id="user-balance-personal" style="font-size:18px;font-weight:700;font-family:var(--font-heading);color:var(--text-heading);">加载中...</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;">' +
      '<span style="font-size:14px;font-family:var(--font-body);color:var(--text-secondary);">项目钱包剩余</span>' +
      '<span style="font-size:18px;font-weight:700;font-family:var(--font-heading);color:var(--text-heading);">¥0.00</span>' +
      '</div></div>' +
      '<div style="padding:8px;border-bottom:1px solid var(--border-subtle);">' +
      '<button data-user-action="profile" class="user-menu-btn" style="width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:none;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:15px;font-family:var(--font-heading);color:var(--text-body);text-align:left;transition:background-color 150ms ease;" onmouseover="this.style.backgroundColor=\'var(--surface-hover)\'" onmouseout="this.style.backgroundColor=\'transparent\'">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);flex-shrink:0;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      '个人资料</button>' +
      '<button data-user-action="learning" class="user-menu-btn" style="width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:none;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:15px;font-family:var(--font-heading);color:var(--text-body);text-align:left;transition:background-color 150ms ease;" onmouseover="this.style.backgroundColor=\'var(--surface-hover)\'" onmouseout="this.style.backgroundColor=\'transparent\'">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);flex-shrink:0;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
      '学习记录</button>' +
      '<button data-user-action="creation" class="user-menu-btn" style="width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:none;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:15px;font-family:var(--font-heading);color:var(--text-body);text-align:left;transition:background-color 150ms ease;" onmouseover="this.style.backgroundColor=\'var(--surface-hover)\'" onmouseout="this.style.backgroundColor=\'transparent\'">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);flex-shrink:0;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
      '创作记录</button>' +
      '</div>' +
      '<div style="padding:8px;">' +
      '<button id="logout-btn" style="width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;background:none;border:none;border-radius:var(--radius-md);cursor:pointer;font-size:15px;font-family:var(--font-heading);color:#ef4444;text-align:left;transition:background-color 150ms ease;" onmouseover="this.style.backgroundColor=\'rgba(239,68,68,0.08)\'" onmouseout="this.style.backgroundColor=\'transparent\'">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
      '退出账号</button>' +
      '</div>';

    return dropdown;
  }

  function showUserDropdown() {
    if (!userDropdown) return;
    clearTimeout(userDropdownTimeout);
    userDropdown.style.opacity = '1';
    userDropdown.style.pointerEvents = 'auto';
    userDropdown.style.transform = 'translateY(0)';
    loadUserBalance();
  }

  function hideUserDropdown() {
    if (!userDropdown) return;
    userDropdownTimeout = setTimeout(function () {
      if (!userDropdown) return;
      userDropdown.style.opacity = '0';
      userDropdown.style.pointerEvents = 'none';
      userDropdown.style.transform = 'translateY(-4px)';
    }, 200);
  }

  function loadUserBalance() {
    var el = document.getElementById('user-balance-personal');
    if (!el) return;
    el.textContent = '加载中...';
    try {
      var config = JSON.parse(localStorage.getItem('ai_config') || '{}');
      if (config.api_key && typeof ai !== 'undefined' && typeof ai.getBalance === 'function') {
        ai.baseURL = config.base_url || ai.baseURL;
        ai.apiKey = config.api_key;
        ai.getBalance().then(function (data) {
          if (el) el.textContent = formatBalance(data);
        }).catch(function () {
          if (el) el.textContent = '¥0.00';
        });
      } else {
        el.textContent = '¥0.00';
      }
    } catch (e) {
      el.textContent = '¥0.00';
    }
  }

  function createLogoutModal() {
    var modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.5);z-index:200;display:flex;' +
      'align-items:center;justify-content:center;opacity:0;' +
      'pointer-events:none;transition:opacity 200ms ease;';

    modal.innerHTML =
      '<div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:24px;max-width:400px;width:90%;box-shadow:var(--shadow-float);transform:scale(0.95);transition:transform 200ms ease;">' +
      '<h3 style="font-size:18px;font-weight:600;font-family:var(--font-heading);color:var(--text-heading);margin:0 0 8px 0;">确认退出账号？</h3>' +
      '<p style="font-size:14px;font-family:var(--font-body);color:var(--text-secondary);margin:0 0 24px 0;line-height:1.6;">退出后您的会话数据和本地配置将被清除，下次登录需要重新配置。</p>' +
      '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
      '<button id="logout-cancel" style="padding:10px 20px;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--surface-card);color:var(--text-body);font-size:14px;font-family:var(--font-heading);cursor:pointer;transition:background-color 150ms ease;" onmouseover="this.style.backgroundColor=\'var(--surface-hover)\'" onmouseout="this.style.backgroundColor=\'var(--surface-card)\'">取消</button>' +
      '<button id="logout-confirm" style="padding:10px 20px;border-radius:var(--radius-md);border:none;background:#ef4444;color:#fff;font-size:14px;font-family:var(--font-heading);cursor:pointer;transition:opacity 150ms ease;" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">确认退出</button>' +
      '</div></div>';

    return modal;
  }

  function showLogoutModal() {
    if (!logoutModal) {
      logoutModal = createLogoutModal();
      document.body.appendChild(logoutModal);
      var cancelBtn = logoutModal.querySelector('#logout-cancel');
      var confirmBtn = logoutModal.querySelector('#logout-confirm');
      if (cancelBtn) cancelBtn.addEventListener('click', hideLogoutModal);
      if (confirmBtn) confirmBtn.addEventListener('click', function () {
        localStorage.removeItem('ai_config');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_id');
        localStorage.removeItem('nav_favorites');
        hideLogoutModal();
        if (window.awShowToast) window.awShowToast('已退出账号');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 500);
      });
      logoutModal.addEventListener('click', function (e) {
        if (e.target === logoutModal) hideLogoutModal();
      });
    }
    requestAnimationFrame(function () {
      logoutModal.style.opacity = '1';
      logoutModal.style.pointerEvents = 'auto';
      var content = logoutModal.querySelector('div');
      if (content) content.style.transform = 'scale(1)';
    });
  }

  function hideLogoutModal() {
    if (!logoutModal) return;
    logoutModal.style.opacity = '0';
    logoutModal.style.pointerEvents = 'none';
    var content = logoutModal.querySelector('div');
    if (content) content.style.transform = 'scale(0.95)';
  }

  function initUserDropdown() {
    var triggerBtn = document.querySelector('button[aria-label="用户菜单"]');
    if (!triggerBtn) return;

    var parent = triggerBtn.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';

    userDropdown = createUserDropdown(triggerBtn);
    parent.appendChild(userDropdown);

    triggerBtn.addEventListener('mouseenter', showUserDropdown);
    triggerBtn.addEventListener('mouseleave', hideUserDropdown);
    userDropdown.addEventListener('mouseenter', function () { clearTimeout(userDropdownTimeout); });
    userDropdown.addEventListener('mouseleave', hideUserDropdown);

    var copyBtn = userDropdown.querySelector('#copy-uid-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var info = getUserInfo();
        navigator.clipboard.writeText(info.uid).then(function () {
          if (window.awShowToast) window.awShowToast('已复制用户ID');
        });
      });
    }

    var logoutBtn = userDropdown.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showLogoutModal();
        hideUserDropdown();
      });
    }

    var menuBtns = userDropdown.querySelectorAll('[data-user-action]');
    menuBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-user-action');
        if (window.awShowToast) {
          var labels = { profile: '个人资料', learning: '学习记录', creation: '创作记录' };
          window.awShowToast(labels[action] || '功能开发中');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && logoutModal && logoutModal.style.opacity === '1') hideLogoutModal();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme();
    initActiveNav();
    initDrawer();
    initNotifications();
    initSearch();
    initCardClicks();
    initUserDropdown();
    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
