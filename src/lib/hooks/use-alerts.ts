"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useMarkets } from "./use-markets";
import {
  PriceAlert,
  getAlerts,
  addAlert,
  removeAlert,
  clearTriggered,
  saveAlerts,
} from "@/lib/alerts/store";

// Global event bus for cross-component sync
const ALERTS_CHANGE_EVENT = "predictboard-alerts-change";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ALERTS_CHANGE_EVENT));
  }
}

// Shared snapshot for useSyncExternalStore
let cachedAlerts: PriceAlert[] = [];
let cachedVersion = 0;

function subscribeToAlerts(callback: () => void) {
  const handler = () => {
    cachedAlerts = getAlerts();
    cachedVersion++;
    callback();
  };
  window.addEventListener(ALERTS_CHANGE_EVENT, handler);
  return () => window.removeEventListener(ALERTS_CHANGE_EVENT, handler);
}

function getAlertsSnapshot() {
  return cachedVersion;
}

function getServerSnapshot() {
  return 0;
}

export function useAlerts() {
  // Sync all hook instances via useSyncExternalStore
  const version = useSyncExternalStore(subscribeToAlerts, getAlertsSnapshot, getServerSnapshot);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const { data } = useMarkets();

  // Load alerts from localStorage on mount and when version changes
  useEffect(() => {
    setAlerts(getAlerts());
  }, [version]);

  // Check alerts against current prices
  useEffect(() => {
    if (!data?.markets.length || !alerts.length) return;

    let changed = false;
    const updated = alerts.map((alert) => {
      if (alert.triggered) return alert;

      const market = data.markets.find((m) => m.id === alert.marketId);
      if (!market) return alert;

      const price = market.yesPrice;
      const shouldTrigger =
        (alert.condition === "above" && price >= alert.threshold) ||
        (alert.condition === "below" && price <= alert.threshold);

      if (shouldTrigger) {
        changed = true;
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("Sigmar Alert", {
            body: `${market.question}\nPrice ${alert.condition === "above" ? "rose above" : "dropped below"} ${(alert.threshold * 100).toFixed(0)}% (now ${(price * 100).toFixed(1)}%)`,
            icon: "/favicon.ico",
          });
        }
        return { ...alert, triggered: true, triggeredAt: Date.now(), currentPrice: price };
      }
      return alert;
    });

    if (changed) {
      saveAlerts(updated);
      notifyChange();
    }
  }, [data?.markets, alerts]);

  const add = useCallback(
    (alert: Omit<PriceAlert, "id" | "createdAt" | "triggered">) => {
      const newAlert = addAlert(alert);
      notifyChange();
      return newAlert;
    },
    []
  );

  const remove = useCallback((id: string) => {
    removeAlert(id);
    notifyChange();
  }, []);

  const clear = useCallback(() => {
    clearTriggered();
    notifyChange();
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const activeCount = alerts.filter((a) => !a.triggered).length;
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return {
    alerts,
    activeCount,
    triggeredCount,
    add,
    remove,
    clear,
    requestPermission,
  };
}
