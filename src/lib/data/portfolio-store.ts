import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PortfolioItem } from "@/types";
import { DEFAULT_PORTFOLIO } from "@/lib/constants";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "portfolio-data.json");

/**
 * Deterministic UUID mapping for legacy portfolio IDs (port-1 through port-9).
 * Uses standard v4 UUID structure matching the database schema (uuid primary key).
 */
export const PORTFOLIO_LEGACY_ID_MAP: Record<string, string> = {
  "port-1": "b0000000-0000-0000-0000-000000000001",
  "port-2": "b0000000-0000-0000-0000-000000000002",
  "port-3": "b0000000-0000-0000-0000-000000000003",
  "port-4": "b0000000-0000-0000-0000-000000000004",
  "port-5": "b0000000-0000-0000-0000-000000000005",
  "port-6": "b0000000-0000-0000-0000-000000000006",
  "port-7": "b0000000-0000-0000-0000-000000000007",
  "port-8": "b0000000-0000-0000-0000-000000000008",
  "port-9": "b0000000-0000-0000-0000-000000000009",
};

export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Converts any ID (legacy string like 'port-8' or raw UUID) into a canonical PostgreSQL UUID.
 */
export function toPortfolioUuid(id: string): string {
  if (!id) return crypto.randomUUID();
  const trimmed = id.trim();
  if (isUuid(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (PORTFOLIO_LEGACY_ID_MAP[trimmed]) {
    return PORTFOLIO_LEGACY_ID_MAP[trimmed];
  }
  const match = trimmed.match(/^port-(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return `b0000000-0000-0000-0000-${num.toString().padStart(12, "0")}`;
  }
  // Deterministic UUID for any other legacy string to guarantee idempotency
  const hash = crypto.createHash("md5").update(`momen-portfolio:${trimmed}`).digest("hex");
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    "4" + hash.substring(13, 16),
    "8" + hash.substring(17, 20),
    hash.substring(20, 32),
  ].join("-");
}

export function getStoredPortfolio(): PortfolioItem[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((item) => ({
            ...item,
            id: toPortfolioUuid(item.id),
          }))
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
  } catch (err) {
    console.error("Failed to read portfolio store:", err);
  }

  return DEFAULT_PORTFOLIO.map((item) => ({
    ...item,
    id: toPortfolioUuid(item.id),
  }));
}

export function updateStoredPortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): PortfolioItem | null {
  try {
    const list = getStoredPortfolio();
    const targetUuid = toPortfolioUuid(id);
    const index = list.findIndex(
      (p) => p.id === id || p.id === targetUuid || toPortfolioUuid(p.id) === targetUuid
    );

    if (index === -1) {
      return null;
    }

    const updatedItem: PortfolioItem = {
      ...list[index],
      ...updates,
      id: targetUuid,
    };

    list[index] = updatedItem;
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return updatedItem;
  } catch (err) {
    console.error("Failed to update portfolio item in store:", err);
    return null;
  }
}

export function createStoredPortfolioItem(
  data: Omit<PortfolioItem, "id"> & { id?: string }
): PortfolioItem {
  try {
    const list = getStoredPortfolio();
    const newId = data.id ? toPortfolioUuid(data.id) : crypto.randomUUID();
    const newItem: PortfolioItem = {
      ...data,
      id: newId,
    };

    list.push(newItem);
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return newItem;
  } catch (err) {
    console.error("Failed to create portfolio item in store:", err);
    return {
      ...data,
      id: data.id ? toPortfolioUuid(data.id) : crypto.randomUUID(),
    } as PortfolioItem;
  }
}

export function deleteStoredPortfolioItem(id: string): boolean {
  try {
    const list = getStoredPortfolio();
    const targetUuid = toPortfolioUuid(id);
    const filtered = list.filter(
      (p) => p.id !== id && p.id !== targetUuid && toPortfolioUuid(p.id) !== targetUuid
    );
    fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to delete portfolio item from store:", err);
    return false;
  }
}
