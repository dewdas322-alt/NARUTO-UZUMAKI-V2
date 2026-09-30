import { GameConfig, GameRecord, GameType, SingleOppositeNumInfo, FusionPrediction, LevelPlan } from '../types';

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

/* ─── PATTERN DATABASE ─── */
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
  // Dragon patterns 3..15
  for (let i = 3; i <= 15; i++) {
    list.push({ key: 'B'.repeat(i), call: 'SMALL', conf: Math.min(96, 72 + i * 1.2), type: 'dragon', len: i });
    list.push({ key: 'S'.repeat(i), call: 'BIG', conf: Math.min(96, 72 + i * 1.2), type: 'dragon', len: i });
  }
  // Zigzag 4..12
  for (let i = 4; i <= 12; i++) {
    const k1 = 'BS'.repeat(Math.ceil(i / 2)).slice(0, i);
    const k2 = 'SB'.repeat(Math.ceil(i / 2)).slice(0, i);
    list.push({ key: k1, call: k1.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 64, type: 'zigzag', len: i });
    list.push({ key: k2, call: k2.slice(-1) === 'S' ? 'BIG' : 'SMALL', conf: 64, type: 'zigzag', len: i });
  }
  // Mirror & block formations
  ['BBSSBB', 'SSBSSB', 'SSSBSSS', 'BBBSSSBBB', 'SSSBBSSS', 'SSSSBBBBSSSS', 'BBBBSSSSBBBB', 'BSSB', 'SBBS', 'BBSB', 'SBSS', 'BBSSBBSS', 'SSBBSSBB'].forEach((m) => {
    list.push({ key: m, call: m.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 62, type: 'mirror', len: m.length });
  });
  ['BBSS', 'SSBB', 'BBSSBB', 'SSBBSS', 'BBSSBBSS', 'SSBBSSBB', 'BBSSBBSSBB', 'SSBBSSBBSS'].forEach((k) => {
    list.push({ key: k, call: k.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 60, type: 'block22', len: k.length });
  });
  ['BBBSSS', 'SSSBBB', 'BBBSSSBBB', 'SSSBBBSSS'].forEach((k) => {
    list.push({ key: k, call: k.slice(-1) === 'B' ? 'SMALL' : 'BIG', conf: 60, type: 'block33', len: k.length });
  });

  list.forEach((p) => {
    if (!PATTERN_DB.combos[p.key]) PATTERN_DB.combos[p.key] = [];
    PATTERN_DB.combos[p.key].push(p);
    if (!PATTERN_DB.vantaMap[p.key]) PATTERN_DB.vantaMap[p.key] = p.call;
  });
})();

/* ─── RDX ENGINE ─── */
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

  if (nums.length >= 2) {
    const last2 = game === 'k31m' ? nums[1] % 10 : nums[0];
    const last1 = game === 'k31m' ? nums[0] % 10 : nums[1];
    const r = RDX_MATRIX[last2] && RDX_MATRIX[last2][last1];
    layers.push({
      name: 'PATTERN MATRIX',
      detail: `pair ${nums[0]}→${nums[1]}`,
      pred: r === 'B' ? 'BIG' : 'SMALL',
      conf: r ? 72 + rdxHash(String(recs[0]?.period || '')) : 52,
      weight: 3,
    });
  } else {
    layers.push({ name: 'PATTERN MATRIX', detail: 'insufficient data', pred: 'BIG', conf: 50, weight: 3 });
  }

  // Streak layer
  const b = nums.slice(0, 8).map((n) => bs1(n, game));
  let st = 1;
  while (st < b.length && b[st] === b[0]) st++;
  const cur = b[0] || 'B';
  layers.push(
    st >= 3
      ? { name: 'STREAK BREAK', detail: `${st}× ${cur}`, pred: cur === 'B' ? 'SMALL' : 'BIG', conf: 65 + Math.min(st * 4, 20), weight: 2.5 }
      : { name: 'STREAK FOLLOW', detail: `${st}× ${cur}`, pred: cur === 'B' ? 'BIG' : 'SMALL', conf: 58 + st * 4, weight: 2.5 }
  );

  // ML Balance layer
  const rc = nums.slice(0, 10);
  let bc = 0, sc = 0;
  rc.forEach((n) => (n >= cfg.bigTh ? bc++ : sc++));
  layers.push(
    bc >= 7
      ? { name: 'ML BALANCE', detail: `${bc}B/${sc}S reversion`, pred: 'SMALL', conf: 60 + bc * 3, weight: 2 }
      : sc >= 7
      ? { name: 'ML BALANCE', detail: `${bc}B/${sc}S reversion`, pred: 'BIG', conf: 60 + sc * 3, weight: 2 }
      : { name: 'ML BALANCE', detail: `${bc}B/${sc}S majority`, pred: bc >= sc ? 'BIG' : 'SMALL', conf: 55 + Math.abs(bc - sc) * 3, weight: 2 }
  );

  // Period hash layer
  const nStr = String(targetPeriod || '');
  const l2 = parseInt(nStr.slice(-2)) || 0;
  layers.push({
    name: 'PERIOD HASH',
    detail: `…${nStr.slice(-2)} mod7=${l2 % 7}`,
    pred: l2 % 7 < 4 ? 'BIG' : 'SMALL',
    conf: 56,
    weight: 1,
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
    conf: Math.round(clamp(raw, 70, 96)),
    layers,
    fw: 1,
  };
}

