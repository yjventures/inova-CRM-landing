import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';

export type DealsQuery = {
  stageId?: string;
  ownerId?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type DealsListItem = { _id: string; title: string; amount: number; stage: string; probability: number };
export type DealsListMeta = { page?: number; limit?: number; total?: number; pages?: number };
export type DealsListResponse = { ok: boolean; data: DealsListItem[]; meta?: DealsListMeta };

export function useDeals(query: DealsQuery = {}) {
  const params = { ...query } as any;
  return useQuery<DealsListResponse>({
    queryKey: ['deals', params],
    queryFn: async () => {
      const res = await get<DealsListResponse>('/deals', params);
      return res; // { ok, data, meta }
    },
    keepPreviousData: true,
  });
}

export function useDeal(id?: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await get<any>(`/deals/${id}`);
      return res?.data ?? null;
    },
    enabled: Boolean(id),
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; amount: number; stage: string; probability?: number; closeDate?: string; source?: string; industry?: string; tags?: string[]; notes?: string; contactId?: string; accountId?: string }) => {
      const res = await post<any>('/deals', body);
      return res?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const res = await patch<any>(`/deals/${id}`, body);
      return res?.data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      qc.invalidateQueries({ queryKey: ['deals', id] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await del<any>(`/deals/${id}`);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}


