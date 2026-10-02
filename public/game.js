// ═══════════════════════════════════════════════════
//  BACKGROUND THEMES
//  Each theme maps layer ids to image URLs + speeds.
//  Layers that don't scroll use speed:0.
//  Put assets in public/assets/bg/<themeId>/
// ═══════════════════════════════════════════════════
const THEMES = {
  woodland: {
    label: 'Woodland', thumb: '/assets/bg/woodland/bg-clouds.png', price: 2100,
    layers: [
      { id: 'pl-sky', src: '/assets/bg/woodland/bg-clouds.png', speed: 0.1 },
      { id: 'pl-buildings', src: '/assets/bg/woodland/bg-mountains.png', speed: 0.3 },
      { id: 'pl-river', src: '/assets/bg/woodland/bg-trees.png', speed: 0.8 },
      { id: 'pl-sidewalk', src: '/assets/bg/woodland/ground.png', speed: 1.8, ground: true },
    ],
  },
  sunnyland: {
    label: 'SunnyLand', thumb: '/assets/bg/sunnyland/preview.png', price: 0,
    layers: [
      { id: 'pl-sky', src: '/assets/bg/sunnyland/back.png', speed: 0.15 },
      { id: 'pl-buildings', src: '/assets/bg/sunnyland/canopy.png', speed: 0.5,
        height: 'clamp(160px,24dvh,240px)', bottom: 'var(--race-ground)' },
      { id: 'pl-river', src: null, speed: 0 },
      { id: 'pl-sidewalk', src: '/assets/bg/sunnyland/ground.png', speed: 1.8, ground: true },
    ],
  },
  magic_cliffs: {
    label: 'Magic Cliffs', thumb: '/assets/bg/magic_cliffs/far-grounds.png', price: 0,
    credit: 'https://opengameart.org/content/magic-cliffs-environment',
    layers: [
      { id: 'pl-sky', src: '/assets/bg/magic_cliffs/sky.png', speed: 0, cover: true },
      { id: 'pl-buildings', src: '/assets/bg/magic_cliffs/clouds.png', speed: 0.2 },
      { id: 'pl-river', src: '/assets/bg/magic_cliffs/far-grounds.png', speed: 0.6 },
      { id: 'pl-sidewalk', src: '/assets/bg/magic_cliffs/ground.png', speed: 1.8, ground: true },
    ],
  },
  synth_city: {
    label: 'Neon Street', thumb: '/assets/bg/synth_city/preview.png',
    price: 0, credit: 'https://opengameart.org/content/cyberpunk-street-environment',
    layers: [
      { id: 'pl-sky', src: '/assets/bg/synth_city/far-buildings.png', speed: 0.15 },
      { id: 'pl-buildings', src: '/assets/bg/synth_city/back-buildings.png', speed: 0.5 },
      { id: 'pl-river', src: null, speed: 0 },
      { id: 'pl-sidewalk', src: '/assets/bg/synth_city/foreground.png', speed: 1.8 },
    ],
  },
  city: {
    label: 'City', thumb: '/assets/bg/city/Buildings.png',
    price: 0,  // free
    layers: [
      { id: 'pl-sky',       src: '/assets/bg/city/Sky.png',       speed: 0,   cover: true },
      { id: 'pl-buildings', src: '/assets/bg/city/Buildings.png', speed: 0.4 },
      { id: 'pl-river',     src: '/assets/bg/city/River.png',     speed: 0.9 },
      { id: 'pl-sidewalk',  src: '/assets/bg/city/Sidewalk.png',  speed: 1.8 },
    ],
  },
  city_dirty: {
    label: 'City Dirty', thumb: '/assets/bg/city_dirty/2.Buildings.png',
    price: 900,
    layers: [
      { id: 'pl-sky',       src: '/assets/bg/city_dirty/1.Sky2.png',      speed: 0,   cover: true },
      { id: 'pl-buildings', src: '/assets/bg/city_dirty/2.Buildings.png', speed: 0.4 },
      { id: 'pl-river',     src: '/assets/bg/city_dirty/3.Wall.png',      speed: 0.9 },
      { id: 'pl-sidewalk',  src: '/assets/bg/city_dirty/4.Sidewalk.png',  speed: 1.8 },
    ],
  },
  desert: {
    label: 'Desert', thumb: '/assets/bg/desert/3.Mountains.png',
    price: 1200,
    layers: [
      { id: 'pl-sky',       src: '/assets/bg/desert/1.Sky.png',       speed: 0,   cover: true },
      { id: 'pl-buildings', src: '/assets/bg/desert/2.Clouds.png',    speed: 0.2 },
      { id: 'pl-river',     src: '/assets/bg/desert/3.Mountains.png', speed: 0.5 },
      { id: 'pl-sidewalk',  src: '/assets/bg/desert/5.Ground.png',    speed: 1.8 },
    ],
  },
  jungle: {
    label: 'Jungle', thumb: '/assets/bg/jungle/2.Trees_back.png',
    price: 1500,
    layers: [
      { id: 'pl-sky',       src: '/assets/bg/jungle/1.Backround.png',    speed: 0,   cover: true },
      { id: 'pl-buildings', src: '/assets/bg/jungle/2.Trees_back.png',  speed: 0.3 },
      { id: 'pl-river',     src: '/assets/bg/jungle/3.Trees_front.png', speed: 0.9 },
      { id: 'pl-sidewalk',  src: '/assets/bg/jungle/4.Ground.png',      speed: 1.8 },
    ],
  },
  mountain: {
    label: 'Mountain', thumb: '/assets/bg/mountain/2.Mountains.png',
    price: 1800,
    layers: [
      { id: 'pl-sky',       src: '/assets/bg/mountain/1.Sky_free.png',   speed: 0,   cover: true },
      { id: 'pl-buildings', src: '/assets/bg/mountain/2.Mountains.png',  speed: 0.2 },
      { id: 'pl-river',     src: '/assets/bg/mountain/3.Trees_back.png', speed: 0.6 },
      { id: 'pl-sidewalk',  src: '/assets/bg/mountain/4.Groundt.png',    speed: 1.8 },
    ],
  },
};

const SPRITES = {
  pink:  { label: 'Pink Monster',  file: '/assets/sprites/Pink_Monster_Run.png',   frames: 6, price: 0   },
  dude:  { label: 'Dude Monster',  file: '/assets/sprites/Dude_Monster_Run_6.png', frames: 6, price: 1200 },
  owlet: { label: 'Owlet Monster', file: '/assets/sprites/Owlet_Monster_Run_6.png',frames: 6, price: 1500 },
  ninja_frog: { label: 'Ninja Frog', file: '/assets/sprites/ninja-frog-run.png', frames: 12, price: 0 },
  mask_dude: { label: 'Mask Dude', file: '/assets/sprites/mask-dude-run.png', frames: 12, price: 900 },
  pink_man: { label: 'Pink Man', file: '/assets/sprites/pink-man-run.png', frames: 12, price: 1050 },
  virtual_guy: { label: 'Virtual Guy', file: '/assets/sprites/virtual-guy-run.png', frames: 12, price: 1350 },
  fox: { label: 'Fox', file: '/assets/sprites/fox-run.png', frames: 6, price: 1600 },
  squirrel: { label: 'Squirrel', file: '/assets/sprites/squirrel-run.png', frames: 6, price: 1800 },
};

// Use the race's complete layer stack for the original background previews.
function themeThumbnail(id, theme) {
  if (!['city', 'city_dirty', 'desert', 'jungle', 'mountain', 'woodland'].includes(id)) {
    return `<img src="${theme.thumb}" alt="" onerror="this.style.display='none'"/>`;
  }
  return `<span class="theme-scene" aria-hidden="true">${theme.layers
    .filter(layer => layer.src)
    .map(layer => `<span style="${layer.ground ? 'top:auto;height:12%;' : ''}background-image:url('${layer.src}');background-size:${layer.cover ? 'cover' : 'auto 100%'};background-position:${layer.cover ? 'center' : 'bottom left'}"></span>`)
    .join('')}</span>`;
}

// ── Coin bank (localStorage persisted) ────────────
const CoinBank = {
  get()          { return parseInt(localStorage.getItem('tr_coins') || '0', 10); },
  add(n)         { localStorage.setItem('tr_coins', this.get() + n); },
  spend(n)       { const b = this.get(); if (b < n) return false; localStorage.setItem('tr_coins', b - n); return true; },
};

// ── Persistent username ────────────────────────────
const NameStore = {
  get()    { return localStorage.getItem('tr_name') || ''; },
  save(n)  { localStorage.setItem('tr_name', n.slice(0, 20)); },
};
function saveName() {
  const val = document.getElementById('lobby-name').value.trim();
  if (val) NameStore.save(val);
}

// ── Unlock registry (localStorage persisted) ──────
const Unlocks = {
  _key: 'tr_unlocks',
  get()       { try { return JSON.parse(localStorage.getItem(this._key) || '[]'); } catch { return []; } },
  has(id)     { return THEMES[id]?.price === 0 || SPRITES[id]?.price === 0 || this.get().includes(id); },
  unlock(id)  { const u = this.get(); if (!u.includes(id)) { u.push(id); localStorage.setItem(this._key, JSON.stringify(u)); } },
};

// ── Race Modifiers ─────────────────────────────────
// Single-use power-ups bought with coins before a race.
// Stored in localStorage, consumed at race start.
const MODIFIERS = {
  double_coins: {
    id: 'double_coins', icon: '🪙', name: 'Double Coins',
    desc: 'Earn 2× coins from the next race',
    cost: 100,
  },
  bot_handicap: {
    id: 'bot_handicap', icon: '🐢', name: 'Bot Handicap',
    desc: 'Bots run at 60% speed for one race',
    cost: 150,
  },
  easy_quote: {
    id: 'easy_quote', icon: '📖', name: 'Easy Quote',
    desc: 'Forces an easy difficulty quote',
    cost: 75,
  },
  extra_time: {
    id: 'extra_time', icon: '⏱', name: 'Extra Time',
    desc: 'Adds 30 seconds to the race timer',
    cost: 80,
  },
};

const ModifierStore = {
  _key: 'tr_active_mods',
  // Local store only tracks mods THIS player has bought (for refund on toggle-off)
  get()        { try { return JSON.parse(localStorage.getItem(this._key) || '[]'); } catch { return []; } },
  has(id)      { return this.get().includes(id); },
  addLocal(id) { const m = this.get(); if (!m.includes(id)) { m.push(id); localStorage.setItem(this._key, JSON.stringify(m)); } },
  removeLocal(id) { const m = this.get().filter(x => x !== id); localStorage.setItem(this._key, JSON.stringify(m)); },
  toggle(id)   {
    if (this.has(id)) {
      // Toggle off — server will refund via mod:refund event
      socket.emit('room:toggle-mod', { modId: id });
    } else {
      // Try to buy — spend coins locally first, then tell server
      if (!CoinBank.spend(MODIFIERS[id].cost)) return false;
      this.addLocal(id);
      socket.emit('room:toggle-mod', { modId: id });
    }
    return true;
  },
  consumeAll() { localStorage.removeItem(this._key); },
};

// Server-owned mod state for the current room — handlers registered after socket init below
let roomModOwners = {};

