import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Target, Flame, RotateCcw, ArrowRight } from 'lucide-react';
import { SessionState } from '../types';

interface TargetSuccessModalProps {
  session: SessionState;
  onResetNewTarget: () => void;
  onContinueSession: () => void;
}

export const TargetSuccessModal: React.FC<TargetSuccessModalProps> = ({
  session,
  onResetNewTarget,
  onContinueSession,
}) => {
  useEffect(() => {
    try {
      const end = Date.now() + 2500;
      const interval: any = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#ffb800', '#ff6b00', '#22d37f', '#00d4ff', '#eef1ff'],
        });
      }, 250);
    } catch {}
  }, []);

  const totalProfit = session.currentWallet - session.initialWallet;
  const roi = Math.round((totalProfit / session.initialWallet) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#20170a] via-[#101424] to-[#070a14] p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(255,184,0,0.3)] sm:p-8">
        {/* Glow Header */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-400" />

        {/* Big Trophy */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-[0_0_35px_rgba(255,184,0,0.5)]">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#120f0a] text-amber-400">
            <Award className="h-14 w-14 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div className="mt-4">
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-orbitron text-[10px] font-black tracking-wider text-amber-300">
            TARGET ACCOMPLISHED!
          </span>
          <h2 className="mt-2 font-orbitron text-2xl font-black text-white sm:text-3xl">
            GOAL ACHIEVED 🏆
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Target amount of ₹{session.targetWallet.toLocaleString()} reached under 4-Level Martingale discipline!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-[9px] font-bold text-slate-400">TOTAL NET PROFIT</span>
            <div className="font-orbitron text-base font-black text-emerald-400">
              +₹{totalProfit.toLocaleString()}
            </div>
            <div className="text-[9px] font-bold text-emerald-400/80">+{roi}% ROI</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-[9px] font-bold text-slate-400">SESSION ROUNDS</span>
            <div className="font-orbitron text-base font-black text-cyan-300">
              {session.wins}W / {session.losses}L
            </div>
            <div className="text-[9px] text-slate-400">{session.jackpots} Jackpot Hits</div>
          </div>
        </div>

        {/* Balance Progression Strip */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs flex items-center justify-between font-orbitron">
          <div className="text-left">
            <span className="text-[9px] text-slate-400 block font-normal">STARTED WITH</span>
            <span className="font-bold text-white">₹{session.initialWallet.toLocaleString()}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-400" />
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block font-normal">CURRENT BALANCE</span>
            <span className="font-bold text-amber-300">₹{session.currentWallet.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={onResetNewTarget}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-3.5 font-orbitron text-xs font-black tracking-wider text-black shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-all hover:scale-[1.01] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            START NEXT HIGHER TARGET SESSION
          </button>

          <button
            onClick={onContinueSession}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-orbitron text-xs font-bold text-slate-300 transition-all hover:bg-white/10"
          >
            CONTINUE PLAYING
          </button>
        </div>
      </div>
    </div>
  );
};
