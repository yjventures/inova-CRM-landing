import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pipelineStagesApi, PipelineStagePayload } from '@/lib/api/pipelineStages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

export default function PipelineStages() {
  const qc = useQueryClient();
  const qk = ['pipeline-stages'];
  const listQuery = useQuery({ queryKey: qk, queryFn: pipelineStagesApi.list });

  const createMutation = useMutation({
    mutationFn: (payload: any) => pipelineStagesApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk }); toast.success('Stage created'); },
    onError: () => toast.error('Failed to create stage'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PipelineStagePayload }) => pipelineStagesApi.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk }); toast.success('Stage updated'); },
    onError: () => toast.error('Failed to update stage'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => pipelineStagesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk }); toast.success('Stage deleted'); },
    onError: (err: any) => {
      if (err?.response?.status === 409) toast.error('Stage in use');
      else toast.error('Failed to delete stage');
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: string; order: number }>) => pipelineStagesApi.reorder(items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk }); toast.success('Stages reordered'); },
    onError: () => toast.error('Failed to reorder stages'),
  });

  const stages = (listQuery.data?.data ?? []) as Array<any>;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; probability: number; type: 'open'|'won'|'lost'; color?: string }>({ name: '', probability: 0, type: 'open' });
  const [editId, setEditId] = useState<string | null>(null);

  const onSave = () => {
    if (!form.name || form.name.length < 1 || form.name.length > 50) { toast.error('Name must be 1-50 chars'); return; }
    if (form.probability < 0 || form.probability > 100) { toast.error('Probability must be 0-100'); return; }
    if (editId) updateMutation.mutate({ id: editId, payload: form });
    else createMutation.mutate(form);
    setOpen(false);
    setEditId(null);
    setForm({ name: '', probability: 0, type: 'open', color: '' });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const reordered = [...stages];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    const items = reordered.map((s, i) => ({ id: s._id, order: i }));
    reorderMutation.mutate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Stages</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Stage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Name</label>
                <Input value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm">Probability</label>
                <Input type="number" value={form.probability} onChange={(e)=>setForm(f=>({...f, probability: Number(e.target.value||0)}))} />
              </div>
              <div>
                <label className="text-sm">Type</label>
                <Select value={form.type} onValueChange={(v)=>setForm(f=>({...f, type: v as any}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Color</label>
                <Input value={form.color || ''} onChange={(e)=>setForm(f=>({...f, color: e.target.value}))} placeholder="#RRGGBB or tailwind class" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={onSave} disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading && <Loading />}
          {listQuery.error && <ErrorState onRetry={()=>listQuery.refetch()} />}
          {!listQuery.isLoading && !listQuery.error && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="stages-droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left">Order</th>
                          <th className="pb-2 text-left">Name</th>
                          <th className="pb-2 text-left">Probability</th>
                          <th className="pb-2 text-left">Type</th>
                          <th className="pb-2 text-left">Color</th>
                          <th className="pb-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stages.map((s, idx) => (
                          <Draggable draggableId={s._id} index={idx} key={s._id}>
                            {(drag) => (
                              <tr ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="border-b">
                                <td className="py-2">{idx}</td>
                                <td className="py-2">{s.name}</td>
                                <td className="py-2">{s.probability}%</td>
                                <td className="py-2"><Badge variant="secondary">{s.type}</Badge></td>
                                <td className="py-2">{s.color || '—'}</td>
                                <td className="py-2">
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={()=>{ setEditId(s._id); setForm({ name: s.name, probability: s.probability, type: s.type, color: s.color }); setOpen(true); }}><Edit2 className="mr-2 h-4 w-4"/>Edit</Button>
                                    <Button size="sm" variant="outline" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800" onClick={()=>deleteMutation.mutate(s._id)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


