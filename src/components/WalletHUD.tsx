import React from 'react';
import { Wallet, Target, TrendingUp, TrendingDown, Layers, Award, RotateCcw } from 'lucide-react';
import { Martingale4Levels, SessionState } from '../types';

interface WalletHUDProps {
  session: SessionState;
  martingale: Martingale4Levels;
  onEditSession: () => void;
  onResetSession: () => void;
}

export const WalletHUD: React.FC<WalletHUDProps> = ({
  session,
  martingale,
  onEditSession,
  onResetSession,
}) => {
  const currentWallet = session.currentWallet;
  const initialWallet = session.initialWallet;
  const targetWallet = session.targetWallet;

  // Calculate percentage of target achieved
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((currentWallet - initialWallet) / (targetWallet - initialWallet)) * 100))
  );

  const netPnl = Math.round((currentWallet - initialWallet) * 10) / 10;
  const isProfit = netPnl >= 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#10152a] to-[#0c1020] p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:p-4">
      {/* Top Row: Wallet Amount & Target */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Live Wallet Balance */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 text-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 font-orbitron">
                VIRTUAL WALLET
              </span>
              <button
                onClick={onEditSession}
                className="text-[9px] font-bold text-orange-400 underline hover:text-orange-300"
              >
                EDIT
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-orbitron text-xl font-black text-white sm:text-2xl">
                ₹{currentWallet.toLocaleString()}
              </span>
              <span
                className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-orbitron text-[10px] font-bold ${
                  isProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isProfit ? `+₹${netPnl}` : `-₹${Math.abs(netPnl)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Target Goal Summary */}
        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-2 sm:border-t-0 sm:pt-0">
          <div className="text-right">
            <span className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-wider text-slate-400 font-orbitron">
              <Target className="h-3 w-3 text-cyan-400" />
              TARGET GOAL
            </span>
            <div className="font-orbitron text-sm font-black text-cyan-300 sm:text-base">
              ₹{targetWallet.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-center">
            <div className="text-[8px] font-bold tracking-wider text-slate-400">WIN RATE</div>
            <div className="font-orbitron text-xs font-black text-white">
              {session.wins + session.losses > 0
                ? `${Math.round((session.wins / (session.wins + session.losses)) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>PROGRESS TO TARGET</span>
          <span className="font-orbitron text-cyan-400">{progressPct}% COMPLETED</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#070a14] p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 transition-all duration-500 shadow-[0_0_12px_rgba(255,107,0,0.5)]"
            style={{ width: `${Math.max(3, progressPct)}%` }}
          />
        </div>
      </div>

      {/* 4-Level Martingale Progress Indicator */}
      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-orange-400" />
          <span className="font-orbitron text-[10px] font-bold text-slate-300">
            MARTINGALE STEP:
          </span>
        </div>

        {/* 4 Steps */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((step) => {
            const isActive = martingale.currentLevel === step;
            const isPassed = martingale.currentLevel > step;

            return (
              <div
                key={step}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 font-orbitron text-[10px] font-black transition-all ${
                  isActive
                    ? 'border border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_12px_rgba(255,107,0,0.4)] animate-pulse'
                    : isPassed
                    ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                    : 'border border-white/10 bg-white/5 text-slate-500'
                }`}
              >
                <span>L{step}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
