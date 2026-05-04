import express from "express";
import cors from "cors";

const app = express();

// CORS middleware - must come first
app.use(cors({
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2-VL-7B-Instruct";
const HF_API_URL = "https://api-inference.huggingface.co";

app.post("/api/analyze-image", async (req, res) => {
  console.log("📥 Received request:", req.body);
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl" });
  }

  if (!HF_TOKEN) {
    console.error("❌ Missing HF_TOKEN");
    return res.status(500).json({ error: "Missing HF_TOKEN on server" });
  }

  try {
    console.log(`🚀 Calling HF API with model: ${HF_MODEL}`);
    const response = await fetch(`${HF_API_URL}/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<image>${imageUrl}</image> Inspect this image and return JSON with: summary (1 sentence), findings (4-6 items with icon, label, value), pov (attacker perspective). Return only valid JSON.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ HF API error ${response.status}:`, error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log("✅ Got response from HF API");
    res.json(data);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
