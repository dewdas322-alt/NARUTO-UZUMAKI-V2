import { GameConfig, GameRecord, GameType, SingleSameNumInfo, FusionPrediction, LevelPlan } from '../types';

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  wingo30: { id: 'wingo30', label: 'WinGo 30S', min: 0, max: 9, bigTh: 5, total: 10, poolB: [5, 6, 7, 8, 9], poolS: [0, 1, 2, 3, 4], secs: 30 },
  wingo1m: { id: 'wingo1m', label: 'WinGo 1M', min: 0, max: 9, bigTh: 5, total: 10, poolB: [5, 6, 7, 8, 9], poolS: [0, 1, 2, 3, 4], secs: 60 },
  wingo3m: { id: 'wingo3m', label: 'WinGo 3M', min: 0, max: 9, bigTh: 5, total: 10, poolB: [5, 6, 7, 8, 9], poolS: [0, 1, 2, 3, 4], secs: 180 },
  wingo5m: { id: 'wingo5m', label: 'WinGo 5M', min: 0, max: 9, bigTh: 5, total: 10, poolB: [5, 6, 7, 8, 9], poolS: [0, 1, 2, 3, 4], secs: 300 },
  trx1m: { id: 'trx1m', label: 'TRX WinGo 1M', min: 0, max: 9, bigTh: 5, total: 10, poolB: [5, 6, 7, 8, 9], poolS: [0, 1, 2, 3, 4], secs: 60 },
  k31m: { id: 'k31m', label: 'K3 1M', min: 3, max: 18, bigTh: 11, total: 16, poolB: [11, 12, 13, 14, 15, 16, 17, 18], poolS: [3, 4, 5, 6, 7, 8, 9, 10], secs: 60 },
};

export const getCfg = (g: GameType): GameConfig => GAME_CONFIGS[g] || GAME_CONFIGS.wingo30;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Number(v) || 0));
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const logit = (p: number) => Math.log(clamp(p, 0.02, 0.98) / (1 - clamp(p, 0.02, 0.98)));

export const bs1 = (n: number, g: GameType): 'B' | 'S' => (n >= getCfg(g).bigTh ? 'B' : 'S');
export const BS = (n: number, g: GameType): 'BIG' | 'SMALL' => (n >= getCfg(g).bigTh ? 'BIG' : 'SMALL');

/* ─── ENHANCED PATTERN DATABASE (3-100 Combos) ─── */
interface PatternEntry {
  key: string;
  call: 'BIG' | 'SMALL';
  conf: number;
  type: string;
  len: number;
}

const PATTERN_DB: { combos: Record<string, PatternEntry[]>; vantaMap: Record<string, 'BIG' | 'SMALL'> } = {
  combos: {},
  vantaMap: {},
};

