'use strict';
require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');
const proxyaddr = require('proxy-addr');
const { isRecord, inRange, createLimiter, originAllowed, validAnalysis } = require('./security');
const { normalizeTypingText } = require('../public/typing-text');
const { startFinishWindow, giveUpPlayer, allRacersDone } = require('./race-rules');

// ── Environment validation ────────────────────────────────────────────────────
const PORT          = parseInt(process.env.PORT, 10) || 3000;
const GROQ_API_KEY  = process.env.GROQ_API_KEY || '';
const GROQ_MODEL    = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:' + PORT;
const NODE_ENV      = process.env.NODE_ENV || 'development';

const production = NODE_ENV === 'production';
if (production) {
  let origin;
  try { origin = new URL(process.env.ALLOWED_ORIGIN); } catch { throw new Error('Set ALLOWED_ORIGIN to the exact public HTTPS origin in production.'); }
  if (origin.protocol !== 'https:' || origin.origin !== process.env.ALLOWED_ORIGIN) {
    throw new Error('ALLOWED_ORIGIN must be an exact HTTPS origin without a path or trailing slash.');
  }
}
const TRUSTED_PROXIES = process.env.TRUSTED_PROXIES || '';
const securityLimits = createLimiter();
let aiInFlight = 0;
async function aiCompletion(client, options) {
  if (aiInFlight >= 4 || !securityLimits.consume('ai:global', 30).allowed) {
    throw new Error('AI capacity exceeded');
  }
  aiInFlight++;
  try { return await client.chat.completions.create(options); }
  finally { aiInFlight--; }
}

// Warn if key is missing in production
if (NODE_ENV === 'production' && !GROQ_API_KEY) {
  console.warn('[Security] GROQ_API_KEY is not set. AI features will be disabled.');
}

// ── Leaderboard (persisted to leaderboard.json) ──────────────────────────────
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

function loadLeaderboard() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.filter(row => isRecord(row) && typeof row.name === 'string'
        && inRange(row.wpm, 10, 300) && inRange(row.accuracy, 0, 100)
        && typeof row.date === 'string' && Number.isFinite(Date.parse(row.date)))
        .slice(0, 100).map(row => ({ name: sanitizeName(row.name), wpm: Math.round(row.wpm),
          accuracy: Math.round(row.accuracy), date: new Date(row.date).toISOString() }));
    }
  } catch (e) { console.error('Leaderboard load error:', e.message); }
  return [];
}

function saveLeaderboard(lb) {
  try { fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(lb, null, 2)); }
  catch (e) { console.error('Leaderboard save error:', e.message); }
}

function submitToLeaderboard(name, wpm, accuracy) {
  if (!name || !inRange(wpm, 10, 300) || !inRange(accuracy, 0, 100)) return;
  const lb = loadLeaderboard();
  lb.push({
    name: sanitizeName(name),
    wpm:  Math.round(wpm),
    accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
    date: new Date().toISOString()
  });
  lb.sort((a, b) => b.wpm - a.wpm);
  const top100 = lb.slice(0, 100);
  saveLeaderboard(top100);
  return top100.slice(0, 10);
}

// ── Input sanitization helpers ────────────────────────────────────────────────
function sanitizeName(name) {
  if (typeof name !== 'string') return 'Anonymous';
  // Strip HTML, control characters, and limit to visible ASCII/unicode letters
  return name.replace(/[<>&"'`]/g, '').replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 20) || 'Anonymous';
}

function sanitizeCode(code) {
  if (typeof code !== 'string' || !/^[A-Za-z0-9]{6}$/.test(code)) return '';
  return code.toUpperCase();
}

// ── Rate limiting (in-memory, per IP) ────────────────────────────────────────
function rateLimit(windowMs, maxRequests, scope = 'route') {
  return (req, res, next) => {
    const result = securityLimits.consume('http:' + scope + ':' + req.path + ':' + req.ip, maxRequests, windowMs);
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    next();
  };
}

// ── Socket.IO connection rate limit (per IP) ──────────────────────────────────
const socketConnections = new Map(); // ip -> count

// ── Express app setup ─────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
app.disable('x-powered-by');
// Only explicitly listed proxy addresses may supply client IP headers.
app.set('trust proxy', TRUSTED_PROXIES ? TRUSTED_PROXIES.split(',').map(value => value.trim()) : false);
function clientIp(req) { return proxyaddr(req, app.get('trust proxy fn')); }
server.headersTimeout = 15000;
server.requestTimeout = 30000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 100;

// ── Security headers (Helmet-style, without the package dependency) ───────────
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Stop MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Force HTTPS in production
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",   // All executable code is served from local files.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' " + ALLOWED_ORIGIN.replace(/^http/, 'ws'),
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; '));
  // Remove server fingerprint
  res.removeHeader('X-Powered-By');
  next();
});

// ── CORS (restrict to your own domain in production) ─────────────────────────
const io = new Server(server, {
  // Preserve the socket identity, rooms, and missed events for brief outages.
  connectionStateRecovery: { maxDisconnectionDuration: 20000, skipMiddlewares: false },
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
  },
  allowRequest: (req, callback) => {
    const allowed = originAllowed(req, ALLOWED_ORIGIN, production)
      && io.engine.clientsCount < 1000
      && securityLimits.consume('handshake:' + clientIp(req), 30).allowed;
    callback(null, allowed);
  },
  // Gameplay events are tiny; bound individual packets to 16 KiB.
  maxHttpBufferSize: 16 * 1024,
  // Allow only polling and websocket (not other transports)
  transports: ['polling', 'websocket'],
});

