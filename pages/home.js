import { API } from '../js/api.js';
import { navigate, showToast } from '../js/app.js';
import { ConfessCard, EmptyState, SkeletonCard } from '../js/components.js';
import { IconEnvelope, IconSend, IconInbox } from '../js/svg-icons.js';

export default function HomePage() {
  const html = `
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div id="home-loading">${SkeletonCard(3)}</div>

      <div id="home-content" class="hidden">
        <!-- Welcome -->
        <div class="mb-6 animate-fadeIn">
          <h1 class="text-2xl font-bold" style="font-family: 'Space Grotesk', sans-serif;">
            Halo, <span id="home-username">User</span>!
          </h1>
          <p class="text-gray-600 text-sm mt-1">Selamat datang kembali di Menfess</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-3 mb-8 stagger-children">
          <div class="stat-card neo-card bg-blue-100 p-4 text-center">
            <div class="stat-value text-blue-600 text-2xl font-bold" id="stat-confess">0</div>
            <div class="stat-label text-xs text-gray-600 mt-1">Total Confess</div>
          </div>
          <div class="stat-card neo-card bg-green-100 p-4 text-center">
            <div class="stat-value text-green-600 text-2xl font-bold" id="stat-reply">0</div>
            <div class="stat-label text-xs text-gray-600 mt-1">Total Balasan</div>
          </div>
          <div class="stat-card neo-card bg-yellow-100 p-4 text-center">
            <div class="stat-value text-yellow-600 text-2xl font-bold" id="stat-unread">0</div>
            <div class="stat-label text-xs text-gray-600 mt-1">Belum Dibaca</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-3 mb-8 animate-slideUp">
          <button id="btn-confess" class="neo-btn neo-btn-primary flex-1 flex items-center justify-center gap-2">
            ${IconSend()}
            <span>Kirim Confess</span>
          </button>
          <button id="btn-inbox" class="neo-btn neo-btn-secondary flex-1 flex items-center justify-center gap-2">
            ${IconInbox()}
            <span>Lihat Inbox</span>
          </button>
        </div>

        <!-- Recent Activity -->
        <div class="animate-fadeIn">
          <h2 class="text-lg font-bold mb-4">Aktivitas Terbaru</h2>
          <div id="activity-list" class="space-y-3"></div>
        </div>
      </div>
    </div>
  `;

  async function scripts() {
    const loadingEl = document.getElementById('home-loading');
    const contentEl = document.getElementById('home-content');

    document.getElementById('btn-confess').addEventListener('click', () => navigate('#/confess'));
    document.getElementById('btn-inbox').addEventListener('click', () => navigate('#/inbox'));

    try {
      const [meRes, confessRes, inboxRes] = await Promise.all([
        API.getMe(),
        API.getMyConfessions(),
        API.getInbox()
      ]);

      // Populate username
      document.getElementById('home-username').textContent = meRes.username || meRes.name || 'User';

      // Stats
      const confessions = confessRes.data || confessRes.confessions || [];
      const inbox = inboxRes.data || inboxRes.inbox || [];
      const totalReplies = confessions.reduce((sum, c) => sum + (c.reply_count || c.replyCount || 0), 0);
      const unreadCount = inbox.filter(m => !m.is_read && !m.isRead).length;

      document.getElementById('stat-confess').textContent = confessions.length;
      document.getElementById('stat-reply').textContent = totalReplies;
      document.getElementById('stat-unread').textContent = unreadCount;

      // Recent activity
      const activityList = document.getElementById('activity-list');
      const recent = confessions.slice(0, 5);

      if (recent.length === 0) {
        activityList.innerHTML = EmptyState({ icon: IconEnvelope(), message: 'Belum ada aktivitas' });
      } else {
        activityList.innerHTML = recent.map(c => ConfessCard(c)).join('');
      }

      // Show content, hide loading
      loadingEl.classList.add('hidden');
      contentEl.classList.remove('hidden');
    } catch (err) {
      showToast(err.message || 'Gagal memuat data', 'error');
      loadingEl.innerHTML = `
        <div class="text-center py-12">
          <p class="text-gray-500 mb-4">Gagal memuat data</p>
          <button onclick="location.reload()" class="neo-btn neo-btn-primary">Coba Lagi</button>
        </div>
      `;
    }
  }

  return { html, scripts };
}
