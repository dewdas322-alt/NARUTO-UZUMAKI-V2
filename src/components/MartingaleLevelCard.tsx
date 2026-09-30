import React from 'react';
import { Layers, Zap, ShieldCheck, Target, CheckCircle2 } from 'lucide-react';
import { Martingale4Levels } from '../types';

interface MartingaleLevelCardProps {
  martingale: Martingale4Levels;
}

export const MartingaleLevelCard: React.FC<MartingaleLevelCardProps> = ({ martingale }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-b from-[#10152a] to-[#0c1020] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
              4-LEVEL MARTINGALE LADDER ({martingale.sizePct || 90}% SIZE • {martingale.numPct || 10}% SAME NUM)
            </h3>
            <p className="text-[9px] font-semibold text-slate-400">
              {martingale.sizePct || 90}% Size Primary • {martingale.numPct || 10}% Same-Side Number • Core Strike on L1 & L2 (L3-L4 Safety Backup)
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-orbitron text-[9px] font-bold text-emerald-400">
          100% WALLET LADDER
        </div>
      </div>

      {/* 4 Levels Grid */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {martingale.levels.map((lvl) => {
          const isActive = martingale.currentLevel === lvl.level;
          const isPassed = martingale.currentLevel > lvl.level;
          const isPrimaryFocus = lvl.level <= 2;

          return (
            <div
              key={lvl.level}
              className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                isActive
                  ? 'border-orange-500/80 bg-gradient-to-b from-orange-500/20 via-orange-950/20 to-[#070a14] shadow-[0_0_25px_rgba(255,107,0,0.35)] ring-1 ring-orange-500/50'
                  : isPassed
                  ? 'border-rose-500/30 bg-rose-500/5 opacity-75'
                  : isPrimaryFocus
                  ? 'border-white/20 bg-[#070a14]/90'
                  : 'border-white/10 bg-[#070a14]/60'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 font-orbitron text-[8px] font-black text-black shadow-[0_0_10px_rgba(255,107,0,0.8)] animate-pulse">
                  ACTIVE NOW
                </div>
              )}

              {/* Primary Focus Badge */}
              {!isActive && isPrimaryFocus && (
                <div className="absolute right-2 top-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-orbitron text-[7px] font-black text-cyan-300">
                  PRIMARY FOCUS
                </div>
              )}

              {/* Level Number & Total Bet */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg font-orbitron text-xs font-black ${
                    isActive
                      ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(255,107,0,0.5)]'
                      : isPassed
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  L{lvl.level}
                </span>

                <div>
                  <div className="font-orbitron text-sm font-black text-white">
                    ₹{lvl.totalBet} ({lvl.percentage}%)
                  </div>
                  <div className="text-[8px] font-bold text-slate-400">
                    {lvl.level === 1
                      ? 'Primary Strike'
                      : lvl.level === 2
                      ? 'Fix Recovery Lock'
                      : lvl.level === 3
                      ? 'Deep Safety'
                      : 'Ultimate Defense'}
                  </div>
                </div>
              </div>

              {/* Bet Split Breakdown */}
              <div className="mt-2.5 space-y-1 border-t border-white/5 pt-2 text-[10px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-orange-400 font-bold">{lvl.sizePct || 90}% Size:</span>
                  <span className="font-orbitron font-bold">₹{lvl.sizeBet}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-emerald-400 font-bold">{lvl.numPct || 10}% Same Num:</span>
                  <span className="font-orbitron font-bold">₹{lvl.sameNumBet}</span>
                </div>
              </div>

              {/* Guaranteed Profit on Win */}
              <div className="mt-2 rounded-xl bg-black/40 p-1.5 text-[9px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Size Win (1.96x):</span>
                  <span className="font-orbitron font-bold text-emerald-400">
                    +₹{lvl.sizeNetProfit}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span>Num Jackpot (9.0x):</span>
                  <span className="font-orbitron font-bold text-amber-300">
                    +₹{lvl.numNetProfit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-400 border-t border-white/5 pt-2.5">
        <span className="text-emerald-400 font-semibold">
          ✓ Core Focus on Level 1 & 2 wins • Levels 3 & 4 act as deep backup reserves
        </span>
        <span>• 100% wallet allocation across 4 levels</span>
      </div>
    </div>
  );
};