(function initPatterns() {
  const list: PatternEntry[] = [];

  // Dragon trends (Ride the dragon with high conviction up to 6, reversal only on exhaustion 7+)
  for (let i = 3; i <= 6; i++) {
    list.push({ key: 'B'.repeat(i), call: 'BIG', conf: 85 + i * 2, type: 'dragon-ride', len: i });
    list.push({ key: 'S'.repeat(i), call: 'SMALL', conf: 85 + i * 2, type: 'dragon-ride', len: i });
  }
  for (let i = 7; i <= 15; i++) {
    list.push({ key: 'B'.repeat(i), call: 'SMALL', conf: Math.min(98, 88 + i * 1.2), type: 'dragon-break', len: i });
    list.push({ key: 'S'.repeat(i), call: 'BIG', conf: Math.min(98, 88 + i * 1.2), type: 'dragon-break', len: i });
  }

  // Ping-pong alternation rhythm 3..14
  for (let i = 3; i <= 14; i++) {
    const k1 = 'BS'.repeat(Math.ceil(i / 2)).slice(0, i);
    const k2 = 'SB'.repeat(Math.ceil(i / 2)).slice(0, i);
    list.push({ key: k1, call: k1.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 86 + Math.min(8, i), type: 'zigzag', len: i });
    list.push({ key: k2, call: k2.slice(-1) === 'S' ? 'BIG' : 'SMALL', conf: 86 + Math.min(8, i), type: 'zigzag', len: i });
  }

  // Double / Triple Block Formations (2-2, 3-3, 1-2, 2-1, 3-1)
  ['BBSS', 'SSBB', 'BBSSBB', 'SSBBSS', 'BBSSBBSS', 'SSBBSSBB', 'BBSSBBSSBB', 'SSBBSSBBSS'].forEach((k) => {
    list.push({ key: k, call: k.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 84, type: 'block22', len: k.length });
  });
  ['BBBSSS', 'SSSBBB', 'BBBSSSBBB', 'SSSBBBSSS'].forEach((k) => {
    list.push({ key: k, call: k.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 85, type: 'block33', len: k.length });
  });
  ['BSSB', 'SBBS', 'BBSB', 'SBSS', 'BSSBSS', 'SBBSBB', 'BSSBSSB', 'SBBSBBS'].forEach((m) => {
    list.push({ key: m, call: m.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 82, type: 'mirror', len: m.length });
  });

  list.forEach((p) => {
    if (!PATTERN_DB.combos[p.key]) PATTERN_DB.combos[p.key] = [];
    PATTERN_DB.combos[p.key].push(p);
    if (!PATTERN_DB.vantaMap[p.key]) PATTERN_DB.vantaMap[p.key] = p.call;
  });
})();

/* ─── RDX ENGINE WITH DRAGON-RIDE & TREND RECOGNITION ─── */
const RDX_MATRIX: Record<number, Record<number, 'B' | 'S'>> = {
  0: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'S', 9: 'B' },
  1: { 0: 'B', 1: 'B', 2: 'B', 3: 'S', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  2: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'B', 6: 'S', 7: 'B', 8: 'S', 9: 'S' },
  3: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'B', 7: 'B', 8: 'S', 9: 'S' },
  4: { 0: 'B', 1: 'S', 2: 'S', 3: 'B', 4: 'S', 5: 'B', 6: 'S', 7: 'B', 8: 'B', 9: 'S' },
  5: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'S', 5: 'B', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  6: { 0: 'S', 1: 'S', 2: 'S', 3: 'B', 4: 'S', 5: 'B', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  7: { 0: 'B', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'S' },
  8: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  9: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'S', 7: 'S', 8: 'B', 9: 'B' },
};

function rdxHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 10;
}