/* ─── VANTA VISION ENGINE ─── */
export function vantaEngine(recs: GameRecord[], game: GameType) {
  const cfg = getCfg(game);
  const chrono = recs.slice().reverse().map((r) => r.number);
  const n = chrono.length;

  if (n < 3) {
    return { id: 'VANTA' as const, name: 'NARUTO VISION', call: 'BIG' as const, pBig: 0.5, conf: 50, basis: 'no-data', analytics: null, digit: cfg.poolB[0], markov: 0, fw: 1 };
  }

  const seq = chrono.slice(-8).map((v) => bs1(v, game)).join('');
  let hit: { key: string; call: 'BIG' | 'SMALL'; L: number } | null = null;

  for (let L = Math.min(8, seq.length); L >= 3; L--) {
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
    const e = 0.1 + hit.L * 0.015;
    pBig = call === 'BIG' ? 0.5 + e : 0.5 - e;
    basis = `PATTERN ${hit.key}`;
    conf = Math.min(96, 86 + hit.L);
  } else {
    const last = bs1(chrono[n - 1], game);
    call = last === 'B' ? 'SMALL' : 'BIG';
    pBig = call === 'BIG' ? 0.56 : 0.44;
    basis = 'ALTERNATION';
    conf = 60;
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

  // Volatility & Momentum
  const w30 = chrono.slice(-30);
  const deltas: number[] = [];
  for (let i = 1; i < w30.length; i++) deltas.push(w30[i] - w30[i - 1]);
  const dm = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const vol = deltas.length > 1 ? Math.sqrt(deltas.reduce((acc, x) => acc + (x - dm) ** 2, 0) / deltas.length) : 0;

  const bigR = w30.filter((v) => v >= cfg.bigTh).length / (w30.length || 1);
  const tilt = (bigR - 0.5) * -0.12;
  pBig = clamp(pBig + tilt, 0.2, 0.8);

  // Markov transition
  const last = chrono[n - 1];
  let mk = 0;
  let best = -1;
  const tr = Array.from({ length: cfg.total }, () => Array(cfg.total).fill(0));
  for (let i = 1; i < n; i++) {
    const a = chrono[i - 1] - cfg.min;
    const b = chrono[i] - cfg.min;
    if (a >= 0 && a < cfg.total && b >= 0 && b < cfg.total) tr[a][b]++;
  }
  const li = last - cfg.min;
  if (li >= 0 && li < cfg.total) {
    for (let i = 0; i < cfg.total; i++) {
      if (tr[li][i] > best) {
        best = tr[li][i];
        mk = i + cfg.min;
      }
    }
  }

  return {
    id: 'VANTA' as const,
    name: 'NARUTO VISION',
    call: pBig >= 0.5 ? ('BIG' as const) : ('SMALL' as const),
    pBig,
    conf,
    basis,
    digit: mk,
    markov: mk,
    analytics: { entropy: entN, volatility: vol, bigRate: bigR, sample: n },
    fw: 1,
  };
}

/* ─── NOCTIS GUARD ENGINE ─── */
function wilson(h: number, n: number, z = 1.96) {
  if (!n) return 0;
  const p = h / n;
  const d = 1 + (z * z) / n;
  return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / d;
}

export function noctisEngine(recs: GameRecord[], game: GameType) {
  const cfg = getCfg(game);
  const chrono = recs.slice().reverse();
  const nums = chrono.map((r) => r.number);
  const votes = { BIG: 0, SMALL: 0 };
  const used: any[] = [];

  // Tail evaluations
  for (let k = 2; k <= 8; k++) {
    if (nums.length < k) break;
    const tail = nums.slice(-k).map((n) => bs1(n, game)).join('');
    const matches = PATTERN_DB.combos[tail];
    if (matches && matches.length) {
      const top = matches[0];
      const w = Math.log2(k + 2);
      votes[top.call] += w;
      used.push({ type: `BS-${k}`, key: tail, pred: top.call, w });
    }
  }

  // Heuristic rulebook
  if (recs.length >= 3) {
    const p3 = nums.slice(-3).map((n) => bs1(n, game)).join('');
    const rules: Record<string, 'BIG' | 'SMALL'> = {
      BBB: 'SMALL',
      SSS: 'BIG',
      BBS: 'BIG',
      SSB: 'SMALL',
      BSB: 'SMALL',
      SBS: 'BIG',
    };
    if (rules[p3]) {
      votes[rules[p3]] += 1.8;
      used.push({ type: 'HEURISTIC-3', key: p3, pred: rules[p3], w: 1.8 });
    }
  }

  const tot = votes.BIG + votes.SMALL;
  const call: 'BIG' | 'SMALL' = tot ? (votes.BIG >= votes.SMALL ? 'BIG' : 'SMALL') : 'BIG';
  const margin = tot ? Math.abs(votes.BIG - votes.SMALL) / tot : 0;
  const conf = Math.round(clamp(55 + margin * 28 + Math.min(6, used.length), 54, 82));
  const pBig = call === 'BIG' ? 0.5 + margin * 0.35 : 0.5 - margin * 0.35;

  return {
    id: 'NOCTIS' as const,
    name: 'NARUTO GUARD',
    call,
    pBig: clamp(pBig, 0.15, 0.85),
    conf,
    used,
    fw: 1,
  };
}

/* ─── BRAIN ENGINE ─── */
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
      conf: 50,
      road: last10,
      human: [],
      humanCall: 'BIG',
      humanConf: 50,
      aiCall: 'BIG',
      aiConf: 50,
      verdict: 'INSUFFICIENT DATA',
      pattern: '—',
      patternNote: 'Awaiting more rounds',
      fw: 1.2,
    };
  }

  const last = seq[n - 1];
  let run = 1;
  while (run < n && seq[n - 1 - run] === last) run++;

  const H: any[] = [];
  if (run >= 4) {
    H.push({ name: `DRAGON ${run}×`, call: last === 'B' ? 'SMALL' : 'BIG', conf: clamp(62 + run * 2, 60, 85), note: `${run}× streak reversal` });
  } else if (run === 3) {
    H.push({ name: '3-RUN MOMENTUM', call: last, conf: 58, note: '3-streak follow' });
  }

  // Ping pong test
  let alt = 0;
  for (let i = 1; i < n; i++) if (seq[i] !== seq[i - 1]) alt++;
  if (n >= 5 && alt >= n - 2) {
    H.push({ name: 'PING-PONG ALTERNATION', call: last === 'B' ? 'S' : 'B', conf: 68, note: 'B-S-B-S rhythm' });
  }

  // Block 2-2 / 3-3 formations
  const rle = rleOf(seq);
  if (rle.length >= 2) {
    const curBlock = rle[rle.length - 1];
    const prevBlock = rle[rle.length - 2];
    if (prevBlock.l === 2 && curBlock.l === 1) {
      H.push({ name: '2-2 FORMATION', call: curBlock.c, conf: 64, note: 'completing 2-2 pair' });
    } else if (prevBlock.l === 2 && curBlock.l === 2) {
      H.push({ name: '2-2 FORMATION BREAK', call: curBlock.c === 'B' ? 'S' : 'B', conf: 65, note: 'pair shift' });
    }
  }

  if (!H.length) {
    H.push({ name: 'NEURAL CONVERGENCE', call: run >= 2 ? (last === 'B' ? 'S' : 'B') : last, conf: 54, note: 'mixed flow' });
  }

  const humanVotes = { B: 0, S: 0 };
  H.forEach((h) => (humanVotes[h.call === 'BIG' || h.call === 'B' ? 'B' : 'S'] += h.conf - 50));
  const humanCall: 'BIG' | 'SMALL' = humanVotes.B >= humanVotes.S ? 'BIG' : 'SMALL';
  const humanConf = Math.round(clamp(54 + Math.abs(humanVotes.B - humanVotes.S) * 1.5, 52, 85));

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
  const aiConf = Math.round(clamp(52 + (Math.abs(aiB - aiS) / Math.max(1, aiB + aiS)) * 25, 50, 80));

  const agree = humanCall === aiCall;
  const call: 'BIG' | 'SMALL' = agree ? humanCall : humanConf >= aiConf ? humanCall : aiCall;
  const conf = Math.round(clamp(agree ? (humanConf + aiConf) / 2 + 6 : Math.max(humanConf, aiConf) - 4, 52, 92));
  const pBig = call === 'BIG' ? 0.5 + (conf - 50) / 100 : 0.5 - (conf - 50) / 100;

  return {
    id: 'BRAIN' as const,
    name: 'NARUTO BRAIN',
    call,
    pBig: clamp(pBig, 0.15, 0.85),
    conf,
    road: last10,
    human: H,
    humanCall,
    humanConf,
    aiCall,
    aiConf,
    verdict: agree ? 'HUMAN + AI FULL CONVERGENCE' : 'WEIGHTED NEURAL RESOLUTION',
    pattern: H[0].name,
    patternNote: H[0].note,
    fw: 1.25,
  };
}

