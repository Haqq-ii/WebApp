🔄 ALUR DATA SINGKAT – ASTA CHATBOT (WebApp + n8n + OpenAI)

1️⃣ User kirim pesan dari WebApp
Contoh:
 “dimana lokasi uii”
Di browser, pesan ini dikirim ke backend:
POST /api/chat
Body: { "message": "dimana lokasi uii" }

2️⃣ Server.js menerima request & meneruskan ke n8n
Server.js melakukan HTTP POST ke webhook n8n:
POST https://<ngrok>/webhook/open-ai
Body: { "message": "dimana lokasi uii" }

3️⃣ n8n Webhook Node menangkap data
Webhook n8n menerima JSON:
{
  "body": {
    "message": "dimana lokasi uii"
  }
}

Node selanjutnya akan memakai body.message.

4️⃣ Message a Model (OpenAI) membuat prompt AI
n8n mengirim prompt ke OpenAI:
System message → “Kamu adalah ASTA…”

User message → dari WebApp

Di belakang layar, n8n mengirim:
messages: [
  { role: "system", content: "Kamu adalah ASTA..." },
  { role: "user", content: "dimana lokasi uii" }
]

OpenAI merespons dengan JSON model seperti:
{
  "index": 0,
  "message": {
    "role": "assistant",
    "content": "UII adalah singkatan dari Universitas Islam Indonesia..."
  }
}

5️⃣ Node “Code in JavaScript” merapikan output OpenAI
n8n mengambil hanya teks yang dibutuhkan:
reply: "UII adalah singkatan dari Universitas Islam Indonesia..."

6️⃣ Respond to Webhook mengembalikan jawaban ke Server.js
n8n mengirim:
{ "reply": "UII adalah singkatan dari Universitas Islam Indonesia..." }

7️⃣ Server.js mengirim reply ke WebApp
server.js membalas ke browser:
{ "reply": "UII adalah singkatan ..." }

8️⃣ WebApp menampilkan balasan di layar
Frontend menampilkan bubble ASTA:
ASTA:
 UII adalah singkatan dari Universitas Islam Indonesia.
📌 Ringkasannya hanya 5 langkah
User → WebApp → Server.js → n8n Webhook → OpenAI → n8n Code → Server.js → WebApp