function buildModifierPanel() {
  const grid = document.getElementById('modifier-grid');
  grid.innerHTML = '';
  const coins = CoinBank.get();

  Object.values(MODIFIERS).forEach(mod => {
    const iMine        = ModifierStore.has(mod.id);
    const ownerId      = roomModOwners[mod.id];
    const takenByOther = ownerId && ownerId !== state.myId;
    const active       = iMine;
    const canAfford    = coins >= mod.cost;

    const card = document.createElement('button');
    card.disabled = takenByOther || (!canAfford && !active);

    if (takenByOther) {
      card.className = 'modifier-card active';
      card.innerHTML = `
        <span class="mod-icon">${mod.icon}</span>
        <span class="mod-name">${mod.name}</span>
        <span class="mod-desc">${mod.desc}</span>
        <span class="mod-cost free">✓ Bought by teammate</span>
      `;
    } else {
      card.className = 'modifier-card' + (active ? ' active' : '');
      card.innerHTML = `
        <span class="mod-icon">${mod.icon}</span>
        <span class="mod-name">${mod.name}</span>
        <span class="mod-desc">${mod.desc}</span>
        <span class="mod-cost ${active ? 'free' : ''}">${active ? '↩ Refund' : mod.cost + ' 🪙'}</span>
      `;
      card.onclick = () => { ModifierStore.toggle(mod.id); };
    }
    grid.appendChild(card);
  });
}
//  Refactored into applyTheme(themeId) so it can be
//  called on init AND when the user picks a new theme.
// ═══════════════════════════════════════════════════
(function initParallax() {
  let rafId    = null;
  let lastTime = null;
  let active   = []; // { el, speed, offset, tileW }

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = src;
    });
  }

  function scaledTileWidth(nW, nH, cH) {
    return nH ? Math.round(nW * (cH / nH)) : window.innerWidth;
  }

  async function applyTheme(themeId) {
    const theme = THEMES[themeId] || THEMES.city;
    document.documentElement.dataset.theme = THEMES[themeId] ? themeId : 'city';
    const credit = document.getElementById('background-credit');
    credit.hidden = !theme.credit;
    if (theme.credit) {
      const creator = credit.querySelector('a');
      creator.href = theme.credit;
      creator.textContent = `${theme.label} by Luis Zuno`;
    }

    // Cancel existing loop
    if (rafId) cancelAnimationFrame(rafId);
    active = [];

    const cH = window.innerHeight;

    for (const layer of theme.layers) {
      const el = document.getElementById(layer.id);
      if (!el) continue;
      el.style.height = layer.ground ? 'var(--race-ground)' : (layer.height || '100%');
      el.style.bottom = layer.bottom || '0px';
      if (!layer.src) {
        el.style.backgroundImage = 'none';
        continue;
      }

      // Set the image
      el.style.backgroundImage    = `url('${layer.src}')`;
      el.style.backgroundSize     = layer.cover ? 'cover' : 'auto 100%';
      el.style.backgroundPosition = layer.cover ? 'center' : 'bottom left';

      if (layer.speed === 0) {
        active.push({ el, speed: 0, offset: 0, tileW: 0 });
        continue;
      }

      const { w, h } = await loadImage(layer.src);
      const tileW    = (w && h) ? scaledTileWidth(w, h, el.clientHeight || cH) : window.innerWidth;
      active.push({ el, speed: layer.speed, offset: 0, tileW });
    }

    lastTime = performance.now();
    rafId    = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (MotionPreferences.isReduced()) return;
    const dt         = (now - lastTime) / 1000;
    lastTime         = now;
    const PX_PER_SEC = 60;

    active.forEach(layer => {
      if (layer.speed === 0) return;
      layer.offset += layer.speed * PX_PER_SEC * dt;
      if (layer.tileW > 0) layer.offset = layer.offset % layer.tileW;
      layer.el.style.backgroundPositionX = (-layer.offset) + 'px';
    });

    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    const saved = localStorage.getItem('tr_theme') || 'city';
    applyTheme(saved);
  });

  // Expose applyTheme globally so the UI can call it
  window.applyTheme = applyTheme;
  window.addEventListener('motionchange', () => applyTheme(localStorage.getItem('tr_theme') || 'city'));

  // Apply saved or default theme on load — fall back to city if not owned
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem('tr_theme') || 'city';
      const theme = Unlocks.has(saved) ? saved : 'city';
      applyTheme(theme);
      // Pre-fill saved name
      const savedName = NameStore.get();
      if (savedName) document.getElementById('lobby-name').value = savedName;
    });
  } else {
    const saved = localStorage.getItem('tr_theme') || 'city';
    const theme = Unlocks.has(saved) ? saved : 'city';
    applyTheme(theme);
    // Pre-fill saved name
    const savedName = NameStore.get();
    if (savedName) document.getElementById('lobby-name').value = savedName;
  }
})();

// ═══════════════════════════════════════════════════
//  SPRITE ENGINE — applySprite(spriteId)
//  Updates the CSS keyframe animation and background-
//  image for all .runner-avatar elements belonging to
//  the local player. Other players keep their own.
// ═══════════════════════════════════════════════════
function updateRunnerPreview(spriteId) {
  const sprite = SPRITES[spriteId] || SPRITES.pink;
  const preview = document.querySelector('.customize-runner-avatar');
  preview.style.backgroundImage = `url('${sprite.file}')`;
  preview.style.setProperty('--preview-frames', sprite.frames);
  preview.style.setProperty('--preview-strip-width', `${sprite.frames * 64}px`);
  document.querySelector('.customize-runner-label').textContent = sprite.label;
}

function applySprite(spriteId) {
  updateRunnerPreview(spriteId);
  const sprite      = SPRITES[spriteId] || SPRITES.pink;
  const SPRITE_H    = 64;   // must match buildLanes
  const SOURCE_FRAME = 32;
  const scale       = SPRITE_H / SOURCE_FRAME;
  const frameW      = Math.round(SOURCE_FRAME * scale);
  const sheetW      = frameW * sprite.frames;
  const animName    = `monsterRun_${sprite.frames}_${frameW}`;

  const myRunner = document.getElementById(`runner-${state.myId}`);
  if (myRunner) {
    myRunner.style.backgroundImage = `url('${sprite.file}')`;
    myRunner.style.backgroundSize  = `${sheetW}px ${SPRITE_H}px`;
    myRunner.style.width           = `${frameW}px`;
    myRunner.style.height          = `${SPRITE_H}px`;
    myRunner.style.animation       = `${animName} 0.55s steps(${sprite.frames}) infinite`;
  }
}

// ═══════════════════════════════════════════════════
//  CUSTOMIZATION PANEL — unlock system
// ═══════════════════════════════════════════════════
function buildCustomizePanel() {
  const preferredTheme = localStorage.getItem('tr_theme') || 'city';
  const savedTheme = Unlocks.has(preferredTheme) ? preferredTheme : 'city';
  if (savedTheme !== preferredTheme) {
    localStorage.setItem('tr_theme', savedTheme);
    window.applyTheme(savedTheme);
  }
  const savedSprite = localStorage.getItem('tr_sprite') || 'pink';
  const coins       = CoinBank.get();

  // Update coin display
  const balEl = document.getElementById('coin-balance-display');
  if (balEl) balEl.textContent = `${coins} 🪙`;

  // ── Theme thumbnails ────────────────────────────
  const themeGrid = document.getElementById('theme-grid');
  if (themeGrid) {
    themeGrid.innerHTML = '';
    Object.entries(THEMES).forEach(([id, theme]) => {
      const owned  = Unlocks.has(id);
      const active = id === savedTheme;

      const btn = document.createElement(owned ? 'button' : 'div');
      btn.className = 'theme-btn' + (active ? ' active' : '') + (owned ? '' : ' locked');
      btn.title     = owned ? theme.label : `${theme.label} — ${theme.price} 🪙`;

      btn.innerHTML = `
        ${themeThumbnail(id, theme)}
        <span class="theme-label">${theme.label}</span>
      `;

      if (!owned) {
        // Lock overlay with unlock button
        const canAfford = coins >= theme.price;
        const overlay   = document.createElement('div');
        overlay.className = 'lock-overlay';
        overlay.innerHTML = `
          <span class="lock-icon">🔒</span>
          <span class="lock-price">${theme.price} 🪙</span>
          <button class="btn-unlock" ${canAfford ? '' : 'disabled'}>Unlock</button>
        `;
        overlay.querySelector('.btn-unlock').setAttribute('aria-label', `Unlock ${theme.label} for ${theme.price} coins`);
        overlay.querySelector('.btn-unlock').onclick = (e) => {
          e.stopPropagation();
          if (!CoinBank.spend(theme.price)) return;
          Unlocks.unlock(id);
          buildCustomizePanel(); // re-render with updated state
          showToast(`🎨 ${theme.label} unlocked!`);
        };
        btn.appendChild(overlay);
      } else {
        btn.onclick = () => {
          if (!Unlocks.has(id)) return;
          localStorage.setItem('tr_theme', id);
          window.applyTheme(id);
          themeGrid.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        };
      }
      themeGrid.appendChild(btn);
    });
  }

  // ── Sprite picker ───────────────────────────────
  const spriteGrid = document.getElementById('sprite-grid');
  if (spriteGrid) {
    spriteGrid.innerHTML = '';
    Object.entries(SPRITES).forEach(([id, sprite]) => {
      const owned  = Unlocks.has(id);
      const active = id === savedSprite;

      const btn = document.createElement(owned ? 'button' : 'div');
      btn.className = 'sprite-btn' + (active ? ' active' : '') + (owned ? '' : ' locked');

      const preview = document.createElement('div');
      preview.className = 'sprite-preview' + (owned ? ' anim' : '');
      preview.style.backgroundImage = `url('${sprite.file}')`;
      preview.style.filter          = owned ? 'none' : 'grayscale(80%) brightness(0.5)';
      preview.style.setProperty('--sprite-frames', sprite.frames);
      preview.style.setProperty('--sprite-strip-width', `${sprite.frames * 32}px`);

      const label = document.createElement('div');
      label.className   = 'sprite-btn-label';
      label.textContent = sprite.label;

      btn.appendChild(preview);
      btn.appendChild(label);

      if (!owned) {
        const canAfford = coins >= sprite.price;
        const overlay   = document.createElement('div');
        overlay.className = 'sprite-lock-overlay';
        overlay.innerHTML = `
          <span class="lock-icon">🔒</span>
          <span class="lock-price">${sprite.price} 🪙</span>
          <button class="btn-unlock" ${canAfford ? '' : 'disabled'}>Unlock</button>
        `;
        overlay.querySelector('.btn-unlock').setAttribute('aria-label', `Unlock ${sprite.label} for ${sprite.price} coins`);
        overlay.querySelector('.btn-unlock').onclick = (e) => {
          e.stopPropagation();
          if (!CoinBank.spend(sprite.price)) return;
          Unlocks.unlock(id);
          buildCustomizePanel();
          showToast(`🧍 ${sprite.label} unlocked!`);
        };
        btn.appendChild(overlay);
      } else {
        btn.onclick = () => {
          if (!Unlocks.has(id)) return;
          localStorage.setItem('tr_sprite', id);
          applySprite(id);
          spriteGrid.querySelectorAll('.sprite-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          socket.emit('player:set-appearance', { spriteId: id });
        };
      }
      spriteGrid.appendChild(btn);
    });
  }
  // Keep powerup shop affordability in sync with coin balance
  refreshPowerupShop();
}

//  SOCKET & GAME STATE
// ═══════════════════════════════════════════════════
const socket = io();

// ── Modifier socket handlers ──────────────────────
socket.on('room:mods-update', ({ modOwners }) => {
  roomModOwners = modOwners || {};
  buildModifierPanel();
  buildCustomizePanel();
});
socket.on('mod:refund', ({ modId }) => {
  ModifierStore.removeLocal(modId);
  CoinBank.add(MODIFIERS[modId].cost);
  buildCustomizePanel();
});

const state = {
  myId: null, myName: '', roomCode: null, hostId: null,
  players: [], prompt: '', promptSource: '', promptCategory: '',
  promptIsAI: false, promptDifficulty: '',
  isRacing: false,
  useAI: false,
  words: [],
  wordIndex: 0,
  correctChars: 0,
  errors: 0,
  totalTyped: 0,
  startTime: null, timerInterval: null,
  wpm: 0, coins: 0, myPlace: null, finished: false,
  activeMods: [],
  // Per-word timing (ms to complete each word)
  wordTimings: [],
  wordStartTime: 0,
  // Navigation flag — set true only when user explicitly clicks Race Again
  navigatingToWaiting: false,
};

let pendingLeave = false;
function showConnectionStatus(message) {
  document.getElementById('connection-message').textContent = message;
  document.getElementById('connection-overlay').hidden = false;
  document.getElementById('typing-input').disabled = true;
}

// Never queue gameplay actions for delivery after reconnection.
const connectedEmit = socket.emit.bind(socket);
socket.emit = (event, ...args) => {
  if (!socket.connected) {
    showConnectionStatus('Reconnecting automatically. Typing is disabled; the race clock keeps running.');
    return socket;
  }
  return connectedEmit(event, ...args);
};
socket.on('disconnect', () => {
  showConnectionStatus('Connection lost. Reconnecting automatically; your spot is held for 20 seconds. The race clock keeps running.');
});
socket.on('connect_error', () => {
  showConnectionStatus('Cannot reach the server. We will keep trying; you can also retry manually.');
});
socket.on('connect', () => {
  state.myId = socket.id;
  document.getElementById('connection-overlay').hidden = true;
  if (pendingLeave) {
    socket.emit('room:leave');
    pendingLeave = false;
  } else if (state.roomCode && !socket.recovered) {
    goLobby();
    showToast('Your room could not be recovered. Please create or join a race again.', 5000);
  }
});
socket.on('room:resumed', room => {
  if (pendingLeave || !state.roomCode) return;
  state.players = room.players;
  state.hostId = room.hostId;
  const me = room.players.find(p => p.id === state.myId);
  if (room.state === 'waiting') {
    renderWaiting(room);
    showScreen('screen-waiting');
  } else if (room.state === 'racing' && state.isRacing && !state.finished && me) {
    const inp = document.getElementById('typing-input');
    inp.disabled = (me.frozenUntil || 0) > Date.now();
    if (!inp.disabled) inp.focus();
  }
  showToast('Reconnected — your progress was preserved.');
});
socket.on('room:recovery-failed', () => { goLobby(); showToast('This room is no longer available.', 5000); });
socket.on('room:closed', () => { goLobby(); showToast('The room closed because all players left.'); });

// ── Helpers ──────────────────────────────────────
function showScreen(id) {
  const changed = !document.getElementById(id).classList.contains('active');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const preview = document.getElementById('customize-runner');
  preview.hidden = !['screen-tt-customize', 'screen-waiting'].includes(id);
  if (!preview.hidden) {
    const saved = localStorage.getItem('tr_sprite') || 'pink';
    updateRunnerPreview(id === 'screen-tt-customize' || Unlocks.has(saved) ? saved : 'pink');
  }
  if (window.AccessibilityUI) window.AccessibilityUI.screenChanged(id, changed);
}
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}
function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
function placeLabel(n) { return n===1?'1ST':n===2?'2ND':n===3?'3RD':n+'TH'; }
function escHtml(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Lobby ─────────────────────────────────────────
function createRoom() {
  if (!socket.connected) return showConnectionStatus("Connect before creating a room.");
  const name = document.getElementById('lobby-name').value.trim();
  if (!name) { showError('lobby-error','Please enter your name.'); return; }
  state.myName = name;
  NameStore.save(name);
  socket.emit('room:create', { name });
}
function joinRoom() {
  if (!socket.connected) return showConnectionStatus("Connect before joining a room.");
  const name = document.getElementById('lobby-name').value.trim();
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!name) { showError('lobby-error','Please enter your name.'); return; }
  if (!code || code.length < 6) { showError('lobby-error','Enter a valid 6-character room code.'); return; }
  state.myName = name;
  NameStore.save(name);
  socket.emit('room:join', { name, code });
}

