import { useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TrendingUp, Target, Briefcase, Trophy, Plus, Calendar, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useDealsPipeline, useDealMove, useDashboardKpis, useUpcomingTasks, usePipelineSummary } from "@/lib/hooks/dashboard";
import { health } from "@/lib/api";

type Deal = { _id: string; title: string; amount: number; probability: number; stage: string; ownerId?: any; contactId?: any; owner?: string; contact?: string; company?: string; daysInStage?: number; lastStageUpdate?: string };
type Stage = { name: string; deals: Deal[] };

const stageColorMap: Record<string, string> = {
  Lead: "border-l-gray-400",
  Qualified: "border-l-blue-500",
  Proposal: "border-l-yellow-500",
  Negotiation: "border-l-orange-500",
  "Closed Won": "border-l-green-500",
};

const quickActions = [
  { name: "Add New Deal", subtitle: "Create a new sales opportunity", icon: Plus, color: "bg-primary hover:bg-primary/90", href: "/deals" },
  { name: "Add Contact", subtitle: "Add a new customer contact", icon: Plus, color: "bg-success hover:bg-success/90", href: "/contacts" },
  { name: "Schedule Meeting", subtitle: "Book a call or demo", icon: Calendar, color: "bg-warning hover:bg-warning/90", href: "/activity" },
  { name: "Send Email", subtitle: "Compose and send email", icon: Mail, color: "bg-[hsl(var(--info))] hover:bg-[hsl(var(--info))]/90", href: "/activity" },
];

const quickNav = [
  { name: "Deal Management", href: "/deals" },
  { name: "Contact Management", href: "/contacts" },
  { name: "Pipeline Analytics", href: "/analytics" },
  { name: "Activity Timeline", href: "/activity" },
];

function computeTotals(stage: Stage) {
  const total = stage.deals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const weighted = stage.deals.reduce((sum, d) => sum + (d.amount || 0) * ((d.probability || 0) / 100), 0);
  return { totalDisplay: `$${Math.round(total / 1000)}K`, weightedDisplay: `$${Math.round(weighted / 1000)}K` };
}

