import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Zap, Wallet, Settings } from 'lucide-react';
import { LicenseInfo } from '../types';

interface HeaderProps {
  license: LicenseInfo | null;
  currentWallet: number;
  targetWallet: number;
  running: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSessionModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  license,
  currentWallet,
  targetWallet,
  running,
  soundEnabled,
  onToggleSound,
  onOpenSessionModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0f20]/80 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4">
        {/* Glow Line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 font-orbitron text-xl font-black text-black shadow-[0_0_20px_rgba(255,107,0,0.4)]">
            N2
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-black ring-2 ring-[#0a0f20]">
              90
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text font-orbitron text-xs font-black tracking-wider text-transparent sm:text-sm">
                NARUTO UZUMAKI V2
              </h1>
              <span className="hidden rounded-full border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 font-orbitron text-[9px] font-bold text-orange-400 sm:inline-block">
                90% SIZE • 10% NUM
              </span>
            </div>
            <p className="text-[9px] font-semibold tracking-wider text-slate-400">
              4-LEVEL • 90% SIZE / 10% SAME NUM • CYBER MATRIX
            </p>
          </div>
        </div>

        {/* Live Controls and Status */}
        <div className="flex items-center gap-2">
          {/* Virtual Wallet Quick Pill */}
          <button
            onClick={onOpenSessionModal}
            className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 active:scale-95"
            title="Configure Wallet & Target"
          >
            <Wallet className="h-3.5 w-3.5 text-orange-400 transition-transform group-hover:scale-110" />
            <div className="text-left font-orbitron text-[11px] font-bold text-white">
              ₹{currentWallet.toLocaleString()}
              <span className="hidden text-[9px] font-normal text-slate-400 sm:inline">
                {' '}/ ₹{targetWallet.toLocaleString()}
              </span>
            </div>
            <Settings className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-90 ${
              soundEnabled
                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                : 'border-white/10 bg-white/5 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Live Engine Indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-xl border px-2 py-1 text-[9px] font-bold tracking-wider font-orbitron ${
              running
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(34,211,127,0.2)]'
                : 'border-white/10 bg-white/5 text-slate-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                running ? 'animate-pulse bg-emerald-400 shadow-[0_0_8px_#22d37f]' : 'bg-slate-500'
              }`}
            />
            {running ? 'LIVE' : 'STANDBY'}
          </div>
        </div>
      </div>
    </header>
  );
};