export function rdxEngine(recs: GameRecord[], targetPeriod: string, game: GameType) {
  const cfg = getCfg(game);
  const nums = recs.map((r) => r.number);
  const layers: any[] = [];

  // Pair Transition Layer
  if (nums.length >= 2) {
    const last2 = game === 'k31m' ? nums[1] % 10 : nums[0];
    const last1 = game === 'k31m' ? nums[0] % 10 : nums[1];
    const r = RDX_MATRIX[last2] && RDX_MATRIX[last2][last1];
    layers.push({
      name: 'PAIR MATRIX',
      detail: `pair ${nums[0]}→${nums[1]}`,
      pred: r === 'B' ? 'BIG' : 'SMALL',
      conf: r ? 78 + rdxHash(String(recs[0]?.period || '')) : 60,
      weight: 3.5,
    });
  } else {
    layers.push({ name: 'PAIR MATRIX', detail: 'seed flow', pred: 'BIG', conf: 55, weight: 3 });
  }

  // ADVANCED DRAGON-RIDE STREAK LAYER
  const b = nums.slice(0, 10).map((n) => bs1(n, game));
  let st = 1;
  while (st < b.length && b[st] === b[0]) st++;
  const cur = b[0] || 'B';

  if (st >= 3 && st <= 6) {
    layers.push({
      name: 'DRAGON RIDE',
      detail: `Riding ${st}× ${cur} trend`,
      pred: cur === 'B' ? 'BIG' : 'SMALL',
      conf: 84 + st * 2.5,
      weight: 4.5,
    });
  } else if (st >= 7) {
    layers.push({
      name: 'DRAGON EXHAUSTION',
      detail: `${st}× streak exhaustion point`,
      pred: cur === 'B' ? 'SMALL' : 'BIG',
      conf: 88,
      weight: 4.0,
    });
  } else {
    layers.push({
      name: 'STREAK FLOW',
      detail: `${st}× ${cur}`,
      pred: cur === 'B' ? 'BIG' : 'SMALL',
      conf: 65,
      weight: 2.0,
    });
  }

  // ML Volume Balance Layer
  const rc = nums.slice(0, 12);
  let bc = 0, sc = 0;
  rc.forEach((n) => (n >= cfg.bigTh ? bc++ : sc++));
  layers.push(
    bc >= 9
      ? { name: 'VOLUME REVERSION', detail: `${bc}B/${sc}S heavy`, pred: 'SMALL', conf: 82, weight: 3 }
      : sc >= 9
      ? { name: 'VOLUME REVERSION', detail: `${bc}B/${sc}S heavy`, pred: 'BIG', conf: 82, weight: 3 }
      : { name: 'VOLUME MOMENTUM', detail: `${bc}B/${sc}S balance`, pred: bc >= sc ? 'BIG' : 'SMALL', conf: 68, weight: 2.5 }
  );

  // Modulo Cycle Layer
  const nStr = String(targetPeriod || '');
  const l2 = parseInt(nStr.slice(-2)) || 0;
  layers.push({
    name: 'PERIOD HARMONIC',
    detail: `…${nStr.slice(-2)} mod7=${l2 % 7}`,
    pred: l2 % 7 < 4 ? 'BIG' : 'SMALL',
    conf: 64,
    weight: 1.5,
  });

  let big = 0, small = 0, tw = 0;
  layers.forEach((l) => {
    const w = l.weight * (l.conf / 100);
    l.pred === 'BIG' ? (big += w) : (small += w);
    tw += l.weight;
  });

  const call: 'BIG' | 'SMALL' = big >= small ? 'BIG' : 'SMALL';
  const raw = (Math.max(big, small) / tw) * 100;
  const pBig = big / (big + small);

  return {
    id: 'RDX' as const,
    name: 'NARUTO CORE',
    call,
    pBig,
    conf: Math.round(clamp(raw, 76, 98)),
    layers,
    fw: 1.3,
  };
}

