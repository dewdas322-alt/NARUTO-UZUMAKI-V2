import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History as HistoryIcon, TrendingUp, TrendingDown, Sparkles, CheckCircle2, XCircle, Zap, Flame, Filter, Trophy } from 'lucide-react';

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
  const [filter, setFilter] = useState<'ALL' | 'JACKPOTS' | 'WINS' | 'LOSSES'>('ALL');

  const totalRounds = wins + losses;
  const winRate = totalRounds > 0 ? Math.round((wins / totalRounds) * 100) : 0;

  // Filter history items based on selection
  const filteredHistory = history.filter((h) => {
    if (filter === 'JACKPOTS') return h.jackpot;
    if (filter === 'WINS') return h.win;
    if (filter === 'LOSSES') return !h.win;
    return true;
  });

  // Helper to get bead color
  const getNumberColorClass = (n: number) => {
    if (n === 0 || n === 5) return 'bg-gradient-to-br from-violet-600 to-rose-600 text-white';
    if ([1, 3, 7, 9].includes(n)) return 'bg-emerald-500 text-black';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className="space-y-4">
      {/* Hyper-Premium Top Performance Summary HUD */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Wins */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#0e172a] to-[#080d1a] p-3.5 text-center shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 font-orbitron">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            TOTAL WINS
          </div>
          <div className="font-orbitron text-2xl font-black text-emerald-400 mt-1">
            {wins}
          </div>
          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
            {winRate}% Win Rate
          </div>
        </div>

        {/* 9x Number Jackpots (Golden Hyper-Glow Card) */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-[#141009] to-[#080d1a] p-3.5 text-center shadow-[0_0_30px_rgba(255,184,0,0.2)] ring-1 ring-amber-500/30">
          <div className="absolute top-1 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </div>
          <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-amber-300 font-orbitron">
            <Trophy className="h-3 w-3 text-amber-400" />
            JACKPOTS (9X)
          </div>
          <div className="font-orbitron text-2xl font-black text-amber-300 mt-1 drop-shadow-[0_0_12px_rgba(255,184,0,0.6)]">
            {jackpots}
          </div>
          <div className="text-[9px] font-bold text-amber-400 mt-0.5">
            Exact Number Matches
          </div>
        </div>

        {/* Losses */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1020] p-3.5 text-center shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 font-orbitron">
            <XCircle className="h-3 w-3 text-rose-400" />
            TOTAL LOSSES
          </div>
          <div className="font-orbitron text-2xl font-black text-rose-400 mt-1">
            {losses}
          </div>
          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
            Max 4-Level Bound
          </div>
        </div>

        {/* Net P&L */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1020] p-3.5 text-center shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400 font-orbitron">
            {totalPnl >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-rose-400" />}
            NET PROFIT
          </div>
          <div
            className={`font-orbitron text-2xl font-black mt-1 ${
              totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnl >= 0 ? `+₹${totalPnl}` : `-₹${Math.abs(totalPnl)}`}
          </div>
          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
            Session Balance
          </div>
        </div>
      </div>

      {/* Filter Tabs & Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4 text-orange-400" />
          <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
            ROUND EXECUTION LEDGER
          </h3>
          <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-slate-400 font-mono">
            {history.length} RECORDS
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-[9px] font-orbitron font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              filter === 'ALL'
                ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(255,107,0,0.5)]'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            ALL ({history.length})
          </button>
          <button
            onClick={() => setFilter('JACKPOTS')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              filter === 'JACKPOTS'
                ? 'border border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(255,184,0,0.5)]'
                : 'border border-white/10 bg-white/5 text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <Trophy className="h-2.5 w-2.5" />
            JACKPOTS ({jackpots})
          </button>
          <button
            onClick={() => setFilter('WINS')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              filter === 'WINS'
                ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(34,211,127,0.4)]'
                : 'border border-white/10 bg-white/5 text-emerald-400/70 hover:text-emerald-300'
            }`}
          >
            WINS ({wins})
          </button>
          <button
            onClick={() => setFilter('LOSSES')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              filter === 'LOSSES'
                ? 'border border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                : 'border border-white/10 bg-white/5 text-rose-400/70 hover:text-rose-300'
            }`}
          >
            LOSSES ({losses})
          </button>
        </div>
      </div>

      {/* Clean & Professional Ledger Table */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-10 text-center text-slate-500">
          <HistoryIcon className="mx-auto h-8 w-8 opacity-40 mb-2 text-slate-400" />
          <p className="text-xs font-orbitron font-bold text-slate-400">NO ROUNDS FOUND IN THIS FILTER</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Start the prediction engine to accumulate live trading rounds.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f20] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0f162c] text-slate-400 font-orbitron text-[9px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3.5">Period / Mode</th>
                  <th className="py-3 px-3">Predicted Stake</th>
                  <th className="py-3 px-3">Actual Result</th>
                  <th className="py-3 px-3 text-center">Outcome</th>
                  <th className="py-3 px-3 text-center">Step</th>
                  <th className="py-3 px-3 text-right">Net Profit / PnL</th>
                  <th className="py-3 px-3.5 text-right">Wallet Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredHistory.map((h) => {
                  const isJackpot = h.jackpot;
                  const isWin = h.win;
                  const isDouble = h.doubleWin;

                  return (
                    <tr
                      key={h.id}
                      className={`transition-colors duration-200 ${
                        isJackpot
                          ? 'bg-gradient-to-r from-amber-950/30 via-yellow-950/15 to-[#0b1022] hover:bg-amber-950/40'
                          : isWin
                          ? 'hover:bg-emerald-950/15'
                          : 'hover:bg-rose-950/15'
                      }`}
                    >
                      {/* Period & Game */}
                      <td className="py-3 px-3.5">
                        <div className="font-orbitron font-bold text-white text-xs">
                          #{h.period.slice(-5)}
                        </div>
                        <div className="text-[8px] text-slate-400 uppercase font-sans mt-0.5">
                          {h.game} • {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* Predicted Stake */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 font-orbitron">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black ${
                                h.prediction === 'BIG' ? 'text-orange-400' : 'text-cyan-400'
                              }`}
                            >
                              {h.prediction}
                            </span>
                            <span className="text-slate-400 text-[10px]">₹{h.sizeBet}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-emerald-300">
                            <span>#{h.predictedSameNum} (Same)</span>
                            <span className="text-slate-400">₹{h.numBet}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actual Result Bead */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-orbitron text-xs font-black shadow-md ${getNumberColorClass(
                              h.actualNum
                            )}`}
                          >
                            {h.actualNum}
                          </span>
                          <span className="font-orbitron text-[10px] font-bold text-slate-300">
                            {h.actualType}
                          </span>
                        </div>
                      </td>

                      {/* Outcome Badge with Hyper-Premium Jackpot Shimmer */}
                      <td className="py-3 px-3 text-center">
                        {isJackpot ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/80 bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-1 font-orbitron text-[9px] font-black text-black shadow-[0_0_15px_rgba(255,184,0,0.8)] animate-pulse">
                              <Trophy className="h-3 w-3 fill-black" />
                              JACKPOT 9X
                            </span>
                            <span className="text-[8px] font-bold text-amber-300 mt-0.5">
                              #{h.actualNum} MATCH!
                            </span>
                          </div>
                        ) : isWin ? (
                          <span className="inline-flex items-center gap-0.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-orbitron text-[9px] font-black text-emerald-400">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            WIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 font-orbitron text-[9px] font-black text-rose-400">
                            <XCircle className="h-2.5 w-2.5" />
                            LOSS
                          </span>
                        )}
                      </td>

                      {/* Martingale Level */}
                      <td className="py-3 px-3 text-center">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-orbitron text-[9px] font-black text-slate-300">
                          L{h.level}
                        </span>
                      </td>

                      {/* Net Profit / PnL */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`font-orbitron text-xs font-black ${
                            h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {h.pnl >= 0 ? `+₹${h.pnl}` : `-₹${Math.abs(h.pnl)}`}
                        </div>
                        {isJackpot && (
                          <div className="text-[8px] font-bold text-amber-300 font-sans">
                            incl. 9x (+₹{Math.round(h.numBet * 9)})
                          </div>
                        )}
                      </td>

                      {/* Wallet Balance After Round */}
                      <td className="py-3 px-3.5 text-right font-orbitron font-bold text-white text-xs">
                        ₹{h.walletAfter.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
