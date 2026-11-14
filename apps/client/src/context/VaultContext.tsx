import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { secureFetch } from "../api/secureFetch";
import {
  activateKey,
  createVault,
  currentDataKey,
  decodeKey,
  encodeKey,
  lockVault,
  newDataKey,
  privateRecord,
  restoreKey,
  StoredVault,
  unlockWithPassphrase,
  unlockWithRecoveryKey,
  VaultMode,
  wrapForPassphrase,
} from "../crypto/vault";

export type VaultStatus = "idle" | "loading" | "setup" | "locked" | "unlocked" | "error";

type RecoveryKeyResult = { recoveryKey: string; finish: () => Promise<void> };

type VaultContextType = {
  status: VaultStatus;
  mode: VaultMode | null;
  setUp: (passphrase: string) => Promise<RecoveryKeyResult>;
  setUpStandard: () => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  recover: (recoveryKey: string, newPassphrase: string) => Promise<void>;
  changePassphrase: (current: string, next: string) => Promise<void>;
  switchToPrivate: (passphrase: string) => Promise<RecoveryKeyResult>;
  switchToStandard: (passphrase: string) => Promise<void>;
  reset: () => Promise<void>;
  retry: () => void;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

async function readVault(res: Response): Promise<StoredVault | null> {
  if (!res.ok) throw new Error("Couldn't save your encryption settings");
  const data = await res.json();
  return data?.vault ?? null;
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [status, setStatus] = useState<VaultStatus>("idle");
  const [vault, setVault] = useState<StoredVault | null>(null);
  const [attempt, setAttempt] = useState(0);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const signedOut = previousUserId.current !== null && previousUserId.current !== userId;
    previousUserId.current = userId;
    if (signedOut) lockVault();

    if (!userId) {
      setVault(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const record = await readVault(await secureFetch("/vault"));
        if (cancelled) return;
        setVault(record);
        if (!record) {
          lockVault();
          setStatus("setup");
          return;
        }
        if (record.mode === "STANDARD" && record.managedKey) {
          await activateKey(userId, decodeKey(record.managedKey));
          if (!cancelled) setStatus("unlocked");
          return;
        }
        const restored = await restoreKey(userId);
        if (!cancelled) setStatus(restored ? "unlocked" : "locked");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const setUp = useCallback(
    async (passphrase: string) => {
      if (!userId) throw new Error("Not signed in");
      const { record, recoveryKey, dataKey } = await createVault(passphrase);
      const saved = await readVault(await secureFetch("/vault", { method: "POST", body: JSON.stringify(record) }));
      return {
        recoveryKey,
        finish: async () => {
          await activateKey(userId, dataKey);
          setVault(saved);
          setStatus("unlocked");
        },
      };
    },
    [userId],
  );

  const setUpStandard = useCallback(async () => {
    if (!userId) throw new Error("Not signed in");
    const dataKey = newDataKey();
    const saved = await readVault(
      await secureFetch("/vault/standard", { method: "POST", body: JSON.stringify({ key: encodeKey(dataKey) }) }),
    );
    await activateKey(userId, dataKey);
    setVault(saved);
    setStatus("unlocked");
  }, [userId]);

  const unlock = useCallback(
    async (passphrase: string) => {
      if (!userId || !vault) throw new Error("Not signed in");
      await activateKey(userId, await unlockWithPassphrase(privateRecord(vault), passphrase));
      setStatus("unlocked");
    },
    [userId, vault],
  );

  const savePassphrase = useCallback(async (dataKey: Uint8Array<ArrayBuffer>, passphrase: string) => {
    const wrap = await wrapForPassphrase(dataKey, passphrase);
    setVault(await readVault(await secureFetch("/vault/passphrase", { method: "PUT", body: JSON.stringify(wrap) })));
  }, []);

  const recover = useCallback(
    async (recoveryKey: string, newPassphrase: string) => {
      if (!userId || !vault) throw new Error("Not signed in");
      const dataKey = await unlockWithRecoveryKey(privateRecord(vault), recoveryKey);
      await savePassphrase(dataKey, newPassphrase);
      await activateKey(userId, dataKey);
      setStatus("unlocked");
    },
    [userId, vault, savePassphrase],
  );

  const changePassphrase = useCallback(
    async (current: string, next: string) => {
      if (!vault) throw new Error("Encryption is not set up");
      const dataKey = await unlockWithPassphrase(privateRecord(vault), current);
      await savePassphrase(dataKey, next);
    },
    [vault, savePassphrase],
  );

  const switchToPrivate = useCallback(async (passphrase: string) => {
    const { record, recoveryKey } = await createVault(passphrase, currentDataKey());
    const saved = await readVault(await secureFetch("/vault/private", { method: "PUT", body: JSON.stringify(record) }));
    return {
      recoveryKey,
      finish: async () => setVault(saved),
    };
  }, []);

  const switchToStandard = useCallback(
    async (passphrase: string) => {
      if (!vault) throw new Error("Encryption is not set up");
      const dataKey = await unlockWithPassphrase(privateRecord(vault), passphrase);
      setVault(
        await readVault(
          await secureFetch("/vault/standard", { method: "PUT", body: JSON.stringify({ key: encodeKey(dataKey) }) }),
        ),
      );
    },
    [vault],
  );

  const reset = useCallback(async () => {
    const res = await secureFetch("/vault", { method: "DELETE" });
    if (!res.ok) throw new Error("Couldn't reset your data");
    lockVault();
    setVault(null);
    setStatus("setup");
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <VaultContext.Provider
      value={{
        status,
        mode: vault?.mode ?? null,
        setUp,
        setUpStandard,
        unlock,
        recover,
        changePassphrase,
        switchToPrivate,
        switchToStandard,
        reset,
        retry,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used within VaultProvider");
  return context;
}