window.addEventListener('load', () => {
  const params    = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  if (roomParam) {
    document.getElementById('join-code').value = roomParam.toUpperCase();
    showToast('Room code auto-filled — enter your name and join!');
  }
  document.getElementById('lobby-name').addEventListener('keydown', e => { if (e.key==='Enter') createRoom(); });
  document.getElementById('join-code').addEventListener('keydown',  e => { if (e.key==='Enter') joinRoom(); });
  document.getElementById('typing-input').addEventListener('keydown', e => { if (e.key==='Enter') e.preventDefault(); });
});

socket.on('room:error',  ({ msg }) => showError('lobby-error', msg));
socket.on('room:joined', (room) => {
  state.roomCode = room.code;
  state.hostId   = room.hostId;
  state.players  = room.players;
  roomModOwners  = {}; // reset mod ownership for this new room

  // Send appearance — in solo mode allow any sprite (all unlocked); in multiplayer enforce ownership
  const savedSprite = localStorage.getItem('tr_sprite') || 'pink';
  const ownedSprite = Unlocks.has(savedSprite) ? savedSprite : 'pink';
  if (!ttState.active && ownedSprite !== savedSprite) localStorage.setItem('tr_sprite', 'pink');
  const spriteToUse = ttState.active ? savedSprite : ownedSprite;
  socket.emit('player:set-appearance', { spriteId: spriteToUse });

  if (room.isTypingTest && ttState.active) {
    // Typing test — set category then auto-ready
    ttState.roomCode = room.code;
    window.history.replaceState({}, '', '/');
    setTimeout(() => {
      socket.emit('room:set-category', { category: ttState.category || 'random', useAI: ttState.useAI });
      socket.emit('player:ready', { mods: [] });
    }, 100);
  } else {
    // Normal multiplayer — go to waiting room
    renderWaiting(room);
    showScreen('screen-waiting');
    window.history.replaceState({}, '', `?room=${room.code}`);
  }
});

// ── Waiting ───────────────────────────────────────
function renderWaiting(room) {
  document.getElementById('w-code').textContent      = room.code;
  document.getElementById('w-link-text').textContent = `${location.origin}?room=${room.code}`;

  // Show host picker or guest display
  const isHost = room.hostId === state.myId;
  const hostEl  = document.getElementById('w-category-host');
  const guestEl = document.getElementById('w-category-guest');
  if (hostEl)  hostEl.style.display  = isHost ? 'block' : 'none';
  if (guestEl) guestEl.style.display = isHost ? 'none'  : 'block';
  // Modifiers visible and purchaseable by all players
  buildModifierPanel();

  // Sync guest label
  const label = document.getElementById('w-cat-display');
  if (label) {
    const useAI = room.useAI || false;
    const cat   = room.quoteCategory || 'random';
    label.textContent = (useAI ? '✨ AI — ' : '') + (CAT_LABELS[cat] || cat);
  }

  const list = document.getElementById('w-players');
  list.innerHTML = '';
  room.players.forEach(p => {
    const li = document.createElement('li');
    li.className = 'player-item' + (p.ready ? ' ready' : '');
    const isBot = p.isBot || false;
    const nameSuffix = p.id === room.hostId
      ? ' <span style="font-size:9px;color:var(--neon-yellow)">HOST</span>'
      : isBot
      ? ' <span style="font-size:9px;color:var(--text-dim)">🤖 BOT</span>'
      : '';
    li.innerHTML = `
      <div class="player-dot" style="background:${p.color}"></div>
      <span class="player-name">${escHtml(p.name)}${nameSuffix}</span>
      <span class="player-status ${p.ready?'status-ready':'status-waiting'}">${p.connected === false ? 'RECONNECTING' : p.ready?'READY':'WAITING'}</span>
    `;
    list.appendChild(li);
  });
  const me  = room.players.find(p => p.id === state.myId);
  const btn = document.getElementById('btn-ready');
  if (me && me.ready) { btn.disabled = true;  btn.textContent = '✓ Ready!'; }
  else                { btn.disabled = false; btn.textContent = 'Ready Up'; }

  // Build customize panel (theme + sprite picker) — visible to all players
  buildCustomizePanel();
}

function copyLink() {
  navigator.clipboard.writeText(`${location.origin}?room=${state.roomCode}`)
    .then(() => showToast('Link copied to clipboard!'));
}

// ── Category / AI selection (host only) ──────────
const CAT_LABELS = {
  random: 'Random', literature: 'Books', film: 'Film',
  speech: 'Speech', philosophy: 'Philosophy', science: 'Science', game: 'Gaming'
};

function setCategory(cat) {
  // Update active button
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  socket.emit('room:set-category', { category: cat, useAI: state.useAI });
}

function toggleAI() {
  state.useAI = !state.useAI;
  const row   = document.getElementById('ai-toggle');
  const check = document.getElementById('ai-check');
  row.classList.toggle('active', state.useAI);
  check.textContent = state.useAI ? '✓' : '';
  // Re-emit with current category
  const activeCat = document.querySelector('.cat-btn.active');
  socket.emit('room:set-category', {
    category: activeCat ? activeCat.dataset.cat : 'random',
    useAI: state.useAI,
  });
}

socket.on('room:category-updated', ({ category, useAI }) => {
  // Update guest display
  const label = document.getElementById('w-cat-display');
  if (label) {
    label.textContent = (useAI ? '✨ AI — ' : '') + (CAT_LABELS[category] || category);
  }
  // If host, sync the button state too (in case another tab)
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === category);
  });
});

// ── Unified room:update ───────────────────────────
socket.on('room:update', (room) => {
  if (room.code !== state.roomCode || pendingLeave) return;
  state.players = room.players;
  state.hostId  = room.hostId;
  if (room.state === 'waiting') {
    renderWaiting(room);
    const onResults = document.getElementById('screen-results').classList.contains('active');
    if (onResults && !ttState.active) {
      // Do nothing — rematch:vote handles navigation when all players vote
    } else if (state.navigatingToWaiting && !ttState.active) {
      state.navigatingToWaiting = false;
      const section = document.getElementById('analysis-section');
      if (section) section.style.display = 'none';
      showScreen('screen-waiting');
    }
  } else if (room.state === 'racing') {
    state.prompt           = room.prompt;
    state.promptSource     = room.promptSource     || '';
    state.promptCategory   = room.promptCategory   || '';
    state.promptIsAI       = room.promptIsAI       || false;
    state.promptDifficulty = room.promptDifficulty || '';
    if (!state.isRacing && !state.finished) beginRace(room);
  }
});

function playerReady() {
  if (!socket.connected) return;
  SoundEngine.ready();
  const mods = ModifierStore.get();
  socket.emit('player:ready', { mods });
  document.getElementById('btn-ready').disabled    = true;
  document.getElementById('btn-ready').textContent = '✓ Ready!';
}

