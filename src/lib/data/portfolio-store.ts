import fs from "fs";
import path from "path";
import { PortfolioItem } from "@/types";
import { DEFAULT_PORTFOLIO } from "@/lib/constants";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "portfolio-data.json");

export function getStoredPortfolio(): PortfolioItem[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
  } catch (err) {
    console.error("Failed to read portfolio store:", err);
  }

  return DEFAULT_PORTFOLIO;
}

export function updateStoredPortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): PortfolioItem | null {
  try {
    const list = getStoredPortfolio();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem: PortfolioItem = {
      ...list[index],
      ...updates,
      id: list[index].id,
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
    const newId = data.id || "port-" + Date.now().toString(36);
    const newItem: PortfolioItem = {
      ...data,
      id: newId,
    };

    list.push(newItem);
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return newItem;
  } catch (err) {
    console.error("Failed to create portfolio item in store:", err);
    return { ...data, id: "port-" + Date.now().toString(36) } as PortfolioItem;
  }
}

export function deleteStoredPortfolioItem(id: string): boolean {
  try {
    const list = getStoredPortfolio();
    const filtered = list.filter((p) => p.id !== id);
    fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to delete portfolio item from store:", err);
    return false;
  }
}
