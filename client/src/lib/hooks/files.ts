import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';
import { qk } from '@/lib/query-keys';

export type EntityType = 'contact' | 'deal' | 'activity';

export type FileDto = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  uploaderId: string;
};

export type FilesListResponse = {
  ok: boolean;
  data: FileDto[];
  meta?: { page: number; limit: number; total: number; pages: number };
};

export function useEntityFiles(params: { entityType: EntityType; entityId: string; page?: number; limit?: number }) {
  const { entityType, entityId, page, limit } = params;
  const query = useQuery<FilesListResponse>({
    queryKey: qk.files.list({ entityType, entityId, page, limit }),
    queryFn: async () => {
      const res = await get<FilesListResponse>('/files', { entityType, entityId, page, limit });
      return res;
    },
    keepPreviousData: true,
    enabled: Boolean(entityType && entityId),
  });
  return { data: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
}

export function useUploadFiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityType, entityId, files }: { entityType: EntityType; entityId: string; files: File[] }) => {
      const fd = new FormData();
      fd.append('entityType', entityType);
      fd.append('entityId', entityId);
      for (const f of files) fd.append('files', f);
      const res = await post<any>('/files', fd);
      return res;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.files.list({ entityType: vars.entityType, entityId: vars.entityId }) });
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => {
      return del<any>(`/files/${fileId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] });
    },
  });
}


