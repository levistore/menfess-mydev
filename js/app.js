// =============================================
// Main SPA Router & App Init - Menfess PWA
// =============================================

import { Navbar, Toast } from './components.js';

// Route definitions: pattern -> page module path
const routes = [
  { pattern: /^#\/login$/,              module: './pages/login.js',            auth: false },
  { pattern: /^#\/register$/,           module: './pages/register.js',         auth: false },
  { pattern: /^#\/home$/,               module: './pages/home.js',             auth: true  },
  { pattern: /^#\/confess$/,            module: './pages/confess.js',          auth: true  },
  { pattern: /^#\/inbox$/,              module: './pages/inbox.js',            auth: true  },
  { pattern: /^#\/chat\/(.+)$/,         module: './pages/chat.js',             auth: true  },
  { pattern: /^#\/profile$/,            module: './pages/profile.js',          auth: true  },
  { pattern: /^#\/settings$/,           module: './pages/settings.js',         auth: true  },
  { pattern: /^#\/c\/(.+)$/,            module: './pages/confession-view.js',  auth: false }
];

// Pages that should NOT show navbar
const noNavRoutes = ['#/login', '#/register'];

// Active page mapping for Navbar
const activePageMap = {
  '#/home': 'home',
  '#/confess': 'confess',
  '#/inbox': 'inbox',
  '#/profile': 'profile',
  '#/settings': 'profile'
};

/**
 * Navigate to a hash route
 */
export function navigate(hash) {
  window.location.hash = hash;
}

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastHtml = Toast(message, type);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = toastHtml;
  const toastEl = wrapper.firstElementChild;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(100%)';
    toastEl.style.transition = 'all 0.3s ease';
    setTimeout(() => toastEl.remove(), 300);
  }, 3000);
}

/**
 * Toggle dark/light theme
 */
export function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/**
 * Core router function
 */
async function router() {
  const hash = window.location.hash || '#/login';
  const token = localStorage.getItem('token');

  // Find matching route
  let matched = null;
  let params = [];

  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      matched = route;
      params = match.slice(1); // captured groups
      break;
    }
  }

  // Fallback to login
  if (!matched) {
    navigate('#/login');
    return;
  }

  // Auth guard: redirect to login if not authenticated on protected routes
  if (matched.auth && !token) {
    navigate('#/login');
    return;
  }

  // Determine active page for navbar
  const baseHash = hash.split('?')[0].split('/').slice(0, 2).join('/');
  let activePage = activePageMap[baseHash] || '';
  if (hash.startsWith('#/chat/')) activePage = 'chat';

  const appEl = document.getElementById('app');
  if (!appEl) return;

  // Show loading state
  appEl.innerHTML = `
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin h-8 w-8 border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full"></div>
    </div>
  `;

  try {
    // Dynamic import of page module
    const pageModule = await import(matched.module);
    const pageFn = pageModule.default;

    if (typeof pageFn !== 'function') {
      throw new Error(`Page module ${matched.module} does not export a default function`);
    }

    const { html, scripts } = pageFn(...params);

    // Build full page HTML
    const showNavbar = token && !noNavRoutes.includes(hash.split('?')[0]);
    const navbarHtml = showNavbar ? Navbar(activePage) : '';

    appEl.innerHTML = `
      ${navbarHtml}
      <div class="page-content ${showNavbar ? 'pb-20 md:pb-0 md:pl-64' : ''} animate-page-enter">
        ${html}
      </div>
    `;

    // Execute page scripts after DOM update
    if (typeof scripts === 'function') {
      requestAnimationFrame(() => scripts());
    }

  } catch (err) {
    console.error('Router error:', err);
    appEl.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <h1 class="text-4xl font-black uppercase text-red-500">Error</h1>
        <p class="text-gray-600 dark:text-gray-400 font-bold">Gagal memuat halaman.</p>
        <button onclick="location.hash='#/home'" class="mt-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase px-6 py-3 rounded-lg border-4 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Kembali ke Home
        </button>
      </div>
    `;
  }
}

/**
 * Apply saved theme preference
 */
function applyTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Hide the loading screen with fade
 */
function hideLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  if (!loader) return;

  loader.style.transition = 'opacity 0.4s ease';
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 400);
}

/**
 * Register service worker
 */
function registerServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  } catch (e) {
    console.warn('SW not supported:', e);
  }
}

// ---- Initialize on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  registerServiceWorker();

  // Initial route
  if (!window.location.hash) {
    window.location.hash = '#/login';
  } else {
    router();
  }

  // Hide loading screen after brief delay
  setTimeout(hideLoadingScreen, 300);
});

// Listen for hash changes
window.addEventListener('hashchange', router);

export default { navigate, showToast, toggleTheme };