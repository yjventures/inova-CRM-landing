import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload } from 'lucide-react';

type EntityType = 'contact' | 'deal' | 'activity';

type FileDto = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  uploaderId: string;
};

export default function FilesPanel({ entityType, entityId }: { entityType: EntityType; entityId: string }) {
  const enabled = Boolean(entityType && entityId);
  const qc = useQueryClient();
  const qk = useMemo(() => ['files', entityType, entityId], [entityType, entityId]);

  const listQuery = useQuery<{ ok: boolean; data: FileDto[] }>({
    queryKey: qk,
    queryFn: async () => get(`/files/${entityType}/${entityId}`),
    enabled,
  });

  const [pending, setPending] = useState<FileList | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!pending || pending.length === 0) return;
      const fd = new FormData();
      fd.append('entityType', entityType);
      fd.append('entityId', entityId);
      // Use single field name 'file' as requested
      for (const f of Array.from(pending)) fd.append('file', f);
      return post('/files', fd);
    },
    onSuccess: () => {
      setPending(null);
      qc.invalidateQueries({ queryKey: qk });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ fileId }: { fileId: string }) => del(`/files/${fileId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  if (!enabled) {
    return <div className="text-sm text-muted-foreground">Select an entity to manage files.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="file" multiple onChange={(e) => setPending(e.target.files)} />
        <Button size="sm" disabled={uploadMutation.isPending || !pending || pending.length === 0} onClick={() => uploadMutation.mutate()}>
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>

      {listQuery.isLoading && <Loading />}
      {listQuery.error && <ErrorState onRetry={() => listQuery.refetch()} />}
      {!listQuery.isLoading && !listQuery.error && ((listQuery.data?.data?.length ?? 0) === 0) && (
        <div className="text-sm text-muted-foreground">No files yet. Upload to get started.</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2 text-left">File</th>
              <th className="pb-2 text-left">Size</th>
              <th className="pb-2 text-left">Uploaded</th>
              <th className="pb-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listQuery.data?.data ?? []).map((f) => {
              const kb = Math.max(1, Math.round((f.size || 0) / 1024));
              const uploaded = f.createdAt ? new Date(f.createdAt).toLocaleString() : '—';
              return (
                <tr key={f._id} className="border-b">
                  <td className="py-2">
                    <a className="text-primary hover:underline" href={f.url} target="_blank" rel="noreferrer">
                      {f.originalName}
                    </a>
                  </td>
                  <td className="py-2">{kb} KB</td>
                  <td className="py-2">{uploaded}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <a className="text-muted-foreground hover:text-primary" href={f.url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800"
                        onClick={() => deleteMutation.mutate({ fileId: f._id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


