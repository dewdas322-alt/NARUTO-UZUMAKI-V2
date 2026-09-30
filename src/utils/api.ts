import { GameRecord, GameType } from '../types';
import { getCfg } from './engines';

const API_BASE: Record<GameType, string> = {
  wingo30: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
  wingo1m: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
  wingo3m: 'https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json',
  wingo5m: 'https://draw.ar-lottery01.com/WinGo/WinGo_5M/GetHistoryIssuePage.json',
  trx1m: 'https://draw.ar-lottery01.com/TrxWinGo/TrxWinGo_1M/GetHistoryIssuePage.json',
  k31m: 'https://draw.ar-lottery01.com/K3/K3_1M/GetHistoryIssuePage.json',
};

/**
 * Computes deterministic time-block period for stable countdown
 * Prevents flickering and false period changes
 */
export function getCurrentPeriodForGame(game: GameType, offsetRounds = 0): string {
  const cfg = getCfg(game);
  const now = Date.now() - offsetRounds * cfg.secs * 1000;
  const d = new Date(now);
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const totalSecondsInDay = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
  const periodIndex = Math.floor(totalSecondsInDay / cfg.secs);
  return `${ymd}1000${(10000 + periodIndex).toString().slice(1)}`;
}

export async function fetchLiveHistory(game: GameType, pageSize = 20, pageNo = 1): Promise<GameRecord[]> {
  const url = `${API_BASE[game]}?pageSize=${pageSize}&pageNo=${pageNo}&ts=${Date.now()}`;
  const cfg = getCfg(game);

  const proxies = [
    (u: string) => u,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  ];

  for (const px of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(px(url), {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      const list = data?.data?.list ?? data?.data?.gameslist ?? data?.list ?? [];

      if (Array.isArray(list) && list.length > 0) {
        const records: GameRecord[] = list
          .map((item: any) => {
            const rawNum = item?.number ?? item?.openCode ?? item?.winNumber ?? item?.result;
            const period = String(item?.issueNumber ?? item?.issue ?? item?.periodNumber ?? item?.issue_number ?? '');
            const num = parseInt(String(rawNum), 10);

            if (!period || isNaN(num) || num < cfg.min || num > cfg.max) {
              return null;
            }
            return { period, number: num };
          })
          .filter(Boolean) as GameRecord[];

        if (records.length > 0) {
          return records;
        }
      }
    } catch {
      // Try next proxy
    }
  }

  return [];
}

/**
 * Generates stable simulation records tied to time-block periods
 */
export function generateSeedRecords(game: GameType, count = 30): GameRecord[] {
  const cfg = getCfg(game);
  const records: GameRecord[] = [];

  for (let i = 0; i < count; i++) {
    const period = getCurrentPeriodForGame(game, i + 1);
    // Deterministic pseudo-random number based on period string
    let hash = 0;
    for (let c = 0; c < period.length; c++) hash = (hash * 31 + period.charCodeAt(c)) & 0xffffffff;
    const num = cfg.min + Math.abs(hash) % (cfg.max - cfg.min + 1);
    records.push({ period, number: num });
  }

  return records;
}

export function nextPeriod(period: string): string {
  try {
    const s = String(period);
    const m = s.match(/^(\D*)(\d+)$/);
    if (!m) return (BigInt(s.replace(/\D/g, '')) + 1n).toString();
    return m[1] + (BigInt(m[2]) + 1n).toString().padStart(m[2].length, '0');
  } catch {
    return period;
  }
}
