import { TrendingUp, Target, Briefcase, Trophy, Plus, Calendar, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const pipelineStages = [
  {
    name: "Lead",
    count: 2,
    total: "$73K",
    weighted: "$16K",
    color: "border-l-gray-400",
    deals: [
      { name: "Acme Corp - Enterprise...", value: "$45K", probability: "20%", owner: "John Smith", ownerInitials: "JS", daysInStage: "5 days in stage", timeAgo: "2 hours ago" },
      { name: "TechStart - SaaS Platform", value: "$28K", probability: "25%", owner: "Sarah Joh...", ownerInitials: "SJ", daysInStage: "3 days in stage", timeAgo: "1 day ago" },
    ],
  },
  {
    name: "Qualified",
    count: 2,
    total: "$195K",
    weighted: "$84K",
    color: "border-l-blue-500",
    deals: [
      { name: "Global Systems -...", value: "$75K", probability: "40%", owner: "Michael Ch...", ownerInitials: "MC", daysInStage: "12 days in stage", timeAgo: "3 hours ago" },
      { name: "InnovateCo - Digital...", value: "$120K", probability: "45%", owner: "Emily Rodri...", ownerInitials: "ER", daysInStage: "8 days in stage", timeAgo: "5 hours ago" },
    ],
  },
  {
    name: "Proposal",
    count: 1,
    total: "$250K",
    weighted: "$175K",
    color: "border-l-yellow-500",
    deals: [
      { name: "MegaCorp - Enterprise...", value: "$250K", probability: "70%", owner: "David Wilson", ownerInitials: "DW", daysInStage: "15 days in stage", timeAgo: "1 hour ago" },
    ],
  },
  {
    name: "Negotiation",
    count: 1,
    total: "$180K",
    weighted: "$153K",
    color: "border-l-orange-500",
    deals: [
      { name: "FutureTech - Cloud...", value: "$180K", probability: "85%", owner: "Lisa Thom...", ownerInitials: "LT", daysInStage: "7 days in stage", timeAgo: "30 minutes ago" },
    ],
  },
  {
    name: "Closed Won",
    count: 1,
    total: "$35K",
    weighted: "$35K",
    color: "border-l-green-500",
    deals: [
      { name: "StartupXYZ - Growth...", value: "$35K", probability: "100%", owner: "Alex Marti...", ownerInitials: "AM", daysInStage: "2 days in stage", timeAgo: "Just closed" },
    ],
  },
];

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

export default function Dashboard() {
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
            <div className="text-3xl font-bold">$0.7M</div>
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
            <div className="text-3xl font-bold">$0.5M</div>
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
            <div className="text-3xl font-bold">7</div>
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
            <div className="text-3xl font-bold">74%</div>
          </CardContent>
        </Card>
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
                <div className="flex h-full items-end justify-around gap-2 border-b border-l pb-0 pl-12 pr-4">
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
                <div className="mt-4 mb-4 flex items-center justify-center gap-4 text-sm">
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
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                {/* Quota Achievement */}
                <div>
                  <h3 className="mb-4 font-semibold">Quota Achievement</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32">
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
                          strokeDasharray={`${2 * Math.PI * 56 * 0.74} ${2 * Math.PI * 56}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-success">
                        74%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Quota</div>
                        <div className="text-xl font-bold">$2.5M</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Achieved</div>
                        <div className="text-xl font-bold text-success">$1.9M</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Remaining</div>
                        <div className="text-xl font-bold">$0.7M</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deal Outcomes */}
                <div>
                  <h3 className="mb-4 font-semibold">Deal Outcomes</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32">
                      <svg className="h-32 w-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--success))"
                          strokeWidth="16"
                          strokeDasharray={`${2 * Math.PI * 56 * 0.74} ${2 * Math.PI * 56}`}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--destructive))"
                          strokeWidth="16"
                          strokeDasharray={`${2 * Math.PI * 56 * 0.26} ${2 * Math.PI * 56}`}
                          strokeDashoffset={`${-2 * Math.PI * 56 * 0.74}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-success">
                        74%
                      </div>
                      <div className="absolute bottom-6 right-4 text-sm font-bold text-destructive">
                        26%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Deals Won</div>
                        <div className="text-xl font-bold text-success">23</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Deals Lost</div>
                        <div className="text-xl font-bold text-destructive">8</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="text-xl font-bold">74.2%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <div className="flex flex-col items-center rounded-lg bg-primary/10 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    $
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Deal Size</div>
                  <div className="text-2xl font-bold">$85K</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-success/10 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-bold">28.5%</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-warning/10 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Sales Cycle</div>
                  <div className="text-2xl font-bold">45 days</div>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-info/10 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-info/20 text-info">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                  <div className="text-2xl font-bold">127</div>
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
                <div className="flex h-full items-end justify-around gap-2 border-b border-l pb-0 pl-12">
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
                <div className="text-right">
                  <div className="text-sm font-semibold">5</div>
                  <div className="text-xs text-muted-foreground">pending</div>
                </div>
                <Button variant="link" size="sm" className="text-primary">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Follow up with Acme Corp",
                  description: "Send pricing proposal and schedule demo",
                  assignee: "John Smith",
                  company: "Acme Corporation",
                  due: "2h",
                  priority: "high",
                  initials: "JS",
                },
                {
                  title: "Demo call with FutureTech",
                  description: "Product demonstration and Q&A session",
                  assignee: "Lisa Thompson",
                  company: "FutureTech Solutions",
                  due: "4h",
                  priority: "high",
                  initials: "LT",
                },
                {
                  title: "Send contract to MegaCorp",
                  description: "Final contract review and signature",
                  assignee: "David Wilson",
                  company: "MegaCorp Industries",
                  due: "1d",
                  priority: "medium",
                  initials: "DW",
                },
                {
                  title: "Quarterly review with Global Systems",
                  description: "Review implementation progress and next steps",
                  assignee: "Michael Chen",
                  company: "Global Systems Ltd",
                  due: "2d",
                  priority: "medium",
                  initials: "MC",
                },
                {
                  title: "Update CRM for TechStart deal",
                  description: "Add meeting notes and next action items",
                  assignee: "Sarah Johnson",
                  company: "TechStart Inc",
                  due: "3d",
                  priority: "low",
                  initials: "SJ",
                },
              ].map((task, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                          {task.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee} • {task.company}
                      </span>
                    </div>
                    <div className="ml-6 mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Due in {task.due}</span>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          task.priority === "medium"
                            ? "bg-warning text-warning-foreground"
                            : task.priority === "low"
                            ? "border-success text-success"
                            : ""
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Original Pipeline Section */}
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
              <div className="flex gap-3 overflow-x-auto pb-4">
                {pipelineStages.map((stage) => (
                  <div
                    key={stage.name}
                    className="min-w-[280px] space-y-3"
                  >
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.name}</span>
                        <Badge variant="secondary">{stage.count}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold">{stage.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weighted:</span>
                        <span className="font-semibold">{stage.weighted}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {stage.deals.map((deal, idx) => (
                        <Card key={idx} className={`border-l-4 ${stage.color} cursor-pointer transition-shadow hover:shadow-md`}>
                          <CardContent className="p-4">
                            <div className="mb-2 font-medium">{deal.name}</div>
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-lg font-bold">{deal.value}</span>
                              <Badge variant="outline">{deal.probability}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                                  {deal.ownerInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{deal.owner}</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {deal.daysInStage} • {deal.timeAgo}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
