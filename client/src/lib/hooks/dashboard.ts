import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api';

// Pipeline stages from server summary
export function usePipelineStages() {
  return useQuery({
    queryKey: ['dashboard', 'pipeline-summary'],
    queryFn: async () => {
      const res = await get<any>('/dashboard/pipeline-summary');
      const stages = (res?.data?.stages ?? []) as Array<{ stage: string }>;
      return stages.map((s: any, idx: number) => ({ _id: s.stage, name: s.stage, order: idx }));
    },
  });
}

export function useDashboardKpis(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', params ?? {}],
    queryFn: async () => {
      const res = await get<any>('/dashboard/kpis', params);
      return res?.data;
    },
  });
}

export function usePipelineSummary() {
  return useQuery({
    queryKey: ['dashboard', 'pipeline-summary'],
    queryFn: async () => {
      const res = await get<any>('/dashboard/pipeline-summary');
      return res?.data; // { stages, totals }
    },
  });
}

export function useUpcomingTasks(limit = 5) {
  return useQuery({
    queryKey: ['activities', 'upcoming', { limit }],
    queryFn: async () => {
      const res = await get<any>('/activities/upcoming', { limit });
      return res?.data as Array<{ _id: string; title: string; type: string; priority: string; dueAt: string; ownerId: string }>;
    },
  });
}

// Deals pipeline list grouped by stage (helper hook for the board)
export function useDealsPipeline() {
  return useQuery({
    queryKey: ['deals', 'pipeline'],
    queryFn: async () => {
      const res = await get<any>('/deals');
      const items = (res?.data ?? []) as Array<{ _id: string; title: string; amount: number; probability: number; stage: string; ownerId?: any; contactId?: any; createdAt?: string; updatedAt?: string }>;

      // Normalize to UI-friendly shape: add value alias, stageId, and placeholders
      const normalized = items.map((d) => ({
        ...d,
        // UI components sometimes expect `value`; mirror from amount
        value: d.amount,
        // Stable stage id for CSS/keys if needed
        stageId: (d.stage || '').toLowerCase().replace(/\s+/g, '-'),
        // Contact/owner details
        contact: typeof d.contactId === 'object' ? (d.contactId.fullName || '—') : '—',
        company: typeof d.contactId === 'object' ? (d.contactId.company || '—') : '—',
        owner: typeof d.ownerId === 'object' ? (d.ownerId.fullName || '—') : '—',
        avatar: undefined,
        // Timing metrics
        daysInStage: d.updatedAt ? Math.max(0, Math.floor((Date.now() - new Date(d.updatedAt).getTime()) / (1000*60*60*24))) : undefined,
        lastStageUpdate: d.updatedAt,
      }));

      const byStage: Record<string, Array<any>> = {};
      for (const d of normalized) {
        if (!byStage[d.stage]) byStage[d.stage] = [];
        byStage[d.stage].push(d);
      }
      const order = ['Lead','Qualified','Proposal','Negotiation','Closed Won'];
      return order.map((name) => ({ name, deals: byStage[name] ?? [] }));
    },
  });
}

export function useDealMove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; stage: string }) => {
      // Server expects stage updates
      const res = await patch<any>(`/deals/${vars.id}/stage`, { stage: vars.stage });
      return res?.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['deals', 'pipeline'] });
      const prev = qc.getQueryData<any>(['deals', 'pipeline']);
      // optimistic: remove deal from any stage and push into target
      if (Array.isArray(prev)) {
        const copy = prev.map((s: any) => ({ ...s, deals: [...s.deals] }));
        let moved: any | null = null;
        for (const col of copy) {
          const idx = col.deals.findIndex((d: any) => d._id === vars.id);
          if (idx >= 0) {
            moved = col.deals.splice(idx, 1)[0];
          }
        }
        if (moved) {
          const target = copy.find((s: any) => s.name === vars.stage);
          if (target) target.deals.unshift({ ...moved, stage: vars.stage });
        }
        qc.setQueryData(['deals', 'pipeline'], copy);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['deals', 'pipeline'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['deals', 'pipeline'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'pipeline-summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
    },
  });
}


export function usePerformanceTrend(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard', 'performance-trend', params ?? {}],
    queryFn: async () => {
      const res = await get<any>('/dashboard/performance-trend', params);
      return res?.data; // { range, series: [{month, actual, forecast}], totals }
    },
    keepPreviousData: true,
  });
}


