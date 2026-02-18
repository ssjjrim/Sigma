"use client";

import { Platform } from "@/types/market";

export interface PriceAlert {
  id: string;
  marketId: string;
  marketQuestion: string;
  platform: Platform;
  platformId: string;
  condition: "above" | "below";
  threshold: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  currentPrice?: number;
}

const STORAGE_KEY = "predictboard-alerts";

export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function addAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "triggered">): PriceAlert {
  const newAlert: PriceAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    triggered: false,
  };
  const alerts = getAlerts();
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function removeAlert(id: string) {
  const alerts = getAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
}

export function clearTriggered() {
  const alerts = getAlerts().map((a) => ({ ...a, triggered: false, triggeredAt: undefined }));
  saveAlerts(alerts);
}

export function markTriggered(id: string, currentPrice: number) {
  const alerts = getAlerts().map((a) =>
    a.id === id ? { ...a, triggered: true, triggeredAt: Date.now(), currentPrice } : a
  );
  saveAlerts(alerts);
}
