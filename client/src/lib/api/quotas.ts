import { get, post } from '@/lib/api';

export type QuotaPayload = {
  year: number;
  monthlyTarget: number;
  currency?: string;
};

export const quotasApi = {
  getCurrent: (year: number) => get('/quotas/current', { year }),
  save: (payload: QuotaPayload) => post('/quotas', payload),
};


