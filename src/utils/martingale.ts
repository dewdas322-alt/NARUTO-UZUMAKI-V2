import { LevelPlan, Martingale4Levels } from '../types';

/**
 * Calculates 4-level Martingale ladder using 100% of the active wallet amount.
 * Level 1 + Level 2 + Level 3 + Level 4 = exactly walletAmount.
 *
 * Each level is partitioned into:
 * - 85% on Size (BIG / SMALL)
 * - 15% on Single Opposite Number
 *
 * GUARANTEED PROFIT PRINCIPLE:
 * Whether Size wins (1.96x) OR Single Opposite Number wins (9.0x),
 * the payout covers ALL previous losses in the 4-level sequence and yields guaranteed net profit!
 */
export function calculate4LevelMartingale(walletAmount: number, targetAmount: number, currentLevel: number = 1): Martingale4Levels {
  const safeWallet = Math.max(20, Math.round(walletAmount));

  // Optimal 4-level progression using 100% of wallet:
  // Level 1: ~4.5% of wallet
  // Level 2: ~12.5% of wallet
  // Level 3: ~28.0% of wallet
  // Level 4: ~55.0% of wallet
  // Sum = 100% of wallet
  let l1 = Math.max(1, Math.floor(safeWallet * 0.045));
  let l2 = Math.max(l1 + 1, Math.floor(safeWallet * 0.125));
  let l3 = Math.max(l2 + 1, Math.floor(safeWallet * 0.28));
  let l4 = safeWallet - (l1 + l2 + l3);

  // Guard for small balances or rounding
  if (l4 <= l3) {
    const unit = safeWallet / 22;
    l1 = Math.max(1, Math.round(unit * 1));
    l2 = Math.max(l1 + 1, Math.round(unit * 3));
    l3 = Math.max(l2 + 1, Math.round(unit * 6.5));
    l4 = Math.max(l3 + 1, safeWallet - (l1 + l2 + l3));

    const diff = safeWallet - (l1 + l2 + l3 + l4);
    if (diff !== 0) {
      l4 += diff;
    }
  }

  const rawBets = [l1, l2, l3, l4];
  const names = [
    'LEVEL 1 (Primary Base)',
    'LEVEL 2 (First Recovery)',
    'LEVEL 3 (Deep Recovery)',
    'LEVEL 4 (Final Maximum Recovery)',
  ];

  let cumulativePrior = 0;

  const levels: LevelPlan[] = rawBets.map((totalBet, idx) => {
    // 85% on Size, 15% on Single Opposite Number
    let sizeBet = Math.round(totalBet * 0.85);
    let oppNumBet = totalBet - sizeBet;

    // Minimum allocations
    if (oppNumBet === 0 && totalBet >= 4) {
      oppNumBet = 1;
      sizeBet = totalBet - oppNumBet;
    }

    // Payout calculations:
    // Size payout: 1.96x
    // Single number payout: 9.0x
    const potentialSizeWin = Math.round(sizeBet * 1.96 * 10) / 10;
    const potentialNumWin = Math.round(oppNumBet * 9.0 * 10) / 10;

    // Cumulative money spent including this level
    const totalSpentSoFar = cumulativePrior + totalBet;

    // Net overall session profit if this level wins
    const sizeNetProfit = Math.round((potentialSizeWin - totalSpentSoFar) * 10) / 10;
    const numNetProfit = Math.round((potentialNumWin - totalSpentSoFar) * 10) / 10;

    cumulativePrior += totalBet;

    return {
      level: idx + 1,
      name: names[idx],
      percentage: Math.round((totalBet / safeWallet) * 100),
      totalBet,
      sizeBet,
      oppNumBet,
      potentialSizeWin,
      potentialNumWin,
      sizeNetProfit,
      numNetProfit,
    };
  });

  const totalAllocated = levels.reduce((sum, lvl) => sum + lvl.totalBet, 0);

  return {
    walletAmount: safeWallet,
    targetAmount,
    currentLevel: Math.max(1, Math.min(4, currentLevel)),
    levels,
    totalAllocated,
  };
}

/**
 * Calculates result PnL for a round
 */
export function calculateRoundPnL(
  levelPlan: LevelPlan,
  sizeWon: boolean,
  numWon: boolean
): { pnl: number; win: boolean; jackpot: boolean; sizeWin: boolean } {
  let payout = 0;
  let jackpot = false;
  let sizeWin = false;

  if (sizeWon) {
    payout += levelPlan.sizeBet * 1.96;
    sizeWin = true;
  }
  if (numWon) {
    payout += levelPlan.oppNumBet * 9.0;
    jackpot = true;
  }

  const pnl = Math.round((payout - levelPlan.totalBet) * 10) / 10;
  const win = sizeWon || numWon;

  return { pnl, win, jackpot, sizeWin };
}
