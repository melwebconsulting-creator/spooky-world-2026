/**
 * SPOOKY WORLD 2026 — Master Client Application
 * Pure Vanilla JavaScript (Zero frameworks, zero backend dependencies)
 * Fully compatible with GitHub Pages and local static hosting.
 */

// ============================================================
// 1. STATE & STORAGE MANAGEMENT
// ============================================================
const STORAGE_PREFIX = 'spookyworld_2026_';

function getStorage(key, defaultValue) {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val !== null ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.warn('Storage read warning:', e);
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write warning:', e);
  }
}

// App State
const state = {
  soundEnabled: getStorage('sound_enabled', true),
  musicEnabled: false, // strictly OFF by default
  triviaScore: getStorage('trivia_score', 0),
  triviaTotal: getStorage('trivia_total', 0),
  triviaBestPercent: getStorage('trivia_best_percent', 0),
  personalityCompleted: getStorage('personality_completed', false),
  personalityResult: getStorage('personality_result', null),
  doorsUnlocked: getStorage('doors_unlocked', [false, false, false, false, false]),
  clickerCandies: getStorage('clicker_candies', 0),
  clickerHighScore: getStorage('clicker_high_score', 0),
  clickerUpgrades: getStorage('clicker_upgrades', {
    spoon: 0,
    candle: 0,
    cauldron: 0,
    skeleton: 0,
    ghostSwarm: 0
  }),
  activitiesDone: getStorage('activities_done', {}),
  demoMode: false
};

function recordActivity(activityKey) {
  state.activitiesDone[activityKey] = true;
  setStorage('activities_done', state.activitiesDone);
  updatePassBadgeCount();
  checkCertEligibility();
}

function updatePassBadgeCount() {
  const count = Object.keys(state.activitiesDone).length;
  const countEl = document.getElementById('headerUnlockedCount');
  if (countEl) countEl.textContent = count;
}

// ============================================================
// 2. WEB AUDIO API SYNTHESIZER (No external audio files needed!)
// ============================================================
let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Synthesized Sound Effects
function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'squish') {
      // Pumpkin squish / pop sound
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } 
    else if (type === 'chime') {
      // Ethereal crystal ball chime
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.85);
      });
    } 
    else if (type === 'creak') {
      // Creaky haunted door
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.15);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);
      osc.frequency.linearRampToValueAtTime(160, now + 0.55);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    } 
    else if (type === 'wail') {
      // Ghost Theremin wail
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.7);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.76);
    } 
    else if (type === 'tada') {
      // Victory fanfare
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + (idx === 3 ? 0.7 : 0.2));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + (idx === 3 ? 0.75 : 0.22));
      });
    }
  } catch (err) {
    console.debug('Audio trigger error:', err);
  }
}

// Spooky Ambient Music Synthesizer
function toggleMusic() {
  initAudio();
  if (!audioCtx) return;

  state.musicEnabled = !state.musicEnabled;
  const musicIcon = document.getElementById('musicIcon');

  if (state.musicEnabled) {
    if (musicIcon) musicIcon.textContent = '🎵';
    showToast('🎵 Spooky ambient synth activated!');
    startAmbientDrone();
  } else {
    if (musicIcon) musicIcon.textContent = '🔇';
    showToast('🔇 Ambient music muted.');
    stopAmbientDrone();
  }
}

function startAmbientDrone() {
  if (!audioCtx || ambientOsc1) return;
  try {
    const now = audioCtx.currentTime;
    ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(0.001, now);
    ambientGain.gain.exponentialRampToValueAtTime(0.07, now + 2);

    // Minor chord drone (D minor: D2, A2)
    ambientOsc1 = audioCtx.createOscillator();
    ambientOsc1.type = 'sawtooth';
    ambientOsc1.frequency.setValueAtTime(73.42, now); // D2

    ambientOsc2 = audioCtx.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.setValueAtTime(110.00, now); // A2

    // Lowpass filter for dark, spooky warmth
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    ambientOsc1.connect(filter);
    ambientOsc2.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    ambientOsc1.start(now);
    ambientOsc2.start(now);
  } catch (e) {
    console.debug('Ambient synth error:', e);
  }
}

function stopAmbientDrone() {
  if (ambientGain && audioCtx) {
    const now = audioCtx.currentTime;
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    setTimeout(() => {
      if (ambientOsc1) { ambientOsc1.stop(); ambientOsc1.disconnect(); ambientOsc1 = null; }
      if (ambientOsc2) { ambientOsc2.stop(); ambientOsc2.disconnect(); ambientOsc2 = null; }
      if (ambientGain) { ambientGain.disconnect(); ambientGain = null; }
    }, 850);
  }
}

// ============================================================
// 3. AMBIENT PARTICLES (Bats, Embers & Floating Ghosts)
// ============================================================
function initAmbientParticles() {
  const container = document.getElementById('ambientParticles');
  if (!container) return;

  const symbols = ['🦇', '✨', '🎃', '🍂', '👻', '⭐'];
  const particleCount = 14;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = `${Math.random() * 96}%`;
    p.style.animationDuration = `${12 + Math.random() * 18}s`;
    p.style.animationDelay = `${Math.random() * 12}s`;
    p.style.fontSize = `${0.9 + Math.random() * 1.2}rem`;
    container.appendChild(p);
  }
}

// ============================================================
// 4. COUNTDOWN TO OCTOBER 31
// ============================================================
function initCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');
  const targetLabel = document.getElementById('countdownTargetText');

  function update() {
    const now = new Date();
    let currentYear = now.getFullYear();
    let target = new Date(currentYear, 9, 31, 23, 59, 59); // Oct 31

    if (now > target) {
      target = new Date(currentYear + 1, 9, 31, 23, 59, 59);
      if (targetLabel) targetLabel.textContent = `Targeting October 31, ${currentYear + 1} · The Witching Hour`;
    } else {
      if (targetLabel) targetLabel.textContent = `Targeting October 31, ${currentYear} · The Witching Hour`;
    }

    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ============================================================
// 5. TOAST NOTIFICATION & SHARE HELPER
// ============================================================
let toastTimer = null;
function showToast(message, icon = '👻') {
  const toast = document.getElementById('spookyToast');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if (!toast || !msgEl) return;

  if (iconEl) iconEl.textContent = icon;
  msgEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

async function copyTextToClipboard(text, successMsg = 'Copied to clipboard! 📋') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, '✅');
    playSound('click');
  } catch (err) {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg, '✅');
      playSound('click');
    } catch (e) {
      showToast('Could not copy automatically.', '⚠️');
    }
    document.body.removeChild(textArea);
  }
}

async function shareContent(title, text, url = window.location.href) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      showToast('Shared successfully! 🦇', '✨');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyTextToClipboard(`${title} — ${text} ${url}`, 'Share text copied! 📋');
      }
    }
  } else {
    copyTextToClipboard(`${title} — ${text} ${url}`, 'Share text copied! 📋');
  }
}

// ============================================================
// 6. HOMEPAGE EASTER EGGS & GHOST BANTER
// ============================================================
function initHomepageEasterEggs() {
  // Moon Click
  const moon = document.getElementById('spookyMoon');
  if (moon) {
    moon.addEventListener('click', () => {
      playSound('wail');
      showToast('AWOOOOO! The full moon smiles upon Spooky World!', '🌕');
    });
  }

  // Attic Window Peek
  const attic = document.getElementById('atticWindow');
  if (attic) {
    const atticQuotes = [
      "Peek-a-boo! You found Barnaby the Attic Monster! 🦇",
      "Shoo! I'm busy untangling spiderwebs for Halloween!",
      "I see you looking up here! Don't make me rattle the roof shingles!"
    ];
    attic.addEventListener('click', () => {
      playSound('creak');
      const quote = atticQuotes[Math.floor(Math.random() * atticQuotes.length)];
      showToast(quote, '👀');
    });
  }

  // Ghost Banter
  const ghosts = [
    {
      id: 'ghostBooford',
      bubbleId: 'speechBooford',
      sound: 'wail',
      lines: [
        "Boo! Did I scare ya? No? Okay, I'll practice my moaning! 👻",
        "Do ghosts use sheet masks? Technically I AM a sheet mask! 😂",
        "Wanna play hide and shriek?"
      ]
    },
    {
      id: 'ghostChuckles',
      bubbleId: 'speechChuckles',
      sound: 'creak',
      lines: [
        "Why did the vampire need mouthwash? He had bat breath! 🧛",
        "I never drink... wine. Only pumpkin spice blood lattes!",
        "Vant to know a secret? I'm afraid of the dark!"
      ]
    },
    {
      id: 'ghostGlitch',
      bubbleId: 'speechGlitch',
      sound: 'click',
      lines: [
        "Why do skeletons stay so calm? Because nothing gets under their skin! 💀",
        "Rattle, rattle! I'm bad to the bone!",
        "Tibias and fibulas! You have great posture, mortal!"
      ]
    }
  ];

  ghosts.forEach(g => {
    const el = document.getElementById(g.id);
    const bubble = document.getElementById(g.bubbleId);
    if (!el || !bubble) return;

    let lineIndex = 0;
    el.addEventListener('click', () => {
      playSound(g.sound);
      bubble.textContent = g.lines[lineIndex % g.lines.length];
      lineIndex++;
      el.classList.add('speaking');
      setTimeout(() => el.classList.remove('speaking'), 3500);
    });
  });
}

// ============================================================
// 7. ACTIVITY 1: HALLOWEEN PERSONALITY QUIZ (10 Questions)
// ============================================================
const quizQuestions = [
  {
    theme: "Nocturnal Habits",
    question: "What does your ideal Friday evening in late October look like?",
    options: [
      { text: "Binge-watching classic horror movies wrapped in dark velvet.", archetype: "vampire", icon: "🧛" },
      { text: "Brewing spiced herbal cider in a giant pot with mystical herbs.", archetype: "witch", icon: "🧙" },
      { text: "Stumbling toward the kitchen fridge at 2 AM mumbling for snacks.", archetype: "zombie", icon: "🧟" },
      { text: "Quietly floating room to room, checking if people left lights on.", archetype: "ghost", icon: "👻" }
    ]
  },
  {
    theme: "Spooky Companions",
    question: "You get to adopt one magical creature. Who are you taking home?",
    options: [
      { text: "A sleek, judgmental black cat who knocks potions off tables.", archetype: "blackcat", icon: "🐈‍⬛" },
      { text: "A mischievous baby bat who loves hanging upside-down on curtains.", archetype: "vampire", icon: "🦇" },
      { text: "A glowing jack-o'-lantern that winks when someone tells a pun.", archetype: "pumpkin", icon: "🎃" },
      { text: "An invisible phantom dog whose tail still thumps against the floor.", archetype: "ghost", icon: "🐕" }
    ]
  },
  {
    theme: "Midnight Snack",
    question: "You arrive at the haunted buffet table. What goes onto your plate first?",
    options: [
      { text: "Gourmet dark chocolate truffles with raspberry blood coulis.", archetype: "vampire", icon: "🍫" },
      { text: "Steaming pumpkin spice bread warm from the cauldron oven.", archetype: "pumpkin", icon: "🥧" },
      { text: "Literally every gummy worm and sour candy in sight, all at once.", archetype: "zombie", icon: "🪱" },
      { text: "Glow-in-the-dark potion punch with dry ice bubbles.", archetype: "witch", icon: "🧪" }
    ]
  },
  {
    theme: "Confrontation Tactics",
    question: "You spot a spider hanging in your shower. How do you respond?",
    options: [
      { text: "Name the spider 'Lord Bartholomew' and offer it rent-free lodging.", archetype: "witch", icon: "🕷️" },
      { text: "Stare at it with cold aristocratic contempt until it leaves.", archetype: "vampire", icon: "👀" },
      { text: "Freeze in place for 10 minutes like a frozen statue.", archetype: "zombie", icon: "🥶" },
      { text: "Swipe at it with a paw and accidentally knock over the shampoo bottles.", archetype: "blackcat", icon: "🐾" }
    ]
  },
  {
    theme: "Haunted Real Estate",
    question: "If you could relocate your secret lair tomorrow, where are we moving?",
    options: [
      { text: "A Victorian Gothic mansion on a foggy cliff with secret bookshelves.", archetype: "vampire", icon: "🏰" },
      { text: "A cozy cottage hidden deep in the enchanted woods with a greenhouse.", archetype: "witch", icon: "🛖" },
      { text: "The attic of an old house where you can gently creak floorboards.", archetype: "ghost", icon: "🏚️" },
      { text: "A cheerful, moonlit pumpkin patch guarded by scarecrows.", archetype: "pumpkin", icon: "🌾" }
    ]
  },
  {
    theme: "Halloween Costume Philosophy",
    question: "How do you pick your Halloween costume each year?",
    options: [
      { text: "Elegance and drama: cape, high collar, impeccable styling.", archetype: "vampire", icon: "👔" },
      { text: "Handcrafted mystical robes, antique jewelry, and wide-brim hat.", archetype: "witch", icon: "👒" },
      { text: "Torn t-shirt, messy bedhead, zero effort, fully in character.", archetype: "zombie", icon: "👕" },
      { text: "A white bedsheet with two jagged holes cut out 5 minutes before leaving.", archetype: "ghost", icon: "👻" }
    ]
  },
  {
    theme: "Supernatural Power",
    question: "Which supernatural ability would be most useful in your everyday life?",
    options: [
      { text: "Turning into mist to escape awkward small talk at social events.", archetype: "vampire", icon: "🌫️" },
      { text: "Manifesting snacks and coffee out of thin air with a finger snap.", archetype: "witch", icon: "☕" },
      { text: "The ability to knock over cups while maintaining intense eye contact.", archetype: "blackcat", icon: "🥛" },
      { text: "Phase-walking through locked doors whenever you forget your keys.", archetype: "ghost", icon: "🚪" }
    ]
  },
  {
    theme: "Morning Routine",
    question: "What time does your soul truly wake up and start functioning?",
    options: [
      { text: "Sunsets only. Daylight is an unnecessary sensory assault.", archetype: "vampire", icon: "🌙" },
      { text: "Midnight under the full moon, precisely when inspiration strikes.", archetype: "witch", icon: "🌕" },
      { text: "Around noon, after shuffling around grumbling incoherently.", archetype: "zombie", icon: "🥱" },
      { text: "3 AM, the exact moment the house settles and ghosts wander.", archetype: "ghost", icon: "⏰" }
    ]
  },
  {
    theme: "Spooky Defense",
    question: "A group of amateur ghost hunters enters your house with cameras. You:",
    options: [
      { text: "Flicker the hallway lights to Morse code spelling 'GET A HOBBY'.", archetype: "ghost", icon: "💡" },
      { text: "Curse their camera batteries so they die instantly at 99%.", archetype: "witch", icon: "🔋" },
      { text: "Walk behind them casually until they turn around and scream.", archetype: "zombie", icon: "🧟" },
      { text: "Gaze unblinking from the darkness until their skin crawls.", archetype: "blackcat", icon: "🐱" }
    ]
  },
  {
    theme: "Halloween Spirit",
    question: "What is the true meaning of Halloween to you?",
    options: [
      { text: "Free candy, cozy pumpkin spices, and carving goofy faces.", archetype: "pumpkin", icon: "🎃" },
      { text: "The one glorious night where being delightfully strange is celebrated.", archetype: "witch", icon: "✨" },
      { text: "A celebration of eternal nocturnal elegance and mystery.", archetype: "vampire", icon: "🦇" },
      { text: "The ultimate excuse to jump out of closets and yell 'BOO!'", archetype: "ghost", icon: "👻" }
    ]
  }
];