/* ─── MARKET ENGINE ─── */
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
      conf: 50,
      state: 'STABILIZING',
      votes: [],
      metrics: null,
      fw: 1.2,
    };
  }

  const last = bits[n - 1];
  const lastName: 'BIG' | 'SMALL' = last ? 'BIG' : 'SMALL';
  const oppName: 'BIG' | 'SMALL' = last ? 'SMALL' : 'BIG';

  // Alt rate in last 20
  const w20 = bits.slice(-20);
  let altCount = 0;
  for (let i = 1; i < w20.length; i++) if (w20[i] !== w20[i - 1]) altCount++;
  const alt20 = w20.length > 1 ? altCount / (w20.length - 1) : 0.5;

  let curRun = 1;
  while (curRun < n && bits[n - 1 - curRun] === last) curRun++;

  // State detection
  let state = 'BALANCED';
  if (alt20 >= 0.65) state = 'CHOPPY';
  else if (curRun >= 3 || alt20 <= 0.35) state = 'TRENDING';
  else if (Math.abs(alt20 - 0.5) < 0.1) state = 'STABLE';

  const votes: any[] = [];
  if (state === 'CHOPPY') {
    votes.push({ name: 'CHOPPY OSCILLATOR', call: oppName, conf: clamp(58 + (alt20 - 0.5) * 40, 56, 75), note: `alt ${Math.round(alt20 * 100)}%` });
  } else if (state === 'TRENDING') {
    votes.push({ name: 'TREND RIDER', call: lastName, conf: clamp(60 + curRun * 3, 58, 80), note: `streak ${curRun}×` });
  } else {
    votes.push({ name: 'MEAN REVERSION', call: oppName, conf: 55, note: 'balance flow' });
  }

  // Missing side count
  let missB = 0, missS = 0;
  for (let i = bits.length - 1; i >= 0; i--) {
    if (bits[i] === 1) break;
    missB++;
  }
  for (let i = bits.length - 1; i >= 0; i--) {
    if (bits[i] === 0) break;
    missS++;
  }
  if (missB >= 3) votes.push({ name: 'BIG DUE GAP', call: 'BIG', conf: 58 + missB * 2, note: `missing ${missB}` });
  if (missS >= 3) votes.push({ name: 'SMALL DUE GAP', call: 'SMALL', conf: 58 + missS * 2, note: `missing ${missS}` });

  const score = { BIG: 0, SMALL: 0 };
  votes.forEach((v) => (score[v.call as 'BIG' | 'SMALL'] += v.conf - 50));
  const call: 'BIG' | 'SMALL' = score.BIG >= score.SMALL ? 'BIG' : 'SMALL';
  const conf = Math.round(clamp(52 + Math.abs(score.BIG - score.SMALL) * 1.3, 50, 85));
  const pBig = call === 'BIG' ? 0.5 + (conf - 50) / 100 : 0.5 - (conf - 50) / 100;

  return {
    id: 'MARKET' as const,
    name: 'NARUTO MARKET',
    call,
    pBig: clamp(pBig, 0.15, 0.85),
    conf,
    state,
    votes,
    metrics: { alt20, curRun, curSide: lastName, missB, missS, sample: n },
    fw: 1.2,
  };
}

