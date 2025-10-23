import { Plus, Upload, Mail, Phone, Edit, MoreVertical, Search, Linkedin, Twitter, Trash2, Download, Facebook, Instagram, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { useContact, useContactActivities, useContactDeals, useContacts, ContactsListResponse } from "@/lib/hooks/contacts";
import { useContactNotes } from "@/lib/hooks/contacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post, patch, del as apiDel } from "@/lib/api";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import { useEntityFiles, useUploadFiles, useDeleteFile, FilesListResponse } from "@/lib/hooks/files";
import FilesPanel from "@/components/files/FilesPanel";
import { useDebouncedValue } from "@/lib/utils";

type ContactItem = { _id: string; fullName: string; company?: string; status: 'active'|'inactive'; lastContactedAt?: string; email?: string };

export default function Contacts() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"active"|"inactive"|"all">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedQ = useDebouncedValue(q, 300);
  const [showFilter, setShowFilter] = useState(false);
  const [filterForm, setFilterForm] = useState<{ tag?: string; ownerId?: string }>({});
  const queryParams = useMemo(() => ({ q: debouncedQ || undefined, status: status === 'all' ? undefined : status, tag: filterForm.tag, page, limit }), [debouncedQ, status, filterForm.tag, page, limit]);
  const { data, isLoading, isError, refetch } = useContacts(queryParams);
  const typed = data as ContactsListResponse | undefined;
  const items = (typed?.data ?? []) as ContactItem[];
  const meta = typed?.meta ?? { page: 1, pages: 1, total: 0, limit };
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: selected } = useContact(selectedId);
  const { data: selectedDeals } = useContactDeals(selectedId);
  const { data: selectedActivities } = useContactActivities(selectedId);
  const filesQuery = useEntityFiles({ entityType: 'contact', entityId: selectedId || '' });
  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [create, setCreate] = useState<{ fullName: string; email?: string; phone?: string; company?: string; title?: string }>({ fullName: '' });
  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await post<any>('/contacts', create);
      return res?.data;
    },
    onSuccess: () => {
      setShowCreate(false);
      setCreate({ fullName: '' });
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('fullName,email,phone,company,title\n');
  const importMutation = useMutation({
    mutationFn: async () => {
      const lines = csvText.trim().split(/\r?\n/);
      const header = lines.shift()?.split(',') || [];
      const items = lines.map((line) => {
        const parts = line.split(',');
        const obj: any = {};
        header.forEach((h, i) => (obj[h.trim()] = (parts[i] || '').trim()));
        return obj;
      }).filter((o)=> o.fullName);
      const res = await post<any>('/contacts/import', { items });
      return res?.data;
    },
    onSuccess: () => {
      setShowImport(false);
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // Edit contact modal
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState<{ fullName?: string; email?: string; phone?: string; company?: string; title?: string; linkedinUrl?: string; twitterUrl?: string; websiteUrl?: string; instagramUrl?: string; facebookUrl?: string }>({});
  const [detailTab, setDetailTab] = useState<'overview'|'activity'|'deals'|'notes'|'files'>('overview');
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return null as any;
      const res = await patch<any>(`/contacts/${selectedId}`, edit);
      return res?.data;
    },
    onSuccess: () => {
      setShowEdit(false);
      qc.invalidateQueries({ queryKey: ['contacts'] });
      if (selectedId) qc.invalidateQueries({ queryKey: ['contacts', selectedId] });
    },
  });
  // Delete contact
  const [showDeleteContact, setShowDeleteContact] = useState(false);
  const deleteContactMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return null as any;
      const res = await apiDel<any>(`/contacts/${selectedId}`);
      return res?.data;
    },
    onSuccess: () => {
      setShowDeleteContact(false);
      setSelectedId(undefined);
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  const norm = (u?: string) => {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };
  const allIds = useMemo(() => items.map((c) => c._id), [items]);
  const allSelected = useMemo(() => items.length > 0 && selectedIds.length === items.length, [items.length, selectedIds.length]);
  const someSelected = useMemo(() => selectedIds.length > 0 && !allSelected, [selectedIds.length, allSelected]);
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? allIds : []);
  };
  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((x) => x !== id);
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Contact Management</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold">Contact Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer relationships and communication history
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={()=> setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          <Button variant="outline" onClick={()=> setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts by name, email, or company..."
          className="pl-9"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="c-name">Full Name *</Label>
              <Input id="c-name" value={create.fullName} onChange={(e)=> setCreate(c=>({ ...c, fullName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" value={create.email ?? ''} onChange={(e)=> setCreate(c=>({ ...c, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" value={create.phone ?? ''} onChange={(e)=> setCreate(c=>({ ...c, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-company">Company</Label>
              <Input id="c-company" value={create.company ?? ''} onChange={(e)=> setCreate(c=>({ ...c, company: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-title">Title</Label>
              <Input id="c-title" value={create.title ?? ''} onChange={(e)=> setCreate(c=>({ ...c, title: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowCreate(false)}>Cancel</Button>
            <Button onClick={()=> createMutation.mutate()} disabled={!create.fullName || createMutation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Contact Confirmation */}
      <Dialog open={showDeleteContact} onOpenChange={setShowDeleteContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this contact? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowDeleteContact(false)}>Cancel</Button>
            <Button className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800" onClick={()=> deleteContactMutation.mutate()} disabled={deleteContactMutation.isPending}>
              {deleteContactMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Contacts</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="f-tag">Tag</Label>
              <Input id="f-tag" value={filterForm.tag ?? ''} onChange={(e)=> setFilterForm(f=>({ ...f, tag: e.target.value || undefined }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setFilterForm({}); setShowFilter(false); }}>Clear</Button>
            <Button onClick={()=> { setPage(1); setShowFilter(false); /* Tag integrated by query param via useContacts below */ }}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Contacts (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Paste CSV with columns: fullName,email,phone,company,title</p>
            <textarea className="w-full min-h-[200px] rounded-md border p-2 font-mono text-xs" value={csvText} onChange={(e)=> setCsvText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowImport(false)}>Cancel</Button>
            <Button onClick={()=> importMutation.mutate()} disabled={importMutation.isPending}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="e-name">Full Name</Label>
              <Input id="e-name" value={edit.fullName ?? ''} onChange={(e)=> setEdit(c=>({ ...c, fullName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-email">Email</Label>
              <Input id="e-email" value={edit.email ?? ''} onChange={(e)=> setEdit(c=>({ ...c, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-phone">Phone</Label>
              <Input id="e-phone" value={edit.phone ?? ''} onChange={(e)=> setEdit(c=>({ ...c, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-company">Company</Label>
              <Input id="e-company" value={edit.company ?? ''} onChange={(e)=> setEdit(c=>({ ...c, company: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-title">Title</Label>
              <Input id="e-title" value={edit.title ?? ''} onChange={(e)=> setEdit(c=>({ ...c, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-linkedin">LinkedIn URL</Label>
              <Input id="e-linkedin" value={edit.linkedinUrl ?? ''} onChange={(e)=> setEdit(c=>({ ...c, linkedinUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-twitter">Twitter URL</Label>
              <Input id="e-twitter" value={edit.twitterUrl ?? ''} onChange={(e)=> setEdit(c=>({ ...c, twitterUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-website">Website</Label>
              <Input id="e-website" value={edit.websiteUrl ?? ''} onChange={(e)=> setEdit(c=>({ ...c, websiteUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-instagram">Instagram</Label>
              <Input id="e-instagram" value={edit.instagramUrl ?? ''} onChange={(e)=> setEdit(c=>({ ...c, instagramUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-facebook">Facebook</Label>
              <Input id="e-facebook" value={edit.facebookUrl ?? ''} onChange={(e)=> setEdit(c=>({ ...c, facebookUrl: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setShowEdit(false)}>Cancel</Button>
            <Button onClick={()=> editMutation.mutate()} disabled={editMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v: any) => handleSelectAll(Boolean(v))}
                  aria-label="Select all contacts"
                />
                <span className="text-sm text-muted-foreground">Select all{someSelected ? ' (partial)' : ''}</span>
              </div>
              <span className="text-sm text-muted-foreground">{meta.total} contacts</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Tabs value={status} onValueChange={(v) => { setPage(1); setStatus(v as any); }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Contacts</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {isLoading && <Loading />}
              {isError && <ErrorState onRetry={() => refetch()} />}
              {!isLoading && !isError && items.length === 0 && (
                <div className="text-sm text-muted-foreground">No contacts found.</div>
              )}
              {items.map((contact) => (
                <div
                  key={contact._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                  onClick={() => setSelectedId(contact._id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(contact._id)}
                    onCheckedChange={(v: any) => toggleSelectOne(contact._id, Boolean(v))}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${contact.fullName}`}
                  />
                  <Avatar>
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {(contact.fullName || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.fullName}</span>
                      {contact.status === "active" && (
                        <div className="h-2 w-2 rounded-full bg-success" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {[contact.company, (contact as any).title].filter(Boolean).join(' • ') || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(contact as any).phone ?? '—'}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e)=> e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e)=> { e.stopPropagation(); setSelectedId(contact._id); setDetailTab('activity'); }}>
                        Activity
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e)=> { e.stopPropagation(); setSelectedId(contact._id); setDetailTab('deals'); }}>
                        Deals
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e)=> { e.stopPropagation(); setSelectedId(contact._id); setDetailTab('notes'); }}>
                        Notes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div>
                Page {meta.page} of {meta.pages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <Button variant="outline" size="sm" disabled={meta.page >= (meta.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                      {(selected?.fullName || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selected?.fullName ?? 'Select a contact'}</h2>
                    <p className="text-muted-foreground">
                      {selected?.title ? `${selected.title} • ` : ''}{selected?.company ?? ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!selected?.email} onClick={()=>{ if (selected?.email) window.open(`mailto:${selected.email}`,'_blank'); }}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selected?.phone} onClick={()=>{ if (selected?.phone) window.open(`tel:${selected.phone}`); }}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selectedId} onClick={()=>{ if (selected) { setEdit({ fullName: (selected as any).fullName, email: (selected as any).email, phone: (selected as any).phone, company: (selected as any).company, title: (selected as any).title, linkedinUrl: (selected as any).linkedinUrl, twitterUrl: (selected as any).twitterUrl }); setShowEdit(true); } }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={()=> setShowDeleteContact(true)} className="text-red-700 focus:text-red-800">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={detailTab} onValueChange={(v)=> setDetailTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </div>
                          <div className="mt-1 text-primary">{selected?.email ?? '—'}</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>Phone</span>
                          </div>
                          <div className="mt-1">{selected?.phone ?? '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div className="mt-1">{selected?.company ?? '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">Position</div>
                          <div className="mt-1">{selected?.title ?? '—'}</div>
                        </div>

                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Social Profiles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(selected as any)?.linkedinUrl && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-5 w-5 text-[#0077B5]" />
                            <a href={norm((selected as any).linkedinUrl)} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">LinkedIn</a>
                          </div>
                        )}
                        {(selected as any)?.facebookUrl && (
                          <div className="flex items-center gap-2">
                            <Facebook className="h-5 w-5 text-[#1877F2]" />
                            <a href={norm((selected as any).facebookUrl)} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">Facebook</a>
                          </div>
                        )}
                        {(selected as any)?.instagramUrl && (
                          <div className="flex items-center gap-2">
                            <Instagram className="h-5 w-5 text-[#C13584]" />
                            <a href={norm((selected as any).instagramUrl)} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">Instagram</a>
                          </div>
                        )}
                        {(selected as any)?.twitterUrl && (
                          <div className="flex items-center gap-2">
                            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                            <a href={norm((selected as any).twitterUrl)} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">Twitter</a>
                          </div>
                        )}
                        {(selected as any)?.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <a href={norm((selected as any).websiteUrl)} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">Website</a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4 pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Array.isArray(selectedActivities) && selectedActivities.length > 0 ? (
                        (selectedActivities as any[]).map((a) => (
                          <div key={a._id} className="rounded border p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="font-medium capitalize">{a.type}</div>
                              <div className="text-muted-foreground">{new Date(a.updatedAt ?? a.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="mt-1">{a.title}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No activities.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deals" className="space-y-4 pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Deals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Array.isArray(selectedDeals) && selectedDeals.length > 0 ? (
                        (selectedDeals as any[]).map((d) => (
                          <div key={d._id} className="flex items-center justify-between rounded border p-3 text-sm">
                            <div>
                              <div className="font-medium">{d.title}</div>
                              <div className="text-xs text-muted-foreground">{d.stage} • ${Math.round(d.amount || 0).toLocaleString()} • {Math.round(d.probability || 0)}%</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No deals.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 pt-6">
                  <ContactNotesSection contactId={selectedId} />
                </TabsContent>

                <TabsContent value="files" className="space-y-4 pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FilesPanel entityType="contact" entityId={selectedId || ''} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactNotesSection({ contactId }: { contactId?: string }) {
  const [text, setText] = useState('');
  const { data, refetch } = useContactNotes(contactId);
  const add = useMutation({
    mutationFn: async () => {
      const res = await post<any>(`/contacts/${contactId}/notes`, { text });
      return res?.data;
    },
    onSuccess: () => { setText(''); refetch(); },
  });
  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-primary/50 bg-primary/5">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Add Note</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <textarea className="w-full min-h-[80px] rounded-md border p-2 text-sm" value={text} onChange={(e)=> setText(e.target.value)} placeholder="Write a quick note..." />
          <div className="mt-2 flex justify-end">
            <Button onClick={()=> add.mutate()} size="sm" disabled={!contactId || !text.trim() || add.isPending}>Add Note</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(data ?? []).map((n: any) => (
          <NoteItem key={n._id} contactId={contactId!} note={n} onChanged={refetch} />
        ))}
        {(data ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">No notes yet.</div>
        )}
      </div>
    </div>
  );
}

function NoteItem({ contactId, note, onChanged }: { contactId: string; note: any; onChanged: () => void }) {
  const [value, setValue] = useState(note.text as string);
  const save = useMutation({
    mutationFn: async () => {
      const res = await patch<any>(`/contacts/${contactId}/notes/${note._id}`, { text: value });
      return res?.data;
    },
    onSuccess: onChanged,
  });
  const delMut = useMutation({
    mutationFn: async () => {
      const res = await apiDel<any>(`/contacts/${contactId}/notes/${note._id}`);
      return res;
    },
    onSuccess: onChanged,
  });
  return (
    <Card className="border-l-4 border-l-secondary/60 bg-muted/30">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">{(() => {
                const name = (note.authorId?.fullName || '') as string;
                return (name || 'NA').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
              })()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm">{note.authorId?.fullName || 'User'}</CardTitle>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {new Date(note.updatedAt || note.createdAt).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <textarea className="w-full min-h-[72px] rounded-md border p-2 text-sm" value={value} onChange={(e)=> setValue(e.target.value)} />
        <div className="mt-2 flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:text-red-800">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800" onClick={()=> delMut.mutate()} disabled={delMut.isPending}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" onClick={()=> save.mutate()} disabled={save.isPending}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