const personalityProfiles = {
  vampire: {
    title: "The Aristocratic Vampire 🧛",
    icon: "🧛",
    tagline: "Sleeps until dusk, allergic to bright lighting, and owns three different velvet capes.",
    strength: "Unrivaled dramatic entrances & impeccable manners",
    weakness: "Cannot resist garlic bread despite the eternal family curse",
    candy: "Dark Cherry Blood Truffles",
    habitat: "Gothic manor with a private pipe organ and super-fast Wi-Fi"
  },
  witch: {
    title: "The Celestial Kitchen Witch 🧙",
    icon: "🧙",
    tagline: "Knows exactly which herbal tea cures bad vibes and owns 17 scented candles.",
    strength: "Can manifest snacks and brew potent festive cider",
    weakness: "Hoards antique glass jars that 'might come in handy'",
    candy: "Salted Caramel Brews & Candy Corn",
    habitat: "Enchanted forest cottage with a herb garden and friendly ravens"
  },
  zombie: {
    title: "The Chill Sunday Zombie 🧟",
    icon: "🧟",
    tagline: "Shuffles toward the kitchen, groaning for carbs and extra pillows.",
    strength: "Completely immune to peer pressure and awkward silences",
    weakness: "Requires three coffees just to remember what year it is",
    candy: "Gummy Brains & Infinite Chocolate Bars",
    habitat: "A cozy couch in front of a Halloween movie marathon"
  },
  ghost: {
    title: "The Poltergeist Prankster 👻",
    icon: "👻",
    tagline: "Leaves cupboards open, rearranges fridge magnets, and never pays heating bills.",
    strength: "Can walk through walls when locked out of the house",
    weakness: "Accidentally floats away whenever a strong breeze comes",
    candy: "Cotton Candy & Marshmallow Phantoms",
    habitat: "The cozy attic right above the warmest heating vent"
  },
  blackcat: {
    title: "The Judgmental Black Cat 🐈‍⬛",
    icon: "🐈‍⬛",
    tagline: "Masters the art of silent stare-downs and demands treats at 3:15 AM.",
    strength: "Supreme stealth and ability to judge outfits with a glance",
    weakness: "Will drop everything if a laser pointer dot appears on the rug",
    candy: "Salmon-shaped Licorice & Cream Puffs",
    habitat: "The sunny patch of floor right where everyone needs to walk"
  },
  pumpkin: {
    title: "The Jolly Pumpkin King 🎃",
    icon: "🎃",
    tagline: "The living embodiment of autumn joy, cinnamon scents, and trick-or-treat cheer.",
    strength: "Spreads warmth and lights up dark autumn nights",
    weakness: "Prone to rolling downhill if startled",
    candy: "Pumpkin Spice Fudge & Caramel Apples",
    habitat: "A vibrant festival patch surrounded by harvest bonfires"
  }
};

let currentQuizIndex = 0;
let quizScores = { vampire: 0, witch: 0, zombie: 0, ghost: 0, blackcat: 0, pumpkin: 0 };

function initQuiz() {
  currentQuizIndex = 0;
  quizScores = { vampire: 0, witch: 0, zombie: 0, ghost: 0, blackcat: 0, pumpkin: 0 };
  renderQuizQuestion();

  const retakeBtn = document.getElementById('retakeQuizBtn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      playSound('click');
      document.getElementById('quizCard').classList.remove('hidden');
      document.getElementById('quizResultCard').classList.add('hidden');
      initQuiz();
    });
  }

  const shareBtn = document.getElementById('shareQuizResultBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (state.personalityResult) {
        const p = personalityProfiles[state.personalityResult];
        shareContent(
          `I am ${p.title} on SPOOKY WORLD 2026!`,
          `I took the Halloween Personality Quiz and my result is: ${p.title} — ${p.tagline} Find your creature:`
        );
      }
    });
  }
}

