const PBKDF2_ITERATIONS = 600_000;
const SESSION_KEY = "invapp.vaultKey";
const PREFIX = "v1";

export const ENCRYPTED_FIELDS = new Set([
  "amount",
  "quantity",
  "quantityChange",
  "price",
  "pricePerUnit",
  "purchasePrice",
  "currentValue",
  "faceValue",
  "couponRate",
  "monthlyRent",
  "goal",
]);

export type VaultMode = "STANDARD" | "PRIVATE";

export type VaultRecord = {
  salt: string;
  iterations: number;
  wrappedKey: string;
  recoverySalt: string;
  recoveryWrappedKey: string;
};

export type StoredVault = {
  mode: VaultMode;
  managedKey: string | null;
} & { [K in keyof VaultRecord]: VaultRecord[K] | null };

export type PassphraseWrap = Pick<VaultRecord, "salt" | "iterations" | "wrappedKey">;

export class VaultLockedError extends Error {
  constructor() {
    super("Your data is locked. Enter your passphrase to continue.");
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let activeKey: CryptoKey | null = null;
let activeRaw: Uint8Array<ArrayBuffer> | null = null;
let activeUserId: string | null = null;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length));
}

async function deriveKey(secret: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function seal(key: CryptoKey, plaintext: Uint8Array<ArrayBuffer>): Promise<string> {
  const iv = randomBytes(12);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  return `${PREFIX}:${toBase64(iv)}:${toBase64(ciphertext)}`;
}

async function open(key: CryptoKey, sealed: string): Promise<Uint8Array<ArrayBuffer>> {
  const [prefix, iv, ciphertext] = sealed.split(":");
  if (prefix !== PREFIX || !iv || !ciphertext) throw new Error("Unsupported ciphertext");
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv) }, key, fromBase64(ciphertext)));
}

function normalizeRecoveryKey(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-F]/g, "");
}

function formatRecoveryKey(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return hex.match(/.{1,5}/g)!.join("-");
}

async function wrapWith(secret: string, dataKey: Uint8Array<ArrayBuffer>): Promise<{ salt: string; wrappedKey: string }> {
  const salt = randomBytes(16);
  const kek = await deriveKey(secret, salt, PBKDF2_ITERATIONS);
  return { salt: toBase64(salt), wrappedKey: await seal(kek, dataKey) };
}

async function unwrapWith(secret: string, salt: string, iterations: number, wrappedKey: string) {
  const kek = await deriveKey(secret, fromBase64(salt), iterations);
  return open(kek, wrappedKey);
}

export function newDataKey(): Uint8Array<ArrayBuffer> {
  return randomBytes(32);
}

export function encodeKey(dataKey: Uint8Array<ArrayBuffer>): string {
  return toBase64(dataKey);
}

export function decodeKey(value: string): Uint8Array<ArrayBuffer> {
  return fromBase64(value);
}

export function currentDataKey(): Uint8Array<ArrayBuffer> {
  if (!activeRaw) throw new VaultLockedError();
  return activeRaw;
}

export function privateRecord(vault: StoredVault): VaultRecord {
  if (vault.mode !== "PRIVATE" || !vault.salt || !vault.iterations || !vault.wrappedKey || !vault.recoverySalt || !vault.recoveryWrappedKey) {
    throw new Error("Your account doesn't use a passphrase");
  }
  return vault as VaultRecord;
}

export async function createVault(passphrase: string, dataKey: Uint8Array<ArrayBuffer> = newDataKey()) {
  const recoveryBytes = randomBytes(20);
  const recoveryKey = formatRecoveryKey(recoveryBytes);

  const passphraseWrap = await wrapWith(passphrase, dataKey);
  const recoveryWrap = await wrapWith(normalizeRecoveryKey(recoveryKey), dataKey);

  const record: VaultRecord = {
    salt: passphraseWrap.salt,
    iterations: PBKDF2_ITERATIONS,
    wrappedKey: passphraseWrap.wrappedKey,
    recoverySalt: recoveryWrap.salt,
    recoveryWrappedKey: recoveryWrap.wrappedKey,
  };
  return { record, recoveryKey, dataKey };
}

export async function unlockWithPassphrase(vault: VaultRecord, passphrase: string) {
  try {
    return await unwrapWith(passphrase, vault.salt, vault.iterations, vault.wrappedKey);
  } catch {
    throw new Error("Wrong passphrase");
  }
}

export async function unlockWithRecoveryKey(vault: VaultRecord, recoveryKey: string) {
  try {
    return await unwrapWith(normalizeRecoveryKey(recoveryKey), vault.recoverySalt, vault.iterations, vault.recoveryWrappedKey);
  } catch {
    throw new Error("Wrong recovery key");
  }
}

export async function wrapForPassphrase(dataKey: Uint8Array<ArrayBuffer>, passphrase: string): Promise<PassphraseWrap> {
  const wrap = await wrapWith(passphrase, dataKey);
  return { salt: wrap.salt, iterations: PBKDF2_ITERATIONS, wrappedKey: wrap.wrappedKey };
}

export async function activateKey(userId: string, dataKey: Uint8Array<ArrayBuffer>): Promise<void> {
  activeKey = await crypto.subtle.importKey("raw", dataKey, "AES-GCM", false, ["encrypt", "decrypt"]);
  activeRaw = dataKey;
  activeUserId = userId;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, key: toBase64(dataKey) }));
  } catch {
    return;
  }
}

export async function restoreKey(userId: string): Promise<boolean> {
  if (activeKey && activeUserId === userId) return true;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored) as { userId: string; key: string };
    if (parsed.userId !== userId) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    await activateKey(userId, fromBase64(parsed.key));
    return true;
  } catch {
    return false;
  }
}

export function lockVault(): void {
  activeKey = null;
  activeRaw = null;
  activeUserId = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}

export function isUnlocked(): boolean {
  return activeKey != null;
}

function requireKey(): CryptoKey {
  if (!activeKey) throw new VaultLockedError();
  return activeKey;
}

export function isCiphertext(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(`${PREFIX}:`);
}

export async function encryptNumber(value: number): Promise<string> {
  return seal(requireKey(), encoder.encode(String(value)));
}

export async function decryptNumber(value: string): Promise<number> {
  return Number(decoder.decode(await open(requireKey(), value)));
}

export async function encryptDeep<T>(value: T): Promise<T> {
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => encryptDeep(v)))) as T;
  if (value === null || typeof value !== "object") return value;
  const entries = await Promise.all(
    Object.entries(value).map(async ([k, v]) => {
      if (ENCRYPTED_FIELDS.has(k) && typeof v === "number" && Number.isFinite(v)) return [k, await encryptNumber(v)];
      return [k, await encryptDeep(v)];
    }),
  );
  return Object.fromEntries(entries) as T;
}

export async function decryptDeep<T>(value: T): Promise<T> {
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => decryptDeep(v)))) as T;
  if (value === null || typeof value !== "object") return value;
  const entries = await Promise.all(
    Object.entries(value).map(async ([k, v]) => {
      if (ENCRYPTED_FIELDS.has(k) && isCiphertext(v)) return [k, await decryptNumber(v)];
      return [k, await decryptDeep(v)];
    }),
  );
  return Object.fromEntries(entries) as T;
}
