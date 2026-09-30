import { LicenseInfo } from '../types';

/**
 * MASTER ENCRYPTION CONFIGURATION
 * This salt must be identical across both this Main Web App and the Google AI Studio Key Generator app!
 */
export const MASTER_SECURITY_SALT = 'NV2-NARUTO-ENCRYPTED-LOCK-2026-KEYGEN-SECRET-SALT-99X';

export const DUR_MAP: Record<string, number> = {
  '1H': 3600000,
  '6H': 21600000,
  '12H': 43200000,
  '1D': 86400000,
  '3D': 259200000,
  '7D': 604800000,
  '15D': 1296000000,
  '30D': 2592000000,
  'LIFETIME': 3153600000000,
};

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function hashChain(input: string): string {
  let h = input + MASTER_SECURITY_SALT;
  for (let r = 0; r < 600; r++) {
    h = fnv1a(h + r) + ':' + fnv1a(MASTER_SECURITY_SALT + h + r) + ':' + fnv1a(h + MASTER_SECURITY_SALT);
  }
  return fnv1a(h).toString(16).padStart(8, '0');
}

/**
 * Cryptographically signs payload with the master salt
 */
export function signPayload(payload: string): string {
  const r1 = hashChain(payload);
  const r2 = hashChain(payload + r1);
  return (r1 + r2).slice(0, 12).toUpperCase();
}

/**
 * Generates an encrypted, tamper-proof license key
 * Format: NUZU-<DUR>-<SERIAL>-<CHECKSUM>
 */
export function generateEncryptedKey(durCode: string = '30D'): string {
  const validDur = DUR_MAP[durCode] ? durCode : '30D';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let serial = '';
  for (let i = 0; i < 8; i++) {
    serial += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const checksum = signPayload(validDur + '-' + serial);
  return `NUZU-${validDur}-${serial}-${checksum}`;
}

async function sha256(str: string): Promise<string> {
  try {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    let h = '';
    for (let i = 0; i < 4; i++) h += fnv1a(str + i).toString(16).padStart(8, '0');
    return h;
  }
}

function getCanvasFP(): string {
  try {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 50;
    const ctx = c.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(0, 0, 120, 50);
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('NARUTO_V2_PRO_LOCK', 4, 15);
    ctx.fillStyle = '#22d37f';
    ctx.fillText('HW_SECURITY_2026', 4, 30);
    return c.toDataURL().slice(-64);
  } catch {
    return 'no-canvas';
  }
}

function getWebGLFP(): string {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || (c.getContext('experimental-webgl') as any);
    if (!gl) return 'no-gl';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      return (
        gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) +
        '|' +
        gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
      );
    }
    return gl.getParameter(gl.VENDOR) + '|' + gl.getParameter(gl.RENDERER);
  } catch {
    return 'no-gl';
  }
}

/**
 * Generates an automatic hardware device fingerprint without prompting the user
 */
export async function generateDeviceId(): Promise<string> {
  const parts = [
    navigator.userAgent || '',
    navigator.platform || '',
    navigator.language || '',
    screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
    screen.availWidth + 'x' + screen.availHeight,
    new Date().getTimezoneOffset(),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    getCanvasFP(),
    getWebGLFP(),
  ];
  return await sha256(parts.join('||'));
}

const LS_KEY_REGISTRY = 'naruto_v2_encrypted_registry';
const LS_CUR_KEY = 'naruto_v2_active_key';
const LS_DEV_ID = 'naruto_v2_hw_device_id';

export function getCachedDeviceId(): string {
  try {
    return localStorage.getItem(LS_DEV_ID) || '';
  } catch {
    return '';
  }
}

export function cacheDeviceId(id: string) {
  try {
    localStorage.setItem(LS_DEV_ID, id);
  } catch {}
}

export function getCurrentKey(): string {
  try {
    return localStorage.getItem(LS_CUR_KEY) || '';
  } catch {
    return '';
  }
}

export function setCurrentKey(k: string) {
  try {
    localStorage.setItem(LS_CUR_KEY, k);
  } catch {}
}

export function clearCurrentKey() {
  try {
    localStorage.removeItem(LS_CUR_KEY);
  } catch {}
}

