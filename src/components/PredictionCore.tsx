import React, { useEffect, useState } from 'react';
import { FusionPrediction, LevelPlan, GameType } from '../types';
import { getCfg } from '../utils/engines';
import { Activity, Timer, Crosshair, Sparkles, CheckCircle2, ShieldCheck, Zap, Terminal, Lock, Cpu } from 'lucide-react';

interface PredictionCoreProps {
  prediction: FusionPrediction | null;
  levelPlan: LevelPlan;
  currentLevel: number;
  game: GameType;
  timerSecs: number;
  analyzing: boolean;
  analysisTimeRemaining?: number; // 4s countdown
  running: boolean;
}

export const PredictionCore: React.FC<PredictionCoreProps> = ({
  prediction,
  levelPlan,
  currentLevel,
  game,
  timerSecs,
  analyzing,
  analysisTimeRemaining = 4,
  running,
}) => {
  const cfg = getCfg(game);

  // Hacker style scrambling number during analysis
  const [glitchText, setGlitchText] = useState('0x7F');
  const [glitchCall, setGlitchCall] = useState<'BIG' | 'SMALL'>('BIG');

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      const hexChars = '0123456789ABCDEF';
      const rHex = '0x' + hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
      setGlitchText(rHex);
      setGlitchCall(Math.random() > 0.5 ? 'BIG' : 'SMALL');
    }, 120);
    return () => clearInterval(interval);
  }, [analyzing]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!running) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131932] via-[#0c1022] to-[#070a14] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-500/5 text-orange-400">
          <Crosshair className="h-12 w-12 animate-pulse" />
        </div>
        <h3 className="mt-4 font-orbitron text-lg font-black tracking-wider text-white">
          ENGINE STANDBY
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Select your game mode and press <span className="font-bold text-orange-400">START 4-LEVEL PREDICTION ENGINE</span> to activate real-time predictive convergence.
        </p>
      </div>
    );
  }

  // 4-SECOND HYPER-AESTHETIC HACKER-STYLE ANIMATION WITH GLOWING HEARTBEAT PULSE
  if (analyzing || !prediction) {
    const progress = Math.min(100, Math.round(((4 - analysisTimeRemaining) / 4) * 100));

    // Dynamic hacker terminal log messages
    const terminalLogs = [
      { t: 4, msg: 'BYPASSING SEED NOISE • INITIALIZING TENSOR STREAM' },
      { t: 3, msg: 'DECRYPTING 2ND-ORDER MARKOV • 5-ENGINE QUANTUM SYNC' },
      { t: 2, msg: 'FILTERING DRAGON TRAJECTORY • MAPPING SAME-SIDE HARMONIC' },
      { t: 1, msg: 'FINALIZING CONVERGENCE LOCK • 90/10 ALLOCATION PREPARED' },
    ];
    const activeLog = terminalLogs.find((l) => l.t >= analysisTimeRemaining) || terminalLogs[3];

    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-[#09121d] via-[#060b14] to-[#03060a] p-5 text-center shadow-[0_25px_80px_rgba(0,255,170,0.2),0_0_50px_rgba(0,0,0,0.9)] sm:p-7">
        {/* Holographic Matrix Grid & Cyber Scanlines */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00ffaa15_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-20 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-[scan_2s_linear_infinite]" />

        {/* Top Terminal Status Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] font-mono text-emerald-400">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span className="font-bold tracking-wider">NARUTO_KERNEL_V2 :: NEURAL_DECRYPTOR</span>
          </div>
          <div className="flex items-center gap-1.5 font-orbitron">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">4.0s MATRIX LOCK</span>
          </div>
        </div>

        {/* Central Hacker Holographic Reactor */}
        <div className="relative z-10 mx-auto mt-4 flex h-36 w-36 items-center justify-center">
          {/* Cyber Ring 1 (Spinning Clockwise) */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-emerald-500/60 [animation-duration:5s]" />

          {/* Cyber Ring 2 (Counter-Clockwise Dashed) */}
          <div className="absolute inset-2 animate-[spin_4s_linear_infinite_reverse] rounded-full border border-cyan-400/50 [stroke-dasharray:6,6]" />

          {/* Pulse Concentric Expanding Wave */}
          <div className="absolute inset-4 animate-ping rounded-full bg-emerald-500/15 [animation-duration:1.5s]" />

          {/* Inner Glowing Reactor Core with Scrambled Glitch Numbers */}
          <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#0b1b1c] via-[#050f14] to-[#020508] border border-emerald-400 shadow-[0_0_35px_rgba(0,255,170,0.6)]">
            <div className="font-mono text-xs font-black text-cyan-300 tracking-wider">
              {glitchText}
            </div>
            <div className="font-orbitron text-base font-black text-emerald-400 animate-pulse mt-0.5">
              {glitchCall}
            </div>
            <div className="font-orbitron text-[9px] font-extrabold text-orange-400">
              {Math.max(1, analysisTimeRemaining)}s • {progress}%
            </div>
          </div>
        </div>

        {/* Real-time Glowing EKG Heartbeat Oscilloscope */}
        <div className="relative z-10 mx-auto mt-4 flex h-8 w-64 items-center justify-center">
          <svg viewBox="0 0 160 30" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="hackerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.2" />
                <stop offset="45%" stopColor="#00ffaa" stopOpacity="1" />
                <stop offset="55%" stopColor="#00d4ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff9900" stopOpacity="0.2" />
              </linearGradient>
              <filter id="hackerGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d="M0 15 L30 15 L40 4 L48 26 L56 6 L64 24 L72 15 L160 15"
              fill="none"
              stroke="url(#hackerGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hackerGlow)"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Live Terminal Log Stream Line */}
        <div className="relative z-10 mt-3 rounded-xl border border-emerald-500/30 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-300 shadow-[inset_0_0_15px_rgba(0,255,170,0.1)]">
          <span className="text-orange-400">&gt; </span>
          <span className="font-bold tracking-wide animate-pulse">{activeLog.msg}</span>
        </div>

        {/* 4-Second Animated Progress Bar */}
        <div className="relative z-10 mx-auto mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-black/70 p-0.5 border border-emerald-500/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,170,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 5 Cyber Engine Matrix Badges */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-2 text-[9px] font-bold font-mono">
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            <Lock className="h-3 w-3" /> RDX [SYNCED]
          </span>
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            <Lock className="h-3 w-3" /> VANTA [SYNCED]
          </span>
          <span className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-400">
            <Lock className="h-3 w-3" /> NOCTIS [SYNCED]
          </span>
          <span className="flex items-center gap-1 rounded-md border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-orange-400">
            <Lock className="h-3 w-3" /> BRAIN [SYNCED]
          </span>
          <span className="flex items-center gap-1 rounded-md border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-purple-400">
            <Lock className="h-3 w-3" /> MARKET [SYNCED]
          </span>
        </div>
      </div>
    );
  }

  const isBig = prediction.call === 'BIG';
  const sameNumInfo = prediction.singleSameNum;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#161c36] via-[#0d1226] to-[#070a14] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(255,107,0,0.15)] sm:p-6 transition-all duration-300">
      {/* Laser Scanline FX */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-16 bg-gradient-to-b from-transparent via-orange-500/15 to-transparent animate-[scan_4s_linear_infinite]" />

      {/* Top Meta Bar with Glowing Heartbeat Pulse */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {/* Live Engine Heartbeat Indicator */}
          <div className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-400 font-orbitron text-[9px] font-bold">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse drop-shadow-[0_0_6px_#22d37f]" />
            <span>PULSE LOCKED</span>
          </div>

          <span className="font-orbitron text-xs font-black tracking-wider text-white">
            #{prediction.period.slice(-5)}
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-300 font-orbitron">
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1 font-orbitron text-xs font-black text-orange-400">
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTimer(timerSecs)}</span>
          </div>

          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 font-orbitron text-[10px] font-black text-cyan-300">
            LV{currentLevel} STEP
          </div>
        </div>
      </div>

      {/* Main Dual Bet Split Card (90% Size & 10% SAME-SIDE Single Number) */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left: 90% Primary Size Bet */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all ${
            isBig
              ? 'border-orange-500/60 bg-gradient-to-br from-orange-500/20 via-orange-900/10 to-[#0c1020] shadow-[0_0_25px_rgba(255,107,0,0.25)]'
              : 'border-cyan-500/60 bg-gradient-to-br from-cyan-500/20 via-cyan-900/10 to-[#0c1020] shadow-[0_0_25px_rgba(0,212,255,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold font-orbitron tracking-wider text-slate-300">
            <span>PRIMARY 90% SIZE BET</span>
            <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-emerald-400 font-bold">
              NET: +₹{levelPlan.sizeNetProfit}
            </span>
          </div>

          <div
            className={`mt-2 font-orbitron text-4xl font-black tracking-widest sm:text-5xl ${
              isBig
                ? 'text-orange-400 drop-shadow-[0_0_25px_rgba(255,107,0,0.8)]'
                : 'text-cyan-400 drop-shadow-[0_0_25px_rgba(0,212,255,0.8)]'
            }`}
          >
            {prediction.call}
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="rounded-xl bg-black/60 px-3 py-1 font-orbitron text-sm font-black text-white border border-white/10">
              BET: ₹{levelPlan.sizeBet}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              (Payout: +₹{levelPlan.potentialSizeWin})
            </span>
          </div>
        </div>

        {/* Right: 10% SAME-SIDE Single Number Bet */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-[#0c1a14]/40 to-[#0c1020] p-4 text-center shadow-[0_0_25px_rgba(34,211,127,0.2)]">
          <div className="flex items-center justify-between text-[10px] font-bold font-orbitron tracking-wider text-emerald-300">
            <span>SAME-SIDE NUMBER (10%)</span>
            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] text-emerald-300 font-bold">
              JACKPOT: +₹{levelPlan.numNetProfit}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 font-orbitron text-3xl font-black text-emerald-300 shadow-[0_0_25px_rgba(34,211,127,0.5)]">
              {sameNumInfo.num}
            </div>
            <div className="text-left">
              <div className="font-orbitron text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>{prediction.call} POOL</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 text-[8px] px-1 py-0.5 font-bold">ALIGNED</span>
              </div>
              <div className="text-[10px] text-slate-300">
                {sameNumInfo.reasons.slice(0, 2).join(' • ')}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="rounded-xl bg-black/60 px-3 py-1 font-orbitron text-sm font-black text-emerald-300 border border-emerald-500/30">
              BET: ₹{levelPlan.sameNumBet}
            </span>
            <span className="text-[10px] font-bold text-emerald-300/80">
              (Payout: +₹{levelPlan.potentialNumWin})
            </span>
          </div>
        </div>
      </div>

      {/* Double Win Highlight Banner (90% Size + 10% Same-side number = 2.66x explosive payout) */}
      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-[10px] font-orbitron font-bold text-emerald-300">
        ⚡ DOUBLE WIN BOOST: If both {prediction.call} & #{sameNumInfo.num} hit $\rightarrow$ Explosive Profit: +₹{levelPlan.doubleWinProfit}!
      </div>

      {/* 5-Engine Agreement Status Bar */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-[#0a0f1e] p-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-orbitron">
          <span>5-ENGINE LIVE VOTES</span>
          <span className="text-orange-400">{prediction.agree}/5 ENGINES CONVERGED</span>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {Object.entries(prediction.cands).map(([eng, call]) => {
            const isMatch = call === prediction.call;
            return (
              <div
                key={eng}
                className={`rounded-xl border p-2 text-center transition-all ${
                  isMatch
                    ? call === 'BIG'
                      ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                      : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/5 bg-white/5 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-[8px] font-extrabold tracking-wider font-orbitron">{eng}</div>
                <div className="font-orbitron text-xs font-black mt-0.5">{call}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence and Metrics Bottom Strip */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="text-[8px] font-bold tracking-wider text-slate-400 font-orbitron">CONFIDENCE</div>
          <div className="font-orbitron text-sm font-black text-orange-400">
            {prediction.conf}%
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="text-[8px] font-bold tracking-wider text-slate-400 font-orbitron">REGIME</div>
          <div className="font-orbitron text-xs font-bold text-slate-200">
            {prediction.regime}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="text-[8px] font-bold tracking-wider text-slate-400 font-orbitron">RISK LEVEL</div>
          <div
            className={`font-orbitron text-xs font-black ${
              prediction.risk === 'LOW'
                ? 'text-emerald-400'
                : prediction.risk === 'HIGH'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {prediction.risk}
          </div>
        </div>
      </div>
    </div>
  );
};