/* ─── SINGLE OPPOSITE NUMBER PREDICTION ─── */
/**
 * As requested by user:
 * "number prediction only ek hi de opposite vali bas"
 * "80% size par or 20% opposite number par"
 * 
 * If call is BIG -> Opposite is SMALL. Pick the SINGLE highest-edge number from Small Pool.
 * If call is SMALL -> Opposite is BIG. Pick the SINGLE highest-edge number from Big Pool.
 */
export function calculateSingleOppositeNumber(recs: GameRecord[], primaryCall: 'BIG' | 'SMALL', game: GameType): SingleOppositeNumInfo {
  const cfg = getCfg(game);
  const oppSide: 'BIG' | 'SMALL' = primaryCall === 'BIG' ? 'SMALL' : 'BIG';
  const oppPool = primaryCall === 'BIG' ? cfg.poolS : cfg.poolB;

  const nums = recs.map((r) => r.number);
  const chrono = nums.slice().reverse();
  const lastNum = nums[0];

  const scores: { num: number; score: number; reasons: string[]; gap: number; avgGap: number; markovProb: number }[] = [];

  oppPool.forEach((num) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Gap since last occurrence
    let gap = nums.indexOf(num);
    if (gap === -1) gap = nums.length;

    // 2. Average gap between occurrences in history
    const occurrences: number[] = [];
    chrono.forEach((val, idx) => {
      if (val === num) occurrences.push(idx);
    });
    let avgGap = 10;
    if (occurrences.length > 1) {
      avgGap = (occurrences[occurrences.length - 1] - occurrences[0]) / (occurrences.length - 1);
    }
    const dueRatio = gap / Math.max(2, avgGap);
    if (dueRatio >= 1.3) {
      score += Math.min(3.5, dueRatio * 1.5);
      reasons.push(`Due Gap ${gap}`);
    } else if (gap <= 2) {
      score += 1.2;
      reasons.push('Recent Echo');
    }

    // 3. Frequency in last 30 rounds
    const f30 = nums.slice(0, 30).filter((x) => x === num).length;
    if (f30 >= 5) {
      score += 2.0;
      reasons.push(`Hot (${f30}×/30)`);
    } else if (f30 <= 1 && nums.length >= 20) {
      score += 1.0;
      reasons.push('Cold Reversal');
    }

    // 4. Markov conditional transition from lastNum
    let trTotal = 0;
    let trHit = 0;
    for (let i = 1; i < chrono.length; i++) {
      if (chrono[i - 1] === lastNum) {
        trTotal++;
        if (chrono[i] === num) trHit++;
      }
    }
    const markovProb = trTotal > 0 ? trHit / trTotal : 1 / cfg.total;
    if (markovProb > 1 / cfg.total) {
      score += (markovProb / (1 / cfg.total) - 1) * 2.5;
      reasons.push(`Markov ${Math.round(markovProb * 100)}%`);
    }

    // 5. Parity balance
    if (lastNum !== undefined) {
      if (num % 2 !== lastNum % 2) {
        score += 0.8;
      }
    }

    scores.push({ num, score, reasons, gap, avgGap, markovProb });
  });

  // Sort descending by score, tiebreaker by largest gap
  scores.sort((a, b) => b.score - a.score || b.gap - a.gap);
  const best = scores[0] || { num: oppPool[0], score: 1, reasons: ['Optimal Hedge'], gap: 5, avgGap: 10, markovProb: 0.1 };

  return {
    num: best.num,
    oppositeSide: oppSide,
    score: Math.round(best.score * 10) / 10,
    reasons: best.reasons.length ? best.reasons : ['Top Hedge Probability'],
    gap: best.gap,
    avgGap: Math.round(best.avgGap * 10) / 10,
    markovProb: Math.round(best.markovProb * 100),
  };
}

