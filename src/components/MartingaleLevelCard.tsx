import React from 'react';
import { Layers, ShieldCheck, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Martingale4Levels } from '../types';

interface MartingaleLevelCardProps {
  martingale: Martingale4Levels;
}

export const MartingaleLevelCard: React.FC<MartingaleLevelCardProps> = ({ martingale }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#10152a] to-[#0c1020] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
              LIVE 4-LEVEL MARTINGALE LADDER
            </h3>
            <p className="text-[9px] font-semibold text-slate-400">
              85% Size • 15% Opp Number (Guaranteed Net Profit on Any Win)
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-orbitron text-[9px] font-bold text-emerald-400">
          100% WALLET COVERAGE
        </div>
      </div>

      {/* 4 Levels Grid */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {martingale.levels.map((lvl) => {
          const isActive = martingale.currentLevel === lvl.level;
          const isPassed = martingale.currentLevel > lvl.level;

          return (
            <div
              key={lvl.level}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-orange-500/80 bg-gradient-to-b from-orange-500/20 via-orange-950/20 to-[#070a14] shadow-[0_0_20px_rgba(255,107,0,0.3)] ring-1 ring-orange-500/50'
                  : isPassed
                  ? 'border-rose-500/30 bg-rose-500/5 opacity-75'
                  : 'border-white/10 bg-[#070a14]/60'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 font-orbitron text-[8px] font-black text-black shadow-[0_0_10px_rgba(255,107,0,0.8)] animate-pulse">
                  ACTIVE NOW
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
                    ₹{lvl.totalBet}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400">
                    {lvl.percentage}% of wallet
                  </div>
                </div>
              </div>

              {/* 85% / 15% Bet Split Breakdown */}
              <div className="mt-3 space-y-1.5 border-t border-white/5 pt-2 text-[10px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-orange-400 font-bold">85% Size:</span>
                  <span className="font-orbitron font-bold">₹{lvl.sizeBet}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-cyan-400 font-bold">15% Opp Num:</span>
                  <span className="font-orbitron font-bold">₹{lvl.oppNumBet}</span>
                </div>
              </div>

              {/* Guaranteed Profit on Win */}
              <div className="mt-2.5 rounded-lg bg-black/40 p-2 text-[9px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Size Win Profit:</span>
                  <span className="font-orbitron font-bold text-emerald-400">
                    +₹{lvl.sizeNetProfit}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Num Win Profit:</span>
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
          ✓ Profit Guarantee: If round wins on Size or Opposite Number, overall profit is guaranteed!
        </span>
        <span>• If win: Wallet increases & level resets to L1</span>
      </div>
    </div>
  );
};
