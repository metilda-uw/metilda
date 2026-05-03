/**
 * Firebase Storage (compat SDK) uses this code when the object does not exist.
 * Treat as success for delete flows so DB rows can still be removed (orphan cleanup).
 */
export function isStorageObjectNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "storage/object-not-found"
  );
}
