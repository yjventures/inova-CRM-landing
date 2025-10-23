import { Plus, Download, Search, Mail, Phone, Calendar, CheckSquare, TrendingUp, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { useDebouncedValue } from '@/lib/utils';
import { useMutation } from "@tanstack/react-query";
import { post, patch as apiPatch, del as apiDel } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";

import { useActivities, type ActivitiesListResponse } from '@/lib/hooks/activities';
import { useContacts } from '@/lib/hooks/contacts';

export default function Activity() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all-time');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const debouncedQ = useDebouncedValue(query, 300);

  // Map UI filters to API params
  const rangeToParams = useMemo(()=>{
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'today') return { dueFrom: startOfDay.toISOString() };
    if (dateFilter === 'week') {
      const d = new Date(startOfDay); d.setDate(d.getDate() - 7); return { dueFrom: d.toISOString() };
    }
    if (dateFilter === 'month') {
      const d = new Date(startOfDay); d.setMonth(d.getMonth() - 1); return { dueFrom: d.toISOString() };
    }
    return {};
  }, [dateFilter]);

  const apiParams: any = useMemo(()=>({
    sort: '-updatedAt',
    limit: 50,
    q: debouncedQ || undefined,
    type: typeFilter !== 'all' ? (typeFilter === 'emails' ? 'email' : typeFilter === 'calls' ? 'call' : typeFilter === 'meetings' ? 'meeting' : typeFilter === 'tasks' ? 'task' : undefined) : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    ...rangeToParams,
  }), [debouncedQ, typeFilter, priorityFilter, rangeToParams]);

  const { data, isLoading, isError, refetch } = useActivities(apiParams);
  const d = data as ActivitiesListResponse | undefined;
  const formatRelative = (dateIso?: string) => {
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
  };

  const activities = useMemo(()=> ((d?.data) ?? []).map((a)=>{
    const contact = typeof a.contactId === 'object' ? a.contactId : undefined;
    const owner = typeof a.ownerId === 'object' ? a.ownerId : undefined;
    const deal = typeof a.dealId === 'object' ? a.dealId : undefined;
    return {
      id: (a as any)._id as string,
      type: a.type,
      title: a.title,
      priority: a.priority ?? 'medium',
      value: deal?.amount ? `$${Math.round(Number(deal.amount)).toLocaleString()}` : undefined,
      from: contact?.fullName ?? owner?.fullName ?? '—',
      to: contact?.fullName ?? undefined,
      company: contact?.company ?? '—',
      description: a.notes ?? '',
      channel: (a.type === 'email' ? 'Email' : a.type === 'call' ? 'Call' : a.type === 'meeting' ? 'Meeting' : 'Task'),
      duration: undefined,
      time: formatRelative(a.updatedAt || a.createdAt || new Date().toISOString()),
      avatars: [
        owner?.fullName ? owner.fullName.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase() : 'NA',
        contact?.fullName ? contact.fullName.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase() : '—',
      ],
      raw: a,
    };
  }), [d]);
  const getTypeMeta = (type: string) => {
    if (type === 'email') return { label: 'Email', bg: 'bg-primary/10', color: 'text-primary', LeftIcon: Mail, SmallIcon: Mail };
    if (type === 'call') return { label: 'Call', bg: 'bg-success/10', color: 'text-success', LeftIcon: Phone, SmallIcon: Phone };
    if (type === 'meeting') return { label: 'Meeting', bg: 'bg-purple-100', color: 'text-purple-600', LeftIcon: Users, SmallIcon: Users };
    if (type === 'task') return { label: 'Task', bg: 'bg-orange-100', color: 'text-orange-500', LeftIcon: CheckCircle, SmallIcon: CheckCircle };
    return { label: 'Activity', bg: 'bg-muted/30', color: 'text-muted-foreground', LeftIcon: CheckSquare, SmallIcon: CheckSquare };
  };

  const getPriorityMeta = (priority?: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return { label: 'High', className: 'bg-destructive text-destructive-foreground' };
      case 'medium':
        return { label: 'Medium', className: 'bg-warning text-warning-foreground' };
      case 'low':
        return { label: 'Low', className: 'bg-success text-success-foreground' };
      default:
        return { label: priority ?? '—', className: 'bg-secondary text-secondary-foreground' };
    }
  };
  const handleExport = () => {
    const exportPayload = {
      generatedAt: new Date().toISOString(),
      filters: {
        q: debouncedQ || undefined,
        type: typeFilter,
        dateRange: dateFilter,
        ...rangeToParams,
      },
      meta: d?.meta ?? { count: d?.data?.length ?? 0 },
      data: d?.data ?? [],
    } as const;
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_timeline_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ type: 'call'|'email'|'meeting'|'task'|''; title: string; priority: 'low'|'medium'|'high'|''; dueAt: string; notes?: string; contactId?: string }>({ type: '', title: '', priority: 'medium', dueAt: '' });
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: form.type,
        title: form.title,
        priority: form.priority || 'medium',
        dueAt: form.dueAt || undefined,
        notes: form.notes || undefined,
      };
      if (form.contactId) payload.contactId = form.contactId;
      const res = await post<any>('/activities', payload);
      return res?.data;
    },
    onSuccess: () => {
      toast({ title: 'Activity created' });
      setShowModal(false);
      setForm({ type: '', title: '', priority: 'medium', dueAt: '' });
      refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Failed to create activity', description: err?.response?.data?.message || err.message, variant: 'destructive' });
    },
  });

  // Edit Activity state and mutation
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string; type: 'call'|'email'|'meeting'|'task'|''; title: string; priority: 'low'|'medium'|'high'|''; dueAt: string; notes?: string; contactId?: string }>({ id: '', type: '', title: '', priority: 'medium', dueAt: '' });
  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: editForm.type,
        title: editForm.title,
        priority: editForm.priority || 'medium',
        dueAt: editForm.dueAt || undefined,
        notes: editForm.notes || undefined,
      };
      if (editForm.contactId) payload.contactId = editForm.contactId;
      const res = await apiPatch<any>(`/activities/${editForm.id}`, payload);
      return res?.data;
    },
    onSuccess: () => {
      toast({ title: 'Activity updated' });
      setShowEditModal(false);
      refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update activity', description: err?.response?.data?.message || err.message, variant: 'destructive' });
    },
  });

  function ContactsSelect({ form, setForm }: { form: any; setForm: (updater: any) => void }) {
    const { data } = useContacts({ q: '', page: 1, limit: 50 } as any);
    const list = (data as any)?.data ?? [];
    const NONE = '__none__';
    return (
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="a-contact">Contact (optional)</Label>
        <Select value={form.contactId ?? NONE} onValueChange={(v)=> setForm((f:any)=> ({...f, contactId: v === NONE ? undefined : v}))}>
          <SelectTrigger id="a-contact">
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>None</SelectItem>
            {list.map((c: any)=> (
              <SelectItem key={c._id} value={c._id}>
                {(c.fullName || 'Unnamed')} {c.company ? `– ${c.company}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // actions
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const deleteAct = async (id: string) => {
    await apiDel(`/activities/${id}`);
    refetch();
  };

  const openEdit = (activity: any) => {
    const raw = activity.raw || {};
    const dueAtIso = raw?.dueAt || '';
    const contactId = raw?.contactId && typeof raw.contactId === 'object' ? raw.contactId._id : raw?.contactId;
    setEditForm({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      priority: activity.priority,
      dueAt: dueAtIso || '',
      notes: raw?.notes || activity.description || '',
      contactId: contactId || undefined,
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Activity Timeline</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold">Activity Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Unified view of all customer interactions across communication channels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Timeline
          </Button>
          <Button onClick={()=> setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activities, contacts, or companies..."
          className="pl-9"
          value={query}
          onChange={(e)=> setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="font-medium">Activity Type</div>
              <RadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center gap-2 font-normal">
                    <TrendingUp className="h-4 w-4" />
                    All Activities
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emails" id="emails" />
                  <Label htmlFor="emails" className="flex items-center gap-2 font-normal">
                    <Mail className="h-4 w-4" />
                    Emails
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calls" id="calls" />
                  <Label htmlFor="calls" className="flex items-center gap-2 font-normal">
                    <Phone className="h-4 w-4" />
                    Calls
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="meetings" id="meetings" />
                  <Label htmlFor="meetings" className="flex items-center gap-2 font-normal">
                    <Calendar className="h-4 w-4" />
                    Meetings
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tasks" id="tasks" />
                  <Label htmlFor="deals" className="flex items-center gap-2 font-normal">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="font-medium">Date Range</div>
              <RadioGroup value={dateFilter} onValueChange={setDateFilter}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-time" id="all-time" />
                  <Label htmlFor="all-time" className="font-normal">All Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today" className="font-normal">Today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week" className="font-normal">This Week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month" className="font-normal">This Month</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="font-medium">Priority Type</div>
              <RadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="prio-all" />
                  <Label htmlFor="prio-all" className="font-normal">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="prio-high" />
                  <Label htmlFor="prio-high" className="font-normal">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="prio-medium" />
                  <Label htmlFor="prio-medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="prio-low" />
                  <Label htmlFor="prio-low" className="font-normal">Low</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="font-medium">Team Member</div>
              <RadioGroup defaultValue="all-members">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-members" id="all-members" />
                  <Label htmlFor="all-members" className="font-normal">All Team Members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="john" id="john" />
                  <Label htmlFor="john" className="font-normal">John Smith</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sarah" id="sarah" />
                  <Label htmlFor="sarah" className="font-normal">Sarah Johnson</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {isLoading ? 'Loading activities...' : isError ? 'Failed to load activities' : `Showing ${(d?.data?.length ?? 0)} of ${(d?.meta?.total ?? d?.data?.length ?? 0)} activities`}
          </div>

          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {(() => { const m = getTypeMeta(activity.type); const Icon = m.LeftIcon; return (
                      <div className={`flex w-16 flex-col items-center justify-center ${m.bg}`}>
                        <Icon className={`h-8 w-8 ${m.color}`} />
                      </div>
                    ); })()}

                    <div className="flex-1 p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {activity.title}
                            </h3>
                            {(() => { const pm = getPriorityMeta(activity.priority); return (
                              <Badge className={pm.className}>
                                {pm.label}
                              </Badge>
                            ); })()}
                            {activity.value && (
                              <Badge variant="outline" className="text-success">
                                {activity.value}
                              </Badge>
                            )}
                          </div>

                          <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                            {(() => { const m = getTypeMeta(activity.type); const Icon = m.SmallIcon; return (
                              <span className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${m.color}`} />
                                {m.label}
                              </span>
                            ); })()}
                            <span>{activity.time}</span>
                            {activity.duration && (
                              <span>Duration: {activity.duration}</span>
                            )}
                          </div>

                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {activity.avatars.map((avatar, i) => (
                                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                    {avatar}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <div className="text-sm">
                              <div>
                                <span className="font-semibold">{activity.from}</span>
                              </div>
                              <div className="text-muted-foreground">
                                {activity.company}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>

                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              Reply
                            </Button>
                            <Button variant="outline" size="sm">
                              Follow-up
                            </Button>
                            <Button variant="outline" size="sm">
                              Schedule
                            </Button>
                            <Button variant="outline" size="sm" onClick={()=> openEdit(activity)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800" onClick={()=> { setActivityToDelete(activity.id); setShowDeleteConfirm(true); }}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
        </div>
      </div>
      {/* Add Activity Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-type">Type *</Label>
                <Select value={form.type} onValueChange={(v)=> setForm(f=>({...f, type: v as any}))}>
                  <SelectTrigger id="a-type">
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
                <Label htmlFor="a-priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v)=> setForm(f=>({...f, priority: v as any}))}>
                  <SelectTrigger id="a-priority">
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
              <Label htmlFor="a-title">Title *</Label>
              <Input id="a-title" value={form.title} onChange={(e)=> setForm(f=>({...f, title: e.target.value}))} />
            </div>

              <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-due">Due At</Label>
                <DateTimePicker value={form.dueAt} onChange={(val)=> setForm(f=>({...f, dueAt: val }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ContactsSelect form={form} setForm={setForm} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-notes">Notes</Label>
              <Textarea id="a-notes" rows={3} value={form.notes ?? ''} onChange={(e)=> setForm(f=>({...f, notes: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowModal(false)}>Cancel</Button>
            <Button disabled={!form.type || !form.title || createMutation.isPending} onClick={()=> createMutation.mutate()}>
              {createMutation.isPending ? 'Saving...' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="e-type">Type *</Label>
                <Select value={editForm.type} onValueChange={(v)=> setEditForm(f=>({...f, type: v as any}))}>
                  <SelectTrigger id="e-type">
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
                <Label htmlFor="e-priority">Priority</Label>
                <Select value={editForm.priority} onValueChange={(v)=> setEditForm(f=>({...f, priority: v as any}))}>
                  <SelectTrigger id="e-priority">
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
              <Label htmlFor="e-title">Title *</Label>
              <Input id="e-title" value={editForm.title} onChange={(e)=> setEditForm(f=>({...f, title: e.target.value}))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="e-due">Due At</Label>
                <DateTimePicker value={editForm.dueAt} onChange={(val)=> setEditForm(f=>({...f, dueAt: val || '' }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ContactsSelect form={editForm} setForm={setEditForm} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="e-notes">Notes</Label>
              <Textarea id="e-notes" rows={3} value={editForm.notes ?? ''} onChange={(e)=> setEditForm(f=>({...f, notes: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowEditModal(false)}>Cancel</Button>
            <Button disabled={!editForm.type || !editForm.title || updateMutation.isPending} onClick={()=> updateMutation.mutate()}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this activity? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowDeleteConfirm(false)}>Cancel</Button>
            <Button className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800" onClick={()=> { if (activityToDelete) { deleteAct(activityToDelete).then(()=>{ setShowDeleteConfirm(false); setActivityToDelete(null); }); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit / Delete / Done helpers
// removed placeholder openEdit; real implementation is defined above


  function DateTimePicker({ value, onChange }: { value?: string; onChange: (iso?: string) => void }) {
    const initial = value ? new Date(value) : undefined;
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(initial);
    const [hour, setHour] = useState<string>(String((((initial?.getHours() ?? 9) + 11) % 12) + 1).padStart(2,'0'));
    const [minute, setMinute] = useState<string>(String(initial?.getMinutes() ?? 0).padStart(2,'0'));
    const [ampm, setAmpm] = useState<'am'|'pm'>((initial?.getHours() ?? 9) >= 12 ? 'pm' : 'am');

    const label = useMemo(() => {
      if (!value) return 'No due date';
      const d = new Date(value);
      return d.toLocaleString();
    }, [value]);

    const apply = () => {
      const base = date ?? new Date();
      const h = Number(hour);
      const m = Number(minute);
      const hh24 = ((h % 12) + (ampm === 'am' ? 0 : 12));
      const composed = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh24, m, 0);
      onChange(composed.toISOString());
      setOpen(false);
    };

    const clear = () => {
      setDate(undefined);
      onChange(undefined);
      setOpen(false);
    };

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2,'0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2,'0'));

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}>
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 border rounded-md bg-popover" align="start">
          <div className="flex gap-3">
            <ShadCalendar
              mode="single"
              selected={date}
              onSelect={(d)=> setDate(d)}
              initialFocus
            />
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hours.map(h => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {minutes.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={ampm} onValueChange={(v)=> setAmpm(v as 'am'|'pm')}>
                  <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="am">am</SelectItem>
                    <SelectItem value="pm">pm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full grid-cols-3 items-center gap-2">
                <Button variant="outline" size="sm" onClick={clear}>Clear</Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-self-center"
                  onClick={()=>{ const now=new Date(); setDate(now); setHour(String(((now.getHours()+11)%12)+1).padStart(2,'0')); setMinute(String(now.getMinutes()).padStart(2,'0')); setAmpm(now.getHours()>=12?'pm':'am'); }}
                >
                  Today
                </Button>
                <Button size="sm" className="justify-self-end" onClick={apply}>Done</Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