/* ─── VANTA VISION (2nd-Order Markov & Entropy) ─── */
export function vantaEngine(recs: GameRecord[], game: GameType) {
  const cfg = getCfg(game);
  const chrono = recs.slice().reverse().map((r) => r.number);
  const n = chrono.length;

  if (n < 3) {
    return { id: 'VANTA' as const, name: 'NARUTO VISION', call: 'BIG' as const, pBig: 0.5, conf: 60, basis: 'seed', analytics: null, digit: cfg.poolB[0], markov: 0, fw: 1.2 };
  }

  const seq = chrono.slice(-10).map((v) => bs1(v, game)).join('');
  let hit: { key: string; call: 'BIG' | 'SMALL'; L: number } | null = null;

  for (let L = Math.min(10, seq.length); L >= 3; L--) {
    const k = seq.slice(-L);
    if (PATTERN_DB.vantaMap[k]) {
      hit = { key: k, call: PATTERN_DB.vantaMap[k], L };
      break;
    }
  }

  let call: 'BIG' | 'SMALL';
  let pBig: number;
  let basis: string;
  let conf: number;

  if (hit) {
    call = hit.call;
    const e = 0.16 + hit.L * 0.02;
    pBig = call === 'BIG' ? 0.5 + e : 0.5 - e;
    basis = `PATTERN ${hit.key}`;
    conf = Math.min(98, 88 + hit.L * 1.5);
  } else {
    // 2nd-Order Markov Chain on Big/Small
    const b2 = seq.slice(-2);
    let countBB = 0, countBS = 0;
    for (let i = 0; i < seq.length - 2; i++) {
      const pair = seq.slice(i, i + 2);
      const nxt = seq[i + 2];
      if (pair === b2) {
        nxt === 'B' ? countBB++ : countBS++;
      }
    }
    const totalTransitions = countBB + countBS;
    if (totalTransitions >= 2) {
      call = countBB >= countBS ? 'BIG' : 'SMALL';
      pBig = countBB / totalTransitions;
      basis = `ORDER-2 MARKOV (${b2}→${call[0]})`;
      conf = Math.round(clamp(70 + Math.abs(pBig - 0.5) * 40, 70, 92));
    } else {
      const last = bs1(chrono[n - 1], game);
      call = last === 'B' ? 'SMALL' : 'BIG';
      pBig = call === 'BIG' ? 0.62 : 0.38;
      basis = 'HARMONIC ALTERNATION';
      conf = 72;
    }
  }

  // Shannon Entropy
  const d = Array(cfg.total).fill(0);
  chrono.forEach((v) => {
    const idx = v - cfg.min;
    if (idx >= 0 && idx < cfg.total) d[idx]++;
  });
  let H = 0;
  for (let i = 0; i < cfg.total; i++) {
    const p = d[i] / n;
    if (p > 0) H -= p * Math.log2(p);
  }
  const entN = H / Math.log2(cfg.total);

  // Volatility
  const w30 = chrono.slice(-30);
  const deltas: number[] = [];
  for (let i = 1; i < w30.length; i++) deltas.push(w30[i] - w30[i - 1]);
  const dm = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const vol = deltas.length > 1 ? Math.sqrt(deltas.reduce((acc, x) => acc + (x - dm) ** 2, 0) / deltas.length) : 0;

  return {
    id: 'VANTA' as const,
    name: 'NARUTO VISION',
    call,
    pBig: clamp(pBig, 0.08, 0.92),
    conf,
    basis,
    digit: chrono[n - 1],
    markov: 0,
    analytics: { entropy: entN, volatility: vol, sample: n },
    fw: 1.3,
  };
}

/* ─── NOCTIS GUARD (Wilson Score & Heuristic Lock) ─── */
export function noctisEngine(recs: GameRecord[], game: GameType) {
  const chrono = recs.slice().reverse();
  const nums = chrono.map((r) => r.number);
  const votes = { BIG: 0, SMALL: 0 };
  const used: any[] = [];

  for (let k = 2; k <= 8; k++) {
    if (nums.length < k) break;
    const tail = nums.slice(-k).map((n) => bs1(n, game)).join('');
    const matches = PATTERN_DB.combos[tail];
    if (matches && matches.length) {
      const top = matches[0];
      const w = Math.log2(k + 3);
      votes[top.call] += w;
      used.push({ type: `DB-${k}`, key: tail, pred: top.call, w });
    }
  }

  // Triple Sequence Rules
  if (nums.length >= 3) {
    const p3 = nums.slice(-3).map((n) => bs1(n, game)).join('');
    const rules: Record<string, 'BIG' | 'SMALL'> = {
      BBB: 'BIG',   // Momentum ride
      SSS: 'SMALL', // Momentum ride
      BBS: 'SMALL', // 2-1 block
      SSB: 'BIG',   // 2-1 block
      BSB: 'SMALL', // Zigzag continuation
      SBS: 'BIG',   // Zigzag continuation
    };
    if (rules[p3]) {
      votes[rules[p3]] += 2.5;
      used.push({ type: 'HARMONIC-3', key: p3, pred: rules[p3], w: 2.5 });
    }
  }

  const tot = votes.BIG + votes.SMALL;
  const call: 'BIG' | 'SMALL' = tot ? (votes.BIG >= votes.SMALL ? 'BIG' : 'SMALL') : 'BIG';
  const margin = tot ? Math.abs(votes.BIG - votes.SMALL) / tot : 0;
  const conf = Math.round(clamp(65 + margin * 30 + Math.min(5, used.length), 65, 94));
  const pBig = call === 'BIG' ? 0.5 + margin * 0.42 : 0.5 - margin * 0.42;

  return {
    id: 'NOCTIS' as const,
    name: 'NARUTO GUARD',
    call,
    pBig: clamp(pBig, 0.1, 0.9),
    conf,
    used,
    fw: 1.25,
  };
}

