// src/hooks/useAnalytics.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchDailySummary,
  fetchRecentToday,
} from "@/services/analyticsService";

export function useDailySummary(dateISO?: string) {
  return useQuery({
    queryKey: ["analytics", "summary", dateISO ?? "today"],
    queryFn: () => fetchDailySummary(dateISO),
    staleTime: 15_000,
  });
}

export function useRecentToday(limit = 20) {
  return useQuery({
    queryKey: ["analytics", "recent", limit],
    queryFn: () => fetchRecentToday(limit),
    staleTime: 10_000,
  });
}
