'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { execFile } = require('child_process');

const app = express();
const PORT = 3001;
const REPO_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'images');

// Live preview of the static site
const siteApp = express();
siteApp.use(express.static(REPO_DIR));
siteApp.listen(3000, () => console.log('Live-Vorschau: http://localhost:3000'));

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(IMAGES_DIR));

function readJson(name, res) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
  } catch (err) {
    if (res) res.status(500).json({ error: `Could not read ${name}: ${err.message}` });
    return null;
  }
}

function writeJson(name, data, res) {
  try {
    fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), 'utf8');
    if (res) res.json({ ok: true });
  } catch (err) {
    if (res) res.status(500).json({ error: `Could not write ${name}: ${err.message}` });
  }
}

async function convertAndSave(inputBuffer, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const MAX_BYTES = 500 * 1024;
  let quality = 80;
  let buf;
  do {
    buf = await sharp(inputBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();
    quality -= 5;
  } while (buf.length > MAX_BYTES && quality >= 20);
  fs.writeFileSync(outputPath, buf);
}

function safeSlug(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event-' + Date.now();
}

// Events
app.get('/api/events', (req, res) => {
  const data = readJson('events.json', res);
  if (data) res.json(data);
});

app.put('/api/events', (req, res) => {
  writeJson('events.json', req.body, res);
});

// Vita
app.get('/api/vita', (req, res) => {
  const data = readJson('vita.json', res);
  if (data) res.json(data);
});

app.put('/api/vita', (req, res) => {
  writeJson('vita.json', req.body, res);
});

// Repertoire
app.get('/api/repertoire', (req, res) => {
  const data = readJson('repertoire.json', res);
  if (data) res.json(data);
});

app.put('/api/repertoire', (req, res) => {
  writeJson('repertoire.json', req.body, res);
});

// KiK
app.get('/api/kik', (req, res) => {
  const data = readJson('kik.json', res);
  if (data) res.json(data);
});

app.put('/api/kik', (req, res) => {
  writeJson('kik.json', req.body, res);
});

app.post('/api/kik/upload-logo', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });
    const outputPath = path.join(IMAGES_DIR, 'kik-logo.webp');
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, logoSrc: 'images/kik-logo.webp' });
  } catch (err) {
    console.error('upload-logo error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Trio Note à Note
app.get('/api/trio-note-a-note', (req, res) => {
  const data = readJson('trio-note-a-note.json', res);
  if (data) res.json(data);
});

app.put('/api/trio-note-a-note', (req, res) => {
  writeJson('trio-note-a-note.json', req.body, res);
});

app.post('/api/trio-note-a-note/upload-gallery', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });
    const filename = 'trio-' + Date.now() + '.webp';
    const outputPath = path.join(IMAGES_DIR, 'trio-note-a-note', filename);
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, imagePath: 'images/trio-note-a-note/' + filename });
  } catch (err) {
    console.error('upload-gallery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Duo Müller-Mazzoletti
app.get('/api/duo-muller-mazzoletti', (req, res) => {
  const data = readJson('duo-muller-mazzoletti.json', res);
  if (data) res.json(data);
});

app.put('/api/duo-muller-mazzoletti', (req, res) => {
  writeJson('duo-muller-mazzoletti.json', req.body, res);
});

app.post('/api/duo-muller-mazzoletti/upload-gallery', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });
    const filename = 'duo-mm-' + Date.now() + '.webp';
    const outputPath = path.join(IMAGES_DIR, 'duo-muller-mazzoletti', filename);
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, imagePath: 'images/duo-muller-mazzoletti/' + filename });
  } catch (err) {
    console.error('upload-gallery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Duo DieDa
app.get('/api/duo-dieda', (req, res) => {
  const data = readJson('duo-dieda.json', res);
  if (data) res.json(data);
});

app.put('/api/duo-dieda', (req, res) => {
  writeJson('duo-dieda.json', req.body, res);
});

app.post('/api/duo-dieda/upload-gallery', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });
    const filename = 'dieda-' + Date.now() + '.webp';
    const outputPath = path.join(IMAGES_DIR, 'duo-dieda', filename);
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, imagePath: 'images/duo-dieda/' + filename });
  } catch (err) {
    console.error('upload-gallery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Kontakt
app.get('/api/kontakt', (req, res) => {
  const data = readJson('kontakt.json', res);
  if (data) res.json(data);
});

app.put('/api/kontakt', (req, res) => {
  writeJson('kontakt.json', req.body, res);
});

// Video page
app.get('/api/video', (req, res) => {
  const data = readJson('video.json', res);
  if (data) res.json(data);
});

app.put('/api/video', (req, res) => {
  writeJson('video.json', req.body, res);
});

// Konzertarchiv
app.get('/api/archiv', (req, res) => {
  const data = readJson('archiv.json', res);
  if (data) res.json(data);
});

app.put('/api/archiv', (req, res) => {
  writeJson('archiv.json', req.body, res);
});

app.post('/api/archiv/upload-image', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });
    const filename = 'archiv-' + Date.now() + '.webp';
    const outputPath = path.join(IMAGES_DIR, 'archiv', filename);
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, imagePath: 'images/archiv/' + filename });
  } catch (err) {
    console.error('archiv upload-image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload image (base64 → WebP)
app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageBase64, eventId } = req.body;
    if (!imageBase64 || !eventId) return res.status(400).json({ error: 'Missing imageBase64 or eventId' });
    const filename = safeSlug(eventId) + '.webp';
    const outputPath = path.join(IMAGES_DIR, 'events', filename);
    await convertAndSave(Buffer.from(imageBase64, 'base64'), outputPath);
    res.json({ ok: true, imagePath: 'images/events/' + filename });
  } catch (err) {
    console.error('upload-image error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Git status — check if data/ or images/ have uncommitted changes
app.get('/api/git/status', (req, res) => {
  execFile('git', ['status', '--porcelain', 'data/', 'images/'], { cwd: REPO_DIR }, (err, stdout) => {
    if (err) return res.json({ ok: false, error: err.message });
    res.json({ ok: true, hasChanges: stdout.trim().length > 0 });
  });
});

// Git publish — stage data/ + images/, commit with message, push
app.post('/api/git/publish', (req, res) => {
  const msg = (req.body.message || '').trim() || `Inhalt aktualisiert: ${new Date().toLocaleDateString('de-CH')}`;
  execFile('git', ['add', 'data/', 'images/'], { cwd: REPO_DIR }, addErr => {
    if (addErr) return res.json({ ok: false, error: addErr.message });
    execFile('git', ['commit', '-m', msg], { cwd: REPO_DIR }, (commitErr, commitOut, commitStderr) => {
      const nothingToCommit = (commitOut + commitStderr).includes('nothing to commit') ||
                              (commitOut + commitStderr).includes('nothing added to commit');
      if (commitErr && !nothingToCommit) return res.json({ ok: false, error: (commitStderr || commitErr.message).trim() });
      // Pull remote changes first (handles edits made directly on GitHub)
      execFile('git', ['pull', '--rebase'], { cwd: REPO_DIR }, (pullErr, _pullOut, pullStderr) => {
        if (pullErr) return res.json({ ok: false, error: (pullStderr || pullErr.message).trim() });
        execFile('git', ['push'], { cwd: REPO_DIR }, (pushErr, _out, pushStderr) => {
          if (pushErr) return res.json({ ok: false, error: (pushStderr || pushErr.message).trim() });
          res.json({ ok: true });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Admin-CMS läuft auf http://localhost:${PORT}`);
});
