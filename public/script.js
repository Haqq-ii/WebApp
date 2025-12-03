const BOT_NAME = 'ASTA';

const chat = document.getElementById('chat');
const form = document.getElementById('chat-form');
const textarea = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const template = document.getElementById('bubble-template');

function now() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(role, text) {
  const fragment = template.content.cloneNode(true);
  const bubble = fragment.querySelector('.bubble');
  const roleLabel = fragment.querySelector('.role');
  const timeLabel = fragment.querySelector('.time');
  const content = fragment.querySelector('.content');

  roleLabel.textContent = role === 'user' ? 'Kamu' : BOT_NAME;
  timeLabel.textContent = now();
  content.textContent = text;

  bubble.classList.add(role === 'user' ? 'bubble--user' : 'bubble--bot');
  chat.appendChild(fragment);
  chat.scrollTop = chat.scrollHeight;
}

function addSkeleton() {
  const skeleton = document.createElement('article');
  skeleton.className = 'bubble bubble--bot bubble--skeleton';
  skeleton.innerHTML = `
    <div class="meta">
      <span class="role">${BOT_NAME}</span>
      <span class="time">...</span>
    </div>
    <div class="skeleton-lines">
      <span class="skeleton-line"></span>
      <span class="skeleton-line"></span>
      <span class="skeleton-line short"></span>
    </div>
  `;
  chat.appendChild(skeleton);
  chat.scrollTop = chat.scrollHeight;
  return skeleton;
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  sendBtn.classList.toggle('loading', isLoading);
}

async function sendMessage(message) {
  setLoading(true);
  const skeleton = addSkeleton();
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil balasan');
    }

    const data = await response.json();
    if (skeleton) skeleton.remove();
    if (data?.reply) {
      addMessage('bot', data.reply);
    } else {
      throw new Error('Balasan kosong');
    }
  } catch (err) {
    if (skeleton) skeleton.remove();
    addMessage('bot', 'Ups, ada kendala. Coba lagi sebentar lagi.');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = textarea.value.trim();
  if (!message) return;

  addMessage('user', message);
  textarea.value = '';
  sendMessage(message);
});

textarea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

addMessage('bot', 'Halo, saya ASTA. Tanyakan apa pun, saya akan merespons dengan ringkas dan jelas.');
