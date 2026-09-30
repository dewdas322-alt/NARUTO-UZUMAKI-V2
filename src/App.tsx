import React, { useState, useEffect, useRef } from 'react';
import { GameType, GameRecord, LicenseInfo, FusionPrediction, SessionState, HistoryItem } from './types';
import { getCfg, fusePrediction, bs1, BS } from './utils/engines';
import { calculate4LevelMartingale, calculateRoundPnL } from './utils/martingale';
import { fetchLiveHistory, generateSeedRecords, nextPeriod } from './utils/api';
import { validateKey, getCachedDeviceId, generateDeviceId, cacheDeviceId } from './utils/auth';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { KeyGateModal } from './components/KeyGateModal';
import { SessionSetupModal } from './components/SessionSetupModal';
import { WalletHUD } from './components/WalletHUD';
import { PredictionCore } from './components/PredictionCore';
import { MartingaleLevelCard } from './components/MartingaleLevelCard';
import { RoadmapCard } from './components/RoadmapCard';
import { TargetSuccessModal } from './components/TargetSuccessModal';
import { HistoryTab } from './components/HistoryTab';
import { EngineTab } from './components/EngineTab';
import { CalculatorTab } from './components/CalculatorTab';
import { ProfileTab } from './components/ProfileTab';

import { Play, Square, RefreshCw, LayoutDashboard, Calculator, Cpu, History as HistoryIcon, User } from 'lucide-react';

