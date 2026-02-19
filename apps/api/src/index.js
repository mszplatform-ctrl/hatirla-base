const express = require('express');
const cors = require('cors');
const usersRouter = require("./routes/users");
const userRouter = require("./routes/user");       // /api/user
const referralRouter = require("./routes/referral");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Test
app.get("/api/ping", (req, res) => res.json({ msg: "pong" }));

// Routes
app.use("/api/users", usersRouter);
app.use("/api/user", userRouter);                  // /api/user route eklendi
app.use("/api/referral", referralRouter);

// AI Suggestions
app.get("/api/ai/suggestions", (req,res) => {
  res.json([
    { id: 1, type: "hotel", title: "Roma 3 Günlük AI Paketi", description: "Kolosseum ve tarihi merkezin yakınında lüks bir konaklamayla Roma'yı keşfedin.", score: 0.95, price: 450 },
    { id: 2, type: "experience", title: "Dubai Lüks AI Tatili", description: "Çöl safarisi ve Burj Khalifa'yı kapsayan unutulmaz bir Dubai deneyimi.", score: 0.88, price: 1299 },
    { id: 3, type: "flight", title: "Paris Sanat & AI Deneyimi", description: "Louvre, Eyfel Kulesi ve Seine nehri turunu içeren Paris sanat yolculuğu.", score: 0.82, price: 799 }
  ]);
});

// Login
app.post("/api/auth/login", (req,res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email gerekli" });

  res.json({
    user: { id:"u1", email, name:"Test User", avatar:"https://i.pravatar.cc/150?img=3" },
    token:"mock-jwt-token"
  });
});

// Compose
app.post("/api/ai/compose", (req,res) => {
  const { selections } = req.body;
  const total = selections.reduce((sum,item)=>sum+(item.price||0),0);
  res.json({ itinerary:{ items: selections, total_price: total } });
});

// Reel
app.post("/api/reel/generate", (req,res) => {
  const { itinerary_id } = req.body;
  if (!itinerary_id) return res.status(400).json({ error:"itinerary_id gerekli" });

  res.json({ jobId:"job-"+Date.now(), status:"pending" });
});

app.get("/api/reel/status/:jobId", (req,res) => {
  const { jobId } = req.params;
  res.json({
    jobId,
    status:"completed",
    reel_url:"https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4"
  });
});

// Referral Generate (frontend’in beklediği)
app.post("/api/referral/generate", (req,res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error:"userId gerekli" });

  const code = "REF"+Math.floor(Math.random()*100000);
  res.json({ code });
});

app.listen(PORT, ()=>console.log(`API running on http://localhost:${PORT}`));




