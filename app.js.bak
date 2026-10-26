import express from 'express';
import { generateFull } from './domoai.js';

const app = express();
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode = 't2i' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "prompt" wajib diisi.' });
    }

    console.log(`[SERVER] Menerima request: "${prompt}" (Mode: ${mode})`);

    const result = await generateFull({
      mode: mode, 
      prompt: prompt,
      modelVersion: 22006, // 22006 = Nano Banana 2.1
      modelName: "Nano Banana 2.1",
    });

    console.log(`[SERVER] Berhasil generate untuk: "${prompt}"`);
    res.json(result);

  } catch (error) {
    console.error('[SERVER] Gagal generate:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan internal pada server.' });
  }
});

app.get('/', (req, res) => {
  res.send('DomoAI API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Berjalan di port ${PORT}`);
});