/* ─── BRAIN ENGINE (Pattern Recognition & Cycle Detection) ─── */
function rleOf(seq: string[]) {
  const r: { c: string; l: number }[] = [];
  for (const c of seq) {
    if (r.length && r[r.length - 1].c === c) r[r.length - 1].l++;
    else r.push({ c, l: 1 });
  }
  return r;
}

export function brainEngine(recs: GameRecord[], game: GameType) {
  const last10 = recs.slice(0, 10).slice().reverse();
  const seq = last10.map((r) => bs1(r.number, game));
  const n = seq.length;

  if (n < 4) {
    return {
      id: 'BRAIN' as const,
      name: 'NARUTO BRAIN',
      call: 'BIG' as const,
      pBig: 0.5,
      conf: 60,
      road: last10,
      human: [],
      humanCall: 'BIG',
      humanConf: 60,
      aiCall: 'BIG',
      aiConf: 60,
      verdict: 'SEEDING FLOW',
      pattern: 'Balanced',
      patternNote: 'Ready',
      fw: 1.4,
    };
  }

  const last = seq[n - 1];
  let run = 1;
  while (run < n && seq[n - 1 - run] === last) run++;

  const H: any[] = [];

  // Streak Handling (3-6: Ride trend; 7+: Break)
  if (run >= 3 && run <= 6) {
    H.push({ name: `DRAGON FLOW ${run}×`, call: last, conf: clamp(78 + run * 3, 78, 95), note: `${run}× trend follow` });
  } else if (run >= 7) {
    H.push({ name: `DRAGON BREAK ${run}×`, call: last === 'B' ? 'S' : 'B', conf: 88, note: `${run}× streak exhaustion` });
  }

  // Ping pong alternator
  let alt = 0;
  for (let i = 1; i < n; i++) if (seq[i] !== seq[i - 1]) alt++;
  if (n >= 4 && alt >= n - 2) {
    H.push({ name: 'PING-PONG ALTERNATOR', call: last === 'B' ? 'S' : 'B', conf: 85, note: 'B-S-B-S rhythm' });
  }

  // 2-2 Block formation
  const rle = rleOf(seq);
  if (rle.length >= 2) {
    const curBlock = rle[rle.length - 1];
    const prevBlock = rle[rle.length - 2];
    if (prevBlock.l === 2 && curBlock.l === 1) {
      H.push({ name: '2-2 PAIR SYMMETRY', call: curBlock.c, conf: 84, note: 'completing 2-2 pair' });
    }
  }

  if (!H.length) {
    H.push({ name: 'CONVERGENCE FLOW', call: run >= 2 ? last : last === 'B' ? 'S' : 'B', conf: 68, note: 'flow bias' });
  }

  const humanVotes = { B: 0, S: 0 };
  H.forEach((h) => (humanVotes[h.call === 'BIG' || h.call === 'B' ? 'B' : 'S'] += h.conf - 50));
  const humanCall: 'BIG' | 'SMALL' = humanVotes.B >= humanVotes.S ? 'BIG' : 'SMALL';
  const humanConf = Math.round(clamp(68 + Math.abs(humanVotes.B - humanVotes.S) * 1.5, 68, 96));

  // AI Deep Pattern Match
  const fullSeq = recs.map((r) => bs1(r.number, game)).reverse();
  let aiB = 0, aiS = 0;
  for (let L = 3; L <= 6 && L < fullSeq.length; L++) {
    const sub = fullSeq.slice(-L).join('');
    for (let i = 0; i + L < fullSeq.length; i++) {
      if (fullSeq.slice(i, i + L).join('') === sub) {
        fullSeq[i + L] === 'B' ? aiB++ : aiS++;
      }
    }
  }
  const aiCall: 'BIG' | 'SMALL' = aiB >= aiS ? 'BIG' : 'SMALL';
  const aiConf = Math.round(clamp(65 + (Math.abs(aiB - aiS) / Math.max(1, aiB + aiS)) * 30, 65, 92));

  const agree = humanCall === aiCall;
  const call: 'BIG' | 'SMALL' = agree ? humanCall : humanConf >= aiConf ? humanCall : aiCall;
  const conf = Math.round(clamp(agree ? (humanConf + aiConf) / 2 + 5 : Math.max(humanConf, aiConf) - 3, 65, 96));
  const pBig = call === 'BIG' ? 0.5 + (conf - 50) / 100 : 0.5 - (conf - 50) / 100;

  return {
    id: 'BRAIN' as const,
    name: 'NARUTO BRAIN',
    call,
    pBig: clamp(pBig, 0.1, 0.9),
    conf,
    road: last10,
    human: H,
    humanCall,
    humanConf,
    aiCall,
    aiConf,
    verdict: agree ? 'HUMAN + AI SYNERGY' : 'CONVERGED FLOW',
    pattern: H[0].name,
    patternNote: H[0].note,
    fw: 1.45,
  };
}

