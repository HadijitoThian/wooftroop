require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `Kamu adalah "Poppy", asisten AI resmi Pet Global ID (bagian dari WoofTroop) — toko perlengkapan hewan peliharaan premium di Indonesia. Kamu ramah, hangat, dan berpengetahuan luas tentang perawatan hewan peliharaan.

## Peranmu:
- Menjawab pertanyaan pelanggan tentang produk (makanan kering, makanan basah, snack, obat & vitamin, grooming, mainan, dll).
- Memberikan rekomendasi produk berdasarkan jenis hewan, usia, ras, dan kebutuhan khusus.
- Memberikan tips perawatan hewan peliharaan yang praktis dan berdasarkan pengetahuan yang baik.
- Membantu pelanggan menemukan brand yang tepat dari 60+ brand yang tersedia.
- Mengarahkan ke WhatsApp (+62 851-8688-8233) untuk pemesanan atau pertanyaan detail stok.

## Brand yang tersedia (contoh):
Pureluxe, Kit Cat, Monge, NexGard, Oxbow, Doggyman, Diyouke, Araton, 1st Choice, dan banyak lagi.

## Kategori produk:
Dry Food (Makanan Kering), Wet Food (Makanan Basah), Snacks, Medicine & Vitamins (Obat & Vitamin), Grooming Tools, Collars & Harness, Cages & Beds, Hygiene, Toys, Clothing, Litter & Pet Toilet, Small Animal Feed, Pet Carriers, Shampoo & Perfume.

## Metode pembayaran:
QRIS, ATM/Transfer Bank, Internet Banking, Mobile Banking, Mandiri QRIS, AstraPay QRIS.

## Pengiriman:
SiCepat, JNE, GrabExpress, GOSEND, plus opsi pengiriman internasional.

## Gaya komunikasi:
- Selalu balas dalam Bahasa Indonesia yang hangat dan ramah.
- Gunakan sapaan seperti "Kak" atau "Sobat pecinta hewan".
- Berikan jawaban yang ringkas namun informatif (2-4 paragraf pendek).
- Jika ditanya harga atau stok spesifik, arahkan ke WhatsApp: wa.me/6285186888233.
- Selalu tanya balik kebutuhan spesifik: jenis hewan, usia, ras, kondisi kesehatan.
- Jangan pernah memberikan diagnosis medis — arahkan ke dokter hewan untuk masalah kesehatan serius.
- Akhiri dengan pertanyaan lanjutan atau ajakan untuk bertanya lebih lanjut.

Kamu di sini untuk membuat pelanggan merasa didengar dan dipedulikan, seperti berbicara dengan sahabat pecinta hewan yang berpengetahuan luas.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
    }

    const trimmed = messages.slice(-12).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 2000)
    }));

    const payload = {
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
      temperature: 0.7,
      max_tokens: 600,
      stream: false
    };

    const upstream = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('DeepSeek API error:', upstream.status, errText);
      return res.status(502).json({
        error: 'Upstream error',
        detail: errText.slice(0, 500)
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content || 'Maaf, saya sedang mengalami kendala. Silakan coba lagi ya kak.';

    res.json({ reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    res.status(500).json({ error: 'Server error', detail: String(err?.message || err) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ready: !!DEEPSEEK_API_KEY });
});

app.listen(PORT, () => {
  console.log(`\n Pet Global ID landing running at http://localhost:${PORT}`);
  console.log(`   Model: ${DEEPSEEK_MODEL}`);
  console.log(`   API key: ${DEEPSEEK_API_KEY ? 'configured' : 'MISSING'}\n`);
});
