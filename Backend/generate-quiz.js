import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.post("/api/generate-quiz", async (req, res) => {
    try {
        const { prompt, image } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt missing" });
        }

        const parts = [{ text: prompt }];

        if (image) {
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: image, // already Base64 — DO NOT split()
                },
            });
        }

        const payload = {
            contents: [
                {
                    parts,
                },
            ],
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const text =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        res.json({ output: text });
    } catch (err) {
        console.log("Backend Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Gemini API error" });
    }
});

app.listen(5000, () =>
    console.log("Backend running on http://localhost:5000")
);