export default function Dashboard() {
  const { data: pipeline = [], isLoading: loadingPipeline, isError: errorPipeline, refetch: refetchPipeline } = useDealsPipeline();
  const { data: kpis, isLoading: loadingKpis, isError: errorKpis, refetch: refetchKpis } = useDashboardKpis();
  const { data: upcoming = [], isLoading: loadingUpcoming, isError: errorUpcoming, refetch: refetchUpcoming } = useUpcomingTasks(5);
  const { data: pipelineSummary } = usePipelineSummary();
  const moveMutation = useDealMove();

  const stages = pipeline as Stage[];

  useEffect(() => {
    health().then((res)=>{
      // Temporary debug once
      // eslint-disable-next-line no-console
      console.log('[api/health]', res);
    }).catch((err)=>{
      // eslint-disable-next-line no-console
      console.log('[api/health] failed', err);
    });
  }, []);

  function formatCurrencyCompact(value?: number) {
    const n = Number(value || 0);
    if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${Math.round(n)}`;
  }

  function formatPercent(value?: number) {
    const v = Number(value || 0);
    return `${Math.round(v)}%`;
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const sourceIndex = parseInt(source.droppableId, 10);
    const destIndex = parseInt(destination.droppableId, 10);
    const deal = stages[sourceIndex]?.deals[source.index];
    const targetStage = stages[destIndex]?.name;
    if (deal && targetStage) {
      moveMutation.mutate({ id: (deal as any)._id, stage: targetStage });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: 11:59:08 AM • Auto-refresh every 5 minutes
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-prob">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-prob">All Probabilities</SelectItem>
              <SelectItem value="high">High Probability</SelectItem>
              <SelectItem value="medium">Medium Probability</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-terr">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-terr">All Territories</SelectItem>
              <SelectItem value="north">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pipeline
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrencyCompact(kpis?.pipelineValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weighted Pipeline
            </CardTitle>
            <Target className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrencyCompact(pipelineSummary?.totals?.weightedValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deals
            </CardTitle>
            <Briefcase className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pipelineSummary?.totals?.count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quota Achievement
            </CardTitle>
            <Trophy className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPercent(kpis?.quotaAchievement)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Original Pipeline Section - moved up */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Pipeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Pipeline</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Drag deals to update stages
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                  {stages.map((stage, stageIndex) => {
                    const totals = computeTotals(stage);
                    return (
                      <Droppable droppableId={String(stageIndex)} key={stage.name}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{stage.name}</span>
                                <Badge variant="secondary">{stage.deals.length}</Badge>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-semibold">{totals.totalDisplay}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Weighted:</span>
                                <span className="font-semibold">{totals.weightedDisplay}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {stage.deals.map((deal, idx) => (
                                <Draggable draggableId={deal._id} index={idx} key={deal._id}>
                                  {(dragProvided, snapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                    >
                                      <Card className={`border-l-4 ${stageColorMap[stage.name] ?? 'border-l-muted'} ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}`}>
                                        <CardContent className="p-4">
                                          <div className="mb-2 font-medium">{(deal.title || '').length > 20 ? (deal.title || '').slice(0, 20) + '…' : (deal.title || '')}</div>
                                          <div className="mb-3 flex items-center justify-between">
                                            <span className="text-lg font-bold">${Math.round((deal.amount || 0) / 1000)}K</span>
                                            <Badge variant="outline">{Math.round(deal.probability || 0)}%</Badge>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                                                {(deal.owner || 'NA').split(' ').map((s: string)=>s[0]).filter(Boolean).slice(0,2).join('') || 'NA'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span>{((deal.contact || '—') as string).length > 15 ? ((deal.contact || '—') as string).slice(0, 15) + '…' : (deal.contact || '—')}</span>
                                          </div>
                                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{deal.daysInStage != null ? `${deal.daysInStage} days in stage` : '—'}</span>
                                            <span>{deal.lastStageUpdate ? 'Updated ' + new Intl.RelativeTimeFormat(undefined,{numeric:'auto'}).format(-Math.max(1, Math.floor((Date.now() - new Date(deal.lastStageUpdate).getTime())/ (1000*60*60))), 'hour') : ''}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.name} to={action.href}>
                  <Button
                    className={`h-auto w-full flex-col gap-2 p-4 text-white ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                    <div className="text-center">
                      <div className="text-xs font-semibold">{action.name}</div>
                      <div className="text-[10px] opacity-90">{action.subtitle}</div>
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickNav.map((item) => (
                <Link key={item.name} to={item.href}>
                  <Button variant="ghost" className="w-full justify-start">
                    {item.name}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80">
                <div className="flex h-full items-end justify-around gap-2 border-b border-l pb-16 pl-12 pr-4">
                  {[
                    { month: "Jan", actual: 450, forecast: 420 },
                    { month: "Feb", actual: 520, forecast: 480 },
                    { month: "Mar", actual: 580, forecast: 560 },
                    { month: "Apr", actual: 640, forecast: 600 },
                    { month: "May", actual: 700, forecast: 660 },
                    { month: "Jun", actual: 780, forecast: 720 },
                  ].map((data) => (
                    <div key={data.month} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full gap-1">
                        <div
                          className="flex-1 rounded-t bg-primary"
                          style={{ height: `${(data.actual / 8) * 100}%` }}
                        />
                        <div
                          className="flex-1 rounded-t bg-success"
                          style={{ height: `${(data.forecast / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 mb-16 flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <span>Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-success" />
                    <span>Forecast</span>
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 flex w-12 flex-col items-end justify-between pr-2 text-xs text-muted-foreground tabular-nums text-right">
                  <span>$800K</span>
                  <span>$600K</span>
                  <span>$400K</span>
                  <span>$200K</span>
                  <span>$0K</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Quota Achievement */}
                <div className="flex flex-col">
                  <h3 className="mb-4 font-semibold">Quota Achievement</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32 shrink-0">
                      <svg className="h-32 w-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="16"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--success))"
                          strokeWidth="16"
                          strokeDasharray={`${2 * Math.PI * 56 * Math.min(1, Math.max(0, (Number(kpis?.quotaAchievement || 0) / 100))) } ${2 * Math.PI * 56}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-success">
                        {formatPercent(kpis?.quotaAchievement)}
                      </div>
                    </div>
                    <div className="space-y-2 leading-tight">
                      <div>
                        <div className="text-sm text-muted-foreground">Quota</div>
                        <div className="text-xl font-bold">{formatCurrencyCompact(kpis?.quotaTarget)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Achieved</div>
                        <div className="text-xl font-bold text-success">{formatCurrencyCompact(kpis?.wonValue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Remaining</div>
                        <div className="text-xl font-bold">{formatCurrencyCompact(Math.max(0, Number(kpis?.quotaTarget || 0) - Number(kpis?.wonValue || 0)))}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deal Outcomes */}
                <div className="flex flex-col">
                  <h3 className="mb-4 font-semibold">Deal Outcomes</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32 shrink-0">
                      <svg className="h-32 w-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--success))"
                          strokeWidth="16"
                          strokeDasharray={`${2 * Math.PI * 56 * Math.min(1, Math.max(0, (Number(kpis?.winRate || 0) / 100))) } ${2 * Math.PI * 56}`}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--destructive))"
                          strokeWidth="16"
                          strokeDasharray={`${2 * Math.PI * 56 * Math.min(1, Math.max(0, (1 - Number(kpis?.winRate || 0) / 100))) } ${2 * Math.PI * 56}`}
                          strokeDashoffset={`${-2 * Math.PI * 56 * Math.min(1, Math.max(0, (Number(kpis?.winRate || 0) / 100))) }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-success">{formatPercent(kpis?.winRate)}</div>
                        <div className="mt-1 text-xs font-bold text-destructive">{formatPercent(100 - Number(kpis?.winRate || 0))}</div>
                      </div>
                    </div>
                    <div className="space-y-2 leading-tight">
                      <div>
                        <div className="text-sm text-muted-foreground">Deals Won</div>
                        <div className="text-xl font-bold text-success">{kpis?.wonDeals ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Deals Lost</div>
                        <div className="text-xl font-bold text-destructive">{kpis?.lostDeals ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="text-xl font-bold">{formatPercent(kpis?.winRate)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center rounded-lg bg-primary/10 p-5">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    $
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Deal Size</div>
                  <div className="text-2xl font-bold">{formatCurrencyCompact(kpis?.avgDealSize)}</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-success/10 p-5">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-bold">{formatPercent(kpis?.winRate)}</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-warning/10 p-5">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Sales Cycle</div>
                  <div className="text-2xl font-bold">{(kpis?.avgSalesCycleDays ?? 0)} days</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-info/10 p-5">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-info/20 text-info">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                  <div className="text-2xl font-bold">{kpis?.totalActivities ?? 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                <div className="flex h-full items-end justify-around gap-2 border-b border-l pb-20 pl-12">
                  {[
                    { month: "Jan", actual: 400, target: 450 },
                    { month: "Feb", actual: 480, target: 500 },
                    { month: "Mar", actual: 560, target: 520 },
                    { month: "Apr", actual: 600, target: 550 },
                    { month: "May", actual: 650, target: 600 },
                    { month: "Jun", actual: 580, target: 650 },
                  ].map((data) => (
                    <div key={data.month} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full justify-center gap-2">
                        <div
                          className="w-12 rounded-t bg-primary"
                          style={{ height: `${(data.actual / 8) * 100}%` }}
                        />
                        <div
                          className="w-12 rounded-t bg-muted"
                          style={{ height: `${(data.target / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute left-0 top-0 bottom-0 flex w-12 flex-col items-end justify-between pr-2 text-xs text-muted-foreground tabular-nums text-right">
                  <span>$800K</span>
                  <span>$600K</span>
                  <span>$400K</span>
                  <span>$200K</span>
                  <span>$0K</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Tasks</CardTitle>
                <Link to="/activity">
                  <Button size="sm" className="ml-auto">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingUpcoming && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
              {errorUpcoming && (
                <div className="text-sm text-destructive">Failed to load tasks.</div>
              )}
              {!loadingUpcoming && !errorUpcoming && upcoming.length === 0 && (
                <div className="text-sm text-muted-foreground">No upcoming tasks.</div>
              )}
              {!loadingUpcoming && !errorUpcoming && upcoming.map((a: any) => {
                const owner = typeof a.ownerId === 'object' ? a.ownerId : undefined;
                const contact = typeof a.contactId === 'object' ? a.contactId : undefined;
                const displayName = contact?.fullName || owner?.fullName || '—';
                const initials = (displayName || 'NA')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s: string) => s[0]?.toUpperCase())
                  .join('') || 'NA';
                const due = (() => {
                  if (!a.dueAt) return '—';
                  const t = new Date(a.dueAt).getTime();
                  const now = Date.now();
                  const diffSec = Math.max(0, Math.floor((t - now) / 1000));
                  const mins = Math.floor(diffSec / 60);
                  if (mins < 60) return `${mins}m`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h`;
                  const days = Math.floor(hrs / 24);
                  return `${days}d`;
                })();
                const priority = (a.priority || 'medium') as 'low'|'medium'|'high';
                return (
                  <Card key={a._id} className="border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start gap-2">
                        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
                        <div className="flex-1">
                          <div className="font-medium">{a.title}</div>
                          <p className="text-xs text-muted-foreground">{a.notes || ''}</p>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{displayName}</span>
                      </div>
                      <div className="ml-6 mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Due in {due}</span>
                        <Badge
                          variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'secondary' : 'outline'}
                          className={priority === 'high' ? '' : priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'border-green-500 text-green-600'}
                        >
                          {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Link to="/activity">
                <Button className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      
    </div>
  );
}
