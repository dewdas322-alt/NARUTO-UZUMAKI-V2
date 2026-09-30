import React from 'react';
import { HistoryItem } from '../types';
import { Trophy, Sparkles, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface HistoryTabProps {
  history: HistoryItem[];
  wins: number;
  losses: number;
  jackpots: number;
  totalPnl: number;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  wins,
  losses,
  jackpots,
  totalPnl,
}) => {
  const totalRounds = wins + losses;
  const winRate = totalRounds > 0 ? Math.round((wins / totalRounds) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">TOTAL WINS</div>
          <div className="font-orbitron text-lg font-black text-emerald-400 sm:text-xl">
            {wins}
          </div>
          <div className="text-[8px] text-emerald-400/80 font-bold">{jackpots} Jackpots</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">LOSSES</div>
          <div className="font-orbitron text-lg font-black text-rose-400 sm:text-xl">
            {losses}
          </div>
          <div className="text-[8px] text-slate-400 font-bold">Max 4 Levels</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">ACCURACY</div>
          <div className="font-orbitron text-lg font-black text-cyan-300 sm:text-xl">
            {winRate}%
          </div>
          <div className="text-[8px] text-cyan-400/80 font-bold">{totalRounds} Rounds</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">NET P&L</div>
          <div
            className={`font-orbitron text-lg font-black sm:text-xl ${
              totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnl >= 0 ? `+₹${totalPnl}` : `-₹${Math.abs(totalPnl)}`}
          </div>
          <div className="text-[8px] text-slate-400 font-bold">Virtual Profit</div>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#10152a] p-12 text-center text-slate-400">
            <Clock className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <div className="font-orbitron text-xs font-bold text-slate-300">NO ROUNDS RECORDED YET</div>
            <p className="text-[11px] mt-1">Start the engine from Home to begin recording 4-level bets.</p>
          </div>
        ) : (
          history.map((h) => {
            const isJackpot = h.jackpot;
            const isWin = h.win;

            return (
              <div
                key={h.id}
                className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                  isJackpot
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-[#161c36] to-[#0c1020]'
                    : isWin
                    ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-[#161c36] to-[#0c1020]'
                    : 'border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-[#161c36] to-[#0c1020]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Period & Mode */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 items-center rounded-md px-2 font-orbitron text-[10px] font-black ${
                        isJackpot
                          ? 'bg-amber-500 text-black'
                          : isWin
                          ? 'bg-emerald-500 text-black'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isJackpot ? 'JACKPOT 9X' : isWin ? 'WIN' : 'LOSS'}
                    </span>
                    <span className="font-orbitron text-xs font-bold text-white">
                      #{h.period.slice(-5)}
                    </span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 font-orbitron">
                      LV{h.level}
                    </span>
                  </div>

                  {/* PnL & Wallet */}
                  <div className="text-right">
                    <span
                      className={`font-orbitron text-xs font-black ${
                        h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.pnl >= 0 ? `+₹${h.pnl}` : `-₹${Math.abs(h.pnl)}`}
                    </span>
                    <span className="ml-2 font-orbitron text-[10px] text-slate-400">
                      Bal: ₹{h.walletAfter}
                    </span>
                  </div>
                </div>

                {/* Bet vs Actual Breakdown */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg bg-black/40 p-2 text-[10px]">
                  <div>
                    <span className="text-slate-400">Predicted Bet: </span>
                    <span className="font-orbitron font-bold text-white">
                      {h.prediction} (₹{h.sizeBet}) + Opp #{h.predictedOppNum} (₹{h.numBet})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Actual Result: </span>
                    <span
                      className={`font-orbitron font-bold ${
                        isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.actualType} #{h.actualNum}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