/* ─── QUANTUM FUSION PREDICTOR ─── */
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

  // Adaptive weighting
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

  // Level-based aggressive recovery adjustment
  // At Level 2, 3, 4 we boost the high-probability direction
  if (currentLevel >= 2) {
    const boost = currentLevel === 2 ? 0.05 : currentLevel === 3 ? 0.09 : 0.14;
    pF = pF >= 0.5 ? clamp(pF + boost, 0.52, 0.94) : clamp(pF - boost, 0.06, 0.48);
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

  let conf = Math.round(clamp(50 + edge * 120 + (agree - 2.5) * 4.5, 60, 97));
  if (currentLevel >= 2) {
    conf = Math.min(98, conf + (currentLevel - 1) * 3);
  }

  // Single opposite number prediction only!
  const singleOppositeNum = calculateSingleOppositeNumber(recs, call, game);

  const regime = M.state || 'BALANCED';
  const risk: 'LOW' | 'MODERATE' | 'HIGH' = agree >= 4 ? 'LOW' : agree === 3 ? 'MODERATE' : 'HIGH';

  return {
    period: targetPeriod,
    call,
    pBig: pF,
    conf,
    agree,
    cands,
    singleOppositeNum,
    engines,
    regime,
    risk,
    weights,
    market: M,
    targetPeriod,
    levelPlan,
  };
}
