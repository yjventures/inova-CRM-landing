import { Save, Plus, Copy, Trash2, Mail, Phone, Upload, Download, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useCreateDeal, useDeal, useDeals, useDeleteDeal, useUpdateDeal, type DealsListResponse } from "@/lib/hooks/deals";
import { useContacts } from "@/lib/hooks/contacts";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import { useEntityFiles, useUploadFiles, useDeleteFile } from "@/lib/hooks/files";
import FilesPanel from "@/components/files/FilesPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useActivities, type ActivitiesListResponse } from '@/lib/hooks/activities';

function getTypeMeta(type: string) {
  if (type === 'email') return { label: 'Email', bg: 'bg-primary/10', color: 'text-primary', Icon: Mail };
  if (type === 'call') return { label: 'Call', bg: 'bg-success/10', color: 'text-success', Icon: Phone };
  if (type === 'meeting') return { label: 'Meeting', bg: 'bg-purple-100', color: 'text-purple-600', Icon: Users };
  if (type === 'task') return { label: 'Task', bg: 'bg-orange-100', color: 'text-orange-500', Icon: CheckCircle };
  return { label: 'Activity', bg: 'bg-muted/30', color: 'text-muted-foreground', Icon: Plus };
}
function formatRelative(dateIso?: string) {
  const now = Date.now();
  const t = dateIso ? new Date(dateIso).getTime() : now;
  const diff = Math.max(0, Math.floor((now - t) / 1000));
  if (diff < 60) return 'just now';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Deals() {
  const [q, setQ] = useState("");
  const { data: dealsData, isLoading, isError, refetch } = useDeals({ q });
  const dd: any = dealsData;
  const list = ((dd?.data) ?? []) as Array<{ _id: string; title: string; amount: number; stage: string; probability: number }>;
  const meta = dd?.meta;
  const [form, setForm] = useState<{ id?: string; title: string; amount?: number; stage: string; probability: number; closeDate?: string; source?: string; industry?: string; notes?: string; contactId?: string }>({ title: '', amount: undefined, stage: 'Lead', probability: 50 });
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();
  const deleteMutation = useDeleteDeal();
  const filesQuery = useEntityFiles({ entityType:'deal', entityId: form.id || '' });
  const uploadMutation = useUploadFiles();
  const deleteFileMutation = useDeleteFile();
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const { data: contactsData } = useContacts({ q: '', page: 1, limit: 100 } as any);
  const contacts = (contactsData as any)?.data ?? [];
  const NONE = '__none__';

  // Add Activity modal state
  const [showActivity, setShowActivity] = useState(false);
  const [activity, setActivity] = useState<{ type: 'call'|'email'|'meeting'|'task' | ''; title: string; priority: 'low'|'medium'|'high' | ''; dueAt: string; notes?: string }>({ type: '', title: '', priority: 'medium', dueAt: '' });
  const addActivityMutation = useMutation({
    mutationFn: async () => {
      const body: any = {
        type: activity.type,
        title: activity.title,
        priority: activity.priority || 'medium',
        dueAt: activity.dueAt || undefined,
        notes: activity.notes || undefined,
      };
      if (form.id) body.dealId = form.id;
      const res = await post<any>('/activities', body);
      return res?.data;
    },
    onSuccess: () => {
      toast({ title: 'Activity added' });
      setShowActivity(false);
      setActivity({ type: '', title: '', priority: 'medium', dueAt: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add activity', description: err?.response?.data?.message || err.message, variant: 'destructive' });
    },
  });

  // Live activities for the selected deal
  const { data: activitiesData, isLoading: activitiesLoading, isError: activitiesError } = useActivities(form.id ? { dealId: form.id, sort: '-updatedAt', limit: 50 } as any : { dealId: undefined as any, limit: 0 } as any);
  const actList = ((activitiesData as ActivitiesListResponse | undefined)?.data ?? []).map((a) => {
    const m = getTypeMeta(a.type);
    const contact = typeof a.contactId === 'object' ? a.contactId : undefined;
    const owner = typeof a.ownerId === 'object' ? a.ownerId : undefined;
    return {
      _id: a._id,
      title: a.title,
      description: a.notes ?? '',
      type: a.type,
      date: formatRelative(a.updatedAt || a.createdAt),
      Left: m,
      author: owner?.fullName ?? '—',
      contact: contact?.fullName,
    };
  });
  // Header actions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const saveDeal = () => {
    if (form.id) {
      updateMutation.mutate({ id: form.id, body: { ...form, amount: Number(form.amount ?? 0) } }, {
        onSuccess: (updated: any) => {
          if (updated?._id) {
            setForm(f => ({
              ...f,
              id: updated._id,
              title: updated.title ?? f.title,
              amount: Number(updated.amount ?? f.amount),
              stage: updated.stage ?? f.stage,
              probability: Number(updated.probability ?? f.probability),
            }));
          }
        }
      });
    } else {
      createMutation.mutate({ ...form, amount: Number(form.amount ?? 0) }, {
        onSuccess: (created: any) => {
          if (created?._id) {
            setForm(f => ({
              ...f,
              id: created._id,
              title: created.title ?? f.title,
              amount: Number(created.amount ?? f.amount),
              stage: created.stage ?? f.stage,
              probability: Number(created.probability ?? f.probability),
            }));
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Deal Management</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold">Deals</h1>
          <p className="text-sm text-muted-foreground">
            Deal ID: #1 • Created: 1/10/2024 • Last updated: 1/28/2024
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
            <CardTitle>Create / Edit Deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deal-name">Deal Name *</Label>
              <Input id="deal-name" value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deal-value">Deal Value *</Label>
                <Input id="deal-value" type="text" inputMode="numeric" value={form.amount ?? ''} onChange={(e)=>{
                  const raw = e.target.value ?? '';
                  const digitsOnly = raw.replace(/[^0-9]/g, '');
                  const noLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, '');
                  setForm(f=>({...f, amount: noLeadingZeros === '' ? undefined : Number(noLeadingZeros)}));
                }} />
                {form.amount != null && (
                  <p className="text-sm text-muted-foreground">${Math.round((form.amount||0)).toLocaleString()}</p>
                )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close-date">Expected Close Date *</Label>
                <Input id="close-date" type="date" value={form.closeDate ?? ''} onChange={(e)=>setForm(f=>({...f, closeDate: e.target.value}))} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stage">Deal Stage *</Label>
                <Select value={form.stage} onValueChange={(v)=>setForm(f=>({...f,stage:v}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                    <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                <Badge variant="secondary">{form.stage}</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rep">Assigned Representative *</Label>
                  <Select defaultValue="john">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Win Probability</Label>
                <Slider value={[form.probability]} max={100} step={1} onValueChange={(v)=>setForm(f=>({...f, probability: v[0]}))} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">0%</span>
                  <span className="font-semibold text-warning">{form.probability}%</span>
                  <span className="text-muted-foreground">100%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Primary Contact *</Label>
                <Select value={form.contactId ?? NONE} onValueChange={(v)=> setForm(f=> ({ ...f, contactId: v === NONE ? undefined : v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {contacts.map((c: any) => (
                      <SelectItem key={c._id} value={c._id}>
                        {(c.fullName || 'Unnamed')}{c.company ? ` - ${c.company}` : ''}{c.title ? ` at ${c.title}` : ''}
                    </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deal Description</Label>
                <Textarea id="description" rows={4} value={form.notes ?? ''} onChange={(e)=>setForm(f=>({...f, notes: e.target.value}))} />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead-source">Lead Source</Label>
                  <Select value={form.source ?? ''} onValueChange={(v)=> setForm(f=> ({ ...f, source: v }))}>
                    <SelectTrigger id="lead-source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={form.industry ?? ''} onValueChange={(v)=> setForm(f=> ({ ...f, industry: v }))}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision-makers">Decision Makers</Label>
                <Input id="decision-makers" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitor-analysis">Competitor Analysis</Label>
                <Textarea id="competitor-analysis" rows={3} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={()=>setForm({ title:'', amount: undefined, stage:'Lead', probability:50 })}>Reset</Button>
                <Button onClick={saveDeal}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Deals (moved to top) */}
          <Card>
            <CardHeader>
              <CardTitle>Current Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <Input placeholder="Search deals..." value={q} onChange={(e)=> setQ(e.target.value)} />
              </div>
              {isLoading && <Loading />}
              {isError && <ErrorState onRetry={()=>refetch()} />}
              {!isLoading && !isError && (
                <div className="space-y-2">
                  {list.map((d)=> (
                    <div key={d._id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <div className="font-medium">{d.title}</div>
                        <div className="text-xs text-muted-foreground">{d.stage} • ${Math.round(d.amount).toLocaleString()} • {Math.round(d.probability)}%</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>setForm({ id: d._id, title: d.title, amount: d.amount, stage: d.stage, probability: d.probability })}>Edit</Button>
                        <Button variant="outline" size="sm" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800" onClick={()=>deleteMutation.mutate(d._id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline</CardTitle>
                <Button size="sm" onClick={()=> setShowActivity(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesLoading && <div className="text-sm text-muted-foreground">Loading activities...</div>}
                {activitiesError && <div className="text-sm text-destructive">Failed to load activities.</div>}
                {!activitiesLoading && !activitiesError && actList.length === 0 && (
                  <div className="text-sm text-muted-foreground">No activities yet.</div>
                )}
                {!activitiesLoading && !activitiesError && actList.map((activity, idx) => (
                  <div key={activity._id} className="space-y-2">
                      <div className="flex items-start gap-2">
                      <div className={`mt-1 rounded-full p-1.5 ${activity.Left.bg} ${activity.Left.color}`}>
                        <activity.Left.Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="font-medium">{activity.title}</div>
                          <span className="text-xs text-muted-foreground">{activity.date}</span>
                          </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <Badge variant="outline" className="text-xs">{activity.Left.label}</Badge>
                        <span className="text-xs text-muted-foreground"> by {activity.author}</span>
                        </div>
                      </div>
                    {idx < actList.length - 1 && <Separator />}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          

          

          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FilesPanel entityType="deal" entityId={form.id || ''} />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Add Activity Modal */}
      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity{form.id ? ' for Deal' : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="act-type">Type *</Label>
                <Select value={activity.type} onValueChange={(v)=> setActivity(a=>({...a, type: v as any}))}>
                  <SelectTrigger id="act-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="act-priority">Priority</Label>
                <Select value={activity.priority} onValueChange={(v)=> setActivity(a=>({...a, priority: v as any}))}>
                  <SelectTrigger id="act-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-title">Title *</Label>
              <Input id="act-title" value={activity.title} onChange={(e)=> setActivity(a=>({...a, title: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-due">Due At</Label>
              <Input id="act-due" type="datetime-local" value={activity.dueAt} onChange={(e)=> setActivity(a=>({...a, dueAt: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-notes">Notes</Label>
              <Textarea id="act-notes" rows={3} value={activity.notes ?? ''} onChange={(e)=> setActivity(a=>({...a, notes: e.target.value}))} />
        </div>
      </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowActivity(false)}>Cancel</Button>
            <Button disabled={!activity.type || !activity.title || addActivityMutation.isPending} onClick={()=> addActivityMutation.mutate()}>
              {addActivityMutation.isPending ? 'Saving...' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Deal Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this deal? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowDeleteConfirm(false)}>Cancel</Button>
            <Button className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800" onClick={()=> { if (form.id) { deleteMutation.mutate(form.id); setShowDeleteConfirm(false); setForm({ title:'', amount: undefined, stage:'Lead', probability:50 }); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
