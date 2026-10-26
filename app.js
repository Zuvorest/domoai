import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { generateFull } from './domoai.js';

const app = express();
app.use(express.json());

// Setup Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==========================================
// ENDPOINT 1: TRIGGER GENERATE
// ==========================================
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode = 't2i' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Parameter "prompt" wajib diisi.' });

    const jobId = crypto.randomUUID();

    // 1. Simpan status 'processing' ke database
    await supabase.from('domoai_jobs').insert({
      job_id: jobId,
      status: 'processing',
      prompt: prompt,
      created_at: new Date().toISOString()
    });

    // 2. LANGSUNG BALAS KE USER (Agar tidak kena Error 524)
    res.status(202).json({ 
      status: 'accepted', 
      job_id: jobId, 
      message: 'Proses generate dimulai di background.' 
    });

    // 3. Jalankan proses berat DomoAI di latar belakang
    generateFull({ 
      mode, 
      prompt, 
      modelVersion: 22006, 
      modelName: "Nano Banana 2.1" 
    })
      .then(async (result) => {
        // Jika sukses, update database jadi 'completed'
        await supabase.from('domoai_jobs').update({
          status: 'completed',
          result: result,
          updated_at: new Date().toISOString()
        }).eq('job_id', jobId);
      })
      .catch(async (error) => {
        // Jika gagal, update database jadi 'failed'
        console.error(`[JOB FAILED] ${jobId}:`, error.message);
        await supabase.from('domoai_jobs').update({
          status: 'failed',
          error: error.message,
          updated_at: new Date().toISOString()
        }).eq('job_id', jobId);
      });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ENDPOINT 2: CEK STATUS JOB
// ==========================================
app.get('/api/status/:jobId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('domoai_jobs')
      .select('*')
      .eq('job_id', req.params.jobId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Job tidak ditemukan.' });

    // Jika selesai, kirim data result. Jika masih proses, kirim status saja.
    res.json({
      job_id: data.job_id,
      status: data.status,
      error: data.error,
      images: data.status === 'completed' ? data.result?.images : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => res.send('DomoAI Async API is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Berjalan di port ${PORT}`));