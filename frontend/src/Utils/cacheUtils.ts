import { openDB } from "idb";

const DB_NAME = "app-cache";
const STORE_NAME = "api-responses";
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // Cache for 24 hours

// Initialize IndexedDB
const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

// Save API response to IndexedDB
export const cacheApiResponse = async (key: string, data: any) => {
  const db = await dbPromise;
  const timestampedData = { data, timestamp: Date.now() };
  await db.put(STORE_NAME, timestampedData, key);
};

// Get cached response from IndexedDB
export const getCachedApiResponse = async (key: string) => {
  const db = await dbPromise;
  const cached = await db.get(STORE_NAME, key);

  if (cached) {
    const isExpired = Date.now() - cached.timestamp > EXPIRATION_TIME;
    return isExpired ? null : cached.data;
  }
  return null;
};

// Clear cached data manually if needed
export const clearCachedResponse = async (key: string) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, key);
};