export default function App() {
  // Always require key on fresh open/restart (do not persist active session across reloads)
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Fresh session state initialized to 0 on every restart/reopen
  const [session, setSession] = useState<SessionState>({
    initialWallet: 500,
    currentWallet: 500,
    targetWallet: 1000,
    targetReached: false,
    level: 1,
    sizePct: 90,
    wins: 0,
    losses: 0,
    jackpots: 0,
    totalPnl: 0,
    peakWallet: 500,
    lowestWallet: 500,
    history: [],
  });

  // Ref to always track latest session without stale closures
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const [showSessionModal, setShowSessionModal] = useState(false);

  // Active Game & Engine State
  const [game, setGame] = useState<GameType>('wingo30');
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisTimer, setAnalysisTimer] = useState<number>(4);
  const [timerSecs, setTimerSecs] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'home' | 'calculator' | 'engines' | 'history' | 'profile'>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Records & Prediction State
  const [records, setRecords] = useState<Record<GameType, GameRecord[]>>({
    wingo30: [],
    wingo1m: [],
    wingo3m: [],
    wingo5m: [],
    trx1m: [],
    k31m: [],
  });

  const lastSeenPeriodRef = useRef<Record<string, string>>({});
  const [currentPrediction, setCurrentPrediction] = useState<FusionPrediction | null>(null);
  const pendingPredictionRef = useRef<{
    period: string;
    prediction: 'BIG' | 'SMALL';
    sameNum: number;
    levelPlan: any;
    currentLevel: number;
  } | null>(null);

  // Overlays
  const [showTargetSuccess, setShowTargetSuccess] = useState(false);

  // Clean wipe on initial mount so fresh open starts at 0
  useEffect(() => {
    try {
      localStorage.removeItem('naruto_v2_session');
    } catch {}
    setAuthChecked(true);
  }, []);

  // Sync Audio Setting
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  // Auto 4-Level Martingale Calculation with dynamic sizePct
  const martingale = calculate4LevelMartingale(
    session.currentWallet,
    session.targetWallet,
    session.level,
    session.sizePct || 90
  );
  const activeLevelPlan = martingale.levels[session.level - 1] || martingale.levels[0];

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const cfg = getCfg(gameRef.current);
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = cfg.secs - (nowSec % cfg.secs);
      setTimerSecs(rem);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Polling Loop
  useEffect(() => {
    if (!running || !license) return;

    let isMounted = true;
    const pollInterval = setInterval(() => {
      if (isMounted && runningRef.current) {
        pollCycle();
      }
    }, 3000);

    // Initial cycle
    pollCycle();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [running, license, game]);

  // Cycle evaluation function
  const pollCycle = async () => {
    const curGame = gameRef.current;
    let recs = await fetchLiveHistory(curGame, 20, 1);
    if (!recs || recs.length === 0) {
      setRecords((prev) => {
        if (!prev[curGame] || prev[curGame].length === 0) {
          recs = generateSeedRecords(curGame, 30);
          return { ...prev, [curGame]: recs };
        }
        recs = prev[curGame];
        return prev;
      });
    } else {
      setRecords((prev) => ({
        ...prev,
        [curGame]: recs,
      }));
    }

    const latest = recs?.[0];
    if (!latest) return;

    // Check if period already processed to prevent repeated blinking
    const previousSeen = lastSeenPeriodRef.current[curGame];
    if (previousSeen === latest.period) {
      return;
    }

    lastSeenPeriodRef.current[curGame] = latest.period;

    // 1. Resolve pending prediction if this new result matches
    if (pendingPredictionRef.current && pendingPredictionRef.current.period === latest.period) {
      resolvePendingRound(latest);
    }

    // 2. Start exact 4-Second Hyper-Premium Analysis Animation
    setAnalyzing(true);
    setAnalysisTimer(4);

    let count = 4;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setAnalysisTimer(Math.max(0, count));
      if (count <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      const targetP = nextPeriod(latest.period);
      const currentCurWallet = sessionRef.current.currentWallet;
      const currentCurLevel = sessionRef.current.level;
      const curPlan = calculate4LevelMartingale(
        currentCurWallet,
        sessionRef.current.targetWallet,
        currentCurLevel,
        sessionRef.current.sizePct || 90
      );
      const curActiveLevelPlan = curPlan.levels[currentCurLevel - 1] || curPlan.levels[0];

      const pred = fusePrediction(recs, targetP, curGame, currentCurLevel, curActiveLevelPlan);

      setCurrentPrediction(pred);
      setAnalyzing(false);

      pendingPredictionRef.current = {
        period: targetP,
        prediction: pred.call,
        sameNum: pred.singleSameNum.num,
        levelPlan: curActiveLevelPlan,
        currentLevel: currentCurLevel,
      };
    }, 4000);
  };

  // Resolves round result and reliably updates wallet balance
  const resolvePendingRound = (fin: GameRecord) => {
    const pending = pendingPredictionRef.current;
    if (!pending) return;

    const actualNum = fin.number;
    const curGame = gameRef.current;
    const actualType = BS(actualNum, curGame);
    const sizeWon = pending.prediction === actualType;
    const numWon = pending.sameNum === actualNum;

    const outcome = calculateRoundPnL(pending.levelPlan, sizeWon, numWon);

    // Compute updated wallet using sessionRef to avoid stale state closure!
    const currentBaseWallet = sessionRef.current.currentWallet;
    const newWallet = Math.max(0, Math.round((currentBaseWallet + outcome.pnl) * 10) / 10);

    const histItem: HistoryItem = {
      id: `${fin.period}_${Date.now()}`,
      period: fin.period,
      game: curGame,
      prediction: pending.prediction,
      predictedSameNum: pending.sameNum,
      actualType,
      actualNum,
      win: outcome.win,
      jackpot: outcome.jackpot,
      sizeWin: outcome.sizeWin,
      doubleWin: outcome.doubleWin,
      level: pending.currentLevel,
      betAmount: pending.levelPlan.totalBet,
      sizeBet: pending.levelPlan.sizeBet,
      numBet: pending.levelPlan.sameNumBet,
      pnl: outcome.pnl,
      walletAfter: newWallet,
      conf: currentPrediction?.conf || 85,
      timestamp: Date.now(),
      engines: currentPrediction?.cands || {},
    };

    if (outcome.win) {
      if (outcome.jackpot) {
        sound.playJackpot();
      } else {
        sound.playWin();
      }

      // Check if target goal achieved
      const isTargetReached = newWallet >= sessionRef.current.targetWallet;
      if (isTargetReached) {
        sound.playTargetComplete();
        setShowTargetSuccess(true);
      }

      // Win resets Martingale step back to 1 and expands wallet
      setSession((prev) => ({
        ...prev,
        currentWallet: newWallet,
        level: 1,
        wins: prev.wins + 1,
        jackpots: prev.jackpots + (outcome.jackpot ? 1 : 0),
        totalPnl: Math.round((prev.totalPnl + outcome.pnl) * 10) / 10,
        peakWallet: Math.max(prev.peakWallet, newWallet),
        history: [histItem, ...prev.history].slice(0, 100),
      }));
    } else {
      sound.playBetPlaced();
      // Loss advances to next Martingale Level (1 -> 2 -> 3 -> 4, with core focus on L1 & L2)
      const nextLevel = Math.min(4, sessionRef.current.level + 1);

      setSession((prev) => ({
        ...prev,
        currentWallet: newWallet,
        level: nextLevel,
        losses: prev.losses + 1,
        totalPnl: Math.round((prev.totalPnl + outcome.pnl) * 10) / 10,
        lowestWallet: Math.min(prev.lowestWallet, newWallet),
        history: [histItem, ...prev.history].slice(0, 100),
      }));
    }

    pendingPredictionRef.current = null;
  };

  const handleStartStop = () => {
    sound.playClick();
    if (!running) {
      setRunning(true);
      pollCycle();
    } else {
      setRunning(false);
      setAnalyzing(false);
      setCurrentPrediction(null);
      pendingPredictionRef.current = null;
    }
  };

  const handleGameSelect = (g: GameType) => {
    if (g === game) return;
    sound.playClick();
    setGame(g);
    setCurrentPrediction(null);
    pendingPredictionRef.current = null;
    lastSeenPeriodRef.current = {};
  };

  const handleConfirmSession = (w: number, t: number, sizePct: number = 90) => {
    setSession((prev) => ({
      ...prev,
      initialWallet: w,
      currentWallet: w,
      targetWallet: t,
      sizePct: sizePct || 90,
      level: 1,
      targetReached: false,
    }));
    setShowSessionModal(false);
  };

  const handleResetSession = () => {
    setShowSessionModal(true);
  };

  const handleClearHistory = () => {
    sound.playClick();
    if (confirm('Clear all historical round records?')) {
      setSession((prev) => ({
        ...prev,
        history: [],
        wins: 0,
        losses: 0,
        jackpots: 0,
        totalPnl: 0,
      }));
    }
  };

  const handleLogout = () => {
    sound.playClick();
    setLicense(null);
    setRunning(false);
    setCurrentPrediction(null);
  };

  if (!authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#070a14] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <span className="font-orbitron text-xs tracking-wider text-slate-400">
            INITIALIZING HARDWARE ENCRYPTION...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-300">
      {/* Background Lighting Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[150px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      {/* License Key Gate (Opens on Every App Launch) */}
      {!license && (
        <KeyGateModal
          onUnlocked={(lic) => {
            setLicense(lic);
            setShowSessionModal(true);
          }}
        />
      )}

      {/* Target & Wallet Setup Modal */}
      {showSessionModal && (
        <SessionSetupModal
          initialWallet={session.initialWallet}
          initialTarget={session.targetWallet}
          initialSizePct={session.sizePct || 90}
          onConfirm={handleConfirmSession}
          onClose={() => setShowSessionModal(false)}
          isFirstSetup={session.wins === 0 && session.losses === 0}
        />
      )}

      {/* Target Accomplished Modal */}
      {showTargetSuccess && (
        <TargetSuccessModal
          session={session}
          onResetNewTarget={() => {
            setShowTargetSuccess(false);
            setShowSessionModal(true);
          }}
          onContinueSession={() => setShowTargetSuccess(false)}
        />
      )}

      {/* Top Header */}
      <Header
        license={license}
        currentWallet={session.currentWallet}
        targetWallet={session.targetWallet}
        sizePct={session.sizePct || 90}
        running={running}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSessionModal={() => setShowSessionModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="relative z-10 mx-auto flex-1 w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-6 pb-24">
        {/* Game Mode Selector Bar */}
        <div className="mb-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'wingo30', label: 'WinGo 30S', sub: '0-9' },
              { id: 'wingo1m', label: 'WinGo 1M', sub: '0-9' },
              { id: 'wingo3m', label: 'WinGo 3M', sub: '0-9' },
              { id: 'wingo5m', label: 'WinGo 5M', sub: '0-9' },
              { id: 'trx1m', label: 'TRX 1M', sub: '0-9' },
              { id: 'k31m', label: 'K3 1M', sub: '3-18' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => handleGameSelect(g.id as GameType)}
                className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 font-orbitron transition-all ${
                  game === g.id
                    ? 'border border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_15px_rgba(255,107,0,0.4)]'
                    : 'border border-white/10 bg-[#0e1326] text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-black">{g.label}</span>
                <span className="text-[8px] font-bold opacity-75">{g.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Live Wallet & Target HUD */}
            <WalletHUD
              session={session}
              martingale={martingale}
              onEditSession={() => setShowSessionModal(true)}
              onResetSession={() => setShowSessionModal(true)}
            />

            {/* Central Radar Prediction Core with Glowing Heartbeat Animation */}
            <PredictionCore
              prediction={currentPrediction}
              levelPlan={activeLevelPlan}
              currentLevel={session.level}
              game={game}
              timerSecs={timerSecs}
              analyzing={analyzing}
              analysisTimeRemaining={analysisTimer}
              running={running}
            />

            {/* Engine Start / Stop Control Button */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                onClick={handleStartStop}
                className={`flex items-center justify-center gap-2 rounded-2xl py-4 font-orbitron text-xs font-black tracking-wider transition-all shadow-lg active:scale-95 ${
                  running
                    ? 'border border-rose-500/50 bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-[0_0_30px_rgba(255,77,109,0.4)]'
                    : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-black shadow-[0_0_30px_rgba(255,107,0,0.4)] hover:shadow-[0_0_40px_rgba(255,107,0,0.6)]'
                }`}
              >
                {running ? (
                  <>
                    <Square className="h-4 w-4 fill-white" />
                    STOP ENGINE
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-black" />
                    START 4-LEVEL PREDICTION ENGINE (L1-L2 FOCUS)
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSessionModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 font-orbitron text-xs font-bold text-slate-300 transition-all hover:bg-white/10 active:scale-95"
              >
                <RefreshCw className="h-4 w-4 text-orange-400" />
                RECONFIGURE TARGET (₹{session.currentWallet} → ₹{session.targetWallet})
              </button>
            </div>

            {/* 4-Level Martingale Breakdown Card */}
            <MartingaleLevelCard martingale={martingale} />

            {/* Last 10 Bead Roadmap */}
            <RoadmapCard
              records={records[game] || []}
              game={game}
              nextCall={currentPrediction?.call || null}
              patternName={currentPrediction?.engines?.BRAIN?.pattern}
              patternNote={currentPrediction?.engines?.BRAIN?.patternNote}
            />
          </div>
        )}

        {activeTab === 'calculator' && <CalculatorTab />}

        {activeTab === 'engines' && <EngineTab prediction={currentPrediction} />}

        {activeTab === 'history' && (
          <HistoryTab
            history={session.history}
            wins={session.wins}
            losses={session.losses}
            jackpots={session.jackpots}
            totalPnl={session.totalPnl}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            license={license}
            session={session}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onResetSession={handleResetSession}
            onClearHistory={handleClearHistory}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-2 z-40 mx-auto max-w-lg px-3">
        <div className="flex items-center justify-around rounded-2xl border border-white/15 bg-[#0a0f20]/90 p-1.5 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          {[
            { id: 'home', label: 'HOME', icon: LayoutDashboard },
            { id: 'calculator', label: '4-LEVEL CALC', icon: Calculator },
            { id: 'engines', label: '5-BRAIN', icon: Cpu },
            { id: 'history', label: 'HISTORY', icon: HistoryIcon },
            { id: 'profile', label: 'PROFILE', icon: User },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(id as any);
                }}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 font-orbitron transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-[0_0_15px_rgba(255,107,0,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[8px] tracking-wider">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
