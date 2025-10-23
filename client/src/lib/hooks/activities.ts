import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

export type ActivityItem = {
  _id: string;
  type: 'call'|'email'|'meeting'|'task';
  title: string;
  priority?: 'low'|'medium'|'high';
  notes?: string;
  channel?: string;
  duration?: string;
  dueAt?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: { _id: string; fullName?: string; email?: string; role?: string } | string;
  contactId?: { _id: string; fullName?: string; email?: string; company?: string } | string;
  dealId?: { _id: string; title?: string; amount?: number } | string;
};

export type ActivitiesListResponse = { ok: boolean; data: ActivityItem[]; meta?: { page: number; limit: number; total: number; pages: number } };

export function useActivities(params?: Record<string, any>) {
  const p = { ...(params ?? {}) } as any;
  return useQuery<ActivitiesListResponse>({
    queryKey: ['activities', 'list', p],
    queryFn: async () => {
      return await get<ActivitiesListResponse>('/activities', p);
    },
    keepPreviousData: true,
  });
}


