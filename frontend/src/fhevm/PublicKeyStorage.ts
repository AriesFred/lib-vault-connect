// Public Key Storage - Simplified in-memory storage
// In production, use IndexedDB or similar persistent storage

const storage = new Map<string, string>();

export async function publicKeyStorageGet(key: string): Promise<string | null> {
  return storage.get(key) || null;
}

export async function publicKeyStorageSet(key: string, value: string): Promise<void> {
  storage.set(key, value);
}

