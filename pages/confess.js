// =============================================
// Send Confess Page - Menfess PWA
// =============================================
import API from '../js/api.js';
import { Modal, LoadingSpinner } from '../js/components.js';
import { IconSend, IconCopy } from '../js/svg-icons.js';
import { navigate, showToast } from '../js/app.js';

export default function() {
  const html = `
    <div class="max-w-2xl mx-auto px-4 py-6 animate-slideUp">
      <h1 class="text-3xl font-black mb-6 flex items-center gap-3">
        ${IconSend(32)}
        Kirim Confess
      </h1>

      <div class="neo-card">
        <form id="confess-form" class="space-y-6">
          <div>
            <label class="neo-label" for="sender-name">Nama Pengirim</label>
            <input
              type="text"
              id="sender-name"
              class="neo-input w-full"
              placeholder="Nama kamu"
              required
            />
          </div>

          <div>
            <label class="neo-label" for="receiver-name">Nama Penerima</label>
            <input
              type="text"
              id="receiver-name"
              class="neo-input w-full"
              placeholder="Nama orang yang dituju"
              required
            />
          </div>

          <div>
            <label class="neo-label" for="receiver-whatsapp">WhatsApp Penerima</label>
            <input
              type="text"
              id="receiver-whatsapp"
              class="neo-input w-full"
              placeholder="628xxx or 08xxx"
              required
            />
          </div>

          <div>
            <label class="neo-label" for="message">Pesan Confess</label>
            <textarea
              id="message"
              class="neo-input w-full"
              style="min-height: 150px;"
              placeholder="Tulis pesan confess kamu di sini..."
              maxlength="500"
              required
            ></textarea>
            <div id="char-counter" class="text-sm mt-2 text-right">
              <span id="char-count">0</span>/500
            </div>
          </div>

          <button
            type="submit"
            id="submit-btn"
            class="neo-btn neo-btn-primary neo-btn-lg w-full"
          >
            Kirim Confess
          </button>
        </form>
      </div>
    </div>
  `;

  function scripts() {
    const form = document.getElementById('confess-form');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const charCounter = document.getElementById('char-counter');
    const submitBtn = document.getElementById('submit-btn');

    // Character counter
    messageInput.addEventListener('input', () => {
      const count = messageInput.value.length;
      charCount.textContent = count;

      if (count >= 480) {
        charCounter.className = 'text-sm mt-2 text-right text-red-600 font-bold';
      } else if (count >= 400) {
        charCounter.className = 'text-sm mt-2 text-right text-yellow-600 font-bold';
      } else {
        charCounter.className = 'text-sm mt-2 text-right';
      }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const senderName = document.getElementById('sender-name').value.trim();
      const receiverName = document.getElementById('receiver-name').value.trim();
      const receiverWhatsapp = document.getElementById('receiver-whatsapp').value.trim();
      const message = messageInput.value.trim();

      // Validation
      if (!senderName || !receiverName || !receiverWhatsapp || !message) {
        showToast('Semua field harus diisi', 'error');
        return;
      }

      // WhatsApp format check
      const whatsappRegex = /^(628|08)\d+$/;
      if (!whatsappRegex.test(receiverWhatsapp)) {
        showToast('Format WhatsApp tidak valid. Gunakan 628xxx atau 08xxx', 'error');
        return;
      }

      if (message.length > 500) {
        showToast('Pesan tidak boleh lebih dari 500 karakter', 'error');
        return;
      }

      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = LoadingSpinner();

      try {
        const response = await API.createConfess({
          senderName,
          receiverName,
          receiverWhatsapp,
          message
        });

        // Show success modal
        const confessUrl = window.location.origin + '/#/c/' + response.uniqueId;
        const modalHtml = Modal({
          title: 'Confess Berkirim!',
          content: `
            <div class="space-y-4">
              <p>Link confess:</p>
              <div class="neo-input p-3 text-sm break-all">${confessUrl}</div>
              <div class="flex gap-3">
                <button id="copy-link-btn" class="neo-btn neo-btn-secondary flex-1">
                  ${IconCopy(20)} Copy Link
                </button>
                <button id="close-modal-btn" class="neo-btn neo-btn-primary flex-1">
                  Tutup
                </button>
              </div>
            </div>
          `,
          onClose: () => {
            form.reset();
            charCount.textContent = '0';
            charCounter.className = 'text-sm mt-2 text-right';
          }
        });

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Copy link button
        document.getElementById('copy-link-btn').addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(confessUrl);
            showToast('Link berhasil disalin', 'success');
          } catch (err) {
            showToast('Gagal menyalin link', 'error');
          }
        });

        // Close modal button
        document.getElementById('close-modal-btn').addEventListener('click', () => {
          const modal = document.querySelector('.modal-overlay');
          if (modal) modal.remove();
          form.reset();
          charCount.textContent = '0';
          charCounter.className = 'text-sm mt-2 text-right';
        });

      } catch (error) {
        showToast(error.message || 'Gagal mengirim confess', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  return { html, scripts };
}
