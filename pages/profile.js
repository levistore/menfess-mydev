import { API } from '../js/api.js';
import { SkeletonCard, AvatarSVG, ConfirmDialog } from '../js/components.js';
import { IconLogout, IconEdit } from '../js/svg-icons.js';
import { navigate } from '../js/app.js';

export default function () {
  const html = `
    <div class="min-h-screen pb-8">
      <div id="profile-page" class="container-custom max-w-2xl mx-auto px-4 py-6">
        ${SkeletonCard(2)}
      </div>
    </div>
  `;

  const scripts = async () => {
    const container = document.getElementById('profile-page');
    if (!container) return;

    try {
      const [userData, confessionsData] = await Promise.all([
        API.getMe(),
        API.getMyConfessions()
      ]);

      const user = userData.user || userData;
      const confessions = confessionsData.confessions || confessionsData || [];

      let totalReplies = 0;
      confessions.forEach(c => {
        totalReplies += c.replyCount || (c.replies ? c.replies.length : 0);
      });

      const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        : '-';

      container.innerHTML = `
        <div class="animate-slideUp">
          <div class="flex flex-col items-center mb-8">
            ${AvatarSVG({ size: 120 })}
            <h1 class="mt-4 text-3xl font-bold" style="font-family: 'Space Grotesk', sans-serif;">
              ${user.username || 'User'}
            </h1>
            <p class="text-muted mt-1">${user.whatsapp || '-'}</p>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-8">
            <div class="stat-card neo-card p-4 text-center">
              <div class="stat-value text-2xl font-bold">${confessions.length}</div>
              <div class="stat-label text-sm text-muted">Confess</div>
            </div>
            <div class="stat-card neo-card p-4 text-center">
              <div class="stat-value text-2xl font-bold">${totalReplies}</div>
              <div class="stat-label text-sm text-muted">Balasan</div>
            </div>
            <div class="stat-card neo-card p-4 text-center">
              <div class="stat-value text-lg font-bold">${memberSince}</div>
              <div class="stat-label text-sm text-muted">Sejak</div>
            </div>
          </div>

          <div class="flex gap-3 justify-center">
            <button id="btn-edit" class="neo-btn neo-btn-secondary">
              ${IconEdit('w-5 h-5')}
              Edit Profil
            </button>
            <button id="btn-logout" class="neo-btn neo-btn-danger">
              ${IconLogout('w-5 h-5')}
              Keluar
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-edit')?.addEventListener('click', () => {
        navigate('#/settings');
      });

      document.getElementById('btn-logout')?.addEventListener('click', () => {
        ConfirmDialog({
          title: 'Keluar?',
          message: 'Apakah Anda yakin ingin keluar dari akun ini?',
          confirmText: 'Ya, Keluar',
          cancelText: 'Batal'
        }).then(confirmed => {
          if (confirmed) {
            localStorage.removeItem('token');
            navigate('#/login');
          }
        });
      });
    } catch (err) {
      container.innerHTML = `
        <div class="text-center animate-fadeIn py-16">
          <p class="text-lg font-semibold mb-2">Gagal memuat profil</p>
          <p class="text-muted mb-4">${err.message || 'Terjadi kesalahan'}</p>
          <button onclick="location.reload()" class="neo-btn neo-btn-primary">Coba Lagi</button>
        </div>
      `;
    }
  };

  return { html, scripts };
}
