import React from 'react';
import { GameRecord, GameType } from '../types';
import { bs1, getCfg } from '../utils/engines';
import { Eye, Network } from 'lucide-react';

interface RoadmapCardProps {
  records: GameRecord[];
  game: GameType;
  nextCall: 'BIG' | 'SMALL' | null;
  patternName?: string;
  patternNote?: string;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  records,
  game,
  nextCall,
  patternName,
  patternNote,
}) => {
  const last10 = records.slice(0, 10).reverse();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#10152a] to-[#0c1020] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          <span className="font-orbitron text-xs font-bold text-white">
            LAST 10 ROUNDS BEAD ROAD
          </span>
        </div>
        {patternName && (
          <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-orbitron text-[9px] font-bold text-orange-400">
            {patternName}
          </span>
        )}
      </div>

      {/* Beads Row */}
      <div className="mt-3 flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
        {last10.map((r, i) => {
          const side = bs1(r.number, game);
          const isBig = side === 'B';
          const isLatest = i === last10.length - 1;

          return (
            <div
              key={r.period}
              className={`flex flex-1 min-w-[28px] max-w-[42px] flex-col items-center justify-center rounded-xl py-2 font-orbitron transition-all ${
                isBig
                  ? 'border border-orange-500/40 bg-orange-500/15 text-orange-400'
                  : 'border border-cyan-500/40 bg-cyan-500/15 text-cyan-400'
              } ${isLatest ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : ''}`}
            >
              <span className="text-xs font-black">{r.number}</span>
              <span className="text-[8px] font-bold opacity-80">{side}</span>
            </div>
          );
        })}

        {/* Next Predicted Bead */}
        {nextCall && (
          <div
            className={`flex flex-1 min-w-[32px] max-w-[46px] flex-col items-center justify-center rounded-xl border-2 border-dashed py-2 font-orbitron animate-pulse ${
              nextCall === 'BIG'
                ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                : 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
            }`}
          >
            <span className="text-xs font-black">?</span>
            <span className="text-[8px] font-bold">{nextCall === 'BIG' ? 'B' : 'S'}</span>
          </div>
        )}
      </div>

      {patternNote && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <Network className="h-3 w-3 text-slate-500 shrink-0" />
          <span>{patternNote}</span>
        </div>
      )}
    </div>
  );
};
