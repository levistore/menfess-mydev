import { API } from '../js/api.js';
import { LoadingSpinner } from '../js/components.js';
import { IconHeart, IconClose, IconStar } from '../js/svg-icons.js';
import { navigate } from '../js/app.js';

export default function (params) {
  const uniqueId = params?.uniqueId;

  const html = `
    <div class="min-h-screen pb-8">
      <div id="confession-view" class="flex flex-col items-center justify-center min-h-[80vh] px-4">
        ${LoadingSpinner()}
      </div>
    </div>
  `;

  const scripts = async () => {
    const container = document.getElementById('confession-view');
    if (!container) return;

    try {
      const data = await API.getConfession(uniqueId);
      const confession = data.confession || data;

      const senderName = confession.senderName || 'Anonim';
      const receiverName = confession.receiverName || 'Seseorang';
      const message = confession.message || '';

      container.innerHTML = `
        <div class="envelope-scene" style="perspective: 1000px;">
          <div class="envelope-container relative cursor-pointer" style="width: 280px; height: 200px;">
            <div class="envelope-body bg-primary border-4 border-black rounded-xl neo-shadow relative overflow-hidden"
                 style="width: 100%; height: 100%;">
              <div class="envelope-flap absolute top-0 left-0 w-full"
                   style="height: 50%; background: linear-gradient(135deg, var(--color-primary-dark, #c2410c), var(--color-primary, #ea580c)); border: 4px solid #000; border-bottom: none; clip-path: polygon(0 0, 100% 0, 50% 100%); transform-origin: top center; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); z-index: 2;">
              </div>
              <div class="envelope-seal absolute flex items-center justify-center rounded-full border-4 border-black"
                   style="width: 56px; height: 56px; background: var(--color-accent, #fbbf24); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 3; transition: opacity 0.4s ease;">
                ${IconHeart('w-6 h-6')}
              </div>
            </div>
          </div>
          <p class="text-center mt-6 text-muted animate-pulse" style="animation: pulse 2s ease-in-out infinite;">
            Ketuk untuk membuka
          </p>
        </div>

        <div id="letter-container" class="hidden w-full max-w-md mt-8">
          <div class="letter bg-card border-4 border-black rounded-xl p-6 neo-shadow" style="transform: translateY(0);">
            <p class="text-sm text-muted mb-4">Dari: <span class="font-semibold">${senderName}</span></p>
            <div class="my-4" style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; line-height: 1.8; color: var(--color-text);">
              ${message}
            </div>
            <div class="my-4 flex justify-center">
              <svg width="100" height="4" viewBox="0 0 100 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="2" x2="100" y2="2" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" />
              </svg>
            </div>
            <p class="text-sm text-muted text-right">Untuk: <span class="font-semibold">${receiverName}</span></p>
          </div>

          <div class="mt-6 flex justify-center">
            <button id="btn-reply" class="neo-btn neo-btn-primary neo-btn-lg">
              Balas Pesan
            </button>
          </div>
        </div>
      `;

      const envelopeContainer = container.querySelector('.envelope-container');
      const envelopeFlap = container.querySelector('.envelope-flap');
      const envelopeSeal = container.querySelector('.envelope-seal');
      const letterContainer = document.getElementById('letter-container');
      const pulseText = container.querySelector('.animate-pulse');

      envelopeContainer.addEventListener('click', () => {
        envelopeFlap.classList.add('open');
        envelopeFlap.style.transform = 'rotateX(180deg)';
        envelopeSeal.style.opacity = '0';
        if (pulseText) pulseText.style.display = 'none';

        setTimeout(() => {
          letterContainer.classList.remove('hidden');
          const letter = letterContainer.querySelector('.letter');
          letter.classList.add('slide-out');
          letter.style.transform = 'translateY(-120px)';

          setTimeout(() => {
            letter.classList.add('unfold');
            letter.style.transform = 'translateY(0) scale(1)';
            createConfetti();
            createFloatingDecorations();
          }, 600);
        }, 800);
      });

      document.getElementById('btn-reply')?.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
          sessionStorage.setItem('redirectAfterLogin', window.location.hash);
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="neo-card bg-card max-w-sm w-full p-6 text-center">
              <p class="text-lg font-bold mb-4">Masuk untuk membalas pesan ini</p>
              <div class="flex gap-3 justify-center">
                <button id="modal-login" class="neo-btn neo-btn-primary">Masuk</button>
                <button id="modal-register" class="neo-btn neo-btn-secondary">Daftar</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          document.getElementById('modal-login')?.addEventListener('click', () => {
            modal.remove();
            navigate('#/login');
          });
          document.getElementById('modal-register')?.addEventListener('click', () => {
            modal.remove();
            navigate('#/register');
          });
          modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
          });
        } else {
          navigate(`#/chat/${confession._id || confession.id}`);
        }
      });
    } catch (err) {
      container.innerHTML = `
        <div class="text-center animate-fadeIn">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 border-4 border-black neo-shadow mb-4">
            ${IconClose('w-10 h-10 text-red-500')}
          </div>
          <h2 class="text-2xl font-bold mb-2" style="font-family: 'Space Grotesk', sans-serif;">Confess tidak ditemukan</h2>
          <p class="text-muted mb-6">Link mungkin salah atau confess sudah dihapus</p>
          <button onclick="location.hash='#/'" class="neo-btn neo-btn-primary">Kembali ke Beranda</button>
        </div>
      `;
    }
  };

  return { html, scripts };
}

function createConfetti() {
  const colors = ['#ea580c', '#fbbf24', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      animation: confetti ${1 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

function createFloatingDecorations() {
  const icons = [IconHeart('w-6 h-6'), IconStar('w-6 h-6')];
  for (let i = 0; i < 6; i++) {
    const dec = document.createElement('div');
    dec.className = 'float-decoration';
    dec.innerHTML = icons[Math.floor(Math.random() * icons.length)];
    dec.style.cssText = `
      position: fixed;
      left: ${20 + Math.random() * 60}vw;
      bottom: -50px;
      color: ${['#ea580c', '#fbbf24', '#22c55e', '#ec4899'][Math.floor(Math.random() * 4)]};
      animation: floatUp ${2 + Math.random() * 2}s ease-out ${Math.random() * 1}s forwards;
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(dec);
    setTimeout(() => dec.remove(), 4000);
  }
}
