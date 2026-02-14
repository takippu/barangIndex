const REGION_STORAGE_KEY = "preferred_region_id";

export function getPreferredRegionId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(REGION_STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function setPreferredRegionId(regionId: number | null) {
  if (typeof window === "undefined") return;
  if (!regionId) {
    window.localStorage.removeItem(REGION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(REGION_STORAGE_KEY, String(regionId));
}