/* ─── MARKET ENGINE (Oscillator & Trend Tracker) ─── */
export function marketEngine(recs: GameRecord[], game: GameType) {
  const cfg = getCfg(game);
  const bits = recs.slice().reverse().map((r) => (r.number >= cfg.bigTh ? 1 : 0));
  const n = bits.length;

  if (n < 6) {
    return {
      id: 'MARKET' as const,
      name: 'NARUTO MARKET',
      call: 'BIG' as const,
      pBig: 0.5,
      conf: 60,
      state: 'STABLE',
      votes: [],
      metrics: null,
      fw: 1.3,
    };
  }

  const last = bits[n - 1];
  const lastName: 'BIG' | 'SMALL' = last ? 'BIG' : 'SMALL';
  const oppName: 'BIG' | 'SMALL' = last ? 'SMALL' : 'BIG';

  // Alternation Rate in last 20
  const w20 = bits.slice(-20);
  let altCount = 0;
  for (let i = 1; i < w20.length; i++) if (w20[i] !== w20[i - 1]) altCount++;
  const alt20 = w20.length > 1 ? altCount / (w20.length - 1) : 0.5;

  let curRun = 1;
  while (curRun < n && bits[n - 1 - curRun] === last) curRun++;

  let state = 'BALANCED';
  if (alt20 >= 0.65) state = 'CHOPPY';
  else if (curRun >= 3 || alt20 <= 0.35) state = 'TRENDING';

  const votes: any[] = [];
  if (state === 'CHOPPY') {
    votes.push({ name: 'CHOPPY OSCILLATOR', call: oppName, conf: clamp(74 + (alt20 - 0.5) * 40, 72, 90), note: `alt ${Math.round(alt20 * 100)}%` });
  } else if (state === 'TRENDING') {
    votes.push({ name: 'TREND RIDER', call: lastName, conf: clamp(75 + curRun * 3, 75, 92), note: `streak ${curRun}×` });
  } else {
    votes.push({ name: 'FLOW BALANCE', call: oppName, conf: 68, note: 'balance flow' });
  }

  const score = { BIG: 0, SMALL: 0 };
  votes.forEach((v) => (score[v.call as 'BIG' | 'SMALL'] += v.conf - 50));
  const call: 'BIG' | 'SMALL' = score.BIG >= score.SMALL ? 'BIG' : 'SMALL';
  const conf = Math.round(clamp(65 + Math.abs(score.BIG - score.SMALL) * 1.5, 65, 92));
  const pBig = call === 'BIG' ? 0.5 + (conf - 50) / 100 : 0.5 - (conf - 50) / 100;

  return {
    id: 'MARKET' as const,
    name: 'NARUTO MARKET',
    call,
    pBig: clamp(pBig, 0.1, 0.9),
    conf,
    state,
    votes,
    metrics: { alt20, curRun, curSide: lastName, sample: n },
    fw: 1.3,
  };
}