// ── Countdown ─────────────────────────────────────
socket.on('countdown:preparing', () => {
  if (!state.roomCode || pendingLeave) return;
  state.finished = false;
  showScreen('screen-countdown');
  const el = document.getElementById('countdown-num');
  el.textContent = '…'; el.className = 'countdown-number';
  document.querySelector('#screen-countdown .countdown-sub').textContent = 'PREPARING YOUR PASSAGE';
});
socket.on('countdown:tick', ({ count }) => {
  if (!state.roomCode || pendingLeave) return;
  document.querySelector('#screen-countdown .countdown-sub').textContent = 'GET READY TO TYPE';
  SoundEngine.countdown();
  showScreen('screen-countdown');
  const el = document.getElementById('countdown-num');
  el.textContent = count; el.className = 'countdown-number';
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.animation = 'countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)';
});
socket.on('countdown:go', () => {
  if (!state.roomCode || pendingLeave) return;
  SoundEngine.go();
  const el = document.getElementById('countdown-num');
  el.textContent = 'GO!'; el.className = 'countdown-number countdown-go';
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.animation = 'countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  const flash = document.createElement('div');
  flash.className = 'flash'; document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
});

// ── Begin Race ────────────────────────────────────
function beginRace(room) {
  state.prompt           = normalizeTypingText(room.prompt).trim();
  state.promptSource     = room.promptSource     || '';
  state.promptCategory   = room.promptCategory   || '';
  state.promptIsAI       = room.promptIsAI       || false;
  state.promptDifficulty = room.promptDifficulty || '';
  state.words          = state.prompt.split(' ');
  state.wordIndex      = 0;
  state.correctChars   = 0;
  state.errors         = 0;
  state.totalTyped     = 0;
  state.startTime      = null;
  state.wpm            = 0;
  state.coins          = 0;
  state.finished       = false;
  state.gaveUp         = false;
  document.getElementById('btn-give-up').disabled = false;
  document.getElementById('race-remaining').textContent = '';
  state.myPlace        = null;
  state.wordTimings    = [];
  state.wordStartTime  = 0;

  // Reset and start the smooth sprite loop
  resetSpriteLoop();
  buildLanes(room.players);
  startSpriteLoop();

  showScreen('screen-race');
  document.getElementById('race-hud').classList.add('show');
  document.getElementById('race-track').style.display = 'block';

  renderPrompt();
  renderSource();

  const inp = document.getElementById('typing-input');
  inp.disabled    = !socket.connected;
  inp.value       = '';
  inp.placeholder = 'Type the highlighted word…';
  inp.classList.remove('has-error');
  inp.focus();

  // Capture active modifiers (they were sent to server at ready-up)
  state.activeMods = ModifierStore.get();

  // Show modifier badges in HUD
  const hudMods = document.getElementById('hud-mods');
  if (hudMods) {
    hudMods.innerHTML = '';
    state.activeMods.forEach(id => {
      const mod  = MODIFIERS[id];
      if (!mod) return;
      const badge = document.createElement('div');
      badge.className   = 'mod-badge';
      badge.textContent = `${mod.icon} ${mod.name}`;
      hudMods.appendChild(badge);
    });
  }

  // Consume modifiers (spent whether you win or lose)
  ModifierStore.consumeAll();

  state.isRacing = true;
  // Initialise power-up HUD and grant counts to server
  updatePowerupHUD();
  socket.emit('powerup:grant', PowerupStore.get());

  state.startTime = Date.now();
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateRaceUI, 100);
  state.isRacing = true;
}

// ── Build Lanes ───────────────────────────────────
// All players share the same ground level (bottom:0).
// A tiny bottomOffset staggers players slightly so they
// don't perfectly overlap — like runners bunched together.
function buildLanes(players) {
  const track = document.getElementById('race-track');
  track.innerHTML = '';

  const SPRITE_H      = 64;  // ← ONE place to change sprite size (48, 64, 80, 96)
  const STAGGER_PX    = 5;
  const SOURCE_FRAME  = 32;  // source sprite sheet frame size in px
  const scale         = SPRITE_H / SOURCE_FRAME;

  // Inject keyframes for each sprite type at the current scale
  // Uses a unique animation name per frame-count+width combo so
  // different sprite sheets animate correctly at any size.
  const styleId = 'sprite-keyframes';
  let styleTag  = document.getElementById(styleId);
  if (!styleTag) {
    styleTag    = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }
  const keyframes = Object.values(SPRITES)
    .map(s => {
      const fw  = Math.round(SOURCE_FRAME * scale);
      const sw  = fw * s.frames;
      return `@keyframes monsterRun_${s.frames}_${fw} {
        from { background-position-x: 0px; }
        to   { background-position-x: -${sw}px; }
      }`;
    })
    .join('\n');
  styleTag.textContent = keyframes;

  players.forEach((p, i) => {
    const lane = document.createElement('div');
    lane.className = 'runner-lane';
    lane.id        = `lane-${p.id}`;

    // Progress bar
    const barBg = document.createElement('div');
    barBg.style.cssText = `
      position:absolute; left:0; bottom:0; width:100%; height:2px;
      background:rgba(255,255,255,0.06); border-radius:2px;
    `;
    lane.appendChild(barBg);

    const barFill = document.createElement('div');
    barFill.className = 'lane-bar';
    barFill.id        = `bar-${p.id}`;
    barFill.style.cssText = `
      background:${p.color}; width:0%;
      position:absolute; left:0; bottom:0;
      height:2px; border-radius:2px; opacity:0.55;
    `;
    lane.appendChild(barFill);

    // Finish line
    const fin = document.createElement('div');
    fin.style.cssText = `
      position:absolute; right:20px; top:0; bottom:0; width:3px;
      background:repeating-linear-gradient(180deg,#fff 0 6px,#000 6px 12px);
      opacity:0.5;
    `;
    lane.appendChild(fin);

    // Sprite
    const isMe     = p.id === state.myId;
    const spriteId = isMe
      ? (localStorage.getItem('tr_sprite') || 'pink')
      : (p.spriteId || 'pink');
    const sprite   = SPRITES[spriteId] || SPRITES.pink;

    // Each source frame is 32×32px. We scale to SPRITE_H tall.
    // Scale factor = SPRITE_H / 32. Apply to width too so sheet proportions stay correct.
    const SOURCE_FRAME_SIZE = 32;
    const scale      = SPRITE_H / SOURCE_FRAME_SIZE;
    const frameW     = Math.round(SOURCE_FRAME_SIZE * scale); // = SPRITE_H (square frames)
    const sheetW     = frameW * sprite.frames;                // total scaled sheet width
    const animEndX   = -(sheetW);                             // steps() end position

    const bottomOffset = `calc(var(--race-ground, 160px) + ${i * STAGGER_PX}px)`;

    const avatar = document.createElement('div');
    avatar.className = 'runner-avatar';
    avatar.id        = `runner-${p.id}`;
    avatar.style.cssText = `
      position:absolute;
      left:10px;
      bottom:${bottomOffset};
      width:${frameW}px;
      height:${SPRITE_H}px;
      image-rendering:pixelated;
      image-rendering:crisp-edges;
      background-image:url('${sprite.file}');
      background-repeat:no-repeat;
      background-size:${sheetW}px ${SPRITE_H}px;
      background-position:0 0;
      animation:monsterRun_${sprite.frames}_${frameW} 0.55s steps(${sprite.frames}) infinite;
      z-index:${10 - i};
    `;
    lane.appendChild(avatar);

    // Name tag — floats directly above the sprite head
    const tag = document.createElement('div');
    tag.id = `tag-${p.id}`;
    tag.style.cssText = `
      position:absolute;
      left:10px;
      bottom:calc(var(--race-ground, 160px) + ${i * STAGGER_PX + SPRITE_H + 2}px);
      font-size:7px;
      font-family:'Press Start 2P';
      color:${p.color};
      text-shadow:0 1px 4px rgba(0,0,0,0.95);
      white-space:nowrap;
      pointer-events:none;
      background:rgba(0,0,0,0.5);
      padding:2px 5px;
      border-radius:3px;
      z-index:${10 - i};
    `;
    const isBot = p.isBot || false;
    tag.textContent = (isBot ? '🤖 ' : '') + p.name.slice(0, 12) + (isMe ? ' (you)' : '');
    lane.appendChild(tag);

    track.appendChild(lane);
  });
}

// ── Prompt Rendering ──────────────────────────────
// Renders each word as a <span class="word done|current|pending">.
// The current word also has per-character spans so wrong characters
// are shown in red inline — exactly like typeracer.com.
function renderPrompt(typedSoFar) {
  const box  = document.getElementById('race-prompt');
  const inp  = typedSoFar !== undefined ? typedSoFar : '';
  let html   = '';

  state.words.forEach((word, wi) => {
    if (wi < state.wordIndex) {
      // Already completed — show green
      html += `<span class="word done">${escHtml(word)}</span>`;
    } else if (wi === state.wordIndex) {
      // Current word — render char by char vs what the user has typed so far
      let charHtml = '';
      for (let ci = 0; ci < word.length; ci++) {
        const ch = escHtml(word[ci]);
        if (ci < inp.length) {
          // User has typed this position
          if (inp[ci] === word[ci]) {
            charHtml += `<span class="ch-correct">${ch}</span>`;
          } else {
            charHtml += `<span class="ch-wrong">${ch}</span>`;
          }
        } else {
          // Not yet typed
          charHtml += `<span class="ch-pending">${ch}</span>`;
        }
      }
      // If user typed MORE than the word length, show extra chars as wrong
      if (inp.length > word.length) {
        for (let ci = word.length; ci < inp.length; ci++) {
          charHtml += `<span class="ch-wrong">${escHtml(inp[ci])}</span>`;
        }
      }
      html += `<span class="word current">${charHtml}</span>`;
    } else {
      // Not yet reached — show dim
      html += `<span class="word pending">${escHtml(word)}</span>`;
    }

    // Space between words (not after last word)
    if (wi < state.words.length - 1) {
      html += '<span class="word-space"> </span>';
    }
  });

  box.innerHTML = html;
  const wordStatus = document.getElementById('current-word');
  if (wordStatus) {
    const description = state.finished ? 'Passage complete.' : `Word ${state.wordIndex + 1} of ${state.words.length}: ${state.words[state.wordIndex] || ''}`;
    if (wordStatus.textContent !== description) wordStatus.textContent = description;
  }
}

function renderSource() {
  const el = document.getElementById('prompt-source');
  if (!el) return;
  if (state.promptSource) {
    const isAI = state.promptIsAI || false;
    const cat  = state.promptCategory || 'quote';
    const diff = state.promptDifficulty || '';

    let badges = '';
    if (isAI) {
      badges += `<span class="ai-badge">✨ AI</span>`;
      if (diff) {
        badges += `<span class="diff-badge ${diff}">${diff}</span>`;
      }
    } else {
      badges += `<span class="cat-badge">${escHtml(cat)}</span>`;
    }
    el.innerHTML = `${badges}${escHtml(state.promptSource)}`;
  } else {
    el.textContent = '';
  }
}

