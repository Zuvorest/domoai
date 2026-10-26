import express from 'express';
import { generateFull } from './domoai.js'; // Pastikan path ini benar

const app = express();
app.use(express.json());

// Endpoint untuk generate gambar
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode = 't2i' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "prompt" wajib diisi.' });
    }

    console.log(`[SERVER] Menerima request: "${prompt}" (Mode: ${mode})`);

    // Panggil fungsi dari script DomoAI kita
    const result = await generateFull({
      mode: mode, // 't2i' untuk text-to-image, 'i2i' untuk image-to-image
      prompt: prompt,
      // modelVersion dan modelName bisa disesuaikan jika perlu
      // modelVersion: 22006, 
      // modelName: "Nano Banana 2.1",
    });

    console.log(`[SERVER] Berhasil generate untuk: "${prompt}"`);
    res.json(result);

  } catch (error) {
    console.error('[SERVER] Gagal generate:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan internal pada server.' });
  }
});

// Endpoint health check sederhana
app.get('/', (req, res) => {
  res.send('DomoAI API is running!');
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Berjalan di port ${PORT}`);
});