import { API } from '../js/api.js';
import { showToast, navigate } from '../js/app.js';

export default function RegisterPage() {
  const html = `
    <div class="min-h-screen flex items-center justify-center px-4 py-8 relative">

      <!-- Decorative floating shapes -->
      <div class="absolute top-12 left-6 w-8 h-8 rounded-full bg-pink-300 border-2 border-black opacity-60 animate-bounceIn" style="animation-delay:0.1s"></div>
      <div class="absolute top-24 right-10 w-6 h-6 rounded-lg bg-yellow-300 border-2 border-black opacity-60 animate-bounceIn" style="animation-delay:0.3s"></div>
      <div class="absolute bottom-20 left-10 w-10 h-10 rounded-xl bg-green-300 border-2 border-black opacity-60 rotate-12 animate-bounceIn" style="animation-delay:0.5s"></div>
      <div class="absolute bottom-32 right-8 w-5 h-5 rounded-full bg-blue-300 border-2 border-black opacity-60 animate-bounceIn" style="animation-delay:0.7s"></div>
      <div class="absolute top-40 left-1/4 w-4 h-4 rounded bg-purple-300 border-2 border-black opacity-50 animate-bounceIn" style="animation-delay:0.9s"></div>

      <div class="w-full max-w-md animate-scaleIn relative z-10">
        <div class="neo-card bg-white p-8 text-center">

          <!-- Envelope Logo -->
          <div class="flex justify-center mb-6">
            <svg width="72" height="72" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-bounceIn">
              <rect x="8" y="20" width="64" height="44" rx="8" fill="#A78BFA" stroke="#000" stroke-width="4"/>
              <path d="M8 28L40 48L72 28" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 60L30 42" stroke="#000" stroke-width="4" stroke-linecap="round"/>
              <path d="M72 60L50 42" stroke="#000" stroke-width="4" stroke-linecap="round"/>
              <circle cx="40" cy="18" r="10" fill="#34D399" stroke="#000" stroke-width="3"/>
              <path d="M37 18L40 21L44 15" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold mb-2" style="font-family: 'Space Grotesk', sans-serif;">Daftar Akun</h1>
          <p class="text-gray-600 mb-8">Buat akun Menfess baru</p>

          <!-- Register Form -->
          <form id="register-form" class="space-y-4 text-left">
            <div>
              <label class="neo-label block mb-1">Username</label>
              <input
                type="text"
                id="reg-username"
                class="neo-input w-full"
                placeholder="Minimal 3 karakter"
                required
              />
            </div>
            <div>
              <label class="neo-label block mb-1">Nomor WhatsApp</label>
              <input
                type="tel"
                id="reg-whatsapp"
                class="neo-input w-full"
                placeholder="628xxx atau 08xxx"
                required
              />
            </div>
            <div>
              <label class="neo-label block mb-1">Password</label>
              <input
                type="password"
                id="reg-password"
                class="neo-input w-full"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
            <div>
              <label class="neo-label block mb-1">Konfirmasi Password</label>
              <input
                type="password"
                id="reg-confirm"
                class="neo-input w-full"
                placeholder="Ulangi password"
                required
              />
            </div>
            <button
              type="submit"
              id="register-btn"
              class="neo-btn neo-btn-primary neo-btn-lg w-full"
            >
              Daftar
            </button>
          </form>

          <!-- Login Link -->
          <p class="mt-6 text-sm text-gray-600">
            Sudah punya akun?
            <a href="#/login" class="font-bold text-purple-600 underline hover:text-purple-800">Masuk</a>
          </p>
        </div>
      </div>
    </div>
  `;

  function scripts() {
    const form = document.getElementById('register-form');
    const btn = document.getElementById('register-btn');
    const usernameInput = document.getElementById('reg-username');
    const whatsappInput = document.getElementById('reg-whatsapp');
    const passwordInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const whatsapp = whatsappInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;

      // Validation
      if (username.length < 3) {
        showToast('Username minimal 3 karakter', 'error');
        return;
      }

      if (!whatsapp.startsWith('62') && !whatsapp.startsWith('08')) {
        showToast('Nomor WhatsApp harus dimulai dengan 62 atau 08', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return;
      }

      if (password !== confirm) {
        showToast('Password dan konfirmasi tidak cocok', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span>Memuat...';

      try {
        const res = await API.register(username, whatsapp, password);
        localStorage.setItem('token', res.token);
        showToast('Registrasi berhasil!', 'success');
        navigate('#/home');
      } catch (err) {
        showToast(err.message || 'Registrasi gagal', 'error');
        btn.disabled = false;
        btn.textContent = 'Daftar';
      }
    });
  }

  return { html, scripts };
}
