const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const userRouter = require('./routes/user');
const referralRouter = require('./routes/referral');
// v2 modular routes
const usersModule = require('./modules/users');
const referralModule = require('./modules/referral');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * ✅ RENDER FIX
 * Render + Cloudflare proxy kullanır
 * express-rate-limit X-Forwarded-For için ZORUNLU
 */
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

/**
 * ROOT HEALTHCHECK (Render bunu sever)
 */
app.get('/', (req, res) => {
  res.json({ status: 'API running', version: '1.0.0' });
});

/**
 * BASIC PING
 */
app.get('/api/ping', (req, res) => {
  res.json({ msg: 'pong' });
});

/**
 * LEGACY ROUTES (v1)
 */
app.use('/api/users', usersRouter);
app.use('/api/user', userRouter);
app.use('/api/referral', referralRouter);

/**
 * AI MOCK ROUTES
 */
app.get('/api/ai/suggestions', (req, res) => {
  res.json([
    { id: 1, type: 'hotel', title: 'Roma 3 Günlük AI Paketi', price: 450 },
    { id: 2, type: 'experience', title: 'Dubai Lüks AI Tatili', price: 1299 },
    { id: 3, type: 'flight', title: 'Paris Sanat & AI Deneyimi', price: 799 }
  ]);
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email gerekli' });
  res.json({
    user: {
      id: 'u1',
      email,
      name: 'Test User',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    token: 'mock-jwt-token'
  });
});

app.post('/api/ai/compose', (req, res) => {
  const { selections = [] } = req.body;
  const total = selections.reduce((sum, item) => sum + (item.price || 0), 0);
  res.json({
    itinerary: {
      items: selections,
      total_price: total
    }
  });
});

/**
 * REEL MOCK
 */
app.post('/api/reel/generate', (req, res) => {
  const { itinerary_id } = req.body;
  if (!itinerary_id) {
    return res.status(400).json({ error: 'itinerary_id gerekli' });
  }
  res.json({
    jobId: 'job-' + Date.now(),
    status: 'pending'
  });
});

app.get('/api/reel/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.json({
    jobId,
    status: 'completed',
    reel_url:
      'https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4'
  });
});

/**
 * REFERRAL MOCK
 */
app.post('/api/referral/generate', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });
  const code = 'REF' + Math.floor(Math.random() * 100000);
  res.json({ code });
});

/**
 * ✅ MODULAR API (v2)
 */
app.use('/api/v2/users', usersModule.routes);
app.use('/api/v2/referral', referralModule.routes);

/**
 * START
 */
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});