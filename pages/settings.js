import { API } from '../js/api.js';
import { showToast, toggleTheme } from '../js/app.js';
import { IconSettings, IconMoon, IconSun } from '../js/svg-icons.js';

export default function () {
  const html = `
    <div class="min-h-screen pb-8">
      <div class="container-custom max-w-2xl mx-auto px-4 py-6">
        <h1 class="flex items-center gap-2 text-2xl font-bold mb-6" style="font-family: 'Space Grotesk', sans-serif;">
          ${IconSettings('w-7 h-7')}
          Pengaturan
        </h1>

        <div class="space-y-6 animate-slideUp stagger-children">
          <div class="neo-card p-6">
            <h2 class="text-lg font-bold mb-4">Tampilan</h2>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span id="theme-icon">${IconMoon('w-5 h-5')}</span>
                <span class="font-medium">Mode Gelap</span>
              </div>
              <button id="toggle-theme" class="neo-toggle" aria-label="Toggle dark mode">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>

          <div class="neo-card p-6">
            <h2 class="text-lg font-bold mb-4">Akun</h2>

            <div class="mb-6">
              <label class="neo-label block mb-2">Username</label>
              <div class="flex gap-2">
                <input type="text" id="input-username" class="neo-input flex-1" placeholder="Username" />
                <button id="btn-save-username" class="neo-btn neo-btn-sm neo-btn-primary">Simpan</button>
              </div>
            </div>

            <div class="border-t-2 border-border pt-6">
              <h3 class="font-semibold mb-3">Ubah Password</h3>
              <div class="space-y-3">
                <input type="password" id="input-old-password" class="neo-input w-full" placeholder="Password lama" />
                <input type="password" id="input-new-password" class="neo-input w-full" placeholder="Password baru (min 6 karakter)" />
                <input type="password" id="input-confirm-password" class="neo-input w-full" placeholder="Konfirmasi password baru" />
                <button id="btn-change-password" class="neo-btn neo-btn-primary w-full">Ubah Password</button>
              </div>
            </div>
          </div>

          <div class="neo-card p-6">
            <h2 class="text-lg font-bold mb-4">Tentang</h2>
            <div class="text-center">
              <p class="text-xl font-bold mb-1" style="font-family: 'Space Grotesk', sans-serif;">Menfess</p>
              <p class="text-sm text-muted mb-3">v1.0.0</p>
              <p class="text-sm text-muted mb-2">Aplikasi confess anonim untuk menyampaikan pesan rahasia</p>
              <p class="text-xs text-muted italic">Dibuat dengan sepenuh hati</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const scripts = async () => {
    const toggleBtn = document.getElementById('toggle-theme');
    const themeIcon = document.getElementById('theme-icon');

    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      toggleBtn?.classList.add('active');
      if (themeIcon) themeIcon.innerHTML = IconSun('w-5 h-5');
    }

    toggleBtn?.addEventListener('click', () => {
      toggleTheme();
      toggleBtn.classList.toggle('active');
      const nowDark = document.documentElement.classList.contains('dark');
      if (themeIcon) {
        themeIcon.innerHTML = nowDark ? IconSun('w-5 h-5') : IconMoon('w-5 h-5');
      }
    });

    try {
      const data = await API.getMe();
      const user = data.user || data;
      const inputUsername = document.getElementById('input-username');
      if (inputUsername && user.username) {
        inputUsername.value = user.username;
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }

    document.getElementById('btn-save-username')?.addEventListener('click', async () => {
      const input = document.getElementById('input-username');
      const username = input?.value?.trim();

      if (!username) {
        showToast('Username tidak boleh kosong', 'error');
        return;
      }

      const btn = document.getElementById('btn-save-username');
      btn.disabled = true;
      btn.textContent = '...';

      try {
        await API.updateProfile({ username });
        showToast('Username berhasil diubah', 'success');
      } catch (err) {
        showToast(err.message || 'Gagal mengubah username', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Simpan';
      }
    });

    document.getElementById('btn-change-password')?.addEventListener('click', async () => {
      const oldPassword = document.getElementById('input-old-password')?.value;
      const newPassword = document.getElementById('input-new-password')?.value;
      const confirmPassword = document.getElementById('input-confirm-password')?.value;

      if (!oldPassword) {
        showToast('Masukkan password lama', 'error');
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok', 'error');
        return;
      }

      const btn = document.getElementById('btn-change-password');
      btn.disabled = true;
      btn.textContent = '...';

      try {
        await API.changePassword(oldPassword, newPassword);
        showToast('Password berhasil diubah', 'success');
        document.getElementById('input-old-password').value = '';
        document.getElementById('input-new-password').value = '';
        document.getElementById('input-confirm-password').value = '';
      } catch (err) {
        showToast(err.message || 'Gagal mengubah password', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Ubah Password';
      }
    });
  };

  return { html, scripts };
}
