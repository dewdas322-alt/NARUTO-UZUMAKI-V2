import React from 'react';
import { HistoryItem } from '../types';
import { History as HistoryIcon, TrendingUp, TrendingDown, Sparkles, CheckCircle2, XCircle, Zap } from 'lucide-react';

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
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">TOTAL WINS</div>
          <div className="font-orbitron text-xl font-black text-emerald-400 mt-1">
            {wins}
          </div>
          <div className="text-[8px] text-slate-400 mt-0.5">{jackpots} Number Jackpots</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">LOSSES</div>
          <div className="font-orbitron text-xl font-black text-rose-400 mt-1">
            {losses}
          </div>
          <div className="text-[8px] text-slate-400 mt-0.5">Max 4 Levels</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">ACCURACY</div>
          <div className="font-orbitron text-xl font-black text-cyan-300 mt-1">
            {winRate}%
          </div>
          <div className="text-[8px] text-slate-400 mt-0.5">{totalRounds} Rounds</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-3 text-center">
          <div className="text-[9px] font-bold text-slate-400 font-orbitron">NET P&L</div>
          <div
            className={`font-orbitron text-xl font-black mt-1 ${
              totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnl >= 0 ? `+₹${totalPnl}` : `-₹${Math.abs(totalPnl)}`}
          </div>
          <div className="text-[8px] text-slate-400 mt-0.5">Virtual Profit</div>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1 font-orbitron font-bold">
            <HistoryIcon className="h-3.5 w-3.5 text-orange-400" />
            RECENT ROUND LOGS
          </span>
          <span>Showing last {history.length} rounds</span>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#10152a] p-8 text-center text-slate-500">
            <HistoryIcon className="mx-auto h-8 w-8 opacity-40 mb-2" />
            <p className="text-xs font-orbitron">NO ROUNDS RECORDED YET</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Start the prediction engine to log real-time bet records.
            </p>
          </div>
        ) : (
          history.map((h) => {
            const isWin = h.win;
            const isJackpot = h.jackpot;
            const isDouble = h.doubleWin;

            return (
              <div
                key={h.id}
                className={`rounded-2xl border p-3 transition-all ${
                  isDouble
                    ? 'border-emerald-500/70 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-[#0c1020] shadow-[0_0_20px_rgba(34,211,127,0.25)]'
                    : isJackpot
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 to-[#0c1020]'
                    : isWin
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Result Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-orbitron text-[9px] font-black ${
                        isDouble
                          ? 'bg-emerald-400 text-black shadow-[0_0_10px_#22d37f]'
                          : isJackpot
                          ? 'bg-amber-400 text-black shadow-[0_0_10px_#ffb800]'
                          : isWin
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isDouble ? 'DOUBLE WIN ⚡' : isJackpot ? 'JACKPOT 9X' : isWin ? 'WIN' : 'LOSS'}
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
                      {h.prediction} (₹{h.sizeBet}) + #{h.predictedSameNum} (₹{h.numBet})
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
