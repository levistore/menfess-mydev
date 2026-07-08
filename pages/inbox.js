// =============================================
// Inbox Page - Menfess PWA
// =============================================
import API from '../js/api.js';
import { SkeletonCard, EmptyState, ConfessCard } from '../js/components.js';
import { IconInbox, IconRefresh } from '../js/svg-icons.js';
import { navigate, showToast } from '../js/app.js';

let refreshInterval = null;
let pullStartY = 0;
let pullIndicator = null;

export default function() {
  const html = `
    <div class="max-w-2xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-black mb-6 flex items-center gap-3">
        ${IconInbox(32)}
        Inbox
        <span id="unread-badge" class="neo-badge hidden"></span>
      </h1>

      <div class="tab-bar mb-6">
        <button class="tab-item active" data-filter="all">Semua</button>
        <button class="tab-item" data-filter="unread">Belum Dibaca</button>
        <button class="tab-item" data-filter="read">Sudah Dibaca</button>
        <button class="tab-item" data-filter="replied">Sudah Dibalas</button>
      </div>

      <div id="pull-indicator" class="text-center py-3 hidden">
        <span class="inline-flex items-center gap-2 text-sm font-semibold">
          <span id="pull-refresh-icon">${IconRefresh(20)}</span>
          Tarik untuk refresh
        </span>
      </div>

      <div id="inbox-loading">${SkeletonCard(4)}</div>

      <div id="inbox-list" class="space-y-4 stagger-children hidden"></div>

      <div id="inbox-empty" class="hidden">
        ${EmptyState(IconInbox(48), 'Tidak ada confess')}
      </div>
    </div>
  `;

  function scripts() {
    // Cleanup previous interval on page revisit
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }

    let confessions = [];
    let currentFilter = 'all';

    const loadingEl = document.getElementById('inbox-loading');
    const listEl = document.getElementById('inbox-list');
    const emptyEl = document.getElementById('inbox-empty');
    const unreadBadge = document.getElementById('unread-badge');
    const pullIndicator = document.getElementById('pull-indicator');
    const tabItems = document.querySelectorAll('.tab-item');

    // Update unread badge
    function updateUnreadBadge() {
      const unreadCount = confessions.filter(c => c.status === 'unread').length;
      if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.classList.remove('hidden');
        unreadBadge.classList.add('neo-badge-unread');
      } else {
        unreadBadge.classList.add('hidden');
      }
    }

    // Filter and render
    function renderList() {
      let filtered = confessions;
      if (currentFilter !== 'all') {
        filtered = confessions.filter(c => c.status === currentFilter);
      }

      if (filtered.length === 0) {
        listEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
      } else {
        emptyEl.classList.add('hidden');
        listEl.classList.remove('hidden');
        listEl.innerHTML = filtered.map(c => ConfessCard(c)).join('');

        // Attach click handlers to cards
        listEl.querySelectorAll('[data-confession-id]').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.getAttribute('data-confession-id');
            navigate('#/chat/' + id);
          });
        });
      }

      updateUnreadBadge();
    }

    // Fetch inbox data
    async function fetchInbox() {
      try {
        const data = await API.getInbox();
        confessions = Array.isArray(data) ? data : (data.confessions || data.data || []);
        renderList();
      } catch (error) {
        showToast(error.message || 'Gagal memuat inbox', 'error');
      }
    }

    // Initial load
    async function initialLoad() {
      loadingEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      emptyEl.classList.add('hidden');

      await fetchInbox();

      loadingEl.classList.add('hidden');
    }

    // Silent refresh (no loading spinner)
    async function silentRefresh() {
      await fetchInbox();
    }

    // Tab filtering
    tabItems.forEach(tab => {
      tab.addEventListener('click', () => {
        tabItems.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter');
        renderList();
      });
    });

    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(silentRefresh, 30000);

    // Pull-to-refresh (mobile)
    const pageContainer = document.querySelector('.max-w-2xl');

    if (pageContainer) {
      let isPulling = false;

      pageContainer.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
          pullStartY = e.touches[0].clientY;
          isPulling = true;
        }
      }, { passive: true });

      pageContainer.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        const pullY = e.touches[0].clientY;
        const pullDistance = pullY - pullStartY;

        if (pullDistance > 60) {
          pullIndicator.classList.remove('hidden');
          const icon = document.getElementById('pull-refresh-icon');
          if (icon) {
            icon.style.display = 'inline-block';
            icon.style.animation = 'spin 1s linear infinite';
          }
        }
      }, { passive: true });

      pageContainer.addEventListener('touchend', async () => {
        if (!isPulling) return;
        isPulling = false;

        if (!pullIndicator.classList.contains('hidden')) {
          await silentRefresh();
          pullIndicator.classList.add('hidden');
          const icon = document.getElementById('pull-refresh-icon');
          if (icon) {
            icon.style.animation = '';
          }
        }

        pullStartY = 0;
      }, { passive: true });
    }

    // Initial load
    initialLoad();
  }

  return { html, scripts };
}