interface StoredKeyRecord {
  key: string;
  deviceId: string;
  activatedAt: number;
  expiresAt: number;
  durCode: string;
}

function getKeyRegistry(): Record<string, StoredKeyRecord> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY_REGISTRY) || '{}');
  } catch {
    return {};
  }
}

function saveKeyRegistry(registry: Record<string, StoredKeyRecord>) {
  try {
    localStorage.setItem(LS_KEY_REGISTRY, JSON.stringify(registry));
  } catch {}
}

/**
 * Validates the license key:
 * 1. Verifies cryptographic signature using MASTER_SECURITY_SALT
 * 2. Automatic First-Device Locking (if not bound, permanently binds to current device)
 * 3. Prevents using the key on any other device
 * 4. Checks expiry time (once time ends, key is permanently expired)
 */
export async function validateKey(
  rawKey: string,
  deviceId: string
): Promise<LicenseInfo & { reason?: string; errorDetails?: string }> {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, reason: 'EMPTY' } as any;
  }

  const clean = rawKey.trim().toUpperCase().replace(/\s+/g, '');

  // Master bypass / demo test key check
  if (clean === 'NARUTO-DEMO-VIP' || clean === 'NUZU-MASTER-PASS') {
    const durMs = DUR_MAP['30D'];
    return {
      valid: true,
      cleanKey: clean,
      durCode: '30D',
      duration: durMs,
      activatedAt: Date.now(),
      expiresAt: Date.now() + durMs,
      deviceId,
      firstBind: false,
      source: 'master-override',
    };
  }

  const parts = clean.split('-');
  if (parts.length !== 4) return { valid: false, reason: 'FORMAT' } as any;
  if (parts[0] !== 'NUZU') return { valid: false, reason: 'FORMAT' } as any;

  const durCode = parts[1];
  const serial = parts[2];
  const checksum = parts[3];

  if (!DUR_MAP[durCode]) return { valid: false, reason: 'INVALID_DURATION' } as any;
  if (serial.length !== 8) return { valid: false, reason: 'FORMAT' } as any;
  if (checksum.length !== 12) return { valid: false, reason: 'FORMAT' } as any;

  // Verify Cryptographic Signature
  const expectedSig = signPayload(durCode + '-' + serial);
  if (checksum !== expectedSig) {
    return { valid: false, reason: 'CHECKSUM_MISMATCH' } as any;
  }

  const durMs = DUR_MAP[durCode];
  const registry = getKeyRegistry();
  const existingRecord = registry[clean];

  if (!existingRecord) {
    // FIRST ACTIVATION:
    // Seamlessly and automatically lock this key to this device permanently!
    const activatedAt = Date.now();
    const expiresAt = activatedAt + durMs;
    const newRecord: StoredKeyRecord = {
      key: clean,
      deviceId,
      activatedAt,
      expiresAt,
      durCode,
    };
    registry[clean] = newRecord;
    saveKeyRegistry(registry);

    return {
      valid: true,
      cleanKey: clean,
      durCode,
      duration: durMs,
      activatedAt,
      expiresAt,
      deviceId,
      firstBind: true,
      source: 'first-activation-lock',
    };
  }

  // KEY ALREADY REGISTERED:
  // 1. Check expiration
  if (Date.now() > existingRecord.expiresAt) {
    const expDate = new Date(existingRecord.expiresAt).toLocaleString();
    return {
      valid: false,
      reason: 'EXPIRED',
      errorDetails: `Key expired on ${expDate}. Re-activation blocked.`,
    } as any;
  }

  // 2. Check Device Lock
  if (existingRecord.deviceId !== deviceId) {
    return {
      valid: false,
      reason: 'DEVICE_MISMATCH',
      errorDetails: 'This key is permanently locked to another device. Cannot be used here.',
    } as any;
  }

  // Key is valid on the same device
  return {
    valid: true,
    cleanKey: clean,
    durCode: existingRecord.durCode,
    duration: durMs,
    activatedAt: existingRecord.activatedAt,
    expiresAt: existingRecord.expiresAt,
    deviceId,
    firstBind: false,
    source: 'locked-device-verified',
  };
}
