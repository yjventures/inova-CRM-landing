import { z } from 'zod';

export const createPipelineStageSchema = z.object({
  name: z.string().min(1).max(50),
  probability: z.number().min(0).max(100),
  type: z.enum(['open','won','lost']),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const updatePipelineStageSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  probability: z.number().min(0).max(100).optional(),
  type: z.enum(['open','won','lost']).optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderPipelineStageSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), order: z.number().int() })).min(1).max(100),
});

export type CreatePipelineStageInput = z.infer<typeof createPipelineStageSchema>;
export type UpdatePipelineStageInput = z.infer<typeof updatePipelineStageSchema>;
export type ReorderPipelineStageInput = z.infer<typeof reorderPipelineStageSchema>;