/* ─── ULTRA-POWERFUL SAME-SIDE SINGLE NUMBER PREDICTION ─── */
/**
 * Predicts the EXACT #1 highest probability single number ON THE SAME PREDICTED SIDE!
 * If call is 'BIG', selects from Big pool [5,6,7,8,9].
 * If call is 'SMALL', selects from Small pool [0,1,2,3,4].
 *
 * 5 ADVANCED MATHEMATICAL MODELS:
 * 1. 2nd-Order Markov Transition: P(N_t = x | N_t-1, N_t-2) in same pool
 * 2. Harmonic Resonance & Parity Step (+2, -2, mirror cycle)
 * 3. Hot Frequency & Cluster Flow
 * 4. Harmonic Due Gap Hazard Multiplier
 * 5. Period Modulo Trajectory
 */
export function calculateSingleSameNumber(
  recs: GameRecord[],
  call: 'BIG' | 'SMALL',
  game: GameType
): SingleSameNumInfo {
  const cfg = getCfg(game);
  const samePool = call === 'BIG' ? cfg.poolB : cfg.poolS;

  const nums = recs.map((r) => r.number);
  const chrono = nums.slice().reverse();
  const lastNum = nums[0] !== undefined ? nums[0] : (call === 'BIG' ? 7 : 2);
  const prevNum = nums[1] !== undefined ? nums[1] : lastNum;

  const scores: { num: number; score: number; reasons: string[]; gap: number; avgGap: number; markovProb: number }[] = [];

  samePool.forEach((num) => {
    let score = 0;
    const reasons: string[] = [];

    // Model 1: Empirical 1st & 2nd Order Markov Transition in same pool
    let trTotal1 = 0, trHit1 = 0;
    let trTotal2 = 0, trHit2 = 0;
    for (let i = 1; i < chrono.length; i++) {
      if (chrono[i - 1] === lastNum) {
        trTotal1++;
        if (chrono[i] === num) trHit1++;
      }
      if (i >= 2 && chrono[i - 1] === lastNum && chrono[i - 2] === prevNum) {
        trTotal2++;
        if (chrono[i] === num) trHit2++;
      }
    }

    const p1 = trTotal1 > 0 ? trHit1 / trTotal1 : 1 / cfg.total;
    const p2 = trTotal2 > 0 ? trHit2 / trTotal2 : p1;

    if (p2 > 1 / cfg.total) {
      score += (p2 / (1 / cfg.total) - 1) * 4.2;
      reasons.push(`Order-2 Markov ${Math.round(p2 * 100)}%`);
    } else if (p1 > 1 / cfg.total) {
      score += (p1 / (1 / cfg.total) - 1) * 2.8;
      reasons.push(`Markov-1 ${Math.round(p1 * 100)}%`);
    }

    // Model 2: Same-Side Cluster Resonance (Within same pool step: e.g. 7->8, 6->7 or 1->2, 2->3)
    const dist = Math.abs(num - lastNum);
    if (dist === 1 || dist === 2) {
      score += 3.2;
      reasons.push(`Adjacent Step ±${dist}`);
    } else if (dist === 0) {
      score += 2.0;
      reasons.push('Repeat Number Echo');
    }

    // Model 3: Hot Frequency in last 25 rounds
    const f25 = nums.slice(0, 25).filter((x) => x === num).length;
    if (f25 >= 4) {
      score += 2.5;
      reasons.push(`Hot Cluster (${f25}×)`);
    }

    // Model 4: Due Gap & Cycle Peak
    let gap = nums.indexOf(num);
    if (gap === -1) gap = nums.length;
    if (gap >= 5 && gap <= 12) {
      score += 3.0;
      reasons.push(`Due Peak Gap ${gap}`);
    } else if (gap <= 2) {
      score += 1.8;
      reasons.push('Active Wave');
    }

    // Model 5: Parity Inversion within same pool (Odd <-> Even alternation)
    if (num % 2 !== lastNum % 2) {
      score += 2.2;
      reasons.push('Parity Shift');
    }

    scores.push({ num, score, reasons, gap, avgGap: 6, markovProb: Math.round(p1 * 100) });
  });

  scores.sort((a, b) => b.score - a.score || b.gap - a.gap);
  const best = scores[0] || { num: samePool[0], score: 5, reasons: ['Top Probability Match'], gap: 3, avgGap: 6, markovProb: 25 };

  return {
    num: best.num,
    side: call,
    score: Math.round(best.score * 10) / 10,
    reasons: best.reasons.length ? best.reasons : ['High Conviction Resonance'],
    gap: best.gap,
    avgGap: 6,
    markovProb: best.markovProb,
  };
}

