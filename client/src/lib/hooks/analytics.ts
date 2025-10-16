import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  territory?: string;
  rep?: string;
};

export function useAnalyticsOverview(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: async () => {
      const res = await get<any>('/analytics/overview', filters);
      return res?.data ?? res;
    },
    keepPreviousData: true,
  });
}

export function useMonthlyForecast(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'monthly-forecast', filters],
    queryFn: async () => {
      const res = await get<any>('/analytics/monthly-forecast', filters);
      return (res?.data ?? res) as Array<{ month: string; forecast: number; actual?: number }>;
    },
    keepPreviousData: true,
  });
}

export function useMonthlyTrend(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'monthly-trend', filters],
    queryFn: async () => {
      const res = await get<any>('/analytics/monthly-trend', filters);
      return (res?.data ?? res) as Array<{ month: string; actual: number; forecast: number }>;
    },
    keepPreviousData: true,
  });
}


