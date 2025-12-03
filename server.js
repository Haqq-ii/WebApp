const path = require('path');
const express = require('express');
const fetch = require('node-fetch'); // <--- tambahkan ini

const app = express();
const PORT = process.env.PORT || 3000;

// ====== GANTI DENGAN URL WEBHOOK n8n KAMU ======
const N8N_WEBHOOK_URL = 'https://imperious-susie-divaricately.ngrok-free.dev/webhook/open-ai';
// Contoh lain kalau pakai ngrok:
// const N8N_WEBHOOK_URL = 'https://imperious-susie-divaricately.ngrok-free.dev/webhook/open-ai';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== RESPON LOCAL (fallback kalau n8n error) ======
const starters = [
  'Berikut ringkasan singkatnya:',
  'Ini yang bisa saya bantu:',
  'Mungkin ini membantu:',
  'Oke, berikut jawabannya:',
];

const details = [
  'coba fokus pada langkah-langkah kecil yang terukur.',
  'berikan contoh konkret supaya mudah dipraktikkan.',
  'jika ada batasan, tuliskan dengan jelas.',
  'pastikan urutannya logis dan ringkas.',
];

const enders = [
  'Ada hal lain yang mau didalami?',
  'Semoga membantu!',
  'Butuh penjelasan tambahan?',
  'Kita bisa iterasi lagi kalau perlu.',
];

const suggestions = [
  '1) Mulai dengan definisi tujuan. 2) Bagi menjadi tugas kecil. 3) Uji tiap bagian sebelum lanjut.',
  'Pastikan contoh atau data yang dipakai relevan dengan kasus kamu.',
  'Dokumentasikan keputusan penting agar mudah ditinjau ulang.',
  'Gunakan format bullet atau langkah berurutan supaya jelas.',
];

function generateLocalResponse(message) {
  const normalized = (message || '').toLowerCase();

  if (!normalized.trim()) {
    return 'Kirimkan pertanyaan atau ide, saya siap bantu.';
  }

  if (normalized.includes('halo') || normalized.includes('hai') || normalized.includes('hello')) {
    return 'Halo! Senang bisa membantu. Ceritakan kebutuhanmu, nanti saya susun jawabannya.';
  }

  if (normalized.includes('terima kasih') || normalized.includes('makasih')) {
    return 'Sama-sama! Jika ada hal lain yang ingin dibahas, tinggal tanyakan saja.';
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const cleaned = normalized.replace(/\s+/g, ' ').trim();

  return [
    pick(starters),
    cleaned ? `Saya tangkap intinya: "${cleaned}".` : '',
    pick(suggestions),
    pick(details),
    pick(enders),
  ]
    .filter(Boolean)
    .join(' ');
}

// ====== FUNGSI PANGGIL N8N ======
async function getBotReplyFromN8n(message) {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // SESUAIKAN body dengan yang diharapkan workflow n8n-mu
    body: JSON.stringify({ message }),
  });

  // Kalau n8n balas bukan 2xx, lempar error
  if (!response.ok) {
    throw new Error(`n8n error status ${response.status}`);
  }

  const data = await response.json().catch(() => ({}));

  // SESUAIKAN property-nya dengan response dari node terakhir di workflow n8n
  // contoh kalau n8n return { reply: "..." }
  if (data.reply) {
    return data.reply;
  }

  // Kalau struktur beda, kamu bisa log dulu untuk lihat:
  // console.log('Respon n8n:', data);

  // fallback kalau field reply tidak ada
  return JSON.stringify(data);
}

// ====== ROUTE CHAT YANG PAKAI n8n ======
app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  }

  try {
    // 1) coba minta jawaban dari n8n
    const replyFromN8n = await getBotReplyFromN8n(message);

    // 2) kasih respon ke frontend
    setTimeout(() => {
      res.json({ reply: replyFromN8n });
    }, 250 + Math.random() * 400);

  } catch (err) {
    console.error('Gagal konek ke n8n, pakai fallback lokal:', err.message);

    // fallback: pakai respon lokal biar webapp tetap jalan
    const reply = generateLocalResponse(message);
    setTimeout(() => {
      res.json({ reply, fallback: true });
    }, 250 + Math.random() * 400);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan.' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
