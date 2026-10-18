// Vercel serverless function: keeps your Gemini key secret on the server.
// Set GEMINI_API_KEY in Vercel -> Project Settings -> Environment Variables.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  const { contents, systemInstruction, generationConfig } = req.body || {};
  if (!Array.isArray(contents) || JSON.stringify(contents).length > 20000) return res.status(400).json({ error: 'Bad request' });
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents, systemInstruction, generationConfig })
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(502).json({ error: 'AI service unreachable' }); }
};
