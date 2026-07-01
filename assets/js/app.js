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
        var label = el.getAttribute('data-clickable);
        if (label) window.awShowToast(label);
      });
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
    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
