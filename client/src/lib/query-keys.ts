export const qk = {
  contacts: {
    list: (params: Record<string, any> = {}) => ['contacts', params] as const,
    detail: (id?: string) => ['contacts', id] as const,
    deals: (id?: string) => ['contacts', id, 'deals'] as const,
    activities: (id?: string) => ['contacts', id, 'activities'] as const,
  },
  deals: {
    list: (params: Record<string, any> = {}) => ['deals', params] as const,
    detail: (id?: string) => ['deals', id] as const,
    pipeline: () => ['deals', 'pipeline'] as const,
  },
  analytics: {
    overview: (filters: Record<string, any> = {}) => ['analytics', 'overview', filters] as const,
    monthlyForecast: (filters: Record<string, any> = {}) => ['analytics', 'monthly-forecast', filters] as const,
    monthlyTrend: (filters: Record<string, any> = {}) => ['analytics', 'monthly-trend', filters] as const,
  },
  dashboard: {
    kpis: (params: Record<string, any> = {}) => ['dashboard', 'kpis', params] as const,
    pipelineSummary: () => ['dashboard', 'pipeline-summary'] as const,
    upcoming: (limit: number) => ['activities', 'upcoming', { limit }] as const,
  },
  users: {
    list: () => ['users'] as const,
  },
  files: {
    list: (params: Record<string, any> = {}) => ['files', params] as const,
  },
};


