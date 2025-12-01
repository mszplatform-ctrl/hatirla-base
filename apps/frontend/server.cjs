// server.cjs — frontend (index.html) ve basit API'yi tek sunucuda çalıştırır

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5173;

// Basit API (eski backend içeriğini buraya taşıyoruz)
app.get('/api/ai/suggestions', (req, res) => {
  res.json([
    { type: 'hotel', score: 0.92, payload: { id: 'h1', name: 'Mock Hotel', price: 120 } },
    { type: 'experience', score: 0.88, payload: { id: 'e1', title: 'City Food Tour', price: 30 } },
    { type: 'flight', score: 0.85, payload: { id: 'f1', origin: 'IST', dest: 'AYT', price: 45 } }
  ]);
});

// index.html dosyasını sun
const indexPath = path.join(__dirname, 'index.html');
app.get('/', (req, res) => {
  res.sendFile(indexPath);
});
// index.html dışında doğrudan istenirse dosya serve et (ör. /index.html)
app.get('/index.html', (req, res) => res.sendFile(indexPath));

// Eğer başka statik var ise serve et (ör. /assets)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Basit 404
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log('Frontend + API running at http://localhost:' + PORT);
});