// ── Typing Handler (word-by-word, typeracer.com style) ──────────────────────
function onTyping() {
  if (!socket.connected || !state.isRacing || state.finished) return;
  const inp = document.getElementById('typing-input');
  const val = normalizeTypingText(inp.value);
  inp.value = val;

  // Start timing the first word on first keystroke
  if (!state.wordStartTime) state.wordStartTime = Date.now();

  state.totalTyped++;

  const currentWord = state.words[state.wordIndex];
  const isLastWord  = state.wordIndex === state.words.length - 1;

  // Last word: finish the moment it matches — no space needed
  if (isLastWord && val === currentWord) {
    const ms = state.wordStartTime ? Date.now() - state.wordStartTime : 0;
    state.wordTimings.push({ word: currentWord, ms, wpm: calcWpm() });
    state.correctChars += currentWord.length;
    state.wordIndex++;
    inp.value = '';
    inp.classList.remove('has-error');
    setSpriteTarget(1);
    renderPrompt('');
    finishRace();
    return;
  }

  // Space = submit current word
  if (val.endsWith(' ')) {
    const typed = val.trimEnd();
    if (typed === currentWord) {
      const ms = state.wordStartTime ? Date.now() - state.wordStartTime : 0;
      state.wordTimings.push({ word: currentWord, ms, wpm: calcWpm() });
      state.correctChars += currentWord.length + 1;
      state.wordIndex++;
      state.wordStartTime = Date.now(); // start timing the next word
      inp.value = '';
      inp.classList.remove('has-error');
      SoundEngine.wordComplete();

      const progress = Math.round((state.wordIndex / state.words.length) * 100);
      const wpm      = calcWpm();
      state.wpm      = wpm;
      state.coins    = Math.round(wpm * 0.5 + progress * 0.8);

      // Target = end of the just-completed word (before the space gap)
      setSpriteTarget(calcCharPosition(0));
      socket.emit('player:progress', { progress, wpm, typedLength: state.correctChars });
      renderPrompt('');
    } else {
      inp.value = typed;
      inp.classList.add('has-error');
      SoundEngine.error();
      state.errors++;
      setSpriteTarget(calcCharPosition(typed.length));
      renderPrompt(typed);
    }
    return;
  }

  // Normal character or backspace
  inp.classList.remove('has-error');
  let hasError = false;
  for (let i = 0; i < val.length; i++) {
    if (i >= currentWord.length || val[i] !== currentWord[i]) {
      hasError = true; break;
    }
  }
  if (hasError) { inp.classList.add('has-error'); SoundEngine.error(); }

  setSpriteTarget(calcCharPosition(val.length));
  renderPrompt(val);
}

// ── Sprite position helpers ───────────────────────────────────────────────
// calcCharPosition: returns a 0..1 float for the current char position.
// charsInCurrentWord is how many chars the player has typed in the active word.
function calcCharPosition(charsInCurrentWord) {
  const totalChars     = state.prompt.length;
  const completedChars = state.words
    .slice(0, state.wordIndex)
    .reduce((sum, w) => sum + w.length + 1, 0); // includes spaces
  const inWord = Math.min(charsInCurrentWord, (state.words[state.wordIndex] || '').length);
  return Math.min(1, (completedChars + inWord) / totalChars);
}

// ── Smooth sprite system ──────────────────────────────────────────────────
// Target position is set instantly on every keystroke.
// A rAF loop lerps the DISPLAYED position toward the target each frame.
// This eliminates all jumpiness at high typing speeds and completely
// prevents backward movement by clamping displayed position to a max.

let spriteTarget   = 0;   // 0..1  — where we WANT the sprite to be
let spriteDisplay  = 0;   // 0..1  — where the sprite IS right now (lerped)
let spriteMax      = 0;   // 0..1  — highest position ever reached (no going back)
let spriteRafId    = null;

function setSpriteTarget(position) {
  // Only allow the target to move forward — never backward
  spriteTarget = Math.max(spriteTarget, position);
}

function startSpriteLoop() {
  if (spriteRafId) return; // already running

  const LERP_SPEED = 0.18; // 0..1 — higher = snappier, lower = smoother

  function tick() {
    // Lerp display toward target
    spriteDisplay = MotionPreferences.isReduced() ? spriteTarget : spriteDisplay + (spriteTarget - spriteDisplay) * LERP_SPEED;

    // Hard clamp: displayed position can never go below the maximum seen
    spriteMax    = Math.max(spriteMax, spriteDisplay);
    spriteDisplay = spriteMax;

    // Apply to DOM
    const runner = document.getElementById(`runner-${state.myId}`);
    const bar    = document.getElementById(`bar-${state.myId}`);
    const tag    = document.getElementById(`tag-${state.myId}`);

    if (runner) {
      const trackEl = document.getElementById('race-track');
      const trackW  = trackEl ? trackEl.offsetWidth : window.innerWidth;
      const maxX    = trackW - 52; // finish line at right:20px + sprite width 32px clearance
      const px      = 10 + spriteDisplay * (maxX - 10);
      runner.style.transition = 'none';
      runner.style.left       = px + 'px';
      // Move tag horizontally with sprite (tag uses same left, bottom is fixed)
      if (tag) { tag.style.transition = 'none'; tag.style.left = px + 'px'; }
      if (bar) bar.style.width = (spriteDisplay * 100) + '%';
    }

    spriteRafId = requestAnimationFrame(tick);
  }

  spriteRafId = requestAnimationFrame(tick);
}

function stopSpriteLoop() {
  if (spriteRafId) { cancelAnimationFrame(spriteRafId); spriteRafId = null; }
}

function resetSpriteLoop() {
  stopSpriteLoop();
  spriteTarget  = 0;
  spriteDisplay = 0;
  spriteMax     = 0;
}

function calcWpm() {
  if (!state.startTime) return 0;
  const mins = (Date.now() - state.startTime) / 60000;
  // Standard WPM: chars typed ÷ 5 ÷ minutes
  return mins > 0 ? Math.round((state.correctChars / 5) / mins) : 0;
}
function calcAccuracy() {
  if (!state.totalTyped) return 100;
  return Math.round(((state.totalTyped - state.errors) / state.totalTyped) * 100);
}

// ── Race UI Loop ──────────────────────────────────
function updateRaceUI() {
  if (!state.startTime) return;
  const elapsed  = (Date.now() - state.startTime) / 1000;
  const wpm      = calcWpm();
  const acc      = calcAccuracy();
  state.wpm      = wpm;

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  document.getElementById('hud-timer').textContent  = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  document.getElementById('hud-wpm').textContent    = `${wpm} WPM`;
  document.getElementById('hud-acc').textContent    = `${acc}%`;
  document.getElementById('stat-time').textContent  = elapsed.toFixed(1) + 's';
  document.getElementById('stat-coins').textContent = state.coins;
  if (state.myPlace) document.getElementById('stat-place').textContent = placeLabel(state.myPlace);

  const arcLen   = Math.min(113, (wpm / 150) * 113);
  const arcColor = wpm < 40 ? '#b53658' : wpm < 80 ? '#795b12' : '#087f72';
  document.getElementById('speed-fill').setAttribute('stroke-dasharray', `${arcLen} 113`);
  document.getElementById('speed-fill').setAttribute('stroke', arcColor);
  document.getElementById('speed-num').textContent = wpm;
  document.getElementById('speed-num').setAttribute('fill', arcColor);
}

// ── Live Positions ────────────────────────────────
socket.on('race:positions', (positions) => {
  const trackEl = document.getElementById('race-track');
  const trackW  = trackEl ? trackEl.offsetWidth : window.innerWidth;
  // maxX must match exactly where the finish line sits.
  // Finish line is drawn at right:20px, sprite width is 32px.
  // So the sprite's left edge should reach (trackW - 20 - 32) = trackW - 52.
  const maxX = trackW - 52;

  positions.forEach(p => {
    const runner = document.getElementById(`runner-${p.id}`);
    const bar    = document.getElementById(`bar-${p.id}`);
    const tag    = document.getElementById(`tag-${p.id}`);
    if (!runner) return;

    const px = 10 + (p.progress / 100) * (maxX - 10);

    // Move ALL non-local runners (bots + other humans) directly
    if (p.id !== state.myId) {
      runner.style.left = px + 'px';
    }
    if (tag) tag.style.left = px + 'px';
    if (bar) bar.style.width = p.progress + '%';

    // Sync sprite sheet for other players if it changed
    if (p.id !== state.myId && p.spriteId) {
      const sprite       = SPRITES[p.spriteId] || SPRITES.pink;
      const SPRITE_H     = 64;
      const SOURCE_FRAME = 32;
      const frameW       = Math.round(SOURCE_FRAME * (SPRITE_H / SOURCE_FRAME));
      const sheetW       = frameW * sprite.frames;
      const animName     = `monsterRun_${sprite.frames}_${frameW}`;
      const current      = runner.style.backgroundImage;
      const next         = `url("${sprite.file}")`;
      if (current !== next) {
        runner.style.backgroundImage = next;
        runner.style.backgroundSize  = `${sheetW}px ${SPRITE_H}px`;
        runner.style.animation       = `${animName} 0.55s steps(${sprite.frames}) infinite`;
      }
    }
  });

  const sorted  = [...positions].sort((a, b) => b.progress - a.progress);
  state.myPlace = sorted.findIndex(p => p.id === state.myId) + 1;
});

// ── Finish / Results ──────────────────────────────
let raceDeadlineInterval = null;
socket.on('race:deadline', ({ remainingMs, firstFinished }) => {
  if (!state.roomCode || pendingLeave) return;
  clearInterval(raceDeadlineInterval);
  const deadline = Date.now() + remainingMs;
  const update = () => {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    document.getElementById('race-remaining').textContent =
      `${firstFinished ? 'First racer finished — ends in' : 'Race ends in'} ${seconds}s`;
  };
  update();
  raceDeadlineInterval = setInterval(update, 250);
});

function giveUpRace() {
  if (!socket.connected || !state.isRacing || state.finished) return;
  document.getElementById('btn-give-up').disabled = true;
  socket.emit('player:give-up');
}

socket.on('race:gave-up', () => {
  state.wpm = calcWpm();
  state.gaveUp = true;
  state.finished = true;
  state.isRacing = false;
  clearInterval(state.timerInterval);
  stopSpriteLoop();
  document.getElementById('typing-input').disabled = true;
  showToast('You gave up (DNF). Watch the remaining racers or leave the match.');
});

function finishRace() {
  state.wpm = calcWpm();
  document.getElementById('btn-give-up').disabled = true;
  state.finished = true;
  state.isRacing = false;
  clearInterval(state.timerInterval);
  stopSpriteLoop();
  document.getElementById('typing-input').disabled = true;

  if (ttState.active) {
    // Typing test — show the dedicated results screen, skip multiplayer flow
    document.getElementById('race-hud').classList.remove('show');
    document.getElementById('race-track').style.display = 'none';
    socket.emit('player:finished', { wpm: state.wpm, accuracy: calcAccuracy() });
    showTypingTestResults();
    return;
  }

  // Multiplayer finish
  const humanOpponents = state.players.filter(p => !p.isBot && p.id !== state.myId);
  socket.emit('player:finished', { wpm: state.wpm, accuracy: calcAccuracy() });
  if (humanOpponents.length > 0) showToast('🏁 You finished! Waiting for others…');
}