// ── Body parser with size limit ───────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!originAllowed(req, ALLOWED_ORIGIN, production)) return res.status(403).json({ error: 'Origin not allowed.' });
  if (req.method === 'POST' && !req.is('application/json')) return res.status(415).json({ error: 'Use application/json.' });
  next();
});
app.use('/api', rateLimit(60000, 180, 'body'));
app.use(express.json({ limit: '16kb', strict: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ── API Routes ────────────────────────────────────────────────────────────────

// GET /api/leaderboard — 60 requests/min per IP
app.get('/api/leaderboard', rateLimit(60 * 1000, 60), (req, res) => {
  res.json(loadLeaderboard().slice(0, 10));
});

// GET /api/rooms — 30 requests/min per IP
app.get('/api/rooms', rateLimit(60 * 1000, 30), (req, res) => {
  const publicRooms = Object.values(rooms)
    .filter(r => r.state === 'waiting' && r.isPublic)
    .map(r => ({
      code:        r.code,
      playerCount: Array.from(r.players.values()).filter(p => !p.isBot).length,
      maxPlayers:  6,
    }));
  res.json(publicRooms);
});

// POST /api/analyze — 10 requests/min per IP (expensive AI call)
app.post('/api/analyze', rateLimit(60 * 1000, 10), async (req, res) => {
  if (!validAnalysis(req.body)) return res.status(400).json({ error: 'Invalid analysis data.' });
  const { wpm, accuracy, errors, totalTime, wordTimings, prompt } = req.body;

  const client = getGroqClient();
  if (!client) {
    return res.json({ analysis: 'Set GROQ_API_KEY to enable AI analysis.' });
  }

  const sorted = [...wordTimings]
    .filter(w => w && typeof w.ms === 'number' && typeof w.word === 'string' && w.ms > 0)
    .map(w => ({ ...w, msPerChar: w.ms / Math.max(1, w.word.length) }))
    .sort((a, b) => b.msPerChar - a.msPerChar);

  const slowest = sorted.slice(0, 3).map(w =>
    `"${w.word.slice(0, 30)}" (${Math.round(w.ms)}ms, ${Math.round(w.msPerChar)}ms/char)`
  ).join(', ');

  const avgMs = wordTimings
    .filter(w => w && typeof w.ms === 'number')
    .reduce((s, w) => s + w.ms, 0) / Math.max(1, wordTimings.length);

  const userPrompt = [
    `The player just finished a typing race. Here are their stats:`,
    `- WPM: ${Math.round(wpm)}`,
    `- Accuracy: ${Math.round(accuracy)}%`,
    `- Total errors: ${Math.round(errors)}`,
    `- Race duration: ${Math.round(totalTime)}s`,
    `- Words in prompt: ${wordTimings.length}`,
    `- Average time per word: ${Math.round(avgMs)}ms`,
    `- Slowest words: ${slowest || 'none recorded'}`,
    `- Full prompt typed: "${prompt.slice(0, 300)}"`,
    ``,
    `Write a short, personalised post-race analysis (3-4 sentences max).`,
    `Be specific about their weak spots and give one actionable tip.`,
    `Be encouraging but honest. Don't use bullet points. Plain text only.`,
  ].join('\n');

  try {
    const completion = await aiCompletion(client, {
      model:       GROQ_MODEL,
      max_completion_tokens: 1024,
      reasoning_effort: 'low',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a typing coach. Give concise, specific, encouraging feedback based on real race data.' },
        { role: 'user',   content: userPrompt },
      ],
    });

    const analysis = (completion.choices?.[0]?.message?.content?.trim() || '').slice(0, 2000);
    res.json({ analysis });
  } catch (err) {
    console.error('[Groq] Analysis error:', err.message);
    res.json({ analysis: '' });
  }
});

// 404 fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Safe errors: never expose parser details, request bodies, or stack traces.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.type === 'entity.too.large' ? 413 : err instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ error: status === 413 ? 'Request too large.' : status === 400 ? 'Invalid JSON.' : 'Internal server error.' });
});

