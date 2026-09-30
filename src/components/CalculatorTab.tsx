import React, { useState } from 'react';
import { Calculator, Wallet, TrendingUp, ShieldCheck, Flame } from 'lucide-react';
import { calculate4LevelMartingale } from '../utils/martingale';

export const CalculatorTab: React.FC = () => {
  const [testWallet, setTestWallet] = useState(1000);
  const [testTarget, setTestTarget] = useState(2000);

  const plan = calculate4LevelMartingale(testWallet, testTarget, 1);

  return (
    <div className="space-y-4">
      {/* Title Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Calculator className="h-5 w-5 text-orange-400" />
          <div>
            <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
              INTERACTIVE 4-LEVEL MARTINGALE SIMULATOR (85% / 15%)
            </h3>
            <p className="text-[10px] text-slate-400">
              Test any custom virtual wallet balance and verify guaranteed net profit on all 4 levels.
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 font-orbitron">
              TEST WALLET AMOUNT (₹)
            </label>
            <input
              type="number"
              value={testWallet}
              onChange={(e) => setTestWallet(Math.max(20, parseInt(e.target.value, 10) || 20))}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 font-orbitron text-base font-black text-white outline-none focus:border-orange-500"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {[200, 500, 1000, 2000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  onClick={() => setTestWallet(val)}
                  className={`rounded-lg px-2 py-0.5 font-orbitron text-[9px] font-bold ${
                    testWallet === val
                      ? 'bg-orange-500 text-black'
                      : 'border border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 font-orbitron">
              TARGET GOAL AMOUNT (₹)
            </label>
            <input
              type="number"
              value={testTarget}
              onChange={(e) => setTestTarget(Math.max(testWallet + 10, parseInt(e.target.value, 10) || testWallet * 2))}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 font-orbitron text-base font-black text-cyan-300 outline-none focus:border-cyan-500"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                { label: '2X', mult: 2 },
                { label: '3X', mult: 3 },
                { label: '5X', mult: 5 },
              ].map(({ label, mult }) => (
                <button
                  key={label}
                  onClick={() => setTestTarget(testWallet * mult)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-orbitron text-[9px] font-bold text-cyan-300"
                >
                  {label} (₹{testWallet * mult})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result Ladder */}
      <div className="rounded-2xl border border-orange-500/30 bg-[#10152a] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="font-orbitron text-xs font-bold text-white">
            100% WALLET LADDER BREAKDOWN (85% SIZE • 15% OPP NUM)
          </span>
          <span className="font-orbitron text-[10px] font-bold text-emerald-400">
            TOTAL = ₹{plan.totalAllocated} (100%)
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {plan.levels.map((lvl) => (
            <div
              key={lvl.level}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#070a14] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 font-orbitron text-xs font-black text-orange-400">
                  L{lvl.level}
                </span>
                <div>
                  <div className="font-orbitron text-xs font-black text-white">
                    TOTAL BET: ₹{lvl.totalBet} ({lvl.percentage}%)
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Cumulative protection ladder
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-orbitron font-bold text-orange-300">
                  85% Size: ₹{lvl.sizeBet} (Net Profit: +₹{lvl.sizeNetProfit})
                </span>
                <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-orbitron font-bold text-cyan-300">
                  15% Opp Num: ₹{lvl.oppNumBet} (Net Profit: +₹{lvl.numNetProfit})
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-[10px] text-slate-300 space-y-1">
          <span className="font-bold text-emerald-400 font-orbitron block">
            ✓ GUARANTEED NET PROFIT ON ANY LEVEL WIN:
          </span>
          <p>
            • Whether your round hits on the 85% Size bet (1.96x) or the 15% Single Opposite Number bet (9.0x), the payout recovers all previous stakes in the 4-level sequence and yields guaranteed net profit!
          </p>
          <p>
            • If Level 1 loses, you advance to Level 2 without decreasing your bet amount.
          </p>
          <p>
            • When any level wins, your wallet increases and all 4 levels expand proportionally!
          </p>
        </div>
      </div>
    </div>
  );
};
