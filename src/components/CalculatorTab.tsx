import React, { useState } from 'react';
import { Calculator, Wallet, TrendingUp, ShieldCheck, Zap, Sliders } from 'lucide-react';
import { calculate4LevelMartingale } from '../utils/martingale';

export const CalculatorTab: React.FC = () => {
  const [testWallet, setTestWallet] = useState(1000);
  const [testTarget, setTestTarget] = useState(2000);
  const [sizePct, setSizePct] = useState(90);

  const numPct = 100 - sizePct;
  const plan = calculate4LevelMartingale(testWallet, testTarget, 1, sizePct);

  return (
    <div className="space-y-4">
      {/* Title Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Calculator className="h-5 w-5 text-orange-400" />
          <div>
            <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
              INTERACTIVE 4-LEVEL MARTINGALE SIMULATOR
            </h3>
            <p className="text-[10px] text-slate-400">
              100% wallet allocation across 4 levels • Manual Size & Number Ratio Controller.
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

        {/* Manual Ratio Slider in Simulator */}
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-black/40 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-orbitron">
              <Sliders className="h-3.5 w-3.5" />
              SIMULATE SPLIT RATIO:
            </span>
            <span className="font-orbitron text-xs font-black">
              <span className="text-orange-400">{sizePct}% SIZE</span>
              <span className="text-slate-500"> / </span>
              <span className="text-emerald-400">{numPct}% NUMBER</span>
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {[90, 85, 80, 75, 95].map((val) => (
              <button
                key={val}
                onClick={() => setSizePct(val)}
                className={`rounded-lg px-2 py-0.5 font-orbitron text-[9px] font-bold ${
                  sizePct === val
                    ? 'bg-cyan-500 text-black'
                    : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {val}% / {100 - val}%
              </button>
            ))}
          </div>

          <input
            type="range"
            min="50"
            max="95"
            value={sizePct}
            onChange={(e) => setSizePct(parseInt(e.target.value, 10))}
            className="mt-2.5 w-full accent-cyan-400 cursor-pointer h-2 rounded-lg bg-black/60 border border-white/10"
          />
        </div>
      </div>

      {/* Result Ladder */}
      <div className="rounded-2xl border border-orange-500/30 bg-[#10152a] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="font-orbitron text-xs font-bold text-white">
            4-LEVEL MARTINGALE LADDER ({sizePct}% SIZE • {numPct}% SAME NUM)
          </span>
          <span className="font-orbitron text-[10px] font-bold text-emerald-400">
            TOTAL = ₹{plan.totalAllocated} (100% WALLET)
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {plan.levels.map((lvl) => (
            <div
              key={lvl.level}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#070a14] p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/20 font-orbitron text-xs font-black text-orange-400">
                  L{lvl.level}
                </span>
                <div>
                  <div className="font-orbitron text-sm font-black text-white">
                    TOTAL BET: ₹{lvl.totalBet} ({lvl.percentage}% WALLET)
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {lvl.level === 1
                      ? 'Primary Strike (Target Focus)'
                      : lvl.level === 2
                      ? 'Fix Recovery (Primary Focus)'
                      : lvl.level === 3
                      ? 'Deep Safety Reserve'
                      : 'Ultimate Defense Reserve'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-orbitron font-bold text-orange-300">
                  {sizePct}% Size: ₹{lvl.sizeBet} (Net: +₹{lvl.sizeNetProfit})
                </span>
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-orbitron font-bold text-emerald-300">
                  {numPct}% Same Num: ₹{lvl.sameNumBet} (Net: +₹{lvl.numNetProfit})
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-[10px] text-slate-300 space-y-1">
          <span className="font-bold text-emerald-400 font-orbitron block">
            ✓ MANUAL ALLOCATION SPLIT ADVANTAGE:
          </span>
          <p>
            • Customize your stake distribution between Size (1.96x) and Same-Side Number (9.0x) to match your exact risk profile.
          </p>
          <p>
            • If both hit, you achieve a massive Double Win payout with combined multiplier!
          </p>
        </div>
      </div>
    </div>
  );
};
