// backend/index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { OpenAI } = require('openai');
// LowDB imports for CommonJS
const { Low }      = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Build a dynamic GPT system prompt based on nutrient keys
function makePrompt(nutrients) {
  const list = nutrients.join(', ');
  return `
You are a nutrition logging assistant.
Interpret the user's food description into the following nutrients: ${list}.
Always respond with a single JSON object with keys:
  - date (YYYY-MM-DD)
  - ${nutrients.join('\n  - ')}
  - tips
Do NOT include any additional text—only the JSON.
`;
}

// Setup LowDB with default data
const dbFile  = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
// Pass default data here to avoid the missing-data error
const db      = new Low(adapter, { history: [] });

async function initDB() {
  // Load existing or default
  await db.read();
  await db.write();
}

initDB().then(() => {
  // POST /api/nutrition — log a new meal
  app.post('/api/nutrition', async (req, res) => {
    try {
      const { text, nutrients } = req.body;

      // Timestamp + 4AM cutoff
      let dt = req.body.datetime ? new Date(req.body.datetime) : new Date();
      if (dt.getHours() < 4) dt.setDate(dt.getDate() - 1);
      const entryDate = dt.toISOString().split('T')[0];

      // Determine keys to request from GPT
      const keys = Array.isArray(nutrients) && nutrients.length
        ? nutrients
        : ['calories','protein','carbs','fat'];
      const system = makePrompt(keys);

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: text   }
        ],
        temperature: 0.7
      });

      // Parse GPT’s JSON response
      const raw = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        return res.status(500).json({
          error: `JSON parse error: ${err.message}`,
          rawOutput: raw
        });
      }

      // Stamp date and persist
      parsed.date = entryDate;
      await db.read();
      const nextId = db.data.history.length
        ? Math.max(...db.data.history.map(e => e.id)) + 1
        : 1;
      const record = { id: nextId, ...parsed };
      db.data.history.push(record);
      await db.write();

      res.json(record);

    } catch (err) {
      if (err.code === 'insufficient_quota' || err.status === 429) {
        return res.status(402).json({
          error: 'Quota exhausted. Please add billing or wait.'
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/history — fetch all meals
  app.get('/api/history', async (_req, res) => {
    await db.read();
    res.json(db.data.history);
  });

  // PATCH /api/history/:id — edit an entry
  app.patch('/api/history/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await db.read();
    const entry = db.data.history.find(e => e.id === id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    ['date','calories','protein','carbs','fat'].forEach(field => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });
    await db.write();
    res.json(entry);
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Nutrition API listening on http://localhost:${PORT}`);
  });
});
