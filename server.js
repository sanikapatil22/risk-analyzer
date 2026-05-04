import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

// CORS middleware - must come first
const corsOptions = {
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "50mb" }));

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "CohereLabs/aya-vision-32b:cohere";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

const extractContent = (payload) => {
  const content = payload?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
};

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
    console.log(`🚀 Calling HF router with model: ${HF_MODEL}`);
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        stream: false,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You analyze uploaded images for privacy and exposure risks. Return only JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Inspect the uploaded image and return JSON with: summary (1 sentence), findings (4-6 concrete items with icon, label, value), and pov (a concise first-person attacker perspective based on what is visible). Use only details that are visible or strongly inferable from the image. Be specific and avoid generic filler.",
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ HF API error ${response.status}:`, error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    const content = extractContent(data);
    console.log("✅ Got response from HF API");
    res.json([{ generated_text: content }]);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Uploaded image is too large. Please use a smaller screenshot or crop the image.",
    });
  }
  return next(err);
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
