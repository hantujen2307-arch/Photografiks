import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BlockedDate, BlockedSlot } from "@/types";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "calendar-data.json");

interface CalendarStoreData {
  blockedDates: BlockedDate[];
  blockedSlots: BlockedSlot[];
}

function readStore(): CalendarStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      return {
        blockedDates: Array.isArray(parsed?.blockedDates) ? parsed.blockedDates : [],
        blockedSlots: Array.isArray(parsed?.blockedSlots) ? parsed.blockedSlots : [],
      };
    }
  } catch (err) {
    console.error("Failed to read calendar store:", err);
  }
  return { blockedDates: [], blockedSlots: [] };
}

function writeStore(data: CalendarStoreData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write calendar store:", err);
  }
}

export function getStoredBlockedDates(): BlockedDate[] {
  return readStore().blockedDates;
}

export function createStoredBlockedDate(data: { blocked_date: string; reason?: string }): BlockedDate {
  const store = readStore();
  const newDate: BlockedDate = {
    id: crypto.randomUUID(),
    blocked_date: data.blocked_date,
    reason: data.reason || "Libur Studio",
    created_at: new Date().toISOString(),
  };
  store.blockedDates.push(newDate);
  writeStore(store);
  return newDate;
}

export function deleteStoredBlockedDate(id: string): boolean {
  const store = readStore();
  const initialLength = store.blockedDates.length;
  store.blockedDates = store.blockedDates.filter((d) => d.id !== id);
  if (store.blockedDates.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}

export function getStoredBlockedSlots(): BlockedSlot[] {
  return readStore().blockedSlots;
}

export function createStoredBlockedSlot(data: {
  slot_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}): BlockedSlot {
  const store = readStore();
  const newSlot: BlockedSlot = {
    id: crypto.randomUUID(),
    slot_date: data.slot_date,
    start_time: data.start_time,
    end_time: data.end_time,
    reason: data.reason || "Maintenance Studio / Istirahat",
    created_at: new Date().toISOString(),
  };
  store.blockedSlots.push(newSlot);
  writeStore(store);
  return newSlot;
}

export function deleteStoredBlockedSlot(id: string): boolean {
  const store = readStore();
  const initialLength = store.blockedSlots.length;
  store.blockedSlots = store.blockedSlots.filter((s) => s.id !== id);
  if (store.blockedSlots.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}
