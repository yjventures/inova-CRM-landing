import { Save, Plus, Copy, Trash2, Mail, Phone, Upload, Download } from "lucide-react";
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
import { useCreateDeal, useDeal, useDeals, useDeleteDeal, useUpdateDeal } from "@/lib/hooks/deals";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import { useEntityFiles, useUploadFiles, useDeleteFile } from "@/lib/hooks/files";
import FilesPanel from "@/components/files/FilesPanel";

const activities = [
  {
    title: "Sent proposal document",
    description: "Forwarded the comprehensive proposal including pricing breakdown and implementation timeline",
    type: "Email",
    author: "John Smith",
    date: "Jan 28, 8:30 PM",
  },
  {
    title: "Discovery call with CTO",
    description: "45-minute call discussing technical requirements, integration needs, and security compliance",
    type: "Call",
    author: "John Smith",
    date: "Jan 26, 4:00 PM",
  },
  {
    title: "Product demo session",
    description: "Conducted live demonstration of key features, Q&A session with stakeholders",
    type: "Meeting",
    author: "John Smith",
    date: "Jan 24, 9:00 PM",
  },
];

export default function Deals() {
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = useDeals({ q });
  const list = (data?.data ?? []) as Array<{ _id: string; title: string; amount: number; stage: string; probability: number }>;
  const meta = data?.meta;
  const [form, setForm] = useState<{ id?: string; title: string; amount: number; stage: string; probability: number; closeDate?: string; source?: string; industry?: string; notes?: string }>({ title: '', amount: 0, stage: 'Lead', probability: 50 });
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();
  const deleteMutation = useDeleteDeal();
  const filesQuery = useEntityFiles({ entityType:'deal', entityId: form.id || '' });
  const uploadMutation = useUploadFiles();
  const deleteFileMutation = useDeleteFile();
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
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
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Deal
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
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
                <Input id="deal-value" type="number" value={form.amount} onChange={(e)=>setForm(f=>({...f,amount: Number(e.target.value||0)}))} />
                <p className="text-sm text-muted-foreground">${Math.round((form.amount||0)).toLocaleString()}</p>
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
                <Select defaultValue="michael">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="michael">
                      Michael Chen - Chief Technology Officer at TechCorp Solutions
                    </SelectItem>
                    <SelectItem value="sarah">Sarah Johnson - VP of Sales</SelectItem>
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
                  <Select defaultValue="website">
                    <SelectTrigger id="lead-source">
                      <SelectValue />
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
                  <Select defaultValue="technology">
                    <SelectTrigger id="industry">
                      <SelectValue />
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
                <Input
                  id="decision-makers"
                  defaultValue="CTO, IT Director, Procurement Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitor-analysis">Competitor Analysis</Label>
                <Textarea
                  id="competitor-analysis"
                  rows={3}
                  defaultValue="Competing against Salesforce and HubSpot"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={()=>setForm({ title:'', amount:0, stage:'Lead', probability:50 })}>Reset</Button>
                <Button onClick={()=>{
                  if (form.id) updateMutation.mutate({ id: form.id, body: form }); else createMutation.mutate(form);
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      MC
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">Michael Chen</div>
                    <div className="text-sm text-muted-foreground">
                      Chief Technology Officer
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-primary">
                      <Mail className="h-3 w-3" />
                      <span>michael.chen@techcorp.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 rounded-full p-1.5 ${
                            activity.type === "Email"
                              ? "bg-primary/10 text-primary"
                              : activity.type === "Call"
                              ? "bg-success/10 text-success"
                              : "bg-info/10 text-info"
                          }`}
                        >
                          {activity.type === "Email" ? (
                            <Mail className="h-3 w-3" />
                          ) : activity.type === "Call" ? (
                            <Phone className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="font-medium">{activity.title}</div>
                            <span className="text-xs text-muted-foreground">
                              {activity.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            by {activity.author}
                          </span>
                        </div>
                      </div>
                      {idx < activities.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Log Call
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2">
                <Input placeholder="Search deals..." value={q} onChange={(e)=>{}}
                />
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
                        <Button variant="destructive" size="sm" onClick={()=>deleteMutation.mutate(d._id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    </div>
  );
}