socket.on('race:finished', ({ results }) => {
  if (!state.roomCode || pendingLeave) return;
  clearInterval(raceDeadlineInterval);
  clearInterval(state.timerInterval);
  stopSpriteLoop();
  state.isRacing = false;
  document.getElementById('typing-input').disabled = true;
  document.getElementById('race-hud').classList.remove('show');
  document.getElementById('race-track').style.display = 'none';
  if (ttState.active) {
    if (!state.finished || state.gaveUp) {
      state.finished = true;
      showTypingTestResults(false);
    }
    return;
  }
  state.finished = true;

  const me = results.find(r => r.id === state.myId);
  if (me && me.finishTime && me.place <= 3) { fireConfetti(); SoundEngine.finish(); }
  else if (me) SoundEngine.raceEnd();

  // ── Bank the earned coins ─────────────────────
  if (me && me.coins > 0) {
    const multiplier = state.activeMods.includes('double_coins') ? 2 : 1;
    const earned     = me.coins * multiplier;
    CoinBank.add(earned);
    const suffix = multiplier > 1 ? ' (2× bonus!)' : '';
    showToast(`+${earned} 🪙 coins earned${suffix}! Total: ${CoinBank.get()} 🪙`);
  }

  const list       = document.getElementById('results-list');
  list.innerHTML   = '';
  const placeEmoji = ['🥇','🥈','🥉'];

  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'result-row' + (r.place === 1 && r.finishTime ? ' winner' : '');
    const isMe  = r.id === state.myId;
    const isBot = r.isBot || false;
    const nameSuffix = isMe
      ? ' <span style="font-size:10px;color:var(--text-dim)">(you)</span>'
      : isBot
      ? ' <span style="font-size:10px;color:var(--text-dim)">🤖</span>'
      : '';
    const finishSecs = r.finishTime
      ? ((r.finishTime - state.startTime) / 1000).toFixed(1) + 's'
      : r.gaveUp ? 'DNF — gave up' : 'DNF — time expired';
    div.innerHTML = `
      <div class="result-place ${r.place<=3?'p'+r.place:''}">${placeEmoji[r.place-1]||r.place}</div>
      <div class="result-dot" style="background:${r.color}"></div>
      <div class="result-name">${escHtml(r.name)}${nameSuffix}</div>
      <div class="result-stats">
        <div class="result-wpm">${r.wpm} WPM</div>
        <div class="result-time">${finishSecs}</div>
        <div class="result-coins">+${r.coins} 🪙</div>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-rematch').style.display = 'block';
  const btn = document.getElementById('btn-rematch');
  if (btn) { btn.disabled = false; btn.textContent = 'Race Again'; }
  const votesEl = document.getElementById('rematch-votes');
  if (votesEl) { votesEl.style.display = 'none'; votesEl.textContent = ''; }
  showScreen('screen-results');

  // Show analysis for the local player only
  showAnalysis(state.wordTimings);
});

function requestRematch() {
  const btn = document.getElementById('btn-rematch');
  if (btn) { btn.disabled = true; btn.textContent = '✓ Voted'; }
  socket.emit('room:rematch');
}

// Other player left during post-match — route the remaining player appropriately
socket.on('room:solo-remaining', ({ isHost, room }) => {
  showToast('Other player left the room.');
  const section = document.getElementById('analysis-section');
  if (section) section.style.display = 'none';
  // Reset rematch UI
  const btn = document.getElementById('btn-rematch');
  if (btn) { btn.disabled = false; btn.textContent = 'Race Again'; }
  const votesEl = document.getElementById('rematch-votes');
  if (votesEl) { votesEl.style.display = 'none'; votesEl.textContent = ''; }

  if (isHost) {
    // Re-render the waiting room with the updated (correct) player list first
    if (room) {
      state.players = room.players;
      state.hostId  = room.hostId;
      renderWaiting(room);
    }
    showScreen('screen-waiting');
  } else {
    goLobby();
  }
});

socket.on('rematch:vote', ({ votes, total, voterId }) => {
  const votesEl = document.getElementById('rematch-votes');
  if (votesEl) {
    votesEl.style.display = 'block';
    votesEl.textContent   = `${votes}/${total} players want to race again…`;
  }
  // If the other player voted and we haven't — update button label to prompt us
  if (voterId !== state.myId) {
    const btn = document.getElementById('btn-rematch');
    if (btn && !btn.disabled) btn.textContent = `Race Again (${votes}/${total})`;
  }
  // All voted — navigate to waiting room immediately here
  if (votes >= total) {
    if (votesEl) votesEl.style.display = 'none';
    roomModOwners = {};
    ModifierStore.consumeAll();
    const section = document.getElementById('analysis-section');
    if (section) section.style.display = 'none';
    showScreen('screen-waiting');
  }
});
function goLobby() {
  pendingLeave = !socket.connected;
  if (socket.connected) socket.emit('room:leave');
  clearInterval(state.timerInterval);
  clearInterval(raceDeadlineInterval);
  stopSpriteLoop();
  state.roomCode = null;
  state.isRacing = false;
  state.finished = false;
  state.players = [];
  state.hostId = null;
  state.navigatingToWaiting = false;
  ttState.active = false;
  ttState.roomCode = null;
  roomModOwners = {};
  document.getElementById('typing-input').disabled = true;
  document.getElementById('race-hud').classList.remove('show');
  document.getElementById('race-track').style.display = 'none';
  const btn = document.querySelector('#screen-tt-customize .btn-ready');
  if (btn) { btn.disabled = false; btn.textContent = 'Start Typing Test'; }
  window.history.replaceState({}, '', '/');
  showScreen('screen-lobby');
  document.getElementById('connection-overlay').hidden = true;
}

// ── WPM Chart — shared canvas drawing util ─────────
// Called by both multiplayer results and typing test results.
function drawWpmChart(canvas, wordTimings) {
  if (canvas && window.AccessibilityUI) window.AccessibilityUI.chartDescription(canvas, wordTimings || []);
  if (!canvas || !wordTimings || !wordTimings.length) return;
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const PAD = { top:18, right:16, bottom:28, left:42 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  const wpms = wordTimings.map(w => {
    const mins = w.ms / 60000;
    return mins > 0 ? Math.round((w.word.length / 5) / mins) : 0;
  });
  const smoothed = wpms.map((_, i) => {
    const win = wpms.slice(Math.max(0, i - 2), i + 1);
    return Math.round(win.reduce((s, v) => s + v, 0) / win.length);
  });

  const maxWpm = Math.max(...smoothed, 30);
  const minWpm = Math.max(0, Math.min(...smoothed) - 10);
  const range  = maxWpm - minWpm || 1;
  const xAt = i => PAD.left + (i / (smoothed.length - 1 || 1)) * cW;
  const yAt = v => PAD.top  + cH - ((v - minWpm) / range) * cH;

  // Grid
  for (let i = 0; i <= 4; i++) {
    const val = minWpm + (range / 4) * i;
    const y   = yAt(val);
    ctx.strokeStyle = '#dce5df'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
    ctx.fillStyle = '#52685f'; ctx.font = '11px monospace'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(val), PAD.left - 5, y + 3);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
  grad.addColorStop(0,   'rgba(8,127,114,0.25)');
  grad.addColorStop(0.6, 'rgba(8,127,114,0.06)');
  grad.addColorStop(1,   'rgba(8,127,114,0)');
  ctx.beginPath(); ctx.moveTo(xAt(0), yAt(smoothed[0]));
  for (let i = 1; i < smoothed.length; i++) {
    const cpx = (xAt(i-1) + xAt(i)) / 2;
    ctx.bezierCurveTo(cpx, yAt(smoothed[i-1]), cpx, yAt(smoothed[i]), xAt(i), yAt(smoothed[i]));
  }
  ctx.lineTo(xAt(smoothed.length - 1), PAD.top + cH);
  ctx.lineTo(xAt(0), PAD.top + cH);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath(); ctx.moveTo(xAt(0), yAt(smoothed[0]));
  for (let i = 1; i < smoothed.length; i++) {
    const cpx = (xAt(i-1) + xAt(i)) / 2;
    ctx.bezierCurveTo(cpx, yAt(smoothed[i-1]), cpx, yAt(smoothed[i]), xAt(i), yAt(smoothed[i]));
  }
  ctx.strokeStyle = 'rgba(8,127,114,0.9)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();

  // Dots
  smoothed.forEach((v, i) => {
    ctx.beginPath(); ctx.arc(xAt(i), yAt(v), 3, 0, Math.PI * 2);
    ctx.fillStyle = '#087f72'; ctx.fill();
  });

  // Avg dashed line
  const avg  = Math.round(smoothed.reduce((s, v) => s + v, 0) / smoothed.length);
  const avgY = yAt(avg);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = '#997a2f'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD.left, avgY); ctx.lineTo(PAD.left + cW, avgY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#795b12'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
  ctx.fillText(`avg ${avg}`, PAD.left + 4, avgY - 4);
  ctx.fillStyle = '#52685f'; ctx.textAlign = 'center';
  ctx.fillText('word →', PAD.left + cW / 2, H - 4);
}

function renderLineChart(wordTimings) {
  drawWpmChart(document.getElementById('wpm-chart'), wordTimings);
}

// ── Fetch AI coaching from server ─────────────────
async function fetchCoaching(wordTimings) {
  const totalTime = wordTimings.reduce((s, w) => s + w.ms, 0) / 1000;
  try {
    const res = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wpm:         state.wpm,
        accuracy:    calcAccuracy(),
        errors:      state.errors,
        totalTime:   Number(totalTime.toFixed(1)),
        wordTimings: wordTimings,
        prompt:      state.prompt,
      }),
    });
    const data = await res.json();
    return data.analysis && !data.analysis.includes('GROQ_API_KEY') ? data.analysis : '';
  } catch (e) {
    console.error('Coaching fetch failed:', e);
    return '';
  }
}

// ── Show post-race analysis ───────────────────────
// ── Race history (session, last 5 WPMs) ──────────
const RaceHistory = {
  _key: 'tr_race_history',
  get()       { try { return JSON.parse(sessionStorage.getItem(this._key) || '[]'); } catch { return []; } },
  push(wpm)   {
    const h = this.get();
    h.push({ wpm, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) });
    sessionStorage.setItem(this._key, JSON.stringify(h.slice(-5)));
  },
  avg()       { const h = this.get(); return h.length ? Math.round(h.reduce((s,r) => s + r.wpm, 0) / h.length) : 0; },
};

function renderRaceHistory() {
  const history = RaceHistory.get();
  const section = document.getElementById('race-history');
  const barsEl  = document.getElementById('race-history-bars');
  const avgEl   = document.getElementById('race-history-avg');
  if (!section || !barsEl || history.length < 2) { if (section) section.style.display = 'none'; return; }

  section.style.display = 'block';
  const maxWpm = Math.max(...history.map(r => r.wpm), 1);
  barsEl.innerHTML = '';

  history.forEach((race, i) => {
    const isCurrent = i === history.length - 1;
    const pct       = Math.max(8, Math.round((race.wpm / maxWpm) * 100));
    const wrap      = document.createElement('div');
    wrap.className  = 'race-history-bar-wrap';
    wrap.innerHTML  = `
      <div class="race-history-bar-val">${race.wpm}</div>
      <div class="race-history-bar${isCurrent ? ' current' : ''}" style="height:${pct}%"></div>
      <div class="race-history-bar-label">${isCurrent ? 'now' : race.time}</div>
    `;
    barsEl.appendChild(wrap);
  });

  if (avgEl) avgEl.textContent = RaceHistory.avg() + ' WPM';
}

async function showAnalysis(wordTimings) {
  if (!wordTimings || wordTimings.length < 2) return;
  const section = document.getElementById('analysis-section');
  if (section) section.style.display = 'block';

  const totalMs  = wordTimings.reduce((s, w) => s + w.ms, 0);
  const totalSec = (totalMs / 1000).toFixed(1);
  document.getElementById('an-wpm').textContent  = state.wpm;
  document.getElementById('an-acc').textContent  = calcAccuracy() + '%';
  document.getElementById('an-time').textContent = totalSec + 's';
  document.getElementById('an-err').textContent  = state.errors;

  // Save to history and render
  RaceHistory.push(state.wpm);
  renderRaceHistory();

  requestAnimationFrame(() => renderLineChart(wordTimings));

  const text   = await fetchCoaching(wordTimings);
  const loadEl = document.getElementById('coaching-loading');
  const textEl = document.getElementById('coaching-text');
  if (loadEl) loadEl.style.display = 'none';
  if (textEl) {
    textEl.style.display = 'block';
    textEl.textContent   = text || 'Keep a steady rhythm and focus on accuracy before speed. Try another passage to build consistency.';
  }
}

// ═══════════════════════════════════════════════════
//  LEADERBOARD SCREEN
// ═══════════════════════════════════════════════════
const RANK_EMOJI = ['🥇', '🥈', '🥉'];

async function openLeaderboard() {
  showScreen('screen-leaderboard');
  const list = document.getElementById('lb-list');
  list.innerHTML = '<div class="lb-spinner-wrap"><div class="lb-spinner"></div><span>Loading…</span></div>';
  try {
    const res  = await fetch('/api/leaderboard');
    const data = await res.json();
    renderLeaderboard(data);
  } catch {
    list.innerHTML = '<div class="lb-empty">Could not load leaderboard.<br>Check your connection.</div>';
  }
}

function renderLeaderboard(entries) {
  const list = document.getElementById('lb-list');
  if (!entries || !entries.length) {
    list.innerHTML = '<div class="lb-empty">No scores yet.<br>Finish a race to get on the board!</div>';
    return;
  }
  list.innerHTML = '';
  entries.forEach((entry, i) => {
    const rank  = i + 1;
    const cls   = rank === 1 ? ' lb-gold' : rank === 2 ? ' lb-silver' : rank === 3 ? ' lb-bronze' : '';
    const date  = entry.date ? new Date(entry.date).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' }) : '';
    const row   = document.createElement('div');
    row.className = `lb-row${cls}`;
    row.innerHTML = `
      <div class="lb-rank">${RANK_EMOJI[rank - 1] || rank}</div>
      <div class="lb-name">${escHtml(entry.name)}</div>
      <div class="lb-right">
        <div class="lb-wpm">${entry.wpm} WPM</div>
        ${entry.accuracy != null ? `<div class="lb-acc">${entry.accuracy}% acc</div>` : ''}
        ${date ? `<div class="lb-date">${date}</div>` : ''}
      </div>`;
    list.appendChild(row);
  });
}

function closeLeaderboard() { showScreen('screen-lobby'); }

// Refresh the leaderboard in-place if the user is viewing it when a race ends
socket.on('leaderboard:update', (entries) => {
  if (document.getElementById('screen-leaderboard').classList.contains('active')) {
    renderLeaderboard(entries);
  }
});

// ═══════════════════════════════════════════════════
//  TYPING TEST MODE
// ═══════════════════════════════════════════════════
const ttState = { active: false, roomCode: null, category: 'random', useAI: false };

function openTypingTest() {
  const name = document.getElementById('lobby-name').value.trim();
  if (!name) { showError('lobby-error', 'Please enter your name first.'); return; }
  state.myName  = name;
  ttState.useAI = false;
  buildSoloCustomizePanel();
  showScreen('screen-tt-customize');
  // Reset AI toggle UI
  const check  = document.getElementById('tt-ai-check');
  const toggle = document.getElementById('tt-ai-toggle');
  if (check)  check.classList.remove('checked');
  if (toggle) toggle.classList.remove('active');
}

function setTTCategory(cat) {
  ttState.category = cat;
  document.querySelectorAll('[data-ttcat]').forEach(b => b.classList.toggle('active', b.dataset.ttcat === cat));
}

function toggleTTAI() {
  ttState.useAI = !ttState.useAI;
  document.getElementById('tt-ai-check').classList.toggle('checked', ttState.useAI);
  document.getElementById('tt-ai-toggle').classList.toggle('active', ttState.useAI);
}

function startTypingTestRace() {
  if (!socket.connected) return showConnectionStatus("Connect before starting a typing test.");
  const btn = document.querySelector('#screen-tt-customize .btn-ready');
  if (btn) { btn.disabled = true; btn.textContent = 'Starting…'; }
  ttState.active = true;
  socket.emit('room:create', { name: state.myName, typingTest: true });
}

// Build the solo customize panel — mirrors buildCustomizePanel exactly, all items unlocked
function buildSoloCustomizePanel() {
  const savedTheme  = localStorage.getItem('tr_theme')  || 'city';
  const savedSprite = localStorage.getItem('tr_sprite') || 'pink';
  const coins       = CoinBank.get();

  // Coin display
  const coinEl = document.getElementById('tt-coin-display');
  if (coinEl) coinEl.textContent = `${coins} 🪙`;

  // Player row
  const playerRow = document.getElementById('tt-player-row');
  if (playerRow) {
    playerRow.innerHTML = `
      <li class="player-item ready">
        <div class="player-dot" style="background:#a78bfa"></div>
        <span class="player-name">${escHtml(state.myName)}</span>
        <span class="player-status status-ready">SOLO</span>
      </li>`;
  }

  // ── Themes — all unlocked, same DOM structure as multiplayer ────────────
  const themeGrid = document.getElementById('tt-theme-grid');
  if (themeGrid) {
    themeGrid.innerHTML = '';
    Object.entries(THEMES).forEach(([id, theme]) => {
      const btn = document.createElement('button');
      btn.className = 'theme-btn' + (id === savedTheme ? ' active' : '');
      btn.title     = theme.label;
      btn.innerHTML = `
        ${themeThumbnail(id, theme)}
        <span class="theme-label">${theme.label}</span>
      `;
      btn.onclick = () => {
        localStorage.setItem('tr_theme', id);
        window.applyTheme(id);
        themeGrid.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      themeGrid.appendChild(btn);
    });
  }

  // ── Sprites — all unlocked, same DOM structure as multiplayer ────────────
  const spriteGrid = document.getElementById('tt-sprite-grid');
  if (spriteGrid) {
    spriteGrid.innerHTML = '';
    Object.entries(SPRITES).forEach(([id, sprite]) => {
      const btn = document.createElement('button');
      btn.className = 'sprite-btn' + (id === savedSprite ? ' active' : '');

      const preview = document.createElement('div');
      preview.className = 'sprite-preview anim';
      preview.style.backgroundImage = `url('${sprite.file}')`;
      preview.style.setProperty('--sprite-frames', sprite.frames);
      preview.style.setProperty('--sprite-strip-width', `${sprite.frames * 32}px`);

      const label = document.createElement('div');
      label.className   = 'sprite-btn-label';
      label.textContent = sprite.label;

      btn.appendChild(preview);
      btn.appendChild(label);
      btn.onclick = () => {
        localStorage.setItem('tr_sprite', id);
        applySprite(id);
        spriteGrid.querySelectorAll('.sprite-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      spriteGrid.appendChild(btn);
    });
  }
}

async function showTypingTestResults(completed = true) {
  document.querySelector('#screen-typing-test-results .tt-title').textContent =
    completed ? '⌨️ TYPING TEST COMPLETE ⌨️' : '⌨️ TYPING TEST — DNF ⌨️';
  const wt = state.wordTimings;

  // Populate stat pills
  const totalSec = (wt.reduce((s, w) => s + w.ms, 0) / 1000).toFixed(1);
  document.getElementById('tt-wpm').textContent  = state.wpm;
  document.getElementById('tt-acc').textContent  = calcAccuracy() + '%';
  document.getElementById('tt-time').textContent = totalSec + 's';
  document.getElementById('tt-err').textContent  = state.errors;

  // Save to session history
  RaceHistory.push(state.wpm);

  // Reset coaching area
  document.getElementById('tt-coaching-loading').style.display = 'flex';
  document.getElementById('tt-coaching-text').style.display    = 'none';

  showScreen('screen-typing-test-results');

  // Draw chart after screen is visible so canvas has dimensions
  requestAnimationFrame(() => drawWpmChart(document.getElementById('tt-chart'), wt));

  // Submit to leaderboard (server-side via socket event on player:finished)
  if (completed && state.wpm >= 10) showToast(`⌨️ ${state.wpm} WPM — added to leaderboard!`);

  // AI coaching
  const text   = await fetchCoaching(wt);
  document.getElementById('tt-coaching-loading').style.display = 'none';
  const textEl = document.getElementById('tt-coaching-text');
  textEl.style.display = 'block';
  textEl.textContent   = text || 'Keep a steady rhythm and focus on accuracy before speed. Try another passage to build consistency.';
}

function retryTypingTest() {
  if (socket.connected) socket.emit('room:leave');
  else pendingLeave = true;
  state.roomCode = null;
  ttState.useAI = false;
  buildSoloCustomizePanel();
  // Reset AI toggle UI
  const check  = document.getElementById('tt-ai-check');
  const toggle = document.getElementById('tt-ai-toggle');
  if (check)  check.classList.remove('checked');
  if (toggle) toggle.classList.remove('active');
  // Re-enable start button
  const btn = document.querySelector('#screen-tt-customize .btn-ready');
  if (btn) { btn.disabled = false; btn.textContent = 'Start Typing Test'; }
  showScreen('screen-tt-customize');
}

function exitTypingTest() { goLobby(); }

// ═══════════════════════════════════════════════════
//  POWER-UPS
// ═══════════════════════════════════════════════════
const POWERUP_DEFS = {
  zap:    { price: 120, icon: '⚡', name: 'Zap',    key: 'F1' },
  shield: { price: 80,  icon: '🛡️', name: 'Shield', key: 'F2' },
};

const PowerupStore = {
  _key: 'tr_powerups',
  get()         { try { return JSON.parse(localStorage.getItem(this._key) || '{"zap":0,"shield":0}'); } catch { return {zap:0,shield:0}; } },
  set(obj)      { localStorage.setItem(this._key, JSON.stringify(obj)); },
  count(type)   { return this.get()[type] || 0; },
  add(type, n=1){ const s = this.get(); s[type] = Math.min(3, (s[type]||0) + n); this.set(s); },
  spend(type)   { const s = this.get(); if (!s[type]) return false; s[type]--; this.set(s); return true; },
  reset()       { this.set({zap:0,shield:0}); },
};

function buyPowerup(type) {
  const def = POWERUP_DEFS[type];
  if (!def) return;
  if (PowerupStore.count(type) >= 3) { showToast(`Max 3 ${def.name}s`); return; }
  if (!CoinBank.spend(def.price))    { showToast(`Not enough coins! Need ${def.price} 🪙`); return; }
  PowerupStore.add(type);
  refreshPowerupShop();
  buildCustomizePanel(); // refresh coin display
  showToast(`${def.icon} ${def.name} purchased! (${PowerupStore.count(type)}/3)`);
  // Tell server our powerup counts for this race
  socket.emit('powerup:grant', PowerupStore.get());
}

function refreshPowerupShop() {
  const coins = CoinBank.get();
  Object.keys(POWERUP_DEFS).forEach(type => {
    const def     = POWERUP_DEFS[type];
    const count   = PowerupStore.count(type);
    const countEl = document.getElementById(`pu-count-${type}`);
    const btn     = document.getElementById(`pu-buy-${type}`);
    if (countEl) countEl.textContent = count;
    if (btn) {
      btn.disabled = count >= 3 || coins < def.price;
      btn.title    = count >= 3 ? 'Max 3' : `${def.price} 🪙 — you have ${coins} 🪙`;
    }
  });
}

function updatePowerupHUD() {
  const zapCount    = PowerupStore.count('zap');
  const shieldCount = PowerupStore.count('shield');

  const zapEl    = document.getElementById('hud-pu-zap');
  const shieldEl = document.getElementById('hud-pu-shield');
  const zapCnt   = document.getElementById('hud-pu-zap-count');
  const shCnt    = document.getElementById('hud-pu-shield-count');
  if (zapEl) zapEl.disabled = zapCount === 0 || !state.isRacing || state.finished;
  if (shieldEl) shieldEl.disabled = shieldCount === 0 || !state.isRacing || state.finished;

  // Hide power-up HUD entirely in solo/typing-test mode
  if (ttState.active) {
    if (zapEl)    zapEl.style.display    = 'none';
    if (shieldEl) shieldEl.style.display = 'none';
    return;
  }

  if (zapCnt) zapCnt.textContent = zapCount;
  if (shCnt)  shCnt.textContent  = shieldCount;

  if (zapEl) {
    zapEl.className   = 'hud-powerup ' + (zapCount > 0 ? 'hud-pu-zap' : 'hud-pu-empty');
    zapEl.style.display = 'flex';
  }
  if (shieldEl) {
    shieldEl.className   = 'hud-powerup ' + (shieldCount > 0 ? 'hud-pu-shield' : 'hud-pu-empty');
    shieldEl.style.display = 'flex';
  }
}

// Key handler — F1 = zap, F2 = shield
document.addEventListener('keydown', (e) => {
  if (!state.isRacing || state.finished || ttState.active) return;
  if (e.key === 'F1') { e.preventDefault(); firePowerup('zap'); }
  if (e.key === 'F2') { e.preventDefault(); firePowerup('shield'); }
});

function firePowerup(type) {
  if (!socket.connected || !state.isRacing || state.finished || ttState.active) return;
  if (!PowerupStore.spend(type)) {
    showToast(`No ${POWERUP_DEFS[type].name}s left!`);
    return;
  }
  updatePowerupHUD();
  socket.emit('powerup:use', { type });
}

// Lane visual effects (freeze / shield)
function applyLaneEffect(targetId, effectClass, durationMs) {
  const lane = document.getElementById(`lane-${targetId}`);
  if (!lane) return;
  // Remove any existing effect of same type
  lane.querySelectorAll(`.${effectClass}`).forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = effectClass;
  lane.appendChild(overlay);
  setTimeout(() => overlay.remove(), durationMs);
}

// ── Power-up socket events (incoming from server) ─────────────────────────────

// My input gets frozen
socket.on('powerup:frozen', ({ duration, by }) => {
  SoundEngine.frozen();
  const inp = document.getElementById('typing-input');
  if (inp) inp.disabled = true;
  showToast(`❄️ FROZEN by ${by}! (${duration/1000}s)`, duration);
  setTimeout(() => {
    if (socket.connected && state.isRacing && !state.finished) {
      if (inp) { inp.disabled = false; inp.focus(); }
    }
  }, duration);
});

// My zap was blocked by a shield
socket.on('powerup:blocked', ({ by }) => {
  PowerupStore.add('zap'); // refund — shield consumed it
  updatePowerupHUD();
  showToast(`🛡️ ${by}'s shield blocked your Zap! (refunded)`);
});