function renderQuizQuestion() {
  const card = document.getElementById('quizCard');
  const resultCard = document.getElementById('quizResultCard');
  if (!card || !resultCard) return;

  if (currentQuizIndex >= quizQuestions.length) {
    // Show results
    card.classList.add('hidden');
    resultCard.classList.remove('hidden');
    calculateQuizResult();
    return;
  }

  card.classList.remove('hidden');
  resultCard.classList.add('hidden');

  const q = quizQuestions[currentQuizIndex];
  const stepText = document.getElementById('quizStepText');
  const catLabel = document.getElementById('quizCategoryLabel');
  const fill = document.getElementById('quizProgressFill');
  const qText = document.getElementById('quizQuestionText');
  const optGrid = document.getElementById('quizOptionsGrid');

  if (stepText) stepText.textContent = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
  if (catLabel) catLabel.textContent = `Theme: ${q.theme}`;
  if (fill) fill.style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
  if (qText) qText.textContent = q.question;

  if (optGrid) {
    optGrid.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span class="option-icon">${opt.icon}</span> <span>${opt.text}</span>`;
      btn.addEventListener('click', () => {
        playSound('click');
        quizScores[opt.archetype] = (quizScores[opt.archetype] || 0) + 1;
        currentQuizIndex++;
        renderQuizQuestion();
      });
      optGrid.appendChild(btn);
    });
  }
}

function calculateQuizResult() {
  playSound('tada');
  let winner = 'vampire';
  let maxScore = -1;

  for (const [archetype, score] of Object.entries(quizScores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = archetype;
    }
  }

  state.personalityCompleted = true;
  state.personalityResult = winner;
  setStorage('personality_completed', true);
  setStorage('personality_result', winner);
  recordActivity('quiz');

  const p = personalityProfiles[winner];
  const iconEl = document.getElementById('quizResultIcon');
  const titleEl = document.getElementById('quizResultTitle');
  const taglineEl = document.getElementById('quizResultTagline');
  const strEl = document.getElementById('quizResultStrength');
  const wknEl = document.getElementById('quizResultWeakness');
  const candyEl = document.getElementById('quizResultCandy');
  const habEl = document.getElementById('quizResultHabitat');

  if (iconEl) iconEl.textContent = p.icon;
  if (titleEl) titleEl.textContent = p.title;
  if (taglineEl) taglineEl.textContent = p.tagline;
  if (strEl) strEl.textContent = p.strength;
  if (wknEl) wknEl.textContent = p.weakness;
  if (candyEl) candyEl.textContent = p.candy;
  if (habEl) habEl.textContent = p.habitat;

  showToast(`Quiz completed! You are ${p.title}`, '🎉');
}

// ============================================================
// 8. ACTIVITY 2: GHOST PRANK GENERATOR (35+ Original Messages)
// ============================================================
const ghostPranks = [
  { category: 'roommate', text: "I didn't leave the kitchen cabinet doors open to scare you. I just couldn't decide which snack I wanted to haunt.", author: "Casper the Indecisive Snacker" },
  { category: 'roommate', text: "I'm the ghost under your bed. Can you please slide some extra fuzzy socks down here? It's freezing on this hardwood.", author: "The Cold-Toed Specter" },
  { category: 'roommate', text: "Attention human: I noticed you bought generic paper towels again. This whole house is now cursed.", author: "The Picky Poltergeist" },
  { category: 'roommate', text: "I flickered the hallway light 3 times to tell you your plant needs water. Learn spectral semaphore already!", author: "Horticultural Haunt" },
  { category: 'roommate', text: "I'm not floating through walls because I'm mysterious. I just hate navigating your hallway laundry piles.", author: "Tidy Ghost Initiative" },
  { category: 'roommate', text: "Whoever drank the last iced coffee without brewing more is getting their cold water turned off mid-shower tonight.", author: "The Caffeinated Shade" },
  { category: 'roommate', text: "The cold chill you felt in the living room wasn't paranormal activity. You left the balcony door open, Susan.", author: "The Practical Apparition" },
  { category: 'office', text: "That email could have been a ouija board session. Please don't invite me to the 9 AM sync.", author: "Corporate Ghoul" },
  { category: 'office', text: "I jammed the office printer again. Not out of malice, but because paper jams are pure chaotic evil art.", author: "The Xerox Banshee" },
  { category: 'office', text: "I moved your stapler 2 inches to the left. Yes, it was me. Yes, I saw you look around in sheer panic.", author: "Desk Demon" },
  { category: 'office', text: "Reminder: Per spectral company policy, ghosts work remotely from another dimension on Fridays.", author: "HR Haunting Dept" },
  { category: 'office', text: "I took the last donut in the breakroom and left an empty box with a single spider inside.", author: "Breakroom Phantom" },
  { category: 'office', text: "If you reply-all to this email thread, a curse will fall upon your spreadsheet formulas forever.", author: "The Excel Wraith" },
  { category: 'office', text: "I didn't steal your labeled lunch from the fridge. Even the undead have standards beyond egg salad.", author: "Ectoplasmic Gourmet" },
  { category: 'text', text: "Look out your window right now. ...Just kidding, it's pitch black and you just scared yourself! 👻", author: "Midnight Jump-Scare Bot" },
  { category: 'text', text: "Hey bestie! Just a quick 2:37 AM text to let you know that shadow in your closet isn't your jacket. Sweet dreams!", author: "Friendly Bedroom Demon" },
  { category: 'text', text: "Did you hear that weird thud downstairs just now? Don't worry, it was just me dropping my spectral bowling ball.", author: "The Midnight Bowler" },
  { category: 'text', text: "I'm hovering right behind your left shoulder. Don't turn around too fast, my hair is still damp.", author: "Moaning Myrtle's Cousin" },
  { category: 'text', text: "Your phone battery just dropped 1% because a ghost sighed near your charging port.", author: "Paranormal Battery Drainer" },
  { category: 'text', text: "Knock knock! Who's there? Not your WiFi signal, because I just hexed the router!", author: "Lag Goblin" },
  { category: 'text', text: "I tried to write 'BOO' on your foggy bathroom mirror, but my handwriting was so bad it looked like 'BEE'. Stay sweet! 🐝", author: "Dyslexic Ghost" },
  { category: 'poltergeist', text: "Sorry the TV turned on at full volume at 3 AM. The Poltergeist Channel was airing the season finale of Ghost Hunters.", author: "Binge-Watching Specter" },
  { category: 'poltergeist', text: "The keys weren't lost. I was holding them in the air 4 inches above the table where you couldn't see them.", author: "Key Hoarder Ghoul" },
  { category: 'poltergeist', text: "I rattled the chains because I couldn't find my Spotify playlist. My apologies for the medieval ruckus.", author: "Old-School Haunt" },
  { category: 'poltergeist', text: "I knocked over that picture frame because frankly, your haircut in 2018 was an offense to the living and dead.", author: "Fashion Critique Ghost" },
  { category: 'poltergeist', text: "If you hear footsteps on the roof, don't call the police. The ghosts are having their weekly tap-dance recital.", author: "Broadway Banshee" },
  { category: 'poltergeist', text: "I hid your left shoe in the crisper drawer. Don't ask why. Sometimes the ectoplasm just compels me.", author: "Fridge Gremlin" },
  { category: 'roommate', text: "Can we talk about the thermostat? 68 degrees is too warm for optimal haunt conditions. 52 degrees is peak ectoplasm.", author: "Frostbite Phantom" },
  { category: 'office', text: "Your meeting has been rescheduled to midnight at the crossroads under the full moon. Attendance mandatory.", author: "Meeting Overlord" },
  { category: 'text', text: "Quick question: does your cat always stare at the empty ceiling corner, or did I accidentally drop my ghost hat up there?", author: "Feline Whisperer" },
  { category: 'poltergeist', text: "I didn't break the coffee mug. It slipped into a fourth-dimensional pocket dimension. It's safe with Abraham Lincoln now.", author: "Physics Phantom" },
  { category: 'roommate', text: "I checked your pantry. We are out of pumpkin spice cookies. This constitutes an immediate haunt emergency.", author: "Cinnamon Spectre" },
  { category: 'text', text: "Boo! Did that text make you jump? If not, please reply with a 1 to 5 rating so I can improve my scaring metrics.", author: "Agile Ghost Scrum Master" },
  { category: 'office', text: "I possessed the water cooler. It now dispenses haunted pumpkin broth instead of filtered tap water. You're welcome.", author: "Hydro Demon" },
  { category: 'poltergeist', text: "I'm not haunting your home for revenge. The rent here is just so much cheaper than the afterlife cemetery fees.", author: "Frugal Phantom" }
];

let currentPrankFilter = 'all';
let currentPrankIndex = 0;

function initPranks() {
  const quoteEl = document.getElementById('prankQuote');
  const authorEl = document.getElementById('prankAuthor');
  const badgeEl = document.getElementById('prankCategoryBadge');
  const nextBtn = document.getElementById('nextPrankBtn');
  const copyBtn = document.getElementById('copyPrankBtn');
  const shareBtn = document.getElementById('sharePrankBtn');
  const categoryTabs = document.getElementById('prankCategories');

  function renderPrank() {
    const list = currentPrankFilter === 'all' 
      ? ghostPranks 
      : ghostPranks.filter(p => p.category === currentPrankFilter);

    if (list.length === 0) return;
    const p = list[currentPrankIndex % list.length];

    if (quoteEl) quoteEl.textContent = `"${p.text}"`;
    if (authorEl) authorEl.textContent = `— ${p.author}`;
    if (badgeEl) {
      badgeEl.textContent = p.category.toUpperCase();
    }
  }

  if (categoryTabs) {
    categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPrankFilter = btn.dataset.category || 'all';
      currentPrankIndex = 0;
      playSound('click');
      renderPrank();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('wail');
      currentPrankIndex = (currentPrankIndex + 1) % ghostPranks.length;
      renderPrank();
      recordActivity('prank');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const q = quoteEl ? quoteEl.textContent : '';
      const a = authorEl ? authorEl.textContent : '';
      copyTextToClipboard(`${q} ${a}`, 'Ghost prank copied to clipboard! 👻');
      recordActivity('prank');
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const q = quoteEl ? quoteEl.textContent : '';
      const a = authorEl ? authorEl.textContent : '';
      shareContent('Ghost Prank Message from SPOOKY WORLD 2026', `${q} ${a}`);
      recordActivity('prank');
    });
  }

  renderPrank();
}

// ============================================================
// 9. ACTIVITY 3: SPOOKY FORTUNE TELLER (35+ Predictions)
// ============================================================
const fortunes = [
  { text: "A black cat will cross your path today. It will not curse you, but it will judge your outfit silently for seven uninterrupted minutes.", advice: "Carry extra treats and accept that the cat has superior fashion sense.", spook: 3 },
  { text: "You will discover a forgotten piece of Halloween chocolate in your jacket pocket when you need it most. It is still 100% edible.", advice: "Eat it immediately before someone asks to split it.", spook: 2 },
  { text: "Beware of doors that creak when closed. A poltergeist has chosen your bedroom as their prime rehearsal studio for slam poetry.", advice: "Offer constructive feedback or invest in high-grade earplugs.", spook: 4 },
  { text: "A mystical pumpkin will appear in your dreams tonight and reveal the answer to life's deepest riddle: 'More caramel.'", advice: "Bake a pumpkin pie tomorrow to fulfill the sacred prophecy.", spook: 3 },
  { text: "The next time you sneeze three times in a row, a local witch will accidentally turn your favorite socks purple.", advice: "Embrace the violet aesthetic; it suits your dark aura.", spook: 3 },
  { text: "You will attempt to carve a terrifying Jack-o'-lantern, but it will end up looking like a mildly confused potato.", advice: "Tell your neighbors it is an avant-garde post-modern critique of fear.", spook: 2 },
  { text: "The spirits whisper that someone in your household has taken the last ice cube without refilling the tray.", advice: "Place a small plastic skeleton on the freezer door as an omen.", spook: 4 },
  { text: "An ancient vampire will mistake your tired dark eye circles for gothic eyeshadow and compliment your high-fashion aesthetic.", advice: "Say 'Thank you, it's called insomnia' and walk away dramatically.", spook: 5 },
  { text: "You will soon hear strange rattling in your attic. It is neither ghost nor demon; merely a raccoon with superior drumming skills.", advice: "Leave out an apple slice as a tip for the percussion performance.", spook: 3 },
  { text: "The stars align to indicate that any candy eaten between midnight and 4 AM contains exactly zero calories.", advice: "This statement is certified by Madam Hazel, not accredited nutritionists.", spook: 2 },
  { text: "Your Wi-Fi router is currently harboring a friendly internet ghost who occasionally disconnects you during video calls to save you from boredom.", advice: "Thank your digital guardian angel.", spook: 4 },
  { text: "A mysterious raven will land on your windowsill and tap three times. It wants to inform you about your car's extended warranty.", advice: "Close the blinds with swift dignity.", spook: 5 },
  { text: "You will soon watch a horror movie with great confidence, only to sprint up the dark stairs like an Olympic athlete.", advice: "No shame in cardio fueled by imaginary vampires.", spook: 4 },
  { text: "A cauldron of hot apple cider is in your near future. Drink deeply, for it shall grant you +5 resistance to autumn chills.", advice: "Add cinnamon sticks for bonus magical defense.", spook: 2 },
  { text: "The next werewolf you meet will be deeply embarrassed when you pull out a squeaky tennis ball.", advice: "Never underestimate the power of canine instincts.", spook: 3 },
  { text: "You are destined to find a sweater so cozy that you will refuse to remove it until approximately March 2027.", advice: "Stock up on fabric softener now.", spook: 1 },
  { text: "An owl will hoot in the distance tonight. Translated from bird Latin, it says: 'Go to sleep, you have work tomorrow.'", advice: "Heed the nocturnal wisdom of the avian council.", spook: 3 },
  { text: "You will soon win an argument with a friend solely because you cited a bizarre piece of trivia learned in Spooky World 2026.", advice: "Wear your mental crown proudly.", spook: 4 },
  { text: "The full moon warns: Do not wear white pants to a Halloween party with raspberry punch and red wine.", advice: "Black velvet is the only prudent survival choice.", spook: 3 },
  { text: "A ghost will soon try to rattle your chains, only to find that your emotional baggage is far heavier than any metal links.", advice: "Therapy and pumpkin donuts are highly recommended.", spook: 4 },
  { text: "The crystal ball sees you standing before two choices: a sensible bedtime or watching one more episode. You will pick the episode.", advice: "Madam Hazel judges not. Enjoy the cliffhanger.", spook: 2 },
  { text: "Beware of candy corn. Not because of curses, but because people will argue about it on the internet for 14 consecutive hours.", advice: "Silently eat the candy corn while watching the chaos unfold.", spook: 3 },
  { text: "A secret skeleton in your closet will formally apologize for cluttering up your shoe rack.", advice: "Politely accept the apology and ask for their shoe size.", spook: 4 },
  { text: "You will accidentally bite your tongue while eating a Halloween cookie, but the sugar rush will heal your wounded ego.", advice: "Chew with mindfulness, mortal.", spook: 1 },
  { text: "The spirits indicate that your Halloween costume this year will be remembered by friends for at least 72 hours.", advice: "Take plenty of photos for historical documentation.", spook: 2 },
  { text: "If you look closely at your shadow at 3:33 PM, it will be tapping its foot waiting for your afternoon tea.", advice: "Boil the kettle immediately.", spook: 3 },
  { text: "A mysterious book with a leather cover will catch your eye. Inside is written the sacred spell: 'Nap on the sofa.'", advice: "Obey the ancient slumber incantation.", spook: 2 },
  { text: "A phantom fog will roll over your thoughts around 2 PM on a workday. The cure is autumn air and pumpkin seeds.", advice: "Take a 10-minute stroll through the crunching leaves.", spook: 2 },
  { text: "You will soon receive a text from an unknown number. It is not an omen, just someone who forgot your area code.", advice: "Reply with 'BOO!' and block them.", spook: 3 },
  { text: "Your inner magic is growing stronger. Soon you will possess the power to accurately guess which miniature candy bar is inside the wrapper.", advice: "Use this great power only for good.", spook: 4 },
  { text: "A wandering spirit will inspect your bookshelf and nod approvingly at your taste in mystery novels.", advice: "Dust the top shelf so you look respectable.", spook: 2 },
  { text: "Madam Hazel detects a 98% probability that you will eat candy meant for trick-or-treaters before October 31 even arrives.", advice: "Buy two bags: one for them, one for the goblin inside you.", spook: 3 },
  { text: "The spirits decree: It is officially time to put spooky decorations on your desk. Even if your colleagues sigh.", advice: "A miniature skull increases productivity by 17%.", spook: 3 },
  { text: "A goblin of good fortune is smiling upon your bank account this week. Do not spend all your gold on plastic cauldrons.", advice: "A single decorative cauldron is quite sufficient.", spook: 2 },
  { text: "Tonight's night air will carry whispers of forgotten lore. Or possibly your neighbor vacuuming at an ungodly hour.", advice: "Earbuds will vanquish either threat.", spook: 3 }
];

let fortuneIndex = 0;

function initFortuneTeller() {
  const ball = document.getElementById('crystalBall');
  const consultBtn = document.getElementById('consultBallBtn');
  const copyBtn = document.getElementById('copyFortuneBtn');
  const textEl = document.getElementById('fortuneText');
  const adviceEl = document.getElementById('fortuneAdvice');
  const numEl = document.getElementById('fortuneNumber');
  const spookEl = document.getElementById('fortuneSpookiness');

  function revealFortune() {
    playSound('chime');
    if (ball) {
      ball.classList.add('active-pulse');
      setTimeout(() => ball.classList.remove('active-pulse'), 1200);
    }

    fortuneIndex = (fortuneIndex + 1) % fortunes.length;
    const f = fortunes[fortuneIndex];

    if (numEl) numEl.textContent = String(fortuneIndex + 1).padStart(2, '0');
    if (textEl) textEl.textContent = `"${f.text}"`;
    if (adviceEl) adviceEl.textContent = f.advice;
    if (spookEl) {
      const pumpkins = '🎃'.repeat(f.spook);
      spookEl.innerHTML = `<span>Spookiness:</span> ${pumpkins}`;
    }

    recordActivity('fortune');
  }

  if (ball) ball.addEventListener('click', revealFortune);
  if (consultBtn) consultBtn.addEventListener('click', revealFortune);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const f = fortunes[fortuneIndex];
      copyTextToClipboard(`🔮 Madam Hazel's Prophecy: "${f.text}" Advice: ${f.advice}`, 'Prophecy copied to clipboard! 🔮');
      recordActivity('fortune');
    });
  }
}

