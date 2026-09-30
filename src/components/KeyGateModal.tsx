import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, Lock, Smartphone } from 'lucide-react';
import { validateKey, generateDeviceId, getCachedDeviceId, cacheDeviceId } from '../utils/auth';
import { sound } from '../utils/audio';
import { LicenseInfo } from '../types';

interface KeyGateModalProps {
  onUnlocked: (lic: LicenseInfo) => void;
}

export const KeyGateModal: React.FC<KeyGateModalProps> = ({ onUnlocked }) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    async function initDevice() {
      let dev = getCachedDeviceId();
      if (!dev) {
        dev = await generateDeviceId();
        cacheDeviceId(dev);
      }
      setDeviceId(dev);
    }
    initDevice();
  }, []);

  const handleUnlock = async (keyToUse?: string) => {
    sound.playClick();
    const finalKey = (keyToUse || keyInput).trim().toUpperCase();
    if (!finalKey) {
      setErrorMsg('PLEASE ENTER LICENSE KEY');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let dev = deviceId;
      if (!dev) {
        dev = await generateDeviceId();
        cacheDeviceId(dev);
        setDeviceId(dev);
      }

      const res = await validateKey(finalKey, dev);
      setLoading(false);

      if (!res.valid) {
        const errorMap: Record<string, string> = {
          FORMAT: 'INVALID KEY FORMAT. Use NUZU-<DUR>-<SERIAL>-<CHECKSUM>',
          INVALID_DURATION: 'UNKNOWN DURATION CODE IN KEY',
          CHECKSUM_MISMATCH: 'TAMPERED OR INVALID ENCRYPTED SIGNATURE',
          EXPIRED: res.errorDetails || 'LICENSE HAS EXPIRED. CANNOT BE REUSED',
          EMPTY: 'PLEASE ENTER LICENSE KEY',
          DEVICE_MISMATCH: '⛔ KEY IS ALREADY LOCKED TO ANOTHER DEVICE. ACCESS DENIED',
        };
        setErrorMsg(errorMap[res.reason || ''] || res.errorDetails || 'VERIFICATION FAILED');
        return;
      }

      sound.playWin();
      onUnlocked(res);
    } catch {
      setLoading(false);
      setErrorMsg('DEVICE VERIFICATION SYSTEM ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-60 w-60 rounded-full bg-cyan-600/15 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#161c36] via-[#0c1022] to-[#070a14] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(255,107,0,0.15)] sm:p-8">
        {/* Glow Accent Header */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />

        {/* Logo Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-0.5 shadow-[0_0_30px_rgba(255,107,0,0.4)]">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c1020]/40 font-orbitron text-3xl font-black text-white">
            N2
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 text-center">
          <h2 className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300 bg-clip-text font-orbitron text-xl font-black tracking-wider text-transparent sm:text-2xl">
            NARUTO UZUMAKI V2
          </h2>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400">
            <Lock className="h-3 w-3 text-orange-400" />
            DEVICE-LOCKED PREDICTION ENGINE
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="ENTER LICENSE KEY"
              className="w-full rounded-xl border border-white/20 bg-[#070a14]/90 px-4 py-3.5 text-center font-mono text-xs font-bold tracking-wider text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:shadow-[0_0_20px_rgba(255,107,0,0.25)] sm:text-sm"
              autoFocus
            />
            <KeyRound className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Unlock Button */}
          <button
            onClick={() => handleUnlock()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 py-3.5 font-orbitron text-xs font-black tracking-wider text-black shadow-[0_0_25px_rgba(255,107,0,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(255,107,0,0.5)] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                VERIFYING ENCRYPTED KEY...
              </span>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                UNLOCK & BIND TO THIS DEVICE
              </>
            )}
          </button>
        </div>

        {/* Seamless Device Lock Architecture Note */}
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 font-semibold">
              <Smartphone className="h-3 w-3 text-cyan-400" />
              Hardware Device Protection:
            </span>
            <span className="font-mono text-[9px] text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <p className="mt-1 text-[9px] text-slate-300">
            This key automatically binds to your device on first login. It cannot be used on any other phone or PC.
          </p>
        </div>
      </div>
    </div>
  );
};
