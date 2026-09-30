import { LevelPlan, Martingale4Levels } from '../types';

/**
 * 4-LEVEL MARTINGALE LADDER (90% SIZE • 10% SAME-SIDE NUMBER)
 * Level 1 + Level 2 + Level 3 + Level 4 = exactly 100% of active wallet amount.
 *
 * ALLOCATION FORMULA:
 * - 90% on Size (BIG / SMALL) -> High-Volume Primary Win Engine
 * - 10% on Single SAME-SIDE Number -> 9.0x Jackpot Booster
 *
 * WIN SCENARIOS:
 * - Size Wins (1.96x): Covers total bet and yields high net profit.
 * - Single Same-Side Number Wins (9.0x): 9x multiplier payout.
 * - DOUBLE WIN: When Size & Same-Side Number BOTH hit together, total payout is (1.96x + 9.0x) giving massive profit!
 */
export function calculate4LevelMartingale(
  walletAmount: number,
  targetAmount: number,
  currentLevel: number = 1
): Martingale4Levels {
  const safeWallet = Math.max(20, Math.round(walletAmount));

  // Optimal 4-level progression using 100% of wallet:
  // Level 1: ~5.0% (Primary Strike)
  // Level 2: ~13.0% (Primary Focus Lock)
  // Level 3: ~28.0% (Deep Safety Reserve)
  // Level 4: ~54.0% (Ultimate Defense Reserve)
  let l1 = Math.max(1, Math.floor(safeWallet * 0.05));
  let l2 = Math.max(l1 + 1, Math.floor(safeWallet * 0.13));
  let l3 = Math.max(l2 + 1, Math.floor(safeWallet * 0.28));
  let l4 = safeWallet - (l1 + l2 + l3);

  // Rounding adjustment
  if (l4 <= l3) {
    const unit = safeWallet / 22;
    l1 = Math.max(1, Math.round(unit * 1.1));
    l2 = Math.max(l1 + 1, Math.round(unit * 3.1));
    l3 = Math.max(l2 + 1, Math.round(unit * 6.5));
    l4 = Math.max(l3 + 1, safeWallet - (l1 + l2 + l3));

    const diff = safeWallet - (l1 + l2 + l3 + l4);
    if (diff !== 0) {
      l4 += diff;
    }
  }

  const rawBets = [l1, l2, l3, l4];
  const names = [
    'LEVEL 1 (Primary Strike - Target Focus)',
    'LEVEL 2 (Fix Recovery - Primary Focus)',
    'LEVEL 3 (Deep Safety Reserve)',
    'LEVEL 4 (Ultimate Defense Reserve)',
  ];

  let cumulativePrior = 0;

  const levels: LevelPlan[] = rawBets.map((totalBet, idx) => {
    // 90% on Size, 10% on Single SAME-SIDE Number
    let sizeBet = Math.round(totalBet * 0.90);
    let sameNumBet = totalBet - sizeBet;

    // Minimum allocations
    if (sameNumBet === 0 && totalBet >= 6) {
      sameNumBet = 1;
      sizeBet = totalBet - sameNumBet;
    }

    // Payout calculations:
    // Size payout: 1.96x
    // Single number payout: 9.0x
    const potentialSizeWin = Math.round(sizeBet * 1.96 * 10) / 10;
    const potentialNumWin = Math.round(sameNumBet * 9.0 * 10) / 10;

    // Cumulative money spent including this level
    const totalSpentSoFar = cumulativePrior + totalBet;

    // Net profits:
    const sizeNetProfit = Math.round((potentialSizeWin - totalSpentSoFar) * 10) / 10;
    const numNetProfit = Math.round((potentialNumWin - totalSpentSoFar) * 10) / 10;
    const doubleWinProfit = Math.round((potentialSizeWin + potentialNumWin - totalSpentSoFar) * 10) / 10;

    cumulativePrior += totalBet;

    return {
      level: idx + 1,
      name: names[idx],
      percentage: Math.round((totalBet / safeWallet) * 100),
      totalBet,
      sizeBet,
      sameNumBet,
      potentialSizeWin,
      potentialNumWin,
      sizeNetProfit,
      numNetProfit,
      doubleWinProfit,
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
 * Calculates result PnL for a round with 90/10 SAME-SIDE prediction logic
 */
export function calculateRoundPnL(
  levelPlan: LevelPlan,
  sizeWon: boolean,
  numWon: boolean
): { pnl: number; win: boolean; jackpot: boolean; sizeWin: boolean; doubleWin: boolean } {
  let payout = 0;
  let jackpot = false;
  let sizeWin = false;
  let doubleWin = false;

  if (sizeWon) {
    payout += levelPlan.sizeBet * 1.96;
    sizeWin = true;
  }
  if (numWon) {
    payout += levelPlan.sameNumBet * 9.0;
    jackpot = true;
  }

  if (sizeWon && numWon) {
    doubleWin = true;
  }

  const pnl = Math.round((payout - levelPlan.totalBet) * 10) / 10;
  const win = sizeWon || numWon;

  return { pnl, win, jackpot, sizeWin, doubleWin };
}