// ============================================================
// 10. ACTIVITY 4: WOULD YOU RATHER? (25+ Dilemmas)
// ============================================================
const wyrDilemmas = [
  {
    optA: "Sleep in a coffin that smells like damp gym socks for a week",
    iconA: "🧛",
    optB: "Have your head permanently replaced with a giant glowing Jack-o'-lantern",
    iconB: "🎃",
    votesA: 1240,
    votesB: 1515,
    reactionA: "At least you're cozy in the velvet! Hope you packed incense!",
    reactionB: "Bold choice! You'll never need a flashlight again at night."
  },
  {
    optA: "Have your voice sound like a screeching witch whenever you sneeze",
    iconA: "🧙",
    optB: "Have your footsteps make loud squeaky skeleton rattle noises",
    iconB: "💀",
    votesA: 1820,
    votesB: 1430,
    reactionA: "Sneezes will now clear entire office buildings instantly!",
    reactionB: "You will never be able to sneak into the kitchen at midnight."
  },
  {
    optA: "Be haunted by a ghost who constantly corrects your grammar",
    iconA: "👻",
    optB: "Be followed by a zombie who walks so slowly you accidentally trip over it",
    iconB: "🧟",
    votesA: 1150,
    votesB: 2040,
    reactionA: "'Whom' shall you haunt now?! The pedantic poltergeist strikes!",
    reactionB: "At least you can outpace the zombie with a brisk power-walk."
  },
  {
    optA: "Only be able to eat candy corn for every meal in October",
    iconA: "🍬",
    optB: "Only be able to drink garlic-infused pumpkin broth",
    iconB: "🧄",
    votesA: 1640,
    votesB: 980,
    reactionA: "Your dentist just felt a great disturbance in the Force.",
    reactionB: "Vampires will stay 5 miles away, but so will everyone else!"
  },
  {
    optA: "Spend a full night alone inside a real abandoned asylum",
    iconA: "🏚️",
    optB: "Walk through a pitch-black corn maze with mysterious rustling",
    iconB: "🌽",
    votesA: 1390,
    votesB: 1720,
    reactionA: "Bring extra flashlights and say hello to the ceiling ghosts!",
    reactionB: "Remember: If the scarecrow blinks, run in the opposite direction!"
  },
  {
    optA: "Turn into a black cat for 24 hours every full moon",
    iconA: "🐈‍⬛",
    optB: "Turn into a giant bat who keeps bumping into ceiling fans",
    iconB: "🦇",
    votesA: 2890,
    votesB: 640,
    reactionA: "Free naps in sunbeams and unlimited catnip privileges!",
    reactionB: "Echolocation is harder than it looks on National Geographic!"
  },
  {
    optA: "Have Frankenstein's monster as your personal bodyguard",
    iconA: "🧟‍♂️",
    optB: "Have Dracula as your personal financial accountant",
    iconB: "🧛‍♂️",
    votesA: 1950,
    votesB: 1450,
    reactionA: "Nobody will cut you in line at the grocery store ever again.",
    reactionB: "He manages offshore Transylvanian vaults with eternal compound interest!"
  },
  {
    optA: "Have spiderwebs shoot out of your wrists like a budget superhero",
    iconA: "🕸️",
    optB: "Be able to shoot pumpkin seeds at high velocity from your fingertips",
    iconB: "🎃",
    votesA: 1580,
    votesB: 1760,
    reactionA: "Great for decorating Halloween parties, terrible for washing sweaters.",
    reactionB: "The ultimate weapon for harvest defense!"
  },
  {
    optA: "Wear a full, itchy werewolf suit for all job interviews",
    iconA: "🐺",
    optB: "Speak exclusively in dramatic villain monologues for a month",
    iconB: "🎭",
    votesA: 820,
    votesB: 2340,
    reactionA: "'What is your greatest weakness?' 'Silver bullets, sir.'",
    reactionB: "'You think you can defeat me, barista?! Pour the macchiato!'"
  },
  {
    optA: "Sleep in a cemetery under the full moon for $5,000",
    iconA: "🪦",
    optB: "Eat a bowl of live gummy worms coated in hot ghost pepper sauce",
    iconB: "🌶️",
    votesA: 2100,
    votesB: 990,
    reactionA: "Easiest $5K ever—ghosts are generally quiet neighbors!",
    reactionB: "Your taste buds will achieve higher dimensional transcendence."
  },
  {
    optA: "Have glowing green eyes in the dark that you cannot turn off",
    iconA: "👁️",
    optB: "Have two tiny decorative vampire fangs that poke your lip when smiling",
    iconB: "🧛",
    votesA: 1350,
    votesB: 1840,
    reactionA: "Midnight bathroom trips are now fully night-vision equipped!",
    reactionB: "Every smile becomes automatically gothic and mysterious."
  },
  {
    optA: "Live in a house where the stairs constantly play the Addams Family theme",
    iconA: "🎶",
    optB: "Live in a house where the doors groan 'BOO!' every time they open",
    iconB: "🚪",
    votesA: 2450,
    votesB: 880,
    reactionA: "Snap, snap! Your daily cardio just got ten times more rhythmic!",
    reactionB: "Delivery drivers will need clean underwear."
  },
  {
    optA: "Be chased by a chainsaw maniac who runs at 0.5 miles per hour",
    iconA: "🪚",
    optB: "Be chased by 100 tiny mischievous goblins who throw candy wrappers",
    iconB: "👹",
    votesA: 2200,
    votesB: 1050,
    reactionA: "You can stop, eat lunch, do laundry, and he's still 40 yards away.",
    reactionB: "The cleanup will be monumental, but at least there's candy!"
  },
  {
    optA: "Have a witch's broom as your only mode of daily highway transport",
    iconA: "🧹",
    optB: "Have a hearse that only plays Monster Mash on the car radio",
    iconB: "🚗",
    votesA: 1980,
    votesB: 1420,
    reactionA: "Zero gas emissions, 100% wind-chill helmet hair!",
    reactionB: "'It was a graveyard smash!' ...for the 400th time on your commute."
  },
  {
    optA: "Accidentally summon a friendly demon who loves vacuuming",
    iconA: "👿",
    optB: "Accidentally summon an angry ghost who reorganizes your pantry poorly",
    iconB: "👻",
    votesA: 2950,
    votesB: 320,
    reactionA: "Free housework from the underworld! A spotless paradise!",
    reactionB: "Why are the cereal boxes in the spice cabinet again?!"
  },
  {
    optA: "Only be able to laugh like a cackling wicked witch",
    iconA: "🧙‍♀️",
    optB: "Only be able to laugh like a slow, deep movie Dracula",
    iconB: "🧛",
    votesA: 1210,
    votesB: 1990,
    reactionA: "'HEHEHEHEHEHEHE!' People in line at Starbucks will step aside.",
    reactionB: "'Mwahaha... ha... ha.' Very distinguished villain energy."
  },
  {
    optA: "Have a Jack-o'-lantern carved with your exact face placed on town hall",
    iconA: "🎃",
    optB: "Have a tombstone with a funny epitaph about your worst hobby",
    iconB: "🪦",
    votesA: 1670,
    votesB: 1490,
    reactionA: "Local civic royalty! The orange glow immortalizes your features.",
    reactionB: "'Here lies human: Died waiting for a parcel delivery.'"
  },
  {
    optA: "Always know exactly where the spookiest Halloween party in town is",
    iconA: "🎉",
    optB: "Always receive full-sized chocolate bars when trick-or-treating",
    iconB: "🍫",
    votesA: 1380,
    votesB: 2150,
    reactionA: "The VIP of the shadow realm! Never a dull evening.",
    reactionB: "Full-size chocolate bars are the universal currency of kings."
  },
  {
    optA: "Be cursed so everything you touch smells faintly of pumpkin spice",
    iconA: "🥧",
    optB: "Be cursed so you can only whisper spooky secrets after sunset",
    iconB: "🤫",
    votesA: 2120,
    votesB: 1140,
    reactionA: "Autumn lovers will flock to you like bees to honey.",
    reactionB: "Every dinner conversation becomes an ominous prophecy."
  },
  {
    optA: "Have a poltergeist who does all your laundry but misplaces one sock",
    iconA: "🧦",
    optB: "Have a friendly mummy who wraps your Christmas presents early",
    iconB: "🎁",
    votesA: 1870,
    votesB: 1520,
    reactionA: "The lost sock is paid as tribute to the dryer dimension.",
    reactionB: "Everything will be wrapped in bandages, but the spirit is there!"
  }
];

let wyrIndex = 0;

function initWouldYouRather() {
  const indexEl = document.getElementById('wyrIndex');
  const totalEl = document.getElementById('wyrTotal');
  const optABtn = document.getElementById('wyrOptionA');
  const optBBtn = document.getElementById('wyrOptionB');
  const textA = document.getElementById('wyrTextA');
  const textB = document.getElementById('wyrTextB');
  const iconA = document.getElementById('wyrIconA');
  const iconB = document.getElementById('wyrIconB');
  const statsA = document.getElementById('wyrStatsA');
  const statsB = document.getElementById('wyrStatsB');
  const percentA = document.getElementById('wyrPercentA');
  const percentB = document.getElementById('wyrPercentB');
  const votesA = document.getElementById('wyrVotesA');
  const votesB = document.getElementById('wyrVotesB');
  const reactionBox = document.getElementById('wyrReactionBox');
  const reactionEmoji = document.getElementById('wyrReactionEmoji');
  const reactionText = document.getElementById('wyrReactionText');
  const nextBtn = document.getElementById('wyrNextBtn');
  const shareBtn = document.getElementById('wyrShareBtn');

  if (totalEl) totalEl.textContent = wyrDilemmas.length;

  function renderDilemma() {
    const d = wyrDilemmas[wyrIndex];
    if (indexEl) indexEl.textContent = wyrIndex + 1;
    if (textA) textA.textContent = d.optA;
    if (textB) textB.textContent = d.optB;
    if (iconA) iconA.textContent = d.iconA;
    if (iconB) iconB.textContent = d.iconB;

    if (statsA) statsA.classList.add('hidden');
    if (statsB) statsB.classList.add('hidden');
    if (reactionBox) reactionBox.classList.add('hidden');

    if (optABtn) optABtn.disabled = false;
    if (optBBtn) optBBtn.disabled = false;
  }

  function handleVote(choice) {
    playSound('squish');
    const d = wyrDilemmas[wyrIndex];
    const total = d.votesA + d.votesB + 1;
    const vA = choice === 'A' ? d.votesA + 1 : d.votesA;
    const vB = choice === 'B' ? d.votesB + 1 : d.votesB;
    const pA = Math.round((vA / total) * 100);
    const pB = 100 - pA;

    if (percentA) percentA.textContent = `${pA}%`;
    if (percentB) percentB.textContent = `${pB}%`;
    if (votesA) votesA.textContent = `${vA.toLocaleString()} Mortals`;
    if (votesB) votesB.textContent = `${vB.toLocaleString()} Mortals`;

    if (statsA) statsA.classList.remove('hidden');
    if (statsB) statsB.classList.remove('hidden');

    if (reactionBox) {
      reactionBox.classList.remove('hidden');
      if (reactionEmoji) reactionEmoji.textContent = choice === 'A' ? '🧛' : '🎃';
      if (reactionText) reactionText.textContent = choice === 'A' ? d.reactionA : d.reactionB;
    }

    if (optABtn) optABtn.disabled = true;
    if (optBBtn) optBBtn.disabled = true;

    recordActivity('rather');
  }

  if (optABtn) optABtn.addEventListener('click', () => handleVote('A'));
  if (optBBtn) optBBtn.addEventListener('click', () => handleVote('B'));

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      wyrIndex = (wyrIndex + 1) % wyrDilemmas.length;
      renderDilemma();
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const d = wyrDilemmas[wyrIndex];
      shareContent(
        'Spooky Would You Rather Dilemma',
        `Would you rather: [A] ${d.optA} OR [B] ${d.optB}? Vote now at SPOOKY WORLD 2026:`
      );
      recordActivity('rather');
    });
  }

  renderDilemma();
}

