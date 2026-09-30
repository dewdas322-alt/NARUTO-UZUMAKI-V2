import React, { useEffect, useState } from 'react';
import { FusionPrediction, LevelPlan, GameType } from '../types';
import { getCfg } from '../utils/engines';
import { Activity, Timer, Crosshair, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

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
  const [pulsePhase, setPulsePhase] = useState(0);

  // Heartbeat pulse rhythm
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 4);
    }, 800);
    return () => clearInterval(pulseInterval);
  }, []);

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

  // 4-SECOND HYPER-PREMIUM ANALYSIS ANIMATION WITH GLOWING HEARTBEAT PULSE
  if (analyzing || !prediction) {
    const progress = Math.min(100, Math.round(((4 - analysisTimeRemaining) / 4) * 100));

    return (
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/40 bg-gradient-to-b from-[#18122c] via-[#0d1226] to-[#070a14] p-6 text-center shadow-[0_25px_80px_rgba(255,107,0,0.25)] sm:p-8">
        {/* Dynamic Scanline & Beam */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-20 bg-gradient-to-b from-transparent via-orange-500/20 to-transparent animate-[scan_2s_linear_infinite]" />

        {/* Central Pulsing Heartbeat Reactor Core */}
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
          {/* Outer Rotating Radar Ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-orange-500/50 [animation-duration:6s]" />

          {/* Glowing Heartbeat Pulse Rings (Concentric Expand) */}
          <div className="absolute inset-2 animate-ping rounded-full bg-orange-500/15 [animation-duration:1.6s]" />
          <div className="absolute inset-4 animate-pulse rounded-full border border-cyan-400/40 shadow-[0_0_20px_rgba(0,212,255,0.3)]" />

          {/* Inner Heartbeat Core */}
          <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#1a1226] via-[#0e1328] to-[#070a14] border border-orange-500/60 shadow-[0_0_30px_rgba(255,107,0,0.5)]">
            <Activity className="h-7 w-7 text-emerald-400 animate-pulse drop-shadow-[0_0_10px_#22d37f]" />
            <span className="mt-1 font-orbitron text-[11px] font-black tracking-widest text-orange-400">
              {Math.max(1, analysisTimeRemaining)}s
            </span>
            <span className="text-[8px] font-bold text-slate-400 font-mono">
              {progress}%
            </span>
          </div>
        </div>

        {/* Glowing Heartbeat Waveform SVG */}
        <div className="mx-auto mt-4 flex h-8 w-64 items-center justify-center">
          <svg viewBox="0 0 160 30" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="heartbeatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#22d37f" stopOpacity="1" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d="M0 15 L35 15 L45 3 L52 27 L60 8 L68 22 L75 15 L160 15"
              fill="none"
              stroke="url(#heartbeatGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Text Status */}
        <div className="mt-3">
          <h3 className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300 bg-clip-text font-orbitron text-sm font-black tracking-widest text-transparent sm:text-base animate-pulse">
            5-ENGINE NEURAL SYNC ({Math.max(1, analysisTimeRemaining)}s)
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-300">
            Harmonizing Level 1 & 2 High-Win Probability Matrix...
          </p>
        </div>

        {/* 4-Second Animated Progress Bar */}
        <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-black/60 p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-emerald-400 to-cyan-400 transition-all duration-300 shadow-[0_0_12px_rgba(34,211,127,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Real-time Subsystem Sync Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[9px] font-bold font-orbitron">
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> RDX
          </span>
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> VANTA
          </span>
          <span className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-400">
            <CheckCircle2 className="h-3 w-3" /> NOCTIS
          </span>
          <span className="flex items-center gap-1 rounded-md border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-orange-400">
            <CheckCircle2 className="h-3 w-3" /> BRAIN
          </span>
          <span className="flex items-center gap-1 rounded-md border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-purple-400">
            <CheckCircle2 className="h-3 w-3" /> MARKET
          </span>
        </div>
      </div>
    );
  }

  const isBig = prediction.call === 'BIG';
  const oppNumInfo = prediction.singleOppositeNum;

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
            <span>PULSE ACTIVE</span>
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

      {/* Main Dual Bet Split Card (85% Size & 15% Single Opposite Number) */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Left: 85% Primary Size Bet */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all ${
            isBig
              ? 'border-orange-500/60 bg-gradient-to-br from-orange-500/20 via-orange-900/10 to-[#0c1020] shadow-[0_0_25px_rgba(255,107,0,0.25)]'
              : 'border-cyan-500/60 bg-gradient-to-br from-cyan-500/20 via-cyan-900/10 to-[#0c1020] shadow-[0_0_25px_rgba(0,212,255,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold font-orbitron tracking-wider text-slate-300">
            <span>PRIMARY 85% SIZE BET</span>
            <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-emerald-400 font-bold">
              NET PROFIT: +₹{levelPlan.sizeNetProfit}
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

        {/* Right: 15% Single Opposite Number Bet */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-[#1a140d]/40 to-[#0c1020] p-4 text-center shadow-[0_0_25px_rgba(255,184,0,0.2)]">
          <div className="flex items-center justify-between text-[10px] font-bold font-orbitron tracking-wider text-amber-300">
            <span>SINGLE OPPOSITE NUMBER (15%)</span>
            <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] text-amber-300 font-bold">
              NET PROFIT: +₹{levelPlan.numNetProfit}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 font-orbitron text-3xl font-black text-amber-300 shadow-[0_0_25px_rgba(255,184,0,0.5)]">
              {oppNumInfo.num}
            </div>
            <div className="text-left">
              <div className="font-orbitron text-[11px] font-bold text-white">
                {oppNumInfo.oppositeSide} POOL
              </div>
              <div className="text-[10px] text-slate-300">
                {oppNumInfo.reasons.slice(0, 2).join(' • ')}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="rounded-xl bg-black/60 px-3 py-1 font-orbitron text-sm font-black text-amber-300 border border-amber-500/30">
              BET: ₹{levelPlan.oppNumBet}
            </span>
            <span className="text-[10px] font-bold text-amber-300/80">
              (Payout: +₹{levelPlan.potentialNumWin})
            </span>
          </div>
        </div>
      </div>

      {/* 5-Engine Agreement Status Bar */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-[#0a0f1e] p-3">
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