// ── Quotes library ───────────────────────────────────────────────────────────
const QUOTES = [
  { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", source: "Pride and Prejudice — Jane Austen", category: "literature" },
  { text: "Call me Ishmael. Some years ago, never mind how long precisely, having little money in my purse, I thought I would sail about a little and see the watery part of the world.", source: "Moby-Dick — Herman Melville", category: "literature" },
  { text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.", source: "A Tale of Two Cities — Charles Dickens", category: "literature" },
  { text: "All happy families are alike; each unhappy family is unhappy in its own way.", source: "Anna Karenina — Leo Tolstoy", category: "literature" },
  { text: "It was a bright cold day in April, and the clocks were striking thirteen.", source: "Nineteen Eighty-Four — George Orwell", category: "literature" },
  { text: "The sky above the port was the color of television, tuned to a dead channel.", source: "Neuromancer — William Gibson", category: "literature" },
  { text: "Not all those who wander are lost; the old that is strong does not wither, deep roots are not reached by the frost.", source: "The Lord of the Rings — J.R.R. Tolkien", category: "literature" },
  { text: "It does not do to dwell on dreams and forget to live, remember that.", source: "Harry Potter and the Philosopher's Stone — J.K. Rowling", category: "literature" },
  { text: "We accept the love we think we deserve.", source: "The Perks of Being a Wallflower — Stephen Chbosky", category: "literature" },
  { text: "In the beginning was the Word, and the Word was with God, and the Word was God.", source: "The Bible — John 1:1", category: "literature" },
  { text: "The man in black fled across the desert, and the gunslinger followed.", source: "The Dark Tower — Stephen King", category: "literature" },
  { text: "There is no greater agony than bearing an untold story inside you.", source: "I Know Why the Caged Bird Sings — Maya Angelou", category: "literature" },
  { text: "Get busy living, or get busy dying.", source: "The Shawshank Redemption (1994)", category: "film" },
  { text: "Why so serious? Let's put a smile on that face.", source: "The Dark Knight (2008)", category: "film" },
  { text: "To infinity and beyond.", source: "Toy Story (1995)", category: "film" },
  { text: "Life is like a box of chocolates. You never know what you're gonna get.", source: "Forrest Gump (1994)", category: "film" },
  { text: "It is not our abilities that show what we truly are. It is our choices.", source: "Harry Potter and the Chamber of Secrets (2002)", category: "film" },
  { text: "With great power comes great responsibility.", source: "Spider-Man (2002)", category: "film" },
  { text: "You either die a hero or you live long enough to see yourself become the villain.", source: "The Dark Knight (2008)", category: "film" },
  { text: "The first rule of Fight Club is you do not talk about Fight Club.", source: "Fight Club (1999)", category: "film" },
  { text: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", source: "The Shawshank Redemption (1994)", category: "film" },
  { text: "Do or do not. There is no try.", source: "Star Wars: The Empire Strikes Back (1980)", category: "film" },
  { text: "After all this time? Always.", source: "Harry Potter and the Deathly Hallows (2011)", category: "film" },
  { text: "I have a dream that one day this nation will rise up and live out the true meaning of its creed: we hold these truths to be self-evident, that all men are created equal.", source: "I Have a Dream — Martin Luther King Jr., 1963", category: "speech" },
  { text: "Ask not what your country can do for you, ask what you can do for your country.", source: "Inaugural Address — John F. Kennedy, 1961", category: "speech" },
  { text: "The only thing we have to fear is fear itself.", source: "First Inaugural Address — Franklin D. Roosevelt, 1933", category: "speech" },
  { text: "We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall never surrender.", source: "We Shall Fight on the Beaches — Winston Churchill, 1940", category: "speech" },
  { text: "That's one small step for man, one giant leap for mankind.", source: "Moon Landing — Neil Armstrong, 1969", category: "speech" },
  { text: "The time is always right to do what is right.", source: "Martin Luther King Jr.", category: "speech" },
  { text: "In the middle of every difficulty lies opportunity.", source: "Albert Einstein", category: "speech" },
  { text: "I think therefore I am.", source: "Discourse on the Method — René Descartes", category: "philosophy" },
  { text: "The unexamined life is not worth living.", source: "Apology — Socrates", category: "philosophy" },
  { text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", source: "Being and Nothingness — Jean-Paul Sartre", category: "philosophy" },
  { text: "He who has a why to live can bear almost any how.", source: "Twilight of the Idols — Friedrich Nietzsche", category: "philosophy" },
  { text: "The only true wisdom is in knowing you know nothing.", source: "Socrates", category: "philosophy" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", source: "Meditations — Marcus Aurelius", category: "philosophy" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", source: "Nicomachean Ethics — Aristotle", category: "philosophy" },
  { text: "Somewhere, something incredible is waiting to be known.", source: "Carl Sagan", category: "science" },
  { text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", source: "Albert Einstein", category: "science" },
  { text: "Science is not only a disciple of reason but also one of romance and passion.", source: "Stephen Hawking", category: "science" },
  { text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.", source: "Cosmos — Carl Sagan", category: "science" },
  { text: "If you wish to make an apple pie from scratch, you must first invent the universe.", source: "Cosmos — Carl Sagan", category: "science" },
  { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", source: "Albert Einstein", category: "science" },
  { text: "It's dangerous to go alone. Take this.", source: "The Legend of Zelda (1986)", category: "game" },
  { text: "Stay a while and listen.", source: "Diablo II (2000)", category: "game" },
  { text: "The cake is a lie.", source: "Portal (2007)", category: "game" },
  { text: "War. War never changes.", source: "Fallout (1997)", category: "game" },
  { text: "What is a man? A miserable little pile of secrets! But enough talk, have at you!", source: "Castlevania: Symphony of the Night (1997)", category: "game" },
  { text: "A hero need not speak. When he is gone, the world will speak for him.", source: "Halo 3 (2007)", category: "game" },
  { text: "The right man in the wrong place can make all the difference in the world.", source: "Half-Life 2 (2004)", category: "game" },
  { text: "We all make choices, but in the end our choices make us.", source: "BioShock (2007)", category: "game" },
];

// ── Groq AI client (lazy-init, key never sent to client) ─────────────────────
const Groq = require('groq-sdk');
let groqClient = null;
function getGroqClient() {
  if (!groqClient && GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: GROQ_API_KEY, timeout: 5000, maxRetries: 0 });
  }
  return groqClient;
}

const AI_CATEGORY_PROMPTS = {
  literature:  'a passage in the style of classic literature (novels, poetry, short stories)',
  film:        'memorable dialogue or narration in the style of a famous film or screenplay',
  speech:      'an inspiring or powerful speech excerpt in the style of historical speeches',
  philosophy:  'a philosophical reflection or quote in the style of classical philosophers',
  science:     'an insightful observation about science, nature, or the universe',
  game:        'dialogue or narration in the style of a classic video game',
  random:      'any interesting, engaging passage — literature, film, speech, science, or philosophy',
};

const DIFFICULTY_TIERS = [
  { name: 'easy',   weight: 30, instruction: 'DIFFICULTY: easy. Use short common words (3-5 letters). Simple sentence structure. No punctuation except periods. Everyday vocabulary only. Example style: "The dog ran fast across the wide open field. It jumped over the fence and kept running."', minLen: 80,  maxLen: 140 },
  { name: 'medium', weight: 45, instruction: 'DIFFICULTY: medium. Mix short and longer words. Use commas and apostrophes naturally. Some multi-syllable words. Varied sentence length. Example style: "Every journey begins with a single step, though the destination often changes along the way."', minLen: 100, maxLen: 170 },
  { name: 'hard',   weight: 25, instruction: 'DIFFICULTY: hard. Use sophisticated, multi-syllable vocabulary. Complex sentence structures with multiple clauses. Include commas, apostrophes, and hyphens naturally. Words should be challenging to type accurately. Example style: "The extraordinary circumstances surrounding the philosopher\'s controversial dissertation precipitated an unprecedented, far-reaching academic controversy."', minLen: 120, maxLen: 200 },
];

function pickDifficulty() {
  const total = DIFFICULTY_TIERS.reduce((s, t) => s + t.weight, 0);
  let rand    = Math.random() * total;
  for (const tier of DIFFICULTY_TIERS) {
    rand -= tier.weight;
    if (rand <= 0) return tier;
  }
  return DIFFICULTY_TIERS[1];
}

async function fetchAIQuote(category, forceDifficulty) {
  const client = getGroqClient();
  if (!client) return null;

  const categoryDesc = AI_CATEGORY_PROMPTS[category] || AI_CATEGORY_PROMPTS.random;
  const difficulty   = forceDifficulty
    ? DIFFICULTY_TIERS.find(t => t.name === forceDifficulty) || DIFFICULTY_TIERS[0]
    : pickDifficulty();

  try {
    const completion = await aiCompletion(client, {
      model:       GROQ_MODEL,
      max_completion_tokens: 1024,
      reasoning_effort: 'low',
      temperature: 0.95,
      messages: [
        {
          role: 'system',
          content: [
            'You generate typing race prompts for a multiplayer typing game.',
            'Rules (follow ALL of these exactly):',
            '- Return ONLY the prompt text. No quotation marks. No title. No preamble. No explanation.',
            '- Use only plain English letters, spaces, commas, periods, apostrophes, and hyphens.',
            '- No markdown, no line breaks, no bullet points, no special symbols.',
            '- Must be clean and suitable for all ages.',
            '- Every response must be a completely different passage.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: `Generate a typing race prompt that is ${categoryDesc}. ${difficulty.instruction} Length: ${difficulty.minLen} to ${difficulty.maxLen} characters total. Return only the text, nothing else.`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw || raw.length < 20 || raw.length > 1000) return null;

    const text = normalizeTypingText(raw.replace(/^["\u201c\u2018]|["\u201d\u2019]$/g, '')).trim();
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    console.log(`[Groq] Generated ${difficulty.name} quote (${text.length} chars) — ${catLabel}`);
    return { text, source: `AI-generated — ${catLabel}`, category, difficulty: difficulty.name, isAI: true };
  } catch (err) {
    console.error('[Groq] Quote request failed; using built-in passage.');
    return null;
  }
}

function pickQuoteFromCategory(category) {
  if (category && category !== 'random') {
    const matches = QUOTES.filter(q => q.category === category);
    if (matches.length > 0) return matches[Math.floor(Math.random() * matches.length)];
  }
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

async function pickQuote(category, useAI, forceDifficulty) {
  if (useAI) {
    const aiQuote = await fetchAIQuote(category || 'random', forceDifficulty);
    if (aiQuote) return aiQuote;
  }
  return pickQuoteFromCategory(category);
}

// ── Room storage ─────────────────────────────────────────────────────────────
const rooms = Object.create(null);
const disconnectedPlayers = new Map();

function generateCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function createPlayer(socketId, name) {
  return {
    id: socketId,
    name: sanitizeName(name),
    ready: false,
    progress: 0,
    wpm: 0,
    coins: 0,
    distance: 0,
    finishTime: null,
    place: null,
    color: null,
    spriteId: 'pink',
    connected: true,
  };
}

const PLAYER_COLORS = ['#a78bfa', '#f87171', '#34d399', '#fbbf24', '#60a5fa', '#f472b6'];
const VALID_SPRITES  = ['pink', 'dude', 'owlet', 'ninja_frog', 'mask_dude', 'pink_man', 'virtual_guy', 'fox', 'squirrel'];
const VALID_CATEGORIES = Object.keys(AI_CATEGORY_PROMPTS);

function roomSnapshot(room) {
  return {
    code:              room.code,
    state:             room.state,
    prompt:            room.prompt,
    promptSource:      room.promptSource     || '',
    promptCategory:    room.promptCategory   || '',
    promptIsAI:        room.promptIsAI       || false,
    promptDifficulty:  room.promptDifficulty || '',
    quoteCategory:     room.quoteCategory    || 'random',
    useAI:             room.useAI            || false,
    hostId:            room.hostId,
    isTypingTest:      room.isTypingTest     || false,
    raceEndAt:         room.raceEndAt || null,
    finishWindowStarted: room.finishWindowStarted || false,
    players:           Array.from(room.players.values()),
  };
}

function broadcastRoom(room) {
  io.to(room.code).emit('room:update', roomSnapshot(room));
}

function assignColors(room) {
  let i = 0;
  for (const player of room.players.values()) {
    player.color = PLAYER_COLORS[i % PLAYER_COLORS.length];
    i++;
  }
}

async function startCountdown(room) {
  if (rooms[room.code] !== room || room.state !== 'waiting') return;
  room.state = 'countdown';
  maybeAddBots(room);
  broadcastRoom(room);
  io.to(room.code).emit('countdown:preparing');

  const forceEasy   = Array.isArray(room.activeMods) && room.activeMods.includes('easy_quote');
  const quote = await pickQuote(room.quoteCategory || 'random', room.useAI || false, forceEasy ? 'easy' : undefined);
  // A room may have been deleted while its AI request was in flight.
  if (rooms[room.code] !== room || room.state !== 'countdown') return;
  room.pendingQuote = quote;

  let count = 3;
  io.to(room.code).emit('countdown:tick', { count });

  room.countdownTimer = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(room.countdownTimer);
      startRace(room);
    } else {
      io.to(room.code).emit('countdown:tick', { count });
    }
  }, 1000);
}

function startRace(room) {
  if (rooms[room.code] !== room || room.state !== 'countdown' || !room.pendingQuote) return;
  const quote            = room.pendingQuote;
  room.pendingQuote      = null;
  room.prompt            = normalizeTypingText(quote.text).trim();
  room.promptSource      = quote.source;
  room.promptCategory    = quote.category;
  room.promptIsAI        = quote.isAI    || false;
  room.promptDifficulty  = quote.difficulty || '';
  room.state             = 'racing';
  room.startTime         = Date.now();
  room.finishWindowStarted = false;

  io.to(room.code).emit('countdown:go');
  broadcastRoom(room);
  startBots(room);

  const extraTime = Array.isArray(room.activeMods) && room.activeMods.includes('extra_time');
  const raceMs    = 5 * 60 * 1000 + (extraTime ? 30000 : 0);
  room.raceEndAt = room.startTime + raceMs;
  room.raceTimer  = setTimeout(() => { if (room.state === 'racing') endRace(room); }, raceMs);
  io.to(room.code).emit('race:deadline', { remainingMs: raceMs, firstFinished: false });
}

function racerFinished(room) {
  startFinishWindow(room, {
    emit: (event, data) => io.to(room.code).emit(event, data), endRace,
  });
}

function endRace(room) {
  if (room.state !== 'racing') return;
  clearTimeout(room.raceTimer);
  clearInterval(room.botInterval);
  room.botInterval = null;
  room.state = 'finished';

  const sorted = Array.from(room.players.values()).sort((a, b) => {
    if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
    if (a.finishTime) return -1;
    if (b.finishTime) return  1;
    return b.progress - a.progress;
  });

  sorted.forEach((p, i) => {
    p.place = i + 1;
    if (!p.finishTime) p.coins = p.gaveUp ? 0 : Math.round(p.wpm * 0.3 + p.progress * 0.5);
  });

  broadcastRoom(room);
  io.to(room.code).emit('race:finished', { results: sorted });

  sorted.forEach(p => {
    if (!p.isBot && p.finishTime && p.wpm >= 10) {
      submitToLeaderboard(p.name, p.wpm, p.accuracy || 100);
    }
  });

  io.to(room.code).emit('leaderboard:update', loadLeaderboard().slice(0, 10));
}

// ── Bot system ────────────────────────────────────────────────────────────────
const BOT_PERSONALITIES = [
  { name: 'SpeedDemon',   baseWpm: 95, variance: 18, stumbleChance: 0.06, stumbleMs: 800,  color: '#f87171' },
  { name: 'SteadyEddie',  baseWpm: 65, variance: 8,  stumbleChance: 0.04, stumbleMs: 500,  color: '#34d399' },
  { name: 'SloppyFingers',baseWpm: 55, variance: 22, stumbleChance: 0.14, stumbleMs: 1200, color: '#fbbf24' },
  { name: 'TheGhost',     baseWpm: 80, variance: 12, stumbleChance: 0.05, stumbleMs: 600,  color: '#a78bfa' },
  { name: 'RookieMistake',baseWpm: 45, variance: 15, stumbleChance: 0.18, stumbleMs: 1400, color: '#60a5fa' },
  { name: 'NightOwl',     baseWpm: 72, variance: 10, stumbleChance: 0.07, stumbleMs: 700,  color: '#f472b6' },
];

function pickBotPersonalities(n) {
  return [...BOT_PERSONALITIES].sort(() => Math.random() - 0.5).slice(0, n);
}

function createBot(personality, index) {
  return {
    id: `bot_${index}_${Date.now()}`,
    name: personality.name,
    color: personality.color,
    isBot: true, ready: true,
    progress: 0, wpm: 0, coins: 0, distance: 0,
    finishTime: null, place: null,
    personality,
    charsTyped: 0, stumbling: false, stumbleUntil: 0,
  };
}

function startBots(room) {
  if (room.botInterval) clearInterval(room.botInterval);
  const TICK_MS   = 100;
  const promptLen = room.prompt.length;

  room.botInterval = setInterval(() => {
    if (room.state !== 'racing') {
      clearInterval(room.botInterval);
      room.botInterval = null;
      return;
    }

    for (const player of room.players.values()) {
      if (!player.isBot || player.finishTime) continue;
      const now = Date.now();
      const p   = player.personality;

      if (player.stumbling) {
        if (now < player.stumbleUntil) continue;
        player.stumbling = false;
      }
      if (Math.random() < p.stumbleChance * (TICK_MS / 1000)) {
        player.stumbling    = true;
        player.stumbleUntil = now + p.stumbleMs + Math.random() * 400;
        continue;
      }

      const variance    = (Math.random() - 0.5) * p.variance * 2;
      const currentWpm  = Math.max(15, p.baseWpm + variance);
      const charsPerTick = currentWpm * 5 * (TICK_MS / 60000);

      player.charsTyped = Math.min(promptLen, player.charsTyped + charsPerTick);
      player.progress   = Math.min(100, (player.charsTyped / promptLen) * 100);
      player.distance   = Math.round(player.progress);
      player.coins      = Math.round(currentWpm * 0.5 + player.progress * 0.8);

      const elapsedMins = (now - room.startTime) / 60000;
      player.wpm        = elapsedMins > 0 ? Math.round((player.charsTyped / 5) / elapsedMins) : 0;

      if (player.charsTyped >= promptLen && !player.finishTime) {
        player.charsTyped = promptLen;
        player.progress   = 100;
        player.finishTime = now;
        racerFinished(room);
        const finalMins   = (now - room.startTime) / 60000;
        player.wpm        = finalMins > 0 ? Math.round((promptLen / 5) / finalMins) : 0;
        const finishers   = Array.from(room.players.values()).filter(p => p.finishTime);
        player.place      = finishers.length;
        const placeBonus  = [200, 120, 80, 50, 30, 20];
        player.coins      = Math.round(player.wpm * 1.5 + (placeBonus[player.place - 1] || 20));
      }
    }

    io.to(room.code).emit('race:positions', Array.from(room.players.values()).map(p => ({
      id: p.id, name: p.name, progress: p.progress, wpm: p.wpm,
      coins: p.coins, color: p.color, finishTime: p.finishTime, place: p.place,
      isBot: p.isBot || false, spriteId: p.spriteId || 'pink',
    })));

    const allDone = allRacersDone(room);
    if (allDone) {
      clearInterval(room.botInterval);
      room.botInterval = null;
      endRace(room);
    }
  }, TICK_MS);
}

function maybeAddBots(room) {
  const humanCount = Array.from(room.players.values()).filter(p => !p.isBot).length;
  if (humanCount !== 1 || room.isTypingTest) return;
  const botCount      = 1 + Math.floor(Math.random() * 3);
  const personalities = pickBotPersonalities(botCount);
  const handicap      = Array.isArray(room.activeMods) && room.activeMods.includes('bot_handicap');
  personalities.forEach((personality, i) => {
    const p = handicap ? {
      ...personality,
      baseWpm:       Math.round(personality.baseWpm * 0.6),
      variance:      Math.round(personality.variance * 0.6),
      stumbleChance: Math.min(0.4, personality.stumbleChance * 1.8),
    } : personality;
    room.players.set(`bot_${i}_${Date.now()}`, createBot(p, i));
  });
}

function removeBots(room) {
  for (const [id, player] of room.players.entries()) {
    if (player.isBot) room.players.delete(id);
  }
  if (room.botInterval) { clearInterval(room.botInterval); room.botInterval = null; }
}

// ── Socket.IO rate-limiter helper ─────────────────────────────────────────────
// Returns false and emits an error if the socket has exceeded its per-event limit.
const socketEventCounts = new Map(); // socketId -> { eventName -> { count, resetAt } }

function socketRateLimit(socket, eventName, maxPerMinute = 60) {
  const now = Date.now();
  if (!socketEventCounts.has(socket.id)) socketEventCounts.set(socket.id, {});
  const events = socketEventCounts.get(socket.id);
  if (!events[eventName] || now > events[eventName].resetAt) {
    events[eventName] = { count: 0, resetAt: now + 60000 };
  }
  events[eventName].count++;
  if (events[eventName].count > maxPerMinute) {
    socket.emit('error', { msg: 'Rate limit exceeded. Please slow down.' });
    return false;
  }
  return true;
}

// Explicit leaves and expired disconnects share the same cleanup.
function leaveRoom(socket) {
  const timeout = disconnectedPlayers.get(socket.id);
  if (timeout) clearTimeout(timeout);
  disconnectedPlayers.delete(socket.id);
  const oldCode = socket.data.roomCode;
  if (oldCode) socket.leave(oldCode);
  cleanupRoomMembership(socket);
  delete socket.data.roomCode;
  delete socket.data.isSpectator;
}

function cleanupRoomMembership(socket) {
  const code = socket.data.roomCode;
  const room = rooms[code];
  if (!room) return;

  room.spectators.delete(socket.id);
  const wasPlayer = room.players.delete(socket.id);
  if (!wasPlayer) return; // Spectators do not change player/host/rematch state.
  if (room.modOwners) {
    for (const [modId, ownerId] of Object.entries(room.modOwners)) {
      if (ownerId === socket.id) delete room.modOwners[modId];
    }
    io.to(room.code).emit('room:mods-update', { modOwners: room.modOwners });
  }
  // Remove from rematch votes if present
  if (room.rematchVotes) room.rematchVotes.delete(socket.id);

  const humansLeft = Array.from(room.players.values()).filter(p => !p.isBot).length;

  if (humansLeft === 0) {
    clearInterval(room.countdownTimer);
    clearTimeout(room.raceTimer);
    clearTimeout(room.autoResetTimer);
    removeBots(room);
    for (const spectatorId of room.spectators) {
      const spectator = io.sockets.sockets.get(spectatorId);
      if (spectator) {
        spectator.leave(code);
        delete spectator.data.roomCode;
        delete spectator.data.isSpectator;
        spectator.emit('room:closed');
      }
    }
    delete rooms[code];
    return;
  }

  if (room.hostId === socket.id) {
    const nextHuman = Array.from(room.players.values()).find(p => !p.isBot);
    if (nextHuman) room.hostId = nextHuman.id;
  }

  // If room was in finished state and only one human remains, notify them
  if (room.state === 'finished' && humansLeft === 1) {
    const remaining = Array.from(room.players.values()).find(p => !p.isBot);
    if (remaining) {
      // Reset room back to waiting with clean player state
      removeBots(room);
      room.activeMods   = [];
      room.rematchVotes = new Set();
      room.modOwners    = {};
      room.state = 'waiting';
      for (const p of room.players.values()) {
        p.ready = false; p.progress = 0; p.wpm = 0;
        p.finishTime = null; p.place = null; p.coins = 0; p.gaveUp = false;
        p.powerups = { zap: 0, shield: 0 };
        p.frozenUntil = 0; p.shieldUntil = 0;
      }
      io.to(remaining.id).emit('room:solo-remaining', {
        isHost: remaining.id === room.hostId,
        roomCode: room.code,
        room:   roomSnapshot(room),
      });
    }
  }

  if (room.state === 'racing' && allRacersDone(room)) endRace(room);
  if (room.state === 'waiting' && Array.from(room.players.values()).every(p => p.ready && p.connected !== false)) {
    room.activeMods = Object.keys(room.modOwners || {});
    startCountdown(room);
  }
  if (room.state === 'finished' && humansLeft > 1 && room.rematchVotes?.size) {
    io.to(room.code).emit('rematch:vote', { votes: room.rematchVotes.size, total: humansLeft });
    if (room.rematchVotes.size >= humansLeft) resetRoomForRematch(room);
  }
  broadcastRoom(room);
}

function resetRoomForRematch(room) {
  clearTimeout(room.autoResetTimer);
  clearTimeout(room.raceTimer);
  room.rematchVotes = new Set();
  room.modOwners = {};
  removeBots(room);
  room.activeMods = [];
  for (const p of room.players.values()) {
    p.ready = false; p.progress = 0; p.wpm = 0;
    p.finishTime = null; p.place = null; p.coins = 0; p.gaveUp = false;
    p.powerups = { zap: 0, shield: 0 };
    p.frozenUntil = 0; p.shieldUntil = 0;
  }
  room.state = 'waiting';
  broadcastRoom(room);
}

// ── Socket.IO connection handler ──────────────────────────────────────────────
io.on('connection', (socket) => {
  const socketIp = clientIp(socket.request);
  socket.data.clientIp = socketIp;

  // Per-IP connection limiting (max 10 concurrent connections per IP)
  const currentConns = socketConnections.get(socketIp) || 0;
  if (currentConns >= 10) {
    socket.emit('error', { msg: 'Too many connections from your IP.' });
    socket.disconnect(true);
    return;
  }
  socketConnections.set(socketIp, currentConns + 1);

  socket.on('disconnect', (reason) => {
    // Decrement IP connection count
    const conn = socketConnections.get(socketIp) || 1;
    if (conn <= 1) socketConnections.delete(socketIp);
    else socketConnections.set(socketIp, conn - 1);

    // Clean up rate-limit state for this socket
    socketEventCounts.delete(socket.id);

    const room = rooms[socket.data.roomCode];
    const player = room?.players.get(socket.id);
    if (player && reason !== 'client namespace disconnect' && reason !== 'server namespace disconnect') {
      player.connected = false;
      broadcastRoom(room);
      const timeout = setTimeout(() => {
        disconnectedPlayers.delete(socket.id);
        cleanupRoomMembership(socket);
      }, 20000);
      disconnectedPlayers.set(socket.id, timeout);
    } else {
      leaveRoom(socket);
    }
  });

  // Drop malformed packets before destructuring event payloads. The IP quota
  // survives reconnects; a socket-wide budget also covers unknown events.
  socket.use(([event, payload], next) => {
    if (!securityLimits.consume('events:' + socketIp, 1800).allowed
        || !securityLimits.consume('socket:' + socket.id, 300).allowed) return;
    const payloadEvents = ['room:create', 'room:join', 'room:toggle-mod', 'room:set-category',
      'player:set-appearance', 'player:ready', 'player:progress', 'player:finished',
      'spectator:join', 'powerup:use', 'powerup:grant'];
    if (payloadEvents.includes(event) && payload !== undefined && !isRecord(payload)) {
      socket.emit('room:error', { msg: 'Invalid event data.' });
      return;
    }
    next();
  });

  if (socket.recovered) {
    const timeout = disconnectedPlayers.get(socket.id);
    if (timeout) clearTimeout(timeout);
    disconnectedPlayers.delete(socket.id);
    const room = rooms[socket.data.roomCode];
    const player = room?.players.get(socket.id);
    if (player) {
      player.connected = true;
      socket.emit('room:resumed', roomSnapshot(room));
      if (room.state === 'racing') socket.emit('race:deadline', {
        remainingMs: Math.max(0, room.raceEndAt - Date.now()), firstFinished: room.finishWindowStarted,
      });
      broadcastRoom(room);
      if (room.state === 'waiting' && Array.from(room.players.values()).every(p => p.ready && p.connected !== false)) {
        room.activeMods = Object.keys(room.modOwners || {});
        startCountdown(room);
      }
    } else {
      leaveRoom(socket);
      socket.emit('room:recovery-failed');
    }
  }

  socket.on('room:leave', () => {
    leaveRoom(socket);
    socket.emit('room:left');
  });

  // ── room:create ─────────────────────────────────────────────────────────────
  socket.on('room:create', ({ name, typingTest } = {}) => {
    if (!socketRateLimit(socket, 'room:create', 5)) return; // max 5 rooms/min
    if (!name || typeof name !== 'string' || name.length > 100 || !name.trim()) return;
    if (Object.keys(rooms).length >= 500) { socket.emit('room:error', { msg: 'Server is full. Try again later.' }); return; }

    leaveRoom(socket);
    let code;
    do { code = generateCode(); } while (rooms[code]);

    const room = {
      code, hostId: socket.id,
      players: new Map(),
      state: 'waiting', prompt: '',
      startTime: null, countdownTimer: null, raceTimer: null,
      autoResetTimer: null, botInterval: null, pendingQuote: null,
      quoteCategory: 'random', useAI: false,
      activeMods: [], isPublic: !typingTest,
      isTypingTest: !!typingTest,
      spectators: new Set(),
    };

    const player  = createPlayer(socket.id, name.trim());
    player.color  = PLAYER_COLORS[0];
    room.players.set(socket.id, player);
    rooms[code]   = room;

    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room:joined', roomSnapshot(room));
  });

  // ── room:toggle-mod ──────────────────────────────────────────────────────────
  socket.on('room:toggle-mod', ({ modId } = {}) => {
    if (!socketRateLimit(socket, 'room:toggle-mod', 20)) return;
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'waiting' || !room.players.has(socket.id)) return;

    const ALLOWED_MODS = ['easy_quote', 'extra_time', 'bot_handicap', 'double_coins'];
    if (!ALLOWED_MODS.includes(modId)) return;

    if (!room.modOwners) room.modOwners = {}; // modId -> socketId

    if (room.modOwners[modId] === socket.id) {
      // This player is toggling off their own mod — refund them
      delete room.modOwners[modId];
      socket.emit('mod:refund', { modId });
    } else if (room.modOwners[modId]) {
      // Already owned by another player — reject silently
      return;
    } else {
      // New purchase — client already validated coins, record ownership
      room.modOwners[modId] = socket.id;
    }

    // Broadcast updated mod ownership to all players in room
    io.to(room.code).emit('room:mods-update', { modOwners: room.modOwners });
  });

  // ── room:set-category ───────────────────────────────────────────────────────
  socket.on('room:set-category', ({ category, useAI } = {}) => {
    if (!socketRateLimit(socket, 'room:set-category', 20)) return;
    const room = rooms[socket.data.roomCode];
    if (!room || room.state !== 'waiting' || socket.id !== room.hostId) return;
    room.quoteCategory = VALID_CATEGORIES.includes(category) ? category : 'random';
    room.useAI         = useAI === true && !!GROQ_API_KEY;
    io.to(room.code).emit('room:category-updated', { category: room.quoteCategory, useAI: room.useAI });
  });

  // ── room:join ───────────────────────────────────────────────────────────────
  socket.on('room:join', ({ name, code } = {}) => {
    if (!socketRateLimit(socket, 'room:join', 10)) return;
    if (!name || typeof name !== 'string' || name.length > 100 || !name.trim() || typeof code !== 'string' || code.length > 6) return;

    const safeCode = sanitizeCode(code);
    const room     = rooms[safeCode];
    if (!room)                      { socket.emit('room:error', { msg: 'Room not found.' });            return; }
    if (room.state !== 'waiting')   { socket.emit('room:error', { msg: 'Race already in progress.' }); return; }
    if (room.players.has(socket.id)) { socket.emit('room:joined', roomSnapshot(room)); return; }
    if (room.players.size >= 6)     { socket.emit('room:error', { msg: 'Room is full.' });             return; }

    leaveRoom(socket);
    const player  = createPlayer(socket.id, name.trim());
    player.color  = PLAYER_COLORS[room.players.size % PLAYER_COLORS.length];
    room.players.set(socket.id, player);

    socket.join(safeCode);
    socket.data.roomCode = safeCode;
    socket.emit('room:joined', roomSnapshot(room));
    broadcastRoom(room);
  });

  // ── player:set-appearance ───────────────────────────────────────────────────
  socket.on('player:set-appearance', ({ spriteId } = {}) => {
    if (!socketRateLimit(socket, 'player:set-appearance', 20)) return;
    const room   = rooms[socket.data.roomCode];
    if (!room)   return;
    const player = room.players.get(socket.id);
    if (!player || player.isBot) return;
    player.spriteId = VALID_SPRITES.includes(spriteId) ? spriteId : 'pink';
    broadcastRoom(room);
  });

  socket.on('race:set-modifiers', () => {});

  // ── player:ready ────────────────────────────────────────────────────────────
  socket.on('player:ready', ({ mods } = {}) => {
    if (!socketRateLimit(socket, 'player:ready', 10)) return;
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'waiting') return;
    const player = room.players.get(socket.id);
    if (!player) return;
    player.ready = true;

    // Store this player's chosen mods — any player can submit
    const ALLOWED_MODS = ['easy_quote', 'extra_time', 'bot_handicap', 'double_coins'];
    if (Array.isArray(mods)) {
      player.mods = mods.filter(m => typeof m === 'string' && ALLOWED_MODS.includes(m));
    }

    broadcastRoom(room);
    const allReady = Array.from(room.players.values()).every(p => p.ready && p.connected !== false);
    if (allReady && room.players.size >= 1) {
      // Active mods come from server-tracked modOwners (one buyer per mod)
      room.activeMods = Object.keys(room.modOwners || {});
      startCountdown(room);
    }
  });

  // ── player:progress ─────────────────────────────────────────────────────────
  socket.on('player:progress', ({ progress, wpm, typedLength } = {}) => {
    if (!socketRateLimit(socket, 'player:progress', 120)) return; // up to 2/s
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'racing') return;
    const player = room.players.get(socket.id);
    if (!player || player.finishTime || player.gaveUp) return;

    if (!inRange(progress, 0, 100) || !inRange(wpm, 0, 300)) return;
    if (Date.now() < (player.frozenUntil || 0)) return;
    // Reject invalid numbers before updating shared state.
    player.progress = Math.min(100, Math.max(0, typeof progress === 'number' ? progress : 0));
    player.wpm      = Math.min(300, Math.max(0, typeof wpm === 'number' ? Math.round(wpm) : 0));
    player.distance = Math.round(player.progress);
    player.coins    = Math.round(player.wpm * 0.5 + player.progress * 0.8);

    io.to(room.code).emit('race:positions', Array.from(room.players.values()).map(p => ({
      id: p.id, name: p.name, progress: p.progress, wpm: p.wpm,
      coins: p.coins, color: p.color, finishTime: p.finishTime, place: p.place,
      isBot: p.isBot || false, spriteId: p.spriteId || 'pink',
    })));
  });

  // ── player:finished ─────────────────────────────────────────────────────────
  socket.on('player:finished', ({ wpm, accuracy } = {}) => {
    if (!socketRateLimit(socket, 'player:finished', 5)) return;
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'racing') return;
    const player = room.players.get(socket.id);
    if (!player || player.finishTime || player.gaveUp) return;

    if (!inRange(wpm, 0, 300) || (accuracy !== undefined && !inRange(accuracy, 0, 100))) return;
    if (Date.now() < (player.frozenUntil || 0)) return;
    player.finishTime = Date.now();
    racerFinished(room);
    player.progress   = 100;
    player.wpm        = Math.min(300, Math.max(0, typeof wpm === 'number' ? Math.round(wpm) : 0));
    player.accuracy   = Math.min(100, Math.max(0, typeof accuracy === 'number' ? Math.round(accuracy) : 100));

    const finishers  = Array.from(room.players.values()).filter(p => p.finishTime);
    player.place     = finishers.length;
    const placeBonus = [200, 120, 80, 50, 30, 20];
    player.coins     = Math.round(player.wpm * 1.5 + (placeBonus[player.place - 1] || 20));

    io.to(room.code).emit('race:positions', Array.from(room.players.values()).map(p => ({
      id: p.id, name: p.name, progress: p.progress, wpm: p.wpm,
      coins: p.coins, color: p.color, finishTime: p.finishTime, place: p.place,
      isBot: p.isBot || false, spriteId: p.spriteId || 'pink',
    })));

    const allDone = allRacersDone(room);
    if (allDone) endRace(room);
  });

  socket.on('player:give-up', () => {
    if (!socketRateLimit(socket, 'player:give-up', 5)) return;
    const room = rooms[socket.data.roomCode];
    if (!room || !giveUpPlayer(room, room.players.get(socket.id))) return;
    socket.emit('race:gave-up');
    broadcastRoom(room);
    const humansDone = Array.from(room.players.values()).filter(p => !p.isBot)
      .every(p => p.finishTime || p.gaveUp);
    if (allRacersDone(room) || humansDone) endRace(room);
  });

  // ── spectator:join ──────────────────────────────────────────────────────────
  socket.on('spectator:join', ({ code } = {}) => {
    if (!socketRateLimit(socket, 'spectator:join', 5)) return;
    if (typeof code !== 'string' || code.length > 6) return;
    const safeCode = sanitizeCode(code || '');
    const room     = rooms[safeCode];
    if (!room) { socket.emit('room:error', { msg: 'Room not found.' }); return; }
    if (socket.data.isSpectator && socket.data.roomCode === safeCode) {
      socket.emit('spectator:joined', roomSnapshot(room));
      return;
    }
    if (room.spectators.size >= 20) { socket.emit('room:error', { msg: 'Spectator seats are full.' }); return; }
    leaveRoom(socket);
    if (!rooms[safeCode]) { socket.emit('room:error', { msg: 'This room has closed.' }); return; }
    socket.join(safeCode);
    socket.data.roomCode    = safeCode;
    socket.data.isSpectator = true;
    room.spectators.add(socket.id);
    socket.emit('spectator:joined', roomSnapshot(room));
  });

  // ── powerup:use ─────────────────────────────────────────────────────────────
  socket.on('powerup:use', ({ type } = {}) => {
    if (!socketRateLimit(socket, 'powerup:use', 10)) return;
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'racing') return;
    const sender = room.players.get(socket.id);
    if (!sender || sender.isBot || sender.finishTime || sender.gaveUp) return;

    const VALID = ['zap', 'shield'];
    if (!VALID.includes(type)) return;

    // Validate the player actually owns this power-up and hasn't used it
    if (!sender.powerups || !sender.powerups[type] || sender.powerups[type] <= 0) return;

    if (type === 'zap') {
      // Find the human player directly ahead of sender (closest higher progress)
      const humans = Array.from(room.players.values())
        .filter(p => !p.isBot && p.id !== socket.id && !p.finishTime && !p.gaveUp);
      const ahead = humans
        .filter(p => p.progress >= sender.progress)
        .sort((a, b) => a.progress - b.progress)[0]
        || humans.sort((a, b) => b.progress - a.progress)[0]; // fallback: furthest ahead overall

      if (!ahead) return;

      // Check if target has a shield active
      if (ahead.shieldUntil && ahead.shieldUntil > Date.now()) {
        // Shield absorbs the zap — notify both players
        ahead.shieldUntil = 0; // consume shield
        io.to(socket.id).emit('powerup:blocked', { by: ahead.name });
        io.to(ahead.id).emit('powerup:shieldused', {});
        sender.powerups.zap--;
        return;
      }

      // Apply freeze
      const freezeUntil = Date.now() + 1500;
      ahead.frozenUntil = freezeUntil;
      sender.powerups.zap--;

      // Notify victim to freeze input
      io.to(ahead.id).emit('powerup:frozen', { duration: 1500, by: sender.name });
      // Notify sender it landed
      io.to(socket.id).emit('powerup:zap_hit', { target: ahead.name });
      // Notify all clients to show visual on that lane
      io.to(room.code).emit('powerup:effect', { type: 'frozen', targetId: ahead.id, duration: 1500 });

    } else if (type === 'shield') {
      sender.shieldUntil = Date.now() + 3000;
      sender.powerups.shield--;
      io.to(socket.id).emit('powerup:shield_active', { duration: 3000 });
      io.to(room.code).emit('powerup:effect', { type: 'shield', targetId: socket.id, duration: 3000 });
    }
  });

  // ── powerup:buy ──────────────────────────────────────────────────────────────
  // Power-ups are bought in the waiting room via the client; server just records them.
  socket.on('powerup:grant', ({ zap, shield } = {}) => {
    if (!socketRateLimit(socket, 'powerup:grant', 20)) return;
    if (!Number.isInteger(zap) || !inRange(zap, 0, 3) || !Number.isInteger(shield) || !inRange(shield, 0, 3)) return;
    // This is purely client-tracked (coins are local); server just records counts for the race.
    const room   = rooms[socket.data.roomCode];
    if (!room || room.state !== 'waiting') return;
    const player = room.players.get(socket.id);
    if (!player) return;
    player.powerups = {
      zap:    Math.min(3, Math.max(0, parseInt(zap,   10) || 0)),
      shield: Math.min(3, Math.max(0, parseInt(shield, 10) || 0)),
    };
  });

  // ── room:rematch ────────────────────────────────────────────────────────────
  socket.on('room:rematch', () => {
    if (!socketRateLimit(socket, 'room:rematch', 5)) return;
    const room = rooms[socket.data.roomCode];
    if (!room || room.state !== 'finished' || !room.players.has(socket.id)) return;

    // Track votes — each human player can vote once
    if (!room.rematchVotes) room.rematchVotes = new Set();
    room.rematchVotes.add(socket.id);

    const humans      = Array.from(room.players.values()).filter(p => !p.isBot);
    const voteCount   = room.rematchVotes.size;
    const totalHumans = humans.length;

    // Broadcast vote progress to all players in the room
    io.to(room.code).emit('rematch:vote', { votes: voteCount, total: totalHumans, voterId: socket.id });

    // All humans voted — reset the room
    if (voteCount >= totalHumans) {
      resetRoomForRematch(room);
    }
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🏁  TypeRacer running at http://localhost:${PORT}`);
  console.log(`🔒  Security: rate limiting, CSP headers, input sanitization ENABLED`);
  if (GROQ_API_KEY) {
    console.log(`✨  Groq AI quotes ENABLED  (model: ${GROQ_MODEL})`);
  } else {
    console.log(`📚  Groq AI quotes DISABLED — using static quote library`);
    console.log(`    To enable: add GROQ_API_KEY=gsk_... to a .env file`);
  }
  console.log();
});