// ============================================================
// 11. ACTIVITY 5: HALLOWEEN TRIVIA GAUNTLET (30 Questions)
// ============================================================
const triviaDatabase = [
  {
    category: "Ancient Origins",
    question: "Which ancient Celtic festival is considered the historical origin of modern Halloween?",
    options: ["Samhain", "Beltane", "Lughnasadh", "Imbolc"],
    correct: 0,
    explanation: "Samhain (pronounced 'sow-in') marked the end of the harvest and the thinning of the veil between the living and dead."
  },
  {
    category: "Vegetable Carving",
    question: "Before pumpkins became popular in America, what root vegetable did people in Ireland and Scotland carve into Jack-o'-lanterns?",
    options: ["Turnips", "Potatoes", "Carrots", "Beets"],
    correct: 0,
    explanation: "Turnips and large rutabagas were traditionally carved with terrifying faces and placed in windows to ward off wandering spirits."
  },
  {
    category: "Candy History",
    question: "What was Candy Corn originally called when first manufactured in the 1880s?",
    options: ["Chicken Feed", "Harvest Gold", "Sweet Maize", "Tri-Color Drops"],
    correct: 0,
    explanation: "Wunderle Candy Company originally branded the confection as 'Chicken Feed' with a rooster on the box!"
  },
  {
    category: "Classic Literature",
    question: "In Bram Stoker's famous 1897 novel Dracula, what castle is the Count's home situated in?",
    options: ["Transylvania", "Bavaria", "Prague", "Normandy"],
    correct: 0,
    explanation: "Count Dracula's decaying castle was nestled high in the Carpathian Mountains of Transylvania."
  },
  {
    category: "Monsters & Lore",
    question: "According to traditional folklore, which metal is reputed to harm or repel werewolves?",
    options: ["Silver", "Gold", "Bronze", "Titanium"],
    correct: 0,
    explanation: "Folklore and cinema maintain that only silver weapons or bullets can subdue a rampaging werewolf."
  },
  {
    category: "Superstition",
    question: "What creature is traditionally believed to bring good luck in Britain and Japan, but bad luck in parts of Western folklore?",
    options: ["Black Cat", "Raven", "Bat", "Toad"],
    correct: 0,
    explanation: "While Western lore often associated black cats with witch familiars, British and Japanese folklore considers a black cat crossing your path good fortune."
  },
  {
    category: "Candy Lore",
    question: "What is the most popular Halloween candy sold in the United States by volume?",
    options: ["Reese's Peanut Butter Cups", "Snickers", "Skittles", "Candy Corn"],
    correct: 0,
    explanation: "Reese's Peanut Butter Cups consistently rank as America's #1 favorite Halloween treat."
  },
  {
    category: "Film & Cinema",
    question: "In Tim Burton's 'The Nightmare Before Christmas', what is the name of Jack Skellington's ghost dog?",
    options: ["Zero", "Sparky", "Bones", "Phantom"],
    correct: 0,
    explanation: "Zero is Jack's faithful spectral canine with a glowing pumpkin-nose like Rudolph!"
  },
  {
    category: "World Traditions",
    question: "What Mexican holiday celebrated on November 1st and 2nd honors departed ancestors with ofrendas and marigolds?",
    options: ["Día de los Muertos", "Las Posadas", "Cinco de Mayo", "Fiesta de San Juan"],
    correct: 0,
    explanation: "Día de los Muertos (Day of the Dead) is a joyful celebration reuniting the living and dead through food, memory, and love."
  },
  {
    category: "Supernatural Biology",
    question: "What is the collective noun for a group of bats?",
    options: ["A Colony or Cloud", "A Murder", "A Pack", "A Coven"],
    correct: 0,
    explanation: "A group of bats is referred to as a colony, cloud, or cauldron!"
  },
  {
    category: "Folklore",
    question: "What legendary figure is Jack-o'-lantern named after?",
    options: ["Stingy Jack", "Mad Jack", "Jack the Giant Killer", "Jack Frost"],
    correct: 0,
    explanation: "Irish myth tells of Stingy Jack, a tricky blacksmith who tricked the Devil and was cursed to roam the earth with a carved turnip lantern."
  },
  {
    category: "Haunted Science",
    question: "What natural phenomenon is believed to cause 'will-o'-the-wisp' ghost lights seen in bogs?",
    options: ["Bioluminescent marsh gas (methane)", "St. Elmo's Fire", "Phosphorescent moss", "Lightning bugs"],
    correct: 0,
    explanation: "Spontaneous combustion of methane and phosphine gases produced by decaying organic matter causes eerie flickering swamp lights."
  },
  {
    category: "Pop Culture",
    question: "What iconic 1984 film song asks: 'Who you gonna call?'",
    options: ["Ghostbusters", "Monster Mash", "Thriller", "Spooky Scary Skeletons"],
    correct: 0,
    explanation: "Ray Parker Jr.'s chart-topping theme song for Ghostbusters became a worldwide Halloween anthem."
  },
  {
    category: "Horror Literature",
    question: "Who wrote the 1818 gothic masterpiece 'Frankenstein; or, The Modern Prometheus'?",
    options: ["Mary Shelley", "Lord Byron", "Percy Shelley", "Bram Stoker"],
    correct: 0,
    explanation: "Mary Shelley conceived the pioneering science-fiction novel at just 18 years old during a rainy summer in Switzerland."
  },
  {
    category: "Witchcraft Lore",
    question: "In the 1692 Salem Witch Trials, in which state did the historical trials take place?",
    options: ["Massachusetts", "Virginia", "Pennsylvania", "Connecticut"],
    correct: 0,
    explanation: "The infamous trials took place in colonial Salem, Massachusetts."
  },
  {
    category: "Halloween Games",
    question: "The traditional Halloween game of 'bobbing for apples' originally began as a Roman ritual honoring which goddess of fruit trees?",
    options: ["Pomona", "Ceres", "Flora", "Minerva"],
    correct: 0,
    explanation: "Pomona was the Roman goddess of fruit, trees, and gardens; her sacred symbol was the apple."
  },
  {
    category: "Halloween Phobias",
    question: "What is the psychological term for an irrational fear of Halloween?",
    options: ["Samhainophobia", "Arachnophobia", "Coulrophobia", "Necrophobia"],
    correct: 0,
    explanation: "Samhainophobia is the clinical term for persistent fear of Halloween and its imagery."
  },
  {
    category: "Music Trivia",
    question: "Which music legend released the record-breaking music video 'Thriller' in 1983 featuring dancing zombies?",
    options: ["Michael Jackson", "Prince", "David Bowie", "Alice Cooper"],
    correct: 0,
    explanation: "Directed by John Landis, Michael Jackson's 14-minute Thriller redefined music video history."
  },
  {
    category: "Mythical Creatures",
    question: "According to myth, looking directly into the gaze of the Gorgon Medusa turned mortals into what?",
    options: ["Stone", "Gold", "Ash", "Salt"],
    correct: 0,
    explanation: "In Greek mythology, anyone who looked into the snake-haired gaze of Medusa turned immediately to stone."
  },
  {
    category: "Pumpkin Facts",
    question: "Botanically speaking, what classification does a pumpkin belong to?",
    options: ["A Fruit (specifically a berry/pepo)", "A Vegetable", "A Root", "A Tuber"],
    correct: 0,
    explanation: "Because pumpkins develop from flower ovaries and contain seeds, botanists classify them as fruits!"
  },
  {
    category: "Spooky Holidays",
    question: "What is the evening before Halloween (October 30th) called in several English-speaking regions?",
    options: ["Mischief Night", "Devil's Eve", "Goosey Night", "All of the above depending on region"],
    correct: 3,
    explanation: "Depending on where you live, October 30th is celebrated as Mischief Night, Devil's Night, or Cabbage Night!"
  },
  {
    category: "Gothic Cinema",
    question: "What actor played Count Dracula in Universal's iconic 1931 black-and-white film?",
    options: ["Bela Lugosi", "Boris Karloff", "Lon Chaney Jr.", "Christopher Lee"],
    correct: 0,
    explanation: "Hungarian-American actor Bela Lugosi defined the cape, accent, and courtly manners of Count Dracula."
  },
  {
    category: "Superstition",
    question: "If a witch's cauldron bubbles over during a full moon, what household item is said to counter bad spirits?",
    options: ["Salt thrown over the left shoulder", "Black pepper", "Cinnamon bark", "Brown sugar"],
    correct: 0,
    explanation: "Throwing a pinch of salt over your left shoulder is one of history's oldest warding superstitions."
  },
  {
    category: "Cinema Classics",
    question: "In the 1993 film 'Hocus Pocus', what are the names of the three Sanderson sisters?",
    options: ["Winifred, Sarah, and Mary", "Glinda, Elphaba, and Nessa", "Prue, Piper, and Phoebe", "Hermione, Luna, and Ginny"],
    correct: 0,
    explanation: "Bette Midler, Sarah Jessica Parker, and Kathy Najimy portrayed Winifred, Sarah, and Mary Sanderson!"
  },
  {
    category: "Skeleton Facts",
    question: "How many bones are in the adult human skeleton?",
    options: ["206", "180", "256", "312"],
    correct: 0,
    explanation: "An adult human has 206 bones, with more than half located in the hands and feet!"
  },
  {
    category: "Trick-or-Treating",
    question: "The phrase 'Trick or Treat' first appeared in print in North American newspapers around which decade?",
    options: ["1920s", "1850s", "1960s", "1900s"],
    correct: 0,
    explanation: "The earliest documented printed uses of 'Trick or treat' date back to late 1920s Canadian and American newspapers."
  },
  {
    category: "Haunted Places",
    question: "Which Scottish castle is renowned as one of the most haunted castles in Europe, featuring a Phantom Piper?",
    options: ["Edinburgh Castle", "Bran Castle", "Tower of London", "Blarney Castle"],
    correct: 0,
    explanation: "Edinburgh Castle is said to be haunted by the Lost Piper Boy whose bagpipe tunes still echo beneath the Royal Mile."
  },
  {
    category: "Pumpkin Records",
    question: "What is the approximate weight of the heaviest pumpkin ever recorded in world history?",
    options: ["Over 2,700 pounds (1,247 kg)", "Over 1,000 pounds", "Over 500 pounds", "Over 4,000 pounds"],
    correct: 0,
    explanation: "In 2023, Travis Gienger's gargantuan pumpkin 'Michael Jordan' weighed in at an astonishing 2,749 pounds!"
  },
  {
    category: "Vampire Lore",
    question: "What culinary staple must you never serve a guest who you suspect is secretly an ancient vampire?",
    options: ["Garlic", "Onions", "Rosemary", "Black Truffle"],
    correct: 0,
    explanation: "Garlic's pungent allicin compound has been cited across folklore as a legendary deterrent for the undead."
  },
  {
    category: "Halloween Colors",
    question: "What do the traditional Halloween colors of Orange and Black historically symbolize?",
    options: ["Orange for the Autumn Harvest; Black for Darkness and Death", "Pumpkins and Witch Hats", "Fire and Coal", "Gold and Iron"],
    correct: 0,
    explanation: "Orange symbolizes the golden autumn harvest and vitality; black symbolizes the dark, cold winter and the veil of mortality."
  }
];

let triviaSession = [];
let currentTriviaIndex = 0;
let currentTriviaScore = 0;
let currentTriviaAnswered = 0;

function initTrivia() {
  startTriviaGauntlet();

  const nextBtn = document.getElementById('triviaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      currentTriviaIndex++;
      renderTriviaQuestion();
    });
  }

  const restartBtn = document.getElementById('restartTriviaBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      playSound('click');
      startTriviaGauntlet();
    });
  }

  const shareBtn = document.getElementById('shareTriviaBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const pct = Math.round((currentTriviaScore / triviaSession.length) * 100);
      shareContent(
        'My Halloween Trivia Score',
        `I scored ${currentTriviaScore}/${triviaSession.length} (${pct}%) on the SPOOKY WORLD 2026 Trivia Gauntlet! Can you beat my score?`
      );
    });
  }
}

function startTriviaGauntlet() {
  // Shuffle all 30 questions and select a crisp 10-question gauntlet round
  const shuffled = [...triviaDatabase].sort(() => 0.5 - Math.random());
  triviaSession = shuffled.slice(0, 10);
  currentTriviaIndex = 0;
  currentTriviaScore = 0;
  currentTriviaAnswered = 0;

  const card = document.getElementById('triviaCard');
  const resultsCard = document.getElementById('triviaResultsCard');
  if (card) card.classList.remove('hidden');
  if (resultsCard) resultsCard.classList.add('hidden');

  updateTriviaScoreboard();
  renderTriviaQuestion();
}

function updateTriviaScoreboard() {
  const scoreEl = document.getElementById('triviaCurrentScore');
  const answeredEl = document.getElementById('triviaAnsweredCount');
  const accEl = document.getElementById('triviaAccuracy');

  if (scoreEl) scoreEl.textContent = currentTriviaScore;
  if (answeredEl) answeredEl.textContent = currentTriviaAnswered;
  if (accEl) {
    const acc = currentTriviaAnswered === 0 ? 100 : Math.round((currentTriviaScore / currentTriviaAnswered) * 100);
    accEl.textContent = `${acc}%`;
  }
}