// My shield was consumed to block a zap
socket.on('powerup:shieldused', () => {
  SoundEngine.shieldBlock();
  showToast('🛡️ Shield blocked a Zap!');
});

// Zap landed on target
socket.on('powerup:zap_hit', ({ target }) => {
  SoundEngine.zap();
  showToast(`⚡ Zapped ${target}!`);
  updatePowerupHUD();
});

// Shield activated
socket.on('powerup:shield_active', ({ duration }) => {
  SoundEngine.shield();
  showToast(`🛡️ Shield active for ${duration/1000}s!`);
  updatePowerupHUD();
});

// Broadcast effect — show lane overlay for all players
socket.on('powerup:effect', ({ type, targetId, duration }) => {
  if (type === 'frozen') applyLaneEffect(targetId, 'lane-frozen', duration);
  if (type === 'shield') applyLaneEffect(targetId, 'lane-shield', duration);
});

// ═══════════════════════════════════════════════════
//  SOUND ENGINE (Web Audio API — zero dependencies)
// ═══════════════════════════════════════════════════
const SoundEngine = (() => {
  let ctx = null, masterVol = null;
  let _volume = parseFloat(localStorage.getItem('tr_volume') ?? '0.7');
  let _muted  = localStorage.getItem('tr_muted') === 'true';

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterVol = ctx.createGain();
    masterVol.gain.value = _muted ? 0 : _volume;
    masterVol.connect(ctx.destination);
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function g(vol) { const n = ctx.createGain(); n.gain.value = vol; n.connect(masterVol); return n; }
  function osc(type, freq, t0, t1, v0, v1, dest) {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    gn.gain.setValueAtTime(v0, t0); gn.gain.linearRampToValueAtTime(v1, t1);
    o.connect(gn); gn.connect(dest); o.start(t0); o.stop(t1);
  }
  function noise(t0, dur, vol, dest) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const src = ctx.createBufferSource(), gn = ctx.createGain();
    src.buffer = buf; gn.gain.setValueAtTime(vol, t0); gn.gain.linearRampToValueAtTime(0, t0+dur);
    src.connect(gn); gn.connect(dest); src.start(t0); src.stop(t0+dur);
  }

  const sounds = {
    keypress()    { init(); resume(); const t=ctx.currentTime, n=g(0.15); osc('sine',880,t,t+0.04,0.3,0,n); },
    error()       { init(); resume(); const t=ctx.currentTime, n=g(0.25); osc('sawtooth',120,t,t+0.12,0.4,0,n); noise(t,0.08,0.12,n); },
    wordComplete(){ init(); resume(); const t=ctx.currentTime, n=g(0.15); osc('sine',1047,t,t+0.08,0.4,0,n); osc('sine',1319,t+0.05,t+0.13,0.3,0,n); },
    countdown()   { init(); resume(); const t=ctx.currentTime, n=g(0.3);  osc('sine',660,t,t+0.15,0.5,0,n); },
    go()          { init(); resume(); const t=ctx.currentTime, n=g(0.4);  osc('sine',880,t,t+0.12,0.6,0,n); osc('sine',1320,t+0.1,t+0.25,0.5,0,n); },
    finish()      { init(); resume(); const t=ctx.currentTime, n=g(0.35); [523,659,784,1047].forEach((f,i)=>osc('sine',f,t+i*.1,t+i*.1+.18,0.5,0,n)); },
    raceEnd()     { init(); resume(); const t=ctx.currentTime, n=g(0.25); osc('sine',440,t,t+0.15,0.4,0,n); osc('sine',330,t+.15,t+.35,0.3,0,n); },
    zap()         { init(); resume(); const t=ctx.currentTime, n=g(0.35); osc('sawtooth',800,t,t+.05,0.5,0,n); osc('sawtooth',200,t+.04,t+.18,0.4,0,n); noise(t,.1,0.2,n); },
    frozen()      { init(); resume(); const t=ctx.currentTime, n=g(0.3);  osc('sine',300,t,t+.12,0.5,0,n); osc('sine',200,t+.1,t+.3,0.3,0,n); noise(t,.15,0.1,n); },
    shield()      { init(); resume(); const t=ctx.currentTime, n=g(0.25); osc('sine',600,t,t+.1,0.4,0,n); osc('sine',900,t+.08,t+.2,0.3,0,n); },
    shieldBlock() { init(); resume(); const t=ctx.currentTime, n=g(0.35); osc('square',440,t,t+.06,0.5,0,n); osc('square',660,t+.05,t+.15,0.4,0,n); noise(t,.08,0.15,n); },
    coin()        { init(); resume(); const t=ctx.currentTime, n=g(0.2);  osc('sine',1047,t,t+.07,0.4,0,n); osc('sine',1319,t+.06,t+.14,0.35,0,n); osc('sine',1568,t+.12,t+.22,0.3,0,n); },
    ready()       { init(); resume(); const t=ctx.currentTime, n=g(0.2);  osc('sine',523,t,t+.08,0.4,0,n); osc('sine',784,t+.07,t+.18,0.3,0,n); },
  };

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('tr_volume', _volume);
    if (!_muted && masterVol) masterVol.gain.value = _volume;
    updateVolumeUI();
  }
  function toggleMute() {
    _muted = !_muted;
    localStorage.setItem('tr_muted', _muted);
    if (masterVol) masterVol.gain.value = _muted ? 0 : _volume;
    updateVolumeUI();
  }
  function updateVolumeUI() {
    const pct   = _muted || _volume === 0 ? 0 : Math.round(_volume * 100);
    const icon  = _muted || _volume === 0 ? '🔇' : _volume < 0.4 ? '🔉' : '🔊';
    const sl    = document.getElementById('vol-slider');
    const lb    = document.getElementById('vol-label');
    const vi    = document.getElementById('vol-icon');
    const hb    = document.getElementById('hud-mute-btn');
    if (sl)  { sl.value = _muted ? 0 : Math.round(_volume*100); sl.style.setProperty('--val', sl.value+'%'); }
    if (lb)  lb.textContent = pct;
    if (vi)  { vi.textContent = icon; vi.setAttribute('aria-label', _muted ? 'Unmute sound' : 'Mute sound'); vi.setAttribute('aria-pressed', String(_muted)); }
    if (hb)  { hb.textContent = icon; hb.setAttribute('aria-label', _muted ? 'Unmute sound' : 'Mute sound'); hb.setAttribute('aria-pressed', String(_muted)); }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const sl = document.getElementById('vol-slider');
    if (sl) { sl.value = Math.round(_volume*100); sl.style.setProperty('--val', sl.value+'%'); }
    updateVolumeUI();
  });
  return { ...sounds, setVolume, toggleMute, updateVolumeUI };
})();

function setVolume(val) {
  SoundEngine.setVolume(val / 100);
  const sl = document.getElementById('vol-slider');
  if (sl) sl.style.setProperty('--val', val + '%');
}
function toggleMute() { SoundEngine.toggleMute(); }

function fireConfetti() {
  if (MotionPreferences.isReduced()) return;
  const colors = ['#ffe566','#ff2d78','#00f5ff','#39ff14','#b44fff','#ff9f43'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};--d:${1.5+Math.random()*2}s;--del:${Math.random()*0.8}s;width:${5+Math.random()*8}px;height:${5+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'2px'};`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
