// =============================================
// Reusable UI Components - Menfess PWA
// =============================================

import {
  IconHome,
  IconSend,
  IconInbox,
  IconChat,
  IconProfile,
  IconClose
} from './svg-icons.js';

/**
 * Bottom nav (mobile) / Sidebar (desktop).
 * activePage: 'home' | 'confess' | 'inbox' | 'chat' | 'profile'
 */
export function Navbar(activePage = '') {
  const items = [
    { id: 'home', label: 'Home', href: '#/home', icon: IconHome },
    { id: 'confess', label: 'Kirim', href: '#/confess', icon: IconSend },
    { id: 'inbox', label: 'Inbox', href: '#/inbox', icon: IconInbox },
    { id: 'chat', label: 'Chat', href: '#/inbox?filter=chat', icon: IconChat },
    { id: 'profile', label: 'Profile', href: '#/profile', icon: IconProfile }
  ];

  const navItems = items.map(item => {
    const isActive = activePage === item.id;
    return `
      <a href="${item.href}" class="nav-item flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }">
        ${item.icon(20)}
        <span class="text-xs font-bold uppercase tracking-wide">${item.label}</span>
        <span class="nav-badge hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-badge="${item.id}"></span>
      </a>
    `;
  }).join('');

  // Mobile: fixed bottom nav
  // Desktop (md+): fixed left sidebar
  return `
    <nav class="navbar fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t-4 border-black dark:border-white shadow-[0_-4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_-4px_0_0_rgba(255,255,255,1)] md:top-0 md:right-auto md:w-64 md:h-screen md:border-t-0 md:border-r-4 md:shadow-[4px_0_0_0_rgba(0,0,0,1)] dark:md:shadow-[4px_0_0_0_rgba(255,255,255,1)]">
      <!-- Mobile layout -->
      <div class="flex items-center justify-around px-2 py-1 md:hidden">
        ${navItems}
      </div>
      <!-- Desktop layout -->
      <div class="hidden md:flex flex-col gap-2 p-4">
        <h1 class="text-2xl font-black uppercase tracking-tight mb-4 border-b-4 border-black dark:border-white pb-3">Menfess</h1>
        ${items.map(item => {
          const isActive = activePage === item.id;
          return `
            <a href="${item.href}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
              isActive
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }">
              ${item.icon(20)}
              <span class="text-sm font-bold uppercase tracking-wide">${item.label}</span>
              <span class="nav-badge hidden ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 items-center justify-center" data-badge="${item.id}"></span>
            </a>
          `;
        }).join('')}
      </div>
    </nav>
  `;
}

/**
 * Centered loading spinner with text
 */
export function LoadingSpinner() {
  return `
    <div class="flex flex-col items-center justify-center py-16 gap-4">
      <svg class="animate-spin h-10 w-10 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">Memuat...</span>
    </div>
  `;
}

/**
 * Skeleton loading cards with shimmer animation
 */
export function SkeletonCard(count = 3) {
  const card = `
    <div class="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-lg p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
      <div class="animate-pulse space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  `;
  return `<div class="space-y-4">${card.repeat(count)}</div>`;
}

/**
 * Toast notification div
 * Types: success, error, info, warning
 */
export function Toast(message, type = 'info') {
  const styles = {
    success: 'bg-green-400 border-black text-black',
    error: 'bg-red-400 border-black text-black',
    info: 'bg-blue-300 border-black text-black',
    warning: 'bg-yellow-300 border-black text-black'
  };

  const style = styles[type] || styles.info;

  return `
    <div class="toast-item ${style} border-4 rounded-lg px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-sm animate-slide-in flex items-center justify-between gap-3 max-w-sm">
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 transition-opacity">
        ${IconClose(16)}
      </button>
    </div>
  `;
}

/**
 * Confession card with Neo Brutalism styling
 */