function renderTriviaQuestion() {
  const card = document.getElementById('triviaCard');
  const resultsCard = document.getElementById('triviaResultsCard');
  const expBox = document.getElementById('triviaExplanationBox');

  if (expBox) expBox.classList.add('hidden');

  if (currentTriviaIndex >= triviaSession.length) {
    // Show final results
    if (card) card.classList.add('hidden');
    if (resultsCard) resultsCard.classList.remove('hidden');
    finishTriviaSession();
    return;
  }

  const q = triviaSession[currentTriviaIndex];
  const qNum = document.getElementById('triviaQNum');
  const totalNum = document.getElementById('triviaTotalQuestions');
  const catEl = document.getElementById('triviaCategory');
  const textEl = document.getElementById('triviaQuestionText');
  const optList = document.getElementById('triviaOptionsList');

  if (qNum) qNum.textContent = currentTriviaIndex + 1;
  if (totalNum) totalNum.textContent = triviaSession.length;
  if (catEl) catEl.textContent = q.category;
  if (textEl) textEl.textContent = q.question;

  if (optList) {
    optList.innerHTML = '';
    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'trivia-opt-btn';
      btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + optIdx)}.</span> <span>${optText}</span>`;
      btn.addEventListener('click', () => handleTriviaAnswer(optIdx, btn));
      optList.appendChild(btn);
    });
  }
}

function handleTriviaAnswer(selectedIndex, clickedBtn) {
  const q = triviaSession[currentTriviaIndex];
  const optButtons = document.querySelectorAll('.trivia-opt-btn');
  optButtons.forEach(b => b.disabled = true);

  currentTriviaAnswered++;
  const isCorrect = selectedIndex === q.correct;

  if (isCorrect) {
    playSound('tada');
    clickedBtn.classList.add('correct');
    currentTriviaScore++;
  } else {
    playSound('wail');
    clickedBtn.classList.add('wrong');
    // Highlight correct answer
    if (optButtons[q.correct]) {
      optButtons[q.correct].classList.add('correct');
    }
  }

  updateTriviaScoreboard();

  // Show explanation box
  const expBox = document.getElementById('triviaExplanationBox');
  const statusEl = document.getElementById('triviaStatusText');
  const detailsEl = document.getElementById('triviaDetailsText');

  if (statusEl) {
    statusEl.textContent = isCorrect ? '✅ Spooktacular! Correct!' : '❌ Bummer! Not quite!';
    statusEl.style.color = isCorrect ? '#10b981' : '#ef4444';
  }
  if (detailsEl) {
    detailsEl.textContent = q.explanation;
  }
  if (expBox) {
    expBox.classList.remove('hidden');
  }
}

function finishTriviaSession() {
  const pct = Math.round((currentTriviaScore / triviaSession.length) * 100);
  state.triviaScore = currentTriviaScore;
  state.triviaTotal = triviaSession.length;
  if (pct > state.triviaBestPercent) {
    state.triviaBestPercent = pct;
    setStorage('trivia_best_percent', pct);
  }
  setStorage('trivia_score', currentTriviaScore);
  setStorage('trivia_total', triviaSession.length);
  recordActivity('trivia');

  const finalScoreEl = document.getElementById('triviaFinalScore');
  const finalPercentEl = document.getElementById('triviaFinalPercent');
  const verdictEl = document.getElementById('triviaVerdict');
  const certBanner = document.getElementById('triviaCertBanner');
  const certTitle = document.getElementById('triviaCertStatusTitle');
  const certDesc = document.getElementById('triviaCertStatusDesc');

  if (finalScoreEl) finalScoreEl.textContent = `${currentTriviaScore} / ${triviaSession.length}`;
  if (finalPercentEl) finalPercentEl.textContent = `(${pct}%)`;

  const unlockedCert = pct >= 80;

  if (unlockedCert) {
    playSound('tada');
    if (verdictEl) verdictEl.textContent = "Spectacular! Your supreme mastery of Halloween lore qualifies you for the official Hall of Champions!";
    if (certBanner) {
      certBanner.style.borderColor = '#10b981';
      certBanner.style.background = 'rgba(16, 185, 129, 0.15)';
    }
    if (certTitle) certTitle.textContent = "🏆 TRIVIA CHAMPION CERTIFICATE UNLOCKED!";
    if (certDesc) certDesc.textContent = `You scored ${pct}%, exceeding the 80% requirement. Head down to the Certificate Hall to claim your personalized award!`;
    showToast('🏆 Trivia Champion Certificate UNLOCKED!', '🎉');
  } else {
    playSound('creak');
    if (verdictEl) verdictEl.textContent = "Good effort, mortal! You need at least 80% to earn the Trivia Champion certificate. Try again!";
    if (certBanner) {
      certBanner.style.borderColor = 'rgba(255, 119, 0, 0.4)';
      certBanner.style.background = 'rgba(255, 119, 0, 0.1)';
    }
    if (certTitle) certTitle.textContent = "Locked: Need ≥ 80% for Certificate";
    if (certDesc) certDesc.textContent = `You scored ${pct}%. Review the explanations and click Play Again to conquer the gauntlet!`;
  }

  checkCertEligibility();
}

// ============================================================
// 12. ACTIVITY 6: PUMPKIN CLICKER GAME (Upgrades & LocalStorage)
// ============================================================
const upgradeConfig = {
  spoon: { name: "Rusty Spoon", baseCost: 15, perClick: 1, perSec: 0 },
  candle: { name: "Haunted Candle", baseCost: 60, perClick: 0, perSec: 2 },
  cauldron: { name: "Witch's Brew", baseCost: 200, perClick: 5, perSec: 0 },
  skeleton: { name: "Skeleton Squad", baseCost: 650, perClick: 0, perSec: 15 },
  ghostSwarm: { name: "Ghost Swarm", baseCost: 2500, perClick: 0, perSec: 60 }
};

function getUpgradeCost(id) {
  const cfg = upgradeConfig[id];
  const count = state.clickerUpgrades[id] || 0;
  return Math.floor(cfg.baseCost * Math.pow(1.15, count));
}

function getClickerRates() {
  let perClick = 1;
  let perSec = 0;

  for (const [id, count] of Object.entries(state.clickerUpgrades)) {
    const cfg = upgradeConfig[id];
    perClick += (cfg.perClick * count);
    perSec += (cfg.perSec * count);
  }

  return { perClick, perSec };
}

function initPumpkinClicker() {
  const pumpkinBtn = document.getElementById('giantPumpkinBtn');
  const countEl = document.getElementById('candyCount');
  const clickRateEl = document.getElementById('perClickRate');
  const secRateEl = document.getElementById('perSecRate');
  const highScoreEl = document.getElementById('highScoreRate');
  const floatersContainer = document.getElementById('clickerFloaters');
  const milestoneEl = document.getElementById('clickerMilestone');

  function updateDisplay() {
    const { perClick, perSec } = getClickerRates();
    if (countEl) countEl.textContent = Math.floor(state.clickerCandies).toLocaleString();
    if (clickRateEl) clickRateEl.textContent = `+${perClick}`;
    if (secRateEl) secRateEl.textContent = `+${perSec}`;
    if (highScoreEl) highScoreEl.textContent = Math.floor(state.clickerHighScore).toLocaleString();

    // Update upgrade buttons
    for (const [id] of Object.entries(upgradeConfig)) {
      const cost = getUpgradeCost(id);
      const owned = state.clickerUpgrades[id] || 0;
      const costEl = document.getElementById(`cost${id.charAt(0).toUpperCase() + id.slice(1)}`);
      const ownedEl = document.getElementById(`owned${id.charAt(0).toUpperCase() + id.slice(1)}`);
      const btn = document.getElementById(`upg${id.charAt(0).toUpperCase() + id.slice(1)}`);

      if (costEl) costEl.textContent = cost.toLocaleString();
      if (ownedEl) ownedEl.textContent = `(${owned})`;
      if (btn) {
        btn.disabled = state.clickerCandies < cost;
      }
    }
  }

  function spawnFloater(text, clientX, clientY) {
    if (!floatersContainer) return;
    const floater = document.createElement('div');
    floater.className = 'click-floater';
    floater.textContent = text;

    const rect = floatersContainer.getBoundingClientRect();
    const x = clientX ? clientX - rect.left - 20 : rect.width / 2 - 20 + (Math.random() * 40 - 20);
    const y = clientY ? clientY - rect.top - 20 : rect.height / 2 - 20 + (Math.random() * 40 - 20);

    floater.style.left = `${Math.max(10, Math.min(rect.width - 60, x))}px`;
    floater.style.top = `${Math.max(10, Math.min(rect.height - 60, y))}px`;

    floatersContainer.appendChild(floater);
    setTimeout(() => floater.remove(), 850);
  }

  if (pumpkinBtn) {
    pumpkinBtn.addEventListener('click', (e) => {
      playSound('squish');
      const { perClick } = getClickerRates();
      state.clickerCandies += perClick;
      if (state.clickerCandies > state.clickerHighScore) {
        state.clickerHighScore = state.clickerCandies;
        setStorage('clicker_high_score', state.clickerHighScore);
      }
      setStorage('clicker_candies', state.clickerCandies);
      spawnFloater(`+${perClick} 🍬`, e.clientX, e.clientY);
      updateDisplay();
      recordActivity('clicker');

      // Milestone celebrations
      if (state.clickerCandies >= 500 && !state.activitiesDone['pumpkin_500']) {
        state.activitiesDone['pumpkin_500'] = true;
        setStorage('activities_done', state.activitiesDone);
        showToast('🎃 Milestone Reached: 500 Candies Hoarded!', '🏆');
        if (milestoneEl) milestoneEl.textContent = "Milestone: 500 Candies! Ultimate Ghost Hunter badge requirement satisfied!";
        checkCertEligibility();
      }
    });
  }

  // Upgrades click handlers
  for (const [id] of Object.entries(upgradeConfig)) {
    const btn = document.getElementById(`upg${id.charAt(0).toUpperCase() + id.slice(1)}`);
    if (btn) {
      btn.addEventListener('click', () => {
        const cost = getUpgradeCost(id);
        if (state.clickerCandies >= cost) {
          playSound('click');
          state.clickerCandies -= cost;
          state.clickerUpgrades[id] = (state.clickerUpgrades[id] || 0) + 1;
          setStorage('clicker_candies', state.clickerCandies);
          setStorage('clicker_upgrades', state.clickerUpgrades);
          showToast(`Purchased ${upgradeConfig[id].name}!`, '🛒');
          updateDisplay();
          recordActivity('clicker');
        }
      });
    }
  }

  // Auto-clicker tick loop (every 1 second)
  setInterval(() => {
    const { perSec } = getClickerRates();
    if (perSec > 0) {
      state.clickerCandies += perSec;
      if (state.clickerCandies > state.clickerHighScore) {
        state.clickerHighScore = state.clickerCandies;
        setStorage('clicker_high_score', state.clickerHighScore);
      }
      setStorage('clicker_candies', state.clickerCandies);
      updateDisplay();
    }
  }, 1000);

  // Reset Button
  const resetBtn = document.getElementById('resetClickerBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your Pumpkin Clicker candies and upgrades?')) {
        state.clickerCandies = 0;
        state.clickerUpgrades = { spoon: 0, candle: 0, cauldron: 0, skeleton: 0, ghostSwarm: 0 };
        setStorage('clicker_candies', 0);
        setStorage('clicker_upgrades', state.clickerUpgrades);
        showToast('Pumpkin Clicker game reset.', '🔄');
        updateDisplay();
      }
    });
  }

  updateDisplay();
}

// ============================================================
// 13. ACTIVITY 7: HALLOWEEN COSTUME PICKER
// ============================================================
const costumeIdeas = [
  {
    archetype: "ghost",
    emoji: "👻",
    name: "The Passive-Aggressive Roommate Ghost",
    tagline: "\"I don't mind that you drank my oat milk... I'll just rattle the pots at 3 AM.\"",
    supplies: "One white bedsheet, a sticky note that says 'PLEASE WASH YOUR DISHES', and an empty coffee mug.",
    budgetHack: "Use your actual bedsheet. Do not cut eye holes; just glare with intense resentment through the cotton.",
    quip: "\"Trick or treat! I'm not here for candy, I'm just checking if anyone turned off the hallway light.\""
  },
  {
    archetype: "vampire",
    emoji: "🧛",
    name: "Corporate 9-to-5 Bloodsucker",
    tagline: "\"I vant to suck your company's quarterly budget!\"",
    supplies: "Business suit, vampire fangs, a lanyard with 14 badges, and a clipboard marked 'URGENT SYNC'.",
    budgetHack: "Wear your work clothes and apply dark purple eyeshadow to look like you worked an 80-hour week.",
    quip: "\"Trick or treat! Let's take this offline and circle back after midnight.\""
  },
  {
    archetype: "witch",
    emoji: "🧙",
    name: "Barista Witch of Salem High",
    tagline: "\"Double, double, toil and trouble; oat milk latte, foam and bubble!\"",
    supplies: "Witch hat, apron stained with coffee, and a coffee stirrer used as a magic wand.",
    budgetHack: "Roll black construction paper into a conical hat and tape it to a hairband.",
    quip: "\"Trick or treat! I cast a spell: your coffee will stay hot forever!\""
  },
  {
    archetype: "zombie",
    emoji: "🧟",
    name: "The Monday Morning Commuter Zombie",
    tagline: "\"Braaains... and also extra espresso shots...\"",
    supplies: "Torn t-shirt, messy bedhead hair, empty thermal mug, and an expired subway card.",
    budgetHack: "Literally roll out of bed on Monday morning and show up exactly as you are.",
    quip: "\"Trick or treat... grumble... grumble... do you have gluten-free brains?\""
  },
  {
    archetype: "skeleton",
    emoji: "💀",
    name: "The Bad-to-the-Bone Rockstar",
    tagline: "\"I'm playing a solo on my ribcage xylophone!\"",
    supplies: "Sunglasses, leather or denim jacket, skeleton gloves, and a cardboard air guitar.",
    budgetHack: "Cut bone shapes out of white paper towels and safety-pin them to a black sweatshirt.",
    quip: "\"Trick or treat! I've got a bone to pick with anyone handing out raisins!\""
  },
  {
    archetype: "pumpkin",
    emoji: "🎃",
    name: "The High-Fashion Pumpkin Spice Influencer",
    tagline: "\"Live, Laugh, Jack-o'-Lantern.\"",
    supplies: "Orange sweater, giant green sunglasses, and a paper pumpkin bag carried like a designer handbag.",
    budgetHack: "Drape an orange towel around your shoulders and hold a cinnamon stick like a cigar.",
    quip: "\"Trick or treat! Don't forget to tag me in your spooky Instagram story!\""
  },
  {
    archetype: "ghost",
    emoji: "👻",
    name: "The 404 Error: Costume Not Found",
    tagline: "\"A catastrophic server error has occurred.\"",
    supplies: "Plain white t-shirt with 'Error 404: Costume Not Found' written in black marker.",
    budgetHack: "Cost: $0. Time to prepare: 30 seconds. Maximum tech humor payoff.",
    quip: "\"Trick or treat! The server returned a 404 on this candy interaction.\""
  },
  {
    archetype: "vampire",
    emoji: "🧛",
    name: "The Sunscreen Allergic Tourist",
    tagline: "\"SPF 5000 is still not enough for this beach trip.\"",
    supplies: "Hawaiian shirt, high-collar vampire cape, zinc oxide white paste on your nose, and a giant sun umbrella.",
    budgetHack: "Wear bright vacation clothes over any dark coat.",
    quip: "\"Trick or treat! Please don't point any UV lamps in my direction!\""
  }
];

let costumeFilter = 'all';
let costumeIndex = 0;

function initCostumePicker() {
  const tabs = document.getElementById('costumeArchetypes');
  const rollBtn = document.getElementById('rollCostumeBtn');
  const copyBtn = document.getElementById('copyCostumeBtn');
  const shareBtn = document.getElementById('shareCostumeBtn');

  function renderCostume() {
    const list = costumeFilter === 'all'
      ? costumeIdeas
      : costumeIdeas.filter(c => c.archetype === costumeFilter);

    if (list.length === 0) return;
    const c = list[costumeIndex % list.length];

    const emojiEl = document.getElementById('costumeEmoji');
    const badgeEl = document.getElementById('costumeCategoryBadge');
    const nameEl = document.getElementById('costumeName');
    const tagEl = document.getElementById('costumeTagline');
    const supEl = document.getElementById('costumeSupplies');
    const budEl = document.getElementById('costumeBudgetHack');
    const quipEl = document.getElementById('costumeQuip');

    if (emojiEl) emojiEl.textContent = c.emoji;
    if (badgeEl) badgeEl.textContent = `${c.archetype.toUpperCase()} ARCHETYPE`;
    if (nameEl) nameEl.textContent = c.name;
    if (tagEl) tagEl.textContent = c.tagline;
    if (supEl) supEl.textContent = c.supplies;
    if (budEl) budEl.textContent = c.budgetHack;
    if (quipEl) quipEl.textContent = c.quip;
  }

  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      costumeFilter = btn.dataset.archetype || 'all';
      costumeIndex = 0;
      playSound('click');
      renderCostume();
    });
  }

  if (rollBtn) {
    rollBtn.addEventListener('click', () => {
      playSound('wail');
      costumeIndex++;
      renderCostume();
      recordActivity('costume');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const name = document.getElementById('costumeName')?.textContent || '';
      const supplies = document.getElementById('costumeSupplies')?.textContent || '';
      const hack = document.getElementById('costumeBudgetHack')?.textContent || '';
      copyTextToClipboard(`🎭 Costume Idea: ${name}\nSupplies: ${supplies}\nBudget Hack: ${hack}`, 'Costume plan copied! 🎭');
      recordActivity('costume');
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const name = document.getElementById('costumeName')?.textContent || '';
      const tag = document.getElementById('costumeTagline')?.textContent || '';
      shareContent('Halloween Costume Idea', `Check out my costume idea: ${name} — ${tag} Generated on SPOOKY WORLD 2026:`);
      recordActivity('costume');
    });
  }

  renderCostume();
}

// ============================================================
// 14. ACTIVITY 8: HALLOWEEN JOKE MACHINE (35+ Family Jokes)
// ============================================================
const halloweenJokes = [
  { setup: "Why didn't the skeleton go to the Halloween dance?", punchline: "Because he had no-body to go with! 💀🥁", tag: "Skeleton Humor" },
  { setup: "What do you call a witch who lives at the beach?", punchline: "A Sand-Witch! 🥪🧙", tag: "Witch Puns" },
  { setup: "Why are ghosts terrible at telling lies?", punchline: "Because you can see right through them! 👻👀", tag: "Ghost Giggles" },
  { setup: "What is a vampire's favorite fruit?", punchline: "A neck-tarine! 🧛🍑", tag: "Vampire Chuckles" },
  { setup: "Why do mummies have no friends?", punchline: "Because they are too wrapped up in themselves! 🧻🤕", tag: "Mummy Laughs" },
  { setup: "What kind of mistake does a ghost make?", punchline: "A boo-boo! 👻🩹", tag: "Ghost Giggles" },
  { setup: "How do monsters like their eggs cooked?", punchline: "Terri-fried! 🍳👹", tag: "Monster Puns" },
  { setup: "What is a ghost's favorite dessert?", punchline: "I scream! (Ice cream) 🍦👻", tag: "Ghost Giggles" },
  { setup: "Why do skeletons stay so calm in stressful situations?", punchline: "Because nothing gets under their skin! 💀✨", tag: "Skeleton Humor" },
  { setup: "What does a panda ghost eat for dinner?", punchline: "Bam-BOO! 🎋👻", tag: "Ghost Giggles" },
  { setup: "What kind of music do mummies listen to at parties?", punchline: "Rag-time and Wrap music! 🎶🧻", tag: "Mummy Laughs" },
  { setup: "Why did the headless horseman go into business?", punchline: "He wanted to get a head in life! 🎃👔", tag: "Spooky Classics" },
  { setup: "What is a vampire's favorite holiday besides Halloween?", punchline: "Fangs-giving! 🦃🧛", tag: "Vampire Chuckles" },
  { setup: "Where do baby ghosts go while their parents haunt houses?", punchline: "To the dayscare center! 🍼👻", tag: "Ghost Giggles" },
  { setup: "What do you get when you cross a vampire with a snowman?", punchline: "Frostbite! ⛄🧛", tag: "Vampire Chuckles" },
  { setup: "Why did the scarecrow win an Olympic gold medal?", punchline: "Because he was outstanding in his field! 🌾🥇", tag: "Harvest Chuckles" },
  { setup: "What do witches put on their bagels in the morning?", punchline: "Scream cheese! 🥯🧙", tag: "Witch Puns" },
  { setup: "What do you call two witches who share an apartment?", punchline: "Broom-mates! 🧹🧙‍♀️", tag: "Witch Puns" },
  { setup: "Why did Frankenstein go to art school?", punchline: "He wanted to learn how to draw his own conclusions! 🎨🧟", tag: "Monster Puns" },
  { setup: "What kind of vehicle does a friendly ghost drive?", punchline: "A boo-ick! 🚗👻", tag: "Ghost Giggles" },
  { setup: "What is a zombie's favorite bean?", punchline: "Human-beans! 🫘🧟", tag: "Zombie Jokes" },
  { setup: "Why are black cats great at bowling?", punchline: "Because they always get purr-fect strikes! 🎳🐈‍⬛", tag: "Cat Humor" },
  { setup: "What happens when you drop a pumpkin on the floor?", punchline: "It becomes squash! 🎃💥", tag: "Pumpkin Chuckles" },
  { setup: "Why did the ghost join the football team?", punchline: "He heard they had great team spirit! 🏈👻", tag: "Ghost Giggles" },
  { setup: "What did the skeleton say before eating dinner?", punchline: "Bone appetit! 🍽️💀", tag: "Skeleton Humor" },
  { setup: "Why don't vampires like fast food?", punchline: "Because they can't catch it! 🍔🧛", tag: "Vampire Chuckles" },
  { setup: "What room do ghosts avoid in every house?", punchline: "The living room! 🛋️👻", tag: "Ghost Giggles" },
  { setup: "How do witches keep their hair in place while flying?", punchline: "With scare spray! 💨🧙", tag: "Witch Puns" },
  { setup: "What is a monster's favorite math subject?", punchline: "Ghoul-ometry! 📐👹", tag: "Monster Puns" },
  { setup: "Why did the bat take medicine?", punchline: "Because he had a bad coffin! 🦇💊", tag: "Bat Chuckles" },
  { setup: "What do you call a cleaning ghost?", punchline: "A vacuum cleaner! 🧹👻", tag: "Ghost Giggles" },
  { setup: "Why was the skeleton afraid of the storm?", punchline: "He didn't have the guts to face it! ⛈️💀", tag: "Skeleton Humor" },
  { setup: "What do goblins put in their hot chocolate?", punchline: "Ghost-mallows! ☕👺", tag: "Monster Puns" },
  { setup: "What do you call a fat jack-o'-lantern?", punchline: "A plump-kin! 🎃🥧", tag: "Pumpkin Chuckles" },
  { setup: "Why did the witch turn the mortal into a toad?", punchline: "Because he toad-ally annoyed her! 🐸🧙", tag: "Witch Puns" }
];

let jokeIndex = 0;

function initJokeMachine() {
  const setupEl = document.getElementById('jokeSetup');
  const punchlineEl = document.getElementById('jokePunchline');
  const revealBtn = document.getElementById('revealPunchlineBtn');
  const nextBtn = document.getElementById('nextJokeBtn');
  const copyBtn = document.getElementById('copyJokeBtn');
  const shareBtn = document.getElementById('shareJokeBtn');
  const numEl = document.getElementById('jokeNumber');

  function renderJoke() {
    const j = halloweenJokes[jokeIndex % halloweenJokes.length];
    if (numEl) numEl.textContent = (jokeIndex % halloweenJokes.length) + 1;
    if (setupEl) setupEl.textContent = `"${j.setup}"`;
    if (punchlineEl) {
      punchlineEl.textContent = j.punchline;
      punchlineEl.classList.add('hidden');
    }
    if (revealBtn) revealBtn.classList.remove('hidden');
  }

  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      playSound('tada');
      revealBtn.classList.add('hidden');
      if (punchlineEl) punchlineEl.classList.remove('hidden');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSound('click');
      jokeIndex++;
      renderJoke();
      recordActivity('jokes');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const j = halloweenJokes[jokeIndex % halloweenJokes.length];
      copyTextToClipboard(`🎃 Joke: ${j.setup}\n${j.punchline}`, 'Joke copied to clipboard! 🃏');
      recordActivity('jokes');
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const j = halloweenJokes[jokeIndex % halloweenJokes.length];
      shareContent('Spooky World 2026 Joke', `${j.setup} — ${j.punchline}`);
      recordActivity('jokes');
    });
  }

  renderJoke();
}

// ============================================================
// 15. ACTIVITY 9: HAUNTED HOUSE CHALLENGE (5 Mysterious Doors)
// ============================================================
function initHauntedDoors() {
  const doors = [1, 2, 3, 4, 5];
  const countEl = document.getElementById('doorsUnlockedCount');
  const fillEl = document.getElementById('doorsProgressFill');
  const allBanner = document.getElementById('allDoorsBanner');

  function updateDoorProgress() {
    const unlockedCount = state.doorsUnlocked.filter(Boolean).length;
    if (countEl) countEl.textContent = unlockedCount;
    if (fillEl) fillEl.style.width = `${(unlockedCount / 5) * 100}%`;

    if (unlockedCount === 5) {
      if (allBanner) allBanner.classList.remove('hidden');
      recordActivity('doors');
    } else {
      if (allBanner) allBanner.classList.add('hidden');
    }
  }

  doors.forEach(doorNum => {
    const btn = document.getElementById(`doorBtn${doorNum}`);
    const item = document.querySelector(`.door-interactive-item[data-door="${doorNum}"]`);
    if (!btn || !item) return;

    // Check if previously opened
    if (state.doorsUnlocked[doorNum - 1]) {
      item.classList.add('opened');
      btn.textContent = 'Room Explored ✅';
    }

    btn.addEventListener('click', () => {
      playSound('creak');
      const isOpened = item.classList.contains('opened');
      if (!isOpened) {
        item.classList.add('opened');
        btn.textContent = 'Room Explored ✅';
        state.doorsUnlocked[doorNum - 1] = true;
        setStorage('doors_unlocked', state.doorsUnlocked);
        showToast(`Door ${doorNum} unlocked! Check out the challenge inside.`, '🗝️');
      } else {
        item.classList.remove('opened');
        btn.textContent = `Open Door ${doorNum}`;
        state.doorsUnlocked[doorNum - 1] = false;
        setStorage('doors_unlocked', state.doorsUnlocked);
      }
      updateDoorProgress();
      checkCertEligibility();
    });
  });

  updateDoorProgress();
}

// ============================================================
// 16. ACTIVITY 10: HALLOWEEN CERTIFICATE GENERATOR
// ============================================================
const certificateTypes = {
  trivia: {
    title: "Halloween Trivia Champion",
    category: "CERTIFICATE OF SUPREME SCHOLARSHIP",
    desc: "Demonstrating extraordinary command of ancient folklore, nocturnal trivia, and supernatural knowledge under the October full moon.",
    reqDesc: "Requirement: Score at least 80% on Halloween Trivia.",
    check: () => state.triviaBestPercent >= 80,
    prefix: "SW26-TRIVIA-"
  },
  explorer: {
    title: "Spooky World Explorer",
    category: "CERTIFICATE OF CURIOUS ADVENTURE",
    desc: "Bravely venturing through 5 or more spectral attractions, overcoming eerie puzzles, and proving unmatched Halloween enthusiasm.",
    reqDesc: "Requirement: Complete at least 5 different activities in Spooky World.",
    check: () => Object.keys(state.activitiesDone).length >= 5,
    prefix: "SW26-EXPLR-"
  },
  master: {
    title: "Master of Halloween",
    category: "SUPREME CROWN OF THE OCTOBER SHADOWS",
    desc: "Conquering the Trivia Gauntlet with honors, unlocking all 5 Mysterious Doors of the Haunted Manor, and reigning supreme over the 2026 festivities.",
    reqDesc: "Requirement: Trivia Champion (≥80%) + Explorer (≥5 activities) + All 5 Haunted Doors opened.",
    check: () => state.triviaBestPercent >= 80 && Object.keys(state.activitiesDone).length >= 5 && state.doorsUnlocked.filter(Boolean).length === 5,
    prefix: "SW26-MASTR-"
  },
  ghostHunter: {
    title: "Ultimate Ghost Hunter",
    category: "ORDER OF THE SPECTRAL INVESTIGATOR",
    desc: "Summoning mischievous phantom pranks and diligently harvesting over 500 candies from the enchanted Jack-o'-lantern.",
    reqDesc: "Requirement: Visited Ghost Pranks + hoarded ≥ 500 candies in Pumpkin Clicker.",
    check: () => Boolean(state.activitiesDone['prank']) && (state.clickerHighScore >= 500 || state.activitiesDone['pumpkin_500']),
    prefix: "SW26-GHUNT-"
  },
  quizGenius: {
    title: "Halloween Quiz Genius",
    category: "CERTIFICATE OF INTELLECTUAL OCCULT",
    desc: "Successfully completing the deep Halloween Personality Assessment and conquering the knowledge gauntlet.",
    reqDesc: "Requirement: Completed Personality Quiz + Completed Halloween Trivia.",
    check: () => Boolean(state.personalityCompleted) && Boolean(state.activitiesDone['trivia']),
    prefix: "SW26-QGENI-"
  }
};

let currentCertType = 'trivia';

function checkCertEligibility() {
  const select = document.getElementById('certTypeSelect');
  if (select) currentCertType = select.value;

  const cfg = certificateTypes[currentCertType];
  const badge = document.getElementById('certStatusBadge');
  const expl = document.getElementById('certStatusExpl');
  const hint = document.getElementById('certRequirementHint');

  if (hint && cfg) hint.textContent = cfg.reqDesc;

  const isEligible = state.demoMode || (cfg && cfg.check());

  if (badge) {
    if (isEligible) {
      badge.textContent = "UNLOCKED ✅";
      badge.className = "status-badge unlocked";
    } else {
      badge.textContent = "LOCKED 🔒";
      badge.className = "status-badge locked";
    }
  }

  if (expl) {
    if (isEligible) {
      expl.textContent = state.demoMode 
        ? "Unlocked in Preview/Test Mode! You can generate, print, or download this award." 
        : "Achievements verified! You have earned the right to bear this official award.";
    } else {
      expl.textContent = `Not yet unlocked. ${cfg.reqDesc} (Toggle Preview Mode above to test immediately).`;
    }
  }

  updateCertificatePreview();
}

function updateCertificatePreview() {
  const nameInput = document.getElementById('certRecipientName');
  const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Morticia Addams";

  const cfg = certificateTypes[currentCertType] || certificateTypes['trivia'];

  const prevName = document.getElementById('certPreviewName');
  const prevTitle = document.getElementById('certPreviewTitle');
  const prevCat = document.getElementById('certPreviewCategory');
  const prevDesc = document.getElementById('certPreviewDesc');
  const prevID = document.getElementById('certPreviewID');
  const prevDate = document.getElementById('certPreviewDate');

  if (prevName) prevName.textContent = name;
  if (prevTitle) prevTitle.textContent = cfg.title;
  if (prevCat) prevCat.textContent = cfg.category;
  if (prevDesc) prevDesc.textContent = cfg.desc;

  // Generate deterministic ID based on name and cert type
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  const certId = `${cfg.prefix}${Math.abs(hash % 90000 + 10000)}`;
  if (prevID) prevID.textContent = certId;

  // Formatted Date
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (prevDate) prevDate.textContent = now.toLocaleDateString('en-US', options);
}

function initCertificateGenerator() {
  const nameInput = document.getElementById('certRecipientName');
  const typeSelect = document.getElementById('certTypeSelect');
  const demoToggle = document.getElementById('demoModeToggle');

  const pngBtn = document.getElementById('downloadPngBtn');
  const pdfBtn = document.getElementById('downloadPdfBtn');
  const printBtn = document.getElementById('printCertBtn');
  const shareBtn = document.getElementById('shareCertBtn');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updateCertificatePreview();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      currentCertType = typeSelect.value;
      checkCertEligibility();
    });
  }

  if (demoToggle) {
    demoToggle.addEventListener('change', (e) => {
      state.demoMode = e.target.checked;
      playSound('click');
      checkCertEligibility();
      showToast(state.demoMode ? 'Test Mode: All certificates unlocked for testing!' : 'Test mode disabled.');
    });
  }

  // Draw on Canvas for Ultra-Crisp 2400x1600 PNG/PDF
  function renderCanvasCertificate() {
    const canvas = document.getElementById('certCanvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const width = 2400;
    const height = 1600;

    canvas.width = width;
    canvas.height = height;

    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Morticia Addams";
    const cfg = certificateTypes[currentCertType] || certificateTypes['trivia'];
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
    const certId = `${cfg.prefix}${Math.abs(hash % 90000 + 10000)}`;

    // Background Gradient (Deep Purple to Black)
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 1300);
    bgGrad.addColorStop(0, '#1c0836');
    bgGrad.addColorStop(0.6, '#0d031c');
    bgGrad.addColorStop(1, '#05010a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ornate Gold Double Border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.strokeRect(85, 85, width - 170, height - 170);

    ctx.strokeStyle = '#ff7700';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, width - 200, height - 200);

    // Corner Spiderweb decorations
    ctx.font = '80px sans-serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.fillText('🕸️', 120, 200);
    ctx.fillText('🕸️', width - 200, 200);
    ctx.fillText('🕸️', 120, height - 130);
    ctx.fillText('🕸️', width - 200, height - 130);

    // Header Crest & Bats
    ctx.textAlign = 'center';
    ctx.font = '50px sans-serif';
    ctx.fillStyle = '#ff7700';
    ctx.fillText('🦇   🦇   🦇', width / 2, 190);

    // SPOOKY WORLD 2026 Header
    ctx.font = '900 75px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ff7700';
    ctx.shadowColor = 'rgba(255, 119, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.fillText('SPOOKY WORLD 2026', width / 2, 280);
    ctx.shadowBlur = 0;

    ctx.font = '700 30px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ffd700';
    ctx.letterSpacing = '6px';
    ctx.fillText('OFFICIAL COURT OF THE SHADOW REALM', width / 2, 340);

    // Ribbon Capsule
    ctx.fillStyle = '#ff7700';
    const ribbonWidth = 850;
    const ribbonX = (width - ribbonWidth) / 2;
    ctx.beginPath();
    ctx.roundRect(ribbonX, 390, ribbonWidth, 54, 27);
    ctx.fill();

    ctx.font = '900 28px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(cfg.category, width / 2, 428);

    // Certificate text
    ctx.font = '600 30px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#c4b5d6';
    ctx.fillText('THIS COVEN HEREBY CERTIFIES THAT', width / 2, 530);

    // Recipient Name
    ctx.font = '900 100px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    ctx.shadowBlur = 25;
    ctx.fillText(name, width / 2, 650);
    ctx.shadowBlur = 0;

    // Underline
    ctx.strokeStyle = '#ff7700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 380, 680);
    ctx.lineTo(width / 2 + 380, 680);
    ctx.stroke();

    // Body Text
    ctx.font = '500 30px "Outfit", sans-serif';
    ctx.fillStyle = '#c4b5d6';
    ctx.fillText('HAS BRAVELY VENTURED THROUGH THE MISTS OF SPOOKY WORLD 2026 AND RIGHTFULLY ATTAINED:', width / 2, 760);

    // Achievement Title
    ctx.font = '900 80px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 30;
    ctx.fillText(cfg.title, width / 2, 870);
    ctx.shadowBlur = 0;

    // Sub Description
    ctx.font = 'italic 400 32px "Outfit", sans-serif';
    ctx.fillStyle = '#e2d9f3';
    ctx.fillText(cfg.desc, width / 2, 950);

    // Official Gold Wax Seal in center
    const sealX = width / 2;
    const sealY = 1170;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 90, 0, Math.PI * 2);
    ctx.fillStyle = '#b8860b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 82, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    ctx.font = '70px sans-serif';
    ctx.fillText('🎃', sealX, sealY + 25);

    // Signatures
    ctx.font = 'italic 55px "Brush Script MT", cursive, serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('Count Vladislav', 420, 1180);
    ctx.fillText('Madam Hazel', width - 420, 1180);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(250, 1205);
    ctx.lineTo(590, 1205);
    ctx.moveTo(width - 590, 1205);
    ctx.lineTo(width - 250, 1205);
    ctx.stroke();

    ctx.font = '600 24px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#c4b5d6';
    ctx.fillText('CHANCELLOR OF SHADOWS', 420, 1245);
    ctx.fillText('HIGH WITCH OF SPOOKDOM', width - 420, 1245);

    // Meta bar
    ctx.font = '600 24px "Outfit", sans-serif';
    ctx.fillStyle = '#8b79a8';
    ctx.fillText(`DATE: ${dateStr.toUpperCase()}   ·   CERTIFICATE ID: ${certId}   ·   VERIFIED ON CLIENT`, width / 2, 1370);

    // Disclaimer
    ctx.font = '500 20px "Outfit", sans-serif';
    ctx.fillStyle = '#6b5887';
    ctx.fillText('DISCLAIMER: This certificate is a fun, decorative participation & achievement award. Not an accredited academic qualification.', width / 2, 1420);

    return canvas;
  }

  // PNG Download
  if (pngBtn) {
    pngBtn.addEventListener('click', () => {
      const cfg = certificateTypes[currentCertType];
      const isEligible = state.demoMode || (cfg && cfg.check());
      if (!isEligible) {
        showToast('Please complete the required activity first, or enable Test Mode above!', '🔒');
        return;
      }

      playSound('tada');
      showToast('Generating ultra-high-resolution PNG...', '⏳');

      setTimeout(() => {
        const canvas = renderCanvasCertificate();
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `SpookyWorld2026_${currentCertType}_Certificate.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        showToast('Certificate PNG downloaded successfully! 🖼️', '🎉');
      }, 100);
    });
  }

  // PDF Download (jsPDF with Canvas fallback)
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      const cfg = certificateTypes[currentCertType];
      const isEligible = state.demoMode || (cfg && cfg.check());
      if (!isEligible) {
        showToast('Please complete the required activity first, or enable Test Mode above!', '🔒');
        return;
      }

      playSound('tada');
      showToast('Building official PDF document...', '⏳');

      setTimeout(() => {
        const canvas = renderCanvasCertificate();
        if (!canvas) return;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        try {
          if (window.jspdf && window.jspdf.jsPDF) {
            const doc = new window.jspdf.jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: 'a4'
            });
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            doc.save(`SpookyWorld2026_${currentCertType}_Certificate.pdf`);
            showToast('Certificate PDF downloaded successfully! 📄', '🎉');
          } else {
            // Fallback: trigger print
            window.print();
          }
        } catch (err) {
          console.warn('PDF export error:', err);
          window.print();
        }
      }, 100);
    });
  }

  // Print
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const cfg = certificateTypes[currentCertType];
      const isEligible = state.demoMode || (cfg && cfg.check());
      if (!isEligible) {
        showToast('Please unlock the certificate or toggle Test Mode before printing!', '🔒');
        return;
      }
      playSound('click');
      window.print();
    });
  }

  // Share
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const cfg = certificateTypes[currentCertType];
      const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Morticia Addams";
      shareContent(
        `My ${cfg.title} Award from SPOOKY WORLD 2026`,
        `I just earned the official ${cfg.title} award at SPOOKY WORLD 2026! Can you brave the haunted house and beat the trivia? Claim yours here:`
      );
    });
  }

  checkCertEligibility();
}

