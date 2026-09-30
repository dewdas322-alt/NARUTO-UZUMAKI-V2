import React from 'react';
import { LicenseInfo, SessionState } from '../types';
import { ShieldCheck, Smartphone, Key, RotateCcw, Trash2, Cpu, Volume2, LogOut } from 'lucide-react';

interface ProfileTabProps {
  license: LicenseInfo | null;
  session: SessionState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetSession: () => void;
  onClearHistory: () => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  license,
  session,
  soundEnabled,
  onToggleSound,
  onResetSession,
  onClearHistory,
  onLogout,
}) => {
  const remainHours = license ? Math.max(0, Math.floor((license.expiresAt - Date.now()) / 3600000)) : 0;
  const remainDays = Math.floor(remainHours / 24);

  return (
    <div className="space-y-4">
      {/* Session Performance Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
        <h3 className="font-orbitron text-xs font-black tracking-wider text-white border-b border-white/10 pb-2.5">
          ACTIVE 4-LEVEL SESSION STATS
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">WINS</div>
            <div className="font-orbitron text-base font-black text-emerald-400">
              {session.wins}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">LOSSES</div>
            <div className="font-orbitron text-base font-black text-rose-400">
              {session.losses}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">NET P&L</div>
            <div
              className={`font-orbitron text-base font-black ${
                session.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {session.totalPnl >= 0 ? `+₹${session.totalPnl}` : `-₹${Math.abs(session.totalPnl)}`}
            </div>
          </div>
        </div>
      </div>

      {/* License & Device Lock Card */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-orbitron text-xs font-bold text-white">
              LICENSE & HARDWARE SECURITY
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-orbitron text-[9px] font-bold text-emerald-400">
            AUTO-LOCKED TO THIS DEVICE
          </span>
        </div>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-black/40 p-2.5 border border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold text-[11px]">
              <Key className="h-3.5 w-3.5 text-orange-400" />
              Active Key
            </span>
            <span className="font-mono text-[10px] font-bold text-white select-all">
              {license?.cleanKey || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-black/40 p-2.5 border border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
              Hardware Device ID
            </span>
            <span className="font-mono text-[9px] text-slate-300">
              {license?.deviceId ? `${license.deviceId.slice(0, 16)}...` : 'Verified'}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-black/40 p-2.5 border border-white/5">
            <span className="text-slate-400 font-semibold text-[11px]">Expiry Status</span>
            <span className="font-orbitron font-bold text-orange-400 text-[11px]">
              {remainDays > 0 ? `${remainDays}d ${remainHours % 24}h remaining` : `${remainHours}h remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Session Actions */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
        <h3 className="font-orbitron text-xs font-black tracking-wider text-white border-b border-white/10 pb-2.5">
          PREDICTION CONTROLS
        </h3>

        <div className="mt-3 space-y-2">
          <button
            onClick={onResetSession}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all hover:bg-white/10 active:scale-[0.99]"
          >
            <div>
              <div className="font-orbitron text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-orange-400" />
                Reset Target & Wallet
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Reconfigure virtual wallet balance and target goal.
              </div>
            </div>
            <span className="text-xs text-orange-400 font-bold">CONFIGURE</span>
          </button>

          <button
            onClick={onClearHistory}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all hover:bg-white/10 active:scale-[0.99]"
          >
            <div>
              <div className="font-orbitron text-xs font-bold text-white flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                Wipe Session Logs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Clear all historical round records.
              </div>
            </div>
            <span className="text-xs text-rose-400 font-bold">CLEAR</span>
          </button>

          <button
            onClick={onToggleSound}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all hover:bg-white/10 active:scale-[0.99]"
          >
            <div>
              <div className="font-orbitron text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                Audio Synthesizer FX
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Sound fx on bets, wins, and jackpots.
              </div>
            </div>
            <span
              className={`font-orbitron text-xs font-bold ${
                soundEnabled ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="flex w-full items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-rose-400 transition-all hover:bg-rose-500/20 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 font-orbitron text-xs font-bold">
              <LogOut className="h-4 w-4" />
              LOCK & LOGOUT SYSTEM
            </div>
            <span className="text-[10px] text-rose-400/80 font-bold">HARDWARE LOCKED</span>
          </button>
        </div>
      </div>

      {/* System Specifications */}
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4 text-[10px] text-slate-400">
        <div className="flex items-center gap-2 font-orbitron font-bold text-white mb-2">
          <Cpu className="h-4 w-4 text-orange-400" />
          SYSTEM SPECIFICATIONS
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div>Engine: <span className="text-white font-bold">NARUTO V2.0 PRO</span></div>
          <div>Bet Allocation: <span className="text-orange-400 font-bold">85% Size / 15% Opp Num</span></div>
          <div>Profit Guarantee: <span className="text-emerald-400 font-bold">Active on Every Win</span></div>
          <div>Device Lock: <span className="text-cyan-400 font-bold">Auto First-Device Lock</span></div>
        </div>
      </div>
    </div>
  );
};
