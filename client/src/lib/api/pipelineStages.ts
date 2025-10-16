import { get, post, patch, del, put } from '@/lib/api';

export type PipelineStagePayload = {
  name?: string;
  probability?: number;
  type?: 'open'|'won'|'lost';
  color?: string;
  order?: number;
};

export const pipelineStagesApi = {
  list: () => get('/pipeline-stages'),
  create: (payload: Required<Pick<PipelineStagePayload, 'name'|'probability'|'type'>> & Partial<PipelineStagePayload>) => post('/pipeline-stages', payload),
  update: (id: string, payload: PipelineStagePayload) => patch(`/pipeline-stages/${id}`, payload),
  remove: (id: string) => del(`/pipeline-stages/${id}`),
  reorder: (items: Array<{ id: string; order: number }>) => put('/pipeline-stages/reorder', { items }),
};