// ============================================================
// 17. HEADER AUDIO & NAVIGATION CONTROLS
// ============================================================
function initHeaderAndNav() {
  const sfxBtn = document.getElementById('sfxToggle');
  const sfxIcon = document.getElementById('sfxIcon');
  const musicBtn = document.getElementById('musicToggle');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeDrawer = document.getElementById('closeDrawerBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Sound FX Toggle
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      setStorage('sound_enabled', state.soundEnabled);
      if (sfxIcon) sfxIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      showToast(state.soundEnabled ? 'Sound effects enabled 🔊' : 'Sound effects muted 🔇');
    });
  }

  // Music Toggle
  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // Mobile Drawer
  if (mobileBtn && drawer) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      } else {
        drawer.classList.add('open');
        mobileBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  if (closeDrawer && drawer) {
    closeDrawer.addEventListener('click', () => {
      drawer.classList.remove('open');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    });
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (drawer) drawer.classList.remove('open');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Back to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ============================================================
// 18. VISITOR INSTRUCTIONS MODAL
// ============================================================
function initVisitorGuideModal() {
  const modal = document.getElementById('guideModal');
  const openBtn1 = document.getElementById('guideModalBtn');
  const openBtn2 = document.getElementById('footerGuideBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const underBtn = document.getElementById('guideUnderstoodBtn');
  const backdrop = document.getElementById('modalBackdrop');

  function openModal() {
    playSound('click');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    playSound('click');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openBtn1) openBtn1.addEventListener('click', openModal);
  if (openBtn2) openBtn2.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (underBtn) underBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// ============================================================
// 19. APP INITIALIZATION (DOM Ready)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initCountdown();
  initHeaderAndNav();
  initHomepageEasterEggs();
  initQuiz();
  initPranks();
  initFortuneTeller();
  initWouldYouRather();
  initTrivia();
  initPumpkinClicker();
  initCostumePicker();
  initJokeMachine();
  initHauntedDoors();
  initCertificateGenerator();
  initVisitorGuideModal();
  updatePassBadgeCount();

  // One-time friendly toast after entry
  setTimeout(() => {
    showToast('Welcome to SPOOKY WORLD 2026! 🎃👻', '🦇');
  }, 1000);
});
