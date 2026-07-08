import { API } from '../js/api.js';
import { showToast, navigate } from '../js/app.js';

export default function LoginPage() {
  if (localStorage.getItem('token')) {
    navigate('#/home');
    return { html: '', scripts() {} };
  }

  const html = `
    <div class="min-h-screen flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md animate-scaleIn">
        <div class="neo-card bg-white p-8 text-center">

          <!-- Animated Envelope Logo -->
          <div class="flex justify-center mb-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-bounceIn">
              <rect x="8" y="20" width="64" height="44" rx="8" fill="#FBBF24" stroke="#000" stroke-width="4"/>
              <path d="M8 28L40 48L72 28" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 60L30 42" stroke="#000" stroke-width="4" stroke-linecap="round"/>
              <path d="M72 60L50 42" stroke="#000" stroke-width="4" stroke-linecap="round"/>
              <circle cx="40" cy="18" r="10" fill="#F472B6" stroke="#000" stroke-width="3"/>
              <path d="M36 17C36 14.5 38 13 40 15C42 13 44 14.5 44 17C44 19.5 40 22 40 22C40 22 36 19.5 36 17Z" fill="#FFF" stroke="#000" stroke-width="1.5"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold mb-2" style="font-family: 'Space Grotesk', sans-serif;">Menfess</h1>
          <p class="text-gray-600 mb-8">Masuk ke akun kamu</p>

          <!-- Login Form -->
          <form id="login-form" class="space-y-4 text-left">
            <div>
              <label class="neo-label block mb-1">Username / WhatsApp</label>
              <input
                type="text"
                id="login-username"
                class="neo-input w-full"
                placeholder="Masukkan username atau nomor WA"
                required
              />
            </div>
            <div>
              <label class="neo-label block mb-1">Password</label>
              <input
                type="password"
                id="login-password"
                class="neo-input w-full"
                placeholder="Masukkan password"
                required
              />
            </div>
            <button
              type="submit"
              id="login-btn"
              class="neo-btn neo-btn-primary neo-btn-lg w-full"
            >
              Masuk
            </button>
          </form>

          <!-- Register Link -->
          <p class="mt-6 text-sm text-gray-600">
            Belum punya akun?
            <a href="#/register" class="font-bold text-purple-600 underline hover:text-purple-800">Daftar</a>
          </p>
        </div>
      </div>
    </div>
  `;

  function scripts() {
    const form = document.getElementById('login-form');
    const btn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showToast('Username dan password wajib diisi', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span>Memuat...';

      try {
        const res = await API.login(username, password);
        localStorage.setItem('token', res.token);
        showToast('Login berhasil!', 'success');
        navigate('#/home');
      } catch (err) {
        showToast(err.message || 'Login gagal', 'error');
        btn.disabled = false;
        btn.textContent = 'Masuk';
      }
    });
  }

  return { html, scripts };
}
