import fs from "fs";
import path from "path";
import { PackageItem } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "packages-data.json");

export function getStoredPackages(): PackageItem[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
  } catch (err) {
    console.error("Failed to read packages store:", err);
  }

  return DEFAULT_PACKAGES;
}

export function updateStoredPackage(
  id: string,
  updates: Partial<PackageItem>
): PackageItem | null {
  try {
    const list = getStoredPackages();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem: PackageItem = {
      ...list[index],
      ...updates,
      id: list[index].id,
      updated_at: new Date().toISOString(),
    };

    list[index] = updatedItem;
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return updatedItem;
  } catch (err) {
    console.error("Failed to update package in store:", err);
    return null;
  }
}

export function createStoredPackage(
  data: Omit<PackageItem, "id"> & { id?: string }
): PackageItem {
  try {
    const list = getStoredPackages();
    const newId = data.id || "pkg-" + Date.now().toString(36);
    const newPkg: PackageItem = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    list.push(newPkg);
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return newPkg;
  } catch (err) {
    console.error("Failed to create package in store:", err);
    return { ...data, id: "pkg-" + Date.now().toString(36) } as PackageItem;
  }
}

export function deleteStoredPackage(id: string): boolean {
  try {
    const list = getStoredPackages();
    const filtered = list.filter((p) => p.id !== id);
    fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to delete package in store:", err);
    return false;
  }
}
