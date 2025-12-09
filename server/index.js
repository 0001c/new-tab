import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const apiKey = process.env.GEMINI_API_KEY;
let client = null;

if (apiKey) {
  client = new GoogleGenAI({ apiKey });
} else {
  console.warn('GEMINI_API_KEY not set in server environment.');
}

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/api/gemini/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  if (!client) return res.status(500).json({ error: 'API key not configured on server' });

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    res.json({ text: response.text || null, isReal: true });
  } catch (err) {
    // Log full error stack and any properties to aid debugging (network/proxy/TLS)
    console.error('Gemini error:', err && (err.stack || err));
    if (err && typeof err === 'object') {
      try {
        console.error('Gemini error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      } catch (e) {
        // ignore JSON stringify errors
      }
    }
    console.warn('Falling back to mock response (Gemini API unavailable)');
    
    const mockResponses = {
      'what is 2+2': 'The sum of 2+2 is 4.',
      'capital of france': 'The capital of France is Paris.',
      'what is the capital of france': 'The capital of France is Paris, a beautiful city known for the Eiffel Tower, museums, and romantic atmosphere.',
      'hello': 'Hello! How can I assist you today?',
      '你好': '你好！很高兴认识你。我是一个 AI 助手，现在处于演示模式。',
      '2+2': '2 加 2 等于 4。',
      'paris': 'Paris is the capital of France.',
      'default': `I received your prompt: "${prompt}" but I'm currently in demo mode. In production, I would process your request with Gemini AI.`
    };
    
    const lowerPrompt = prompt.toLowerCase();
    let mockText = mockResponses['default'];
    
    // Try exact match first (for Chinese)
    if (mockResponses[prompt]) {
      mockText = mockResponses[prompt];
    } else {
      // Then try case-insensitive substring match (for English)
      for (const [key, value] of Object.entries(mockResponses)) {
        if (key !== 'default' && lowerPrompt.includes(key.toLowerCase())) {
          mockText = value;
          break;
        }
      }
    }
    
    res.json({ text: mockText, isMock: true, originalError: String(err) });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  const { history } = req.body;
  if (!client) return res.status(500).json({ error: 'API key not configured on server' });
  
  try {
    // The SDK's `chats.create` may return a session-like object rather than a completed
    // assistant reply. To ensure the frontend receives a concrete `text` reply, we
    // synthesize a prompt from the history and call `models.generateContent` which
    // returns a textual response.
    const hist = Array.isArray(history) ? history : [];
    if (hist.length === 0) return res.status(400).json({ error: 'Missing history' });

    // Build a simple conversational prompt from history. This is a pragmatic
    // approach so the backend always returns a text field the frontend can display.
    const promptParts = hist.map(h => (h.role === 'user' ? `User: ${h.text}` : `Assistant: ${h.text}`));
    // Append an assistant turn marker to prompt the model to reply.
    promptParts.push('Assistant:');
    const prompt = promptParts.join('\n');

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {}
    });

    const text = response?.text || null;
    res.json({ text, raw: response });
  } catch (err) {
    console.error('Gemini chat error:', err && (err.stack || err));
    res.status(500).json({ error: 'Gemini API error', details: String(err) });
  }
});

// Simple root route to show server status and available endpoints
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><meta charset="utf-8"><title>Backend Proxy</title></head>
      <body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;">
        <h2>Backend proxy is running</h2>
        <p>Available endpoints:</p>
        <ul>
          <li><code>POST /api/gemini/generate</code> - body: {"prompt":"..."}</li>
          <li><code>POST /api/gemini/chat</code> - body: {"history":[{role:'user'|'model',text:'...'}]}</li>
        </ul>
        <p>Frontend (dev): <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
        <p>Node version: ${process.versions.node}</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Backend proxy listening on http://localhost:${PORT}`);
});
