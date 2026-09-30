import React, { useState } from 'react';
import { Target, Wallet, ArrowRight, ShieldCheck, Flame, Check, Zap, Percent, Sliders } from 'lucide-react';
import { calculate4LevelMartingale } from '../utils/martingale';
import { sound } from '../utils/audio';

interface SessionSetupModalProps {
  initialWallet: number;
  initialTarget: number;
  initialSizePct?: number;
  onConfirm: (wallet: number, target: number, sizePct: number) => void;
  onClose?: () => void;
  isFirstSetup?: boolean;
}

export const SessionSetupModal: React.FC<SessionSetupModalProps> = ({
  initialWallet,
  initialTarget,
  initialSizePct = 90,
  onConfirm,
  onClose,
  isFirstSetup = false,
}) => {
  const [walletStr, setWalletStr] = useState(String(initialWallet || 500));
  const [targetStr, setTargetStr] = useState(String(initialTarget || 1000));
  const [sizePct, setSizePct] = useState<number>(initialSizePct || 90);
  const [error, setError] = useState('');

  const currentWalletVal = Math.max(20, parseInt(walletStr, 10) || 20);
  const currentTargetVal = Math.max(currentWalletVal + 10, parseInt(targetStr, 10) || currentWalletVal * 2);

  const numPct = 100 - sizePct;

  // Live auto-calculated 4-level plan preview with dynamic sizePct
  const livePlan = calculate4LevelMartingale(currentWalletVal, currentTargetVal, 1, sizePct);

  const handleWalletPreset = (amt: number) => {
    sound.playClick();
    setWalletStr(String(amt));
    if (currentTargetVal <= amt) {
      setTargetStr(String(amt * 2));
    }
  };

  const handleTargetMultiplier = (multiplier: number) => {
    sound.playClick();
    const newTarget = Math.round(currentWalletVal * multiplier);
    setTargetStr(String(newTarget));
  };

  const handleSizePctChange = (newSize: number) => {
    sound.playClick();
    setSizePct(Math.max(50, Math.min(95, newSize)));
  };

  const handleSave = () => {
    sound.playClick();
    const w = parseInt(walletStr, 10);
    const t = parseInt(targetStr, 10);

    if (isNaN(w) || w < 20) {
      setError('Minimum wallet amount is ₹20');
      return;
    }
    if (isNaN(t) || t <= w) {
      setError('Target amount must be greater than wallet amount');
      return;
    }

    sound.playBetPlaced();
    onConfirm(w, t, sizePct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#131932] via-[#0c1022] to-[#070a14] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:p-7">
        {/* Glow Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />

        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 font-orbitron font-bold text-black shadow-[0_0_20px_rgba(255,107,0,0.4)]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-orbitron text-sm font-black tracking-wider text-white sm:text-base">
                {isFirstSetup ? 'SET WALLET & TARGET SESSION' : 'ADJUST TARGET SESSION'}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400">
                4-Level Martingale • Manual Size & Number Split Control
              </p>
            </div>
          </div>
          {onClose && !isFirstSetup && (
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {error}
          </div>
        )}

        {/* Inputs Section */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Wallet Amount Input */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0f20] p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5 font-orbitron">
                <Wallet className="h-3.5 w-3.5 text-orange-400" />
                STARTING WALLET
              </span>
              <span className="font-mono text-orange-400">₹</span>
            </div>
            <input
              type="number"
              value={walletStr}
              onChange={(e) => {
                setWalletStr(e.target.value);
                setError('');
              }}
              min="20"
              step="10"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 font-orbitron text-lg font-black text-white outline-none focus:border-orange-500"
              placeholder="e.g. 500"
            />
            {/* Quick Wallet Presets */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[200, 500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleWalletPreset(amt)}
                  className={`rounded-lg px-2 py-1 font-orbitron text-[10px] font-bold transition-all ${
                    currentWalletVal === amt
                      ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(255,107,0,0.5)]'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount Input */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0f20] p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5 font-orbitron">
                <Target className="h-3.5 w-3.5 text-cyan-400" />
                TARGET GOAL
              </span>
              <span className="font-mono text-cyan-400">₹</span>
            </div>
            <input
              type="number"
              value={targetStr}
              onChange={(e) => {
                setTargetStr(e.target.value);
                setError('');
              }}
              min={currentWalletVal + 10}
              step="50"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 font-orbitron text-lg font-black text-cyan-300 outline-none focus:border-cyan-500"
              placeholder="e.g. 1000"
            />
            {/* Quick Target Multipliers */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                { label: '+50%', m: 1.5 },
                { label: '2X', m: 2 },
                { label: '3X', m: 3 },
                { label: '5X', m: 5 },
              ].map(({ label, m }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleTargetMultiplier(m)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-orbitron text-[10px] font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MANUAL SIZE % & NUMBER % ALLOCATION CONTROLLER */}
        <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-[#0a0f20] to-[#070a14] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Sliders className="h-4 w-4 text-cyan-400" />
              MANUAL BET SPLIT RATIO
            </div>
            <div className="flex items-center gap-2 font-orbitron text-xs font-black">
              <span className="text-orange-400">{sizePct}% SIZE</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{numPct}% NUMBER</span>
            </div>
          </div>

          {/* Quick Split Presets */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { label: '90% / 10% (Default)', s: 90 },
              { label: '85% / 15%', s: 85 },
              { label: '80% / 20%', s: 80 },
              { label: '75% / 25%', s: 75 },
              { label: '95% / 5%', s: 95 },
            ].map(({ label, s }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSizePctChange(s)}
                className={`rounded-xl px-2.5 py-1 font-orbitron text-[10px] font-bold transition-all ${
                  sizePct === s
                    ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Interactive Range Slider */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Size: {sizePct}% (1.96x)</span>
              <span>Same-Side Number: {numPct}% (9.0x)</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={sizePct}
              onChange={(e) => setSizePct(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-black/60 border border-white/10"
            />
          </div>
        </div>

        {/* Live Auto-Generated 4-Level Martingale Preview */}
        <div className="mt-4 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-[#0c1022] to-cyan-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Flame className="h-4 w-4 text-orange-400" />
              LIVE 4-LEVEL BREAKDOWN ({sizePct}% SIZE • {numPct}% SAME NUM)
            </div>
            <div className="font-orbitron text-[10px] font-bold text-emerald-400">
              SUM = ₹{livePlan.totalAllocated} (100% WALLET)
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {livePlan.levels.map((lvl) => (
              <div
                key={lvl.level}
                className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#070a14]/80 p-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 font-orbitron text-[10px] font-black text-orange-400">
                    L{lvl.level}
                  </span>
                  <div>
                    <span className="font-orbitron text-xs font-bold text-white">
                      ₹{lvl.totalBet}{' '}
                      <span className="text-[10px] text-slate-400">({lvl.percentage}% wallet)</span>
                    </span>
                    {lvl.level <= 2 && (
                      <span className="ml-1.5 rounded bg-cyan-500/20 px-1 py-0.5 text-[8px] font-bold text-cyan-300">
                        PRIMARY FOCUS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-orange-300">
                    {sizePct}% Size: ₹{lvl.sizeBet} (Net: +₹{lvl.sizeNetProfit})
                  </span>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                    {numPct}% Num: ₹{lvl.sameNumBet} (Net: +₹{lvl.numNetProfit})
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
            <span>✓ Primary target focus on Level 1 & Level 2!</span>
            <span>✓ Double Win when both Size & Number hit</span>
          </div>
        </div>

        {/* Start / Confirm Button */}
        <button
          onClick={handleSave}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 py-3.5 font-orbitron text-xs font-black tracking-wider text-black shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,107,0,0.6)] active:scale-95"
        >
          <Check className="h-4 w-4" />
          APPLY TARGET & {sizePct}/{numPct} SPLIT (₹{currentWalletVal} → ₹{currentTargetVal})
        </button>
      </div>
    </div>
  );
};