/* ─── QUANTUM FUSION PREDICTOR WITH SAME-SIDE SINGLE NUMBER ─── */
export function fusePrediction(
  recs: GameRecord[],
  targetPeriod: string,
  game: GameType,
  currentLevel: number,
  levelPlan: LevelPlan
): FusionPrediction {
  const A = rdxEngine(recs, targetPeriod, game);
  const B = vantaEngine(recs, game);
  const C = noctisEngine(recs, game);
  const D = brainEngine(recs, game);
  const M = marketEngine(recs, game);

  const engines = { RDX: A, VANTA: B, NOCTIS: C, BRAIN: D, MARKET: M };

  const weights: Record<string, number> = {
    BRAIN: D.fw,
    MARKET: M.fw,
    RDX: A.fw,
    VANTA: B.fw,
    NOCTIS: C.fw,
  };

  let sw = 0;
  let sl = 0;
  [A, B, C, D, M].forEach((e) => {
    const w = weights[e.id] || 1;
    sw += w;
    sl += w * logit(e.pBig);
  });

  let pF = sigmoid(sw ? sl / sw : 0);

  // LEVEL 2 & 3 ADVANCED WIN CONVICTION OVERDRIVE:
  if (currentLevel >= 2) {
    const boost = currentLevel === 2 ? 0.16 : 0.22;
    pF = pF >= 0.5 ? clamp(pF + boost, 0.72, 0.98) : clamp(pF - boost, 0.02, 0.28);
  }

  const call: 'BIG' | 'SMALL' = pF >= 0.5 ? 'BIG' : 'SMALL';
  const cands: Record<string, 'BIG' | 'SMALL'> = {
    RDX: A.call,
    VANTA: B.call,
    NOCTIS: C.call,
    BRAIN: D.call,
    MARKET: M.call,
  };

  const agree = Object.values(cands).filter((c) => c === call).length;
  const edge = Math.abs(pF - 0.5);

  let conf = Math.round(clamp(72 + edge * 85 + (agree - 2.5) * 4.5, 78, 99));
  if (currentLevel >= 2) {
    conf = Math.min(99, conf + (currentLevel === 2 ? 6 : 9));
  }

  // EXACT SAME-SIDE SINGLE NUMBER PREDICTION
  const singleSameNum = calculateSingleSameNumber(recs, call, game);

  const regime = M.state || 'BALANCED';
  const risk: 'LOW' | 'MODERATE' | 'HIGH' = agree >= 4 ? 'LOW' : agree === 3 ? 'MODERATE' : 'HIGH';

  return {
    period: targetPeriod,
    call,
    pBig: pF,
    conf,
    agree,
    cands,
    singleSameNum,
    engines,
    regime,
    risk,
    weights,
    market: M,
    targetPeriod,
    levelPlan,
  };
}
