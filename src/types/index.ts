export type GameType = 'wingo30' | 'wingo1m' | 'wingo3m' | 'wingo5m' | 'trx1m' | 'k31m';

export interface GameConfig {
  id: GameType;
  label: string;
  min: number;
  max: number;
  bigTh: number;
  total: number;
  poolB: number[];
  poolS: number[];
  secs: number;
}

export interface GameRecord {
  period: string;
  number: number;
}

export interface LicenseInfo {
  valid: boolean;
  cleanKey: string;
  durCode: string;
  duration: number;
  activatedAt: number;
  expiresAt: number;
  deviceId: string;
  firstBind: boolean;
  source: string;
}

export interface LevelPlan {
  level: number;
  name: string;
  percentage: number; // % of total wallet (sums to 100% across 4 levels)
  totalBet: number;
  sizeBet: number;    // 90% of totalBet
  sameNumBet: number; // 10% of totalBet (Same Side Single Number)
  potentialSizeWin: number;
  potentialNumWin: number;
  sizeNetProfit: number; // Guaranteed net profit if size wins
  numNetProfit: number;  // Massive profit if same-side number jackpot hits (9.0x)
  doubleWinProfit: number; // Combined profit if both Size & Same Number hit!
}

export interface Martingale4Levels {
  walletAmount: number;
  targetAmount: number;
  currentLevel: number; // 1, 2, 3, 4 (Primary Focus on Level 1 & 2)
  levels: LevelPlan[];
  totalAllocated: number;
  isCustomMultiplier?: boolean;
}

export type Martingale2Levels = Martingale4Levels;

export interface SingleSameNumInfo {
  num: number;
  side: 'BIG' | 'SMALL';
  score: number;
  reasons: string[];
  gap: number;
  avgGap: number;
  markovProb: number;
}

export interface EngineResult {
  id: 'RDX' | 'VANTA' | 'NOCTIS' | 'BRAIN' | 'MARKET';
  name: string;
  call: 'BIG' | 'SMALL';
  conf: number;
  pBig: number;
  details?: any;
}

export interface FusionPrediction {
  period: string;
  call: 'BIG' | 'SMALL';
  pBig: number;
  conf: number;
  agree: number;
  cands: Record<string, 'BIG' | 'SMALL'>;
  singleSameNum: SingleSameNumInfo; // Same Side Single Number
  engines: Record<string, any>;
  regime: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH';
  weights: Record<string, number>;
  market: any;
  targetPeriod: string;
  levelPlan: LevelPlan;
}

export interface HistoryItem {
  id: string;
  period: string;
  game: GameType;
  prediction: 'BIG' | 'SMALL';
  predictedSameNum: number; // Same Side Single Number
  actualType: 'BIG' | 'SMALL';
  actualNum: number;
  win: boolean;
  jackpot: boolean; // Same number hit!
  sizeWin: boolean;
  doubleWin: boolean; // Both Size & Number Hit!
  level: number;
  betAmount: number;
  sizeBet: number;
  numBet: number;
  pnl: number;
  walletAfter: number;
  conf: number;
  timestamp: number;
  engines: Record<string, string>;
}

export interface SessionState {
  initialWallet: number;
  currentWallet: number;
  targetWallet: number;
  targetReached: boolean;
  level: number;
  wins: number;
  losses: number;
  jackpots: number;
  totalPnl: number;
  peakWallet: number;
  lowestWallet: number;
  history: HistoryItem[];
}
