// =============================================
// Chat / Conversation Page - Menfess PWA
// =============================================
import API from '../js/api.js';
import { SkeletonCard, EmptyState, ChatBubble, ConfirmDialog } from '../js/components.js';
import { IconBack, IconSend, IconDelete } from '../js/svg-icons.js';
import { navigate, showToast } from '../js/app.js';

let replyRefreshInterval = null;

export default function(params) {
  const confessionId = params.id;

  const html = `
    <div class="flex flex-col h-screen">
      <div class="neo-card sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <button id="back-btn" class="neo-btn neo-btn-sm neo-btn-outline">
          ${IconBack(20)}
        </button>
        <div class="flex-1 min-w-0">
          <h1 id="chat-title" class="text-lg font-black truncate">Percakapan</h1>
          <span id="chat-status" class="neo-badge neo-badge-sm"></span>
        </div>
        <button id="delete-chat-btn" class="neo-btn neo-btn-sm neo-btn-danger">
          ${IconDelete(20)}
        </button>
      </div>

      <div id="chat-area" class="chat-bubble-area flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div id="chat-loading">${SkeletonCard(3)}</div>
      </div>

      <div id="no-replies" class="hidden px-4 pb-4">
        ${EmptyState(IconSend(48), 'Belum ada balasan. Mulai percakapan!')}
      </div>

      <div class="message-input-bar px-4 py-3 border-t-4 border-black bg-white">
        <div class="flex items-center gap-3">
          <input
            type="text"
            id="reply-input"
            class="neo-input flex-1"
            placeholder="Tulis balasan..."
            maxlength="500"
          />
          <button id="send-btn" class="neo-btn neo-btn-primary">
            ${IconSend(20)}
          </button>
        </div>
      </div>
    </div>
  `;

  function scripts() {
    // Cleanup previous interval on page revisit
    if (replyRefreshInterval) {
      clearInterval(replyRefreshInterval);
      replyRefreshInterval = null;
    }

    const chatArea = document.getElementById('chat-area');
    const chatLoading = document.getElementById('chat-loading');
    const noReplies = document.getElementById('no-replies');
    const replyInput = document.getElementById('reply-input');
    const sendBtn = document.getElementById('send-btn');
    const backBtn = document.getElementById('back-btn');
    const deleteChatBtn = document.getElementById('delete-chat-btn');
    const chatTitle = document.getElementById('chat-title');
    const chatStatus = document.getElementById('chat-status');

    let confession = null;
    let replies = [];
    let currentUserId = null;

    // Get current user ID
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id || payload.userId || payload.sub;
      }
    } catch (e) {
      // Ignore token parse errors
    }

    // Format time to HH:MM
    function formatTime(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Render original confession card
    function renderConfessionCard(c) {
      return `
        <div class="neo-card mx-auto max-w-md animate-scaleIn" style="background-color: #fef3c7;">
          <p class="text-xs font-semibold text-gray-500 mb-2">Dari: ${c.senderName || 'Anonim'}</p>
          <p class="text-base font-medium mb-3 whitespace-pre-wrap">${c.message || ''}</p>
          <p class="text-xs text-gray-400 text-right">${c.createdAt ? formatTime(c.createdAt) : ''}</p>
        </div>
      `;
    }

    // Render replies
    function renderReplies() {
      // Clear loading
      if (chatLoading) chatLoading.classList.add('hidden');

      if (replies.length === 0) {
        noReplies.classList.remove('hidden');
      } else {
        noReplies.classList.add('hidden');
      }

      // Remove existing bubble elements (keep loading/empty)
      chatArea.querySelectorAll('.bubble-row, .confession-original').forEach(el => el.remove());

      // Add original confession
      if (confession) {
        const confessionDiv = document.createElement('div');
        confessionDiv.className = 'confession-original';
        confessionDiv.innerHTML = renderConfessionCard(confession);
        chatArea.appendChild(confessionDiv);
      }

      // Add reply bubbles
      replies.forEach(reply => {
        const isOwn = reply.userId === currentUserId;
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'animate-fadeIn';
        bubbleDiv.innerHTML = ChatBubble({
          message: reply.message,
          time: formatTime(reply.createdAt),
          isOwn: isOwn,
          replyId: reply.id
        });

        // Delete own message
        if (isOwn) {
          const deleteBtn = bubbleDiv.querySelector('[data-delete-reply]');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
              e.stopPropagation();
              try {
                await API.deleteReply(reply.id);
                showToast('Pesan dihapus', 'success');
                await fetchReplies();
              } catch (error) {
                showToast(error.message || 'Gagal menghapus pesan', 'error');
              }
            });
          }
        }

        // Double-click to copy message
        const bubbleContent = bubbleDiv.querySelector('.bubble-sent, .bubble-received');
        if (bubbleContent) {
          bubbleContent.addEventListener('dblclick', async () => {
            try {
              await navigator.clipboard.writeText(reply.message);
              showToast('Pesan disalin', 'success');
            } catch (err) {
              showToast('Gagal menyalin pesan', 'error');
            }
          });
        }

        chatArea.appendChild(bubbleDiv);
      });

      // Auto-scroll to bottom
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Fetch confession details
    async function fetchConfession() {
      try {
        const data = await API.getConfession(confessionId);
        confession = data;

        // Update header
        if (confession.receiverName) {
          chatTitle.textContent = confession.receiverName;
        }
        if (confession.status) {
          chatStatus.textContent = confession.status;
          chatStatus.className = 'neo-badge neo-badge-sm neo-badge-' + confession.status;
        }
      } catch (error) {
        showToast(error.message || 'Gagal memuat percakapan', 'error');
      }
    }

    // Fetch replies
    async function fetchReplies() {
      try {
        const data = await API.getReplies(confessionId);
        const previousLength = replies.length;
        replies = Array.isArray(data) ? data : (data.replies || data.data || []);
        renderReplies();

        // Scroll only if new messages
        if (replies.length > previousLength) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      } catch (error) {
        showToast(error.message || 'Gagal memuat balasan', 'error');
      }
    }

    // Initial load
    async function initialLoad() {
      chatLoading.classList.remove('hidden');
      await fetchConfession();
      await fetchReplies();
      chatLoading.classList.add('hidden');
    }

    // Send reply
    async function sendReply() {
      const message = replyInput.value.trim();
      if (!message) return;

      sendBtn.disabled = true;
      try {
        await API.createReply(confessionId, message);
        replyInput.value = '';
        await fetchReplies();
        chatArea.scrollTop = chatArea.scrollHeight;
      } catch (error) {
        showToast(error.message || 'Gagal mengirim balasan', 'error');
      } finally {
        sendBtn.disabled = false;
      }
    }

    // Event listeners
    sendBtn.addEventListener('click', sendReply);

    replyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendReply();
      }
    });

    backBtn.addEventListener('click', () => {
      navigate('#/inbox');
    });

    deleteChatBtn.addEventListener('click', () => {
      const dialogHtml = ConfirmDialog({
        title: 'Hapus Percakapan',
        message: 'Apakah kamu yakin ingin menghapus percakapan ini? Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Hapus',
        cancelText: 'Batal',
        onConfirm: async () => {
          try {
            await API.deleteChat(confessionId);
            showToast('Percakapan dihapus', 'success');
            navigate('#/inbox');
          } catch (error) {
            showToast(error.message || 'Gagal menghapus percakapan', 'error');
          }
        }
      });

      document.body.insertAdjacentHTML('beforeend', dialogHtml);

      // Attach confirm/cancel handlers
      const confirmBtn = document.querySelector('.confirm-dialog-confirm');
      const cancelBtn = document.querySelector('.confirm-dialog-cancel');
      const overlay = document.querySelector('.confirm-dialog-overlay');

      async function handleConfirm() {
        try {
          await API.deleteChat(confessionId);
          showToast('Percakapan dihapus', 'success');
          if (overlay) overlay.remove();
          navigate('#/inbox');
        } catch (error) {
          showToast(error.message || 'Gagal menghapus percakapan', 'error');
        }
      }

      function handleCancel() {
        if (overlay) overlay.remove();
      }

      if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
      if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) handleCancel();
        });
      }
    });

    // Auto-refresh replies every 5 seconds
    replyRefreshInterval = setInterval(async () => {
      await fetchReplies();
    }, 5000);

    // Start loading
    initialLoad();
  }

  return { html, scripts };
}
