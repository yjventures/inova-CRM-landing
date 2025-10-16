import { Plus, Upload, Filter, Mail, Phone, Edit, MoreVertical, Search, Linkedin, Twitter, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { useContact, useContactActivities, useContactDeals, useContacts, ContactsListResponse } from "@/lib/hooks/contacts";
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
  const queryParams = useMemo(() => ({ q: debouncedQ || undefined, status: status === 'all' ? undefined : status, page, limit }), [debouncedQ, status, page, limit]);
  const { data, isLoading, isError, refetch } = useContacts(queryParams);
  const typed = data as ContactsListResponse | undefined;
  const items = (typed?.data ?? []) as ContactItem[];
  const meta = typed?.meta ?? { page: 1, pages: 1, total: 0, limit };
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data: selected } = useContact(selectedId);
  const { data: selectedDeals } = useContactDeals(selectedId);
  const { data: selectedActivities } = useContactActivities(selectedId);
  const filesQuery = useEntityFiles({ entityType: 'contact', entityId: selectedId || '' });
  const uploadMutation = useUploadFiles();
  const deleteMutation = useDeleteFile();
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Checkbox />
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
                  <Checkbox />
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
                      {contact.email || contact.company}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
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
                      SJ
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
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="deals">Deals (2)</TabsTrigger>
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

                        <div>
                          <div className="text-sm text-muted-foreground">
                            Last Contacted
                          </div>
                          <div className="mt-1">{selected?.lastContactedAt ? new Date(selected.lastContactedAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Social Profiles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-5 w-5 text-[#0077B5]" />
                          <a
                            href="#"
                            className="text-primary hover:underline"
                          >
                            LinkedIn
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                          <a
                            href="#"
                            className="text-primary hover:underline"
                          >
                            Twitter
                          </a>
                        </div>

                        <Separator className="my-4" />

                        <div>
                          <CardTitle className="mb-3 text-base">
                            Additional Information
                          </CardTitle>

                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Preferred Contact Method
                              </div>
                              <div className="mt-1">email</div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">
                                Decision Timeframe
                              </div>
                              <div className="mt-1">Q3 2023</div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">
                                Budget Range
                              </div>
                              <div className="mt-1">$100K-$250K</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
