import React from 'react';
import { FusionPrediction } from '../types';
import { Cpu, Eye, Shield, Brain, BarChart3, Binary, CheckCircle } from 'lucide-react';

interface EngineTabProps {
  prediction: FusionPrediction | null;
}

export const EngineTab: React.FC<EngineTabProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#10152a] p-12 text-center text-slate-400">
        <Cpu className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <div className="font-orbitron text-xs font-bold text-slate-300">NO ANALYSIS YET</div>
        <p className="text-[11px] mt-1">Start the engine from Home to activate the 5-brain analysis.</p>
      </div>
    );
  }

  const { engines, cands, weights, agree, conf, regime, risk, singleSameNum } = prediction;
  const A = engines.RDX;
  const B = engines.VANTA;
  const C = engines.NOCTIS;
  const D = engines.BRAIN;
  const M = engines.MARKET;

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-[#131932] to-[#0c1020] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-orange-400" />
            <h3 className="font-orbitron text-xs font-black tracking-wider text-white">
              QUANTUM MULTI-ENGINE CONVERGENCE
            </h3>
          </div>
          <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 font-orbitron text-[10px] font-bold text-orange-400">
            {agree}/5 ENGINES ALIGNED
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
          <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">FUSED CALL</div>
            <div
              className={`font-orbitron text-sm font-black ${
                prediction.call === 'BIG' ? 'text-orange-400' : 'text-cyan-400'
              }`}
            >
              {prediction.call} (90%)
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">SAME-SIDE NUM</div>
            <div className="font-orbitron text-sm font-black text-emerald-400">
              #{singleSameNum.num} (10%)
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">CONFIDENCE</div>
            <div className="font-orbitron text-sm font-black text-emerald-400">
              {conf}%
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
            <div className="text-[8px] font-bold text-slate-400 font-orbitron">REGIME</div>
            <div className="font-orbitron text-xs font-bold text-slate-200 mt-0.5">
              {regime}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Engine Deep Breakdown */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Engine 1: BRAIN */}
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Brain className="h-4 w-4 text-purple-400" />
              NARUTO BRAIN (Neural)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-orbitron text-[9px] font-black ${
                D?.call === 'BIG' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {D?.call} • {D?.conf}%
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Detected Pattern:</span>
              <span className="font-orbitron text-white">{D?.pattern || 'Balanced'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Human vs AI Read:</span>
              <span className="text-slate-200">{D?.verdict || 'Converged'}</span>
            </div>
          </div>
        </div>

        {/* Engine 2: MARKET */}
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              NARUTO MARKET (Regime)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-orbitron text-[9px] font-black ${
                M?.call === 'BIG' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {M?.call} • {M?.conf}%
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Market State:</span>
              <span className="font-orbitron text-white">{M?.state || 'Normal'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alternation Rate (20):</span>
              <span className="font-orbitron text-slate-200">
                {Math.round((M?.metrics?.alt20 || 0.5) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Engine 3: RDX CORE */}
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Cpu className="h-4 w-4 text-orange-400" />
              NARUTO CORE (RDX Matrix)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-orbitron text-[9px] font-black ${
                A?.call === 'BIG' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {A?.call} • {A?.conf}%
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Matrix Layers:</span>
              <span className="font-orbitron text-white">{A?.layers?.length || 4} evaluated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P(BIG) Probability:</span>
              <span className="font-orbitron text-slate-200">{Math.round((A?.pBig || 0.5) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Engine 4: VANTA VISION */}
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Eye className="h-4 w-4 text-cyan-400" />
              NARUTO VISION (Entropy & Markov)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-orbitron text-[9px] font-black ${
                B?.call === 'BIG' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {B?.call} • {B?.conf}%
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Pattern Basis:</span>
              <span className="font-orbitron text-white truncate max-w-[160px]">{B?.basis || 'Alternation'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Markov Transition:</span>
              <span className="font-orbitron text-slate-200">Digit #{B?.markov ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Engine 5: NOCTIS GUARD */}
        <div className="rounded-2xl border border-white/10 bg-[#10152a] p-4 sm:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-orbitron text-xs font-bold text-white">
              <Shield className="h-4 w-4 text-rose-400" />
              NARUTO GUARD (Pattern DB & Wilson Score)
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-orbitron text-[9px] font-black ${
                C?.call === 'BIG' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {C?.call} • {C?.conf}%
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Matched DB Patterns:</span>
              <span className="font-orbitron text-white">{C?.used?.length || 0} active sequences</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guard Confidence Edge:</span>
              <span className="font-orbitron text-slate-200">Bound: {C?.conf}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