export function ConfessCard(confession) {
  const statusBadge = {
    unread: '<span class="bg-blue-400 text-black text-xs font-bold uppercase px-2 py-0.5 rounded border-2 border-black">Belum Dibaca</span>',
    read: '<span class="bg-gray-300 text-black text-xs font-bold uppercase px-2 py-0.5 rounded border-2 border-black">Dibaca</span>',
    replied: '<span class="bg-green-400 text-black text-xs font-bold uppercase px-2 py-0.5 rounded border-2 border-black">Dibalas</span>'
  };

  const badge = statusBadge[confession.status] || statusBadge.unread;
  const sender = confession.senderName || 'Anonim';
  const preview = confession.message
    ? (confession.message.length > 100 ? confession.message.substring(0, 100) + '...' : confession.message)
    : '';
  const time = confession.createdAt
    ? new Date(confession.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  return `
    <div class="confess-card bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-lg p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" data-confession-id="${confession._id || confession.id || ''}">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-sm uppercase">${sender}</span>
        ${badge}
      </div>
      <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">${preview}</p>
      <span class="text-xs text-gray-500 dark:text-gray-500 font-mono">${time}</span>
    </div>
  `;
}

/**
 * Chat bubble - sent (own) or received
 */
export function ChatBubble(reply, isOwn = false) {
  const time = reply.createdAt
    ? new Date(reply.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isOwn) {
    return `
      <div class="flex justify-end mb-3">
        <div class="bubble-sent bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white rounded-lg rounded-tr-none px-4 py-2 max-w-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,1)]">
          <p class="text-sm">${reply.message || ''}</p>
          <span class="text-xs opacity-60 font-mono block text-right mt-1">${time}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="flex justify-start mb-3">
      <div class="bubble-received bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-lg rounded-tl-none px-4 py-2 max-w-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,1)]">
        <p class="text-sm text-gray-900 dark:text-gray-100">${reply.message || ''}</p>
        <span class="text-xs text-gray-500 font-mono block text-right mt-1">${time}</span>
      </div>
    </div>
  `;
}

/**
 * Empty state placeholder
 */
export function EmptyState(iconSvg, message) {
  return `
    <div class="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div class="text-gray-300 dark:text-gray-600">${iconSvg}</div>
      <p class="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide text-sm">${message}</p>
    </div>
  `;
}

/**
 * Modal with backdrop
 * actions: [{ label, class, id }]
 */
export function Modal(title, contentHtml, actions = []) {
  const actionButtons = actions.map(action => `
    <button id="${action.id || ''}" class="${action.class || 'bg-gray-200 border-4 border-black text-black font-bold uppercase px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors'}">${action.label}</button>
  `).join('');

  return `
    <div class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onclick="if(event.target===this)this.remove()">
      <div class="modal-content bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] w-full max-w-md overflow-hidden animate-scale-in">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b-4 border-black dark:border-white">
          <h2 class="text-lg font-black uppercase tracking-tight">${title}</h2>
          <button onclick="this.closest('.modal-backdrop').remove()" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
            ${IconClose(20)}
          </button>
        </div>
        <!-- Body -->
        <div class="px-5 py-4">${contentHtml}</div>
        <!-- Actions -->
        ${actions.length > 0 ? `
          <div class="flex items-center justify-end gap-3 px-5 py-4 border-t-4 border-black dark:border-white">
            ${actionButtons}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Confirmation dialog
 */
export function ConfirmDialog(message, onConfirmId) {
  return `
    <div class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onclick="if(event.target===this)this.remove()">
      <div class="modal-content bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] w-full max-w-sm overflow-hidden animate-scale-in">
        <div class="px-5 py-6 text-center">
          <p class="text-gray-800 dark:text-gray-200 font-bold">${message}</p>
        </div>
        <div class="flex items-center justify-center gap-3 px-5 py-4 border-t-4 border-black dark:border-white">
          <button onclick="this.closest('.modal-backdrop').remove()" class="bg-gray-200 dark:bg-gray-700 border-4 border-black dark:border-white text-black dark:text-white font-bold uppercase px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Batal</button>
          <button id="${onConfirmId}" class="bg-red-500 border-4 border-black dark:border-white text-white font-bold uppercase px-5 py-2 rounded-lg hover:bg-red-600 transition-colors">Konfirmasi</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * SVG avatar with initials
 */
export function AvatarSVG(username, size = 80) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const name = username || 'AN';
  const initials = name.substring(0, 2).toUpperCase();

  // Deterministic color from char codes
  const charSum = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const bgColor = colors[charSum % colors.length];

  const half = size / 2;
  const fontSize = size * 0.38;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${half}" cy="${half}" r="${half}" fill="${bgColor}" stroke="black" stroke-width="3"/>
      <text x="${half}" y="${half}" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="${fontSize}" fill="black">${initials}</text>
    </svg>
  `;
}