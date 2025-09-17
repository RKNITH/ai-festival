import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-1.5-flash-latest";

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

function buildPayload(prompt) {
    return {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800, // increased a bit for Hindi text
        },
    };
}

app.post('/generate-festival', async (req, res) => {
    try {
        const { festival } = req.body;

        if (!festival || typeof festival !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid festival name' });
        }

        const festivalPrompt = `
आप एक विशेषज्ञ सांस्कृतिक इतिहासकार हैं। कृपया भारतीय त्योहार "${festival}" के बारे में जानकारी केवल **हिंदी भाषा** में दें।

अपना उत्तर बिल्कुल JSON प्रारूप में दें, इस संरचना का पालन करते हुए:
{
  "त्योहार": "...",
  "परिचय": "...",
  "मनाने_का_कारण": "...",
  "मनाने_की_विधि": "...",
  "अनुष्ठान": "...",
  "पूजे_जाने_वाले_देवता": "...",
  "उपयोग_किए_जाने_वाले_मंत्र": "...",
  "कहानी_के_पीछे": "..."
}

नियम:
- सभी फ़ील्ड हिंदी में स्पष्ट और संक्षिप्त लिखें।
- किसी भी विवरण को खाली न छोड़ें। यदि निश्चित नहीं है तो अनुमान लगाएँ।
- JSON ऑब्जेक्ट के बाहर कोई अतिरिक्त टेक्स्ट न लिखें।
`;

        const payload = buildPayload(festivalPrompt);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY,
            },
            timeout: 30000,
        });

        let text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(502).json({ error: "No content returned from AI" });
        }

        let cleaned = text.replace(/```json|```/g, "").trim();

        let festivalData;
        try {
            festivalData = JSON.parse(cleaned);
        } catch (err) {
            console.error("⚠️ Invalid JSON from AI:", text);
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    festivalData = JSON.parse(match[0]);
                } catch {
                    return res.status(502).json({ error: "Invalid response format from AI", raw: text });
                }
            } else {
                return res.status(502).json({ error: "Invalid response format from AI", raw: text });
            }
        }

        res.json(festivalData);

    } catch (error) {
        console.error("🔥 Server error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Internal server error",
            detail: error.response?.data || error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
