import { TrendingUp, TrendingDown, Download, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Pipeline Analytics</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold">Pipeline Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive sales performance insights and forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select defaultValue="30days">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Territory</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Territories</SelectItem>
                  <SelectItem value="north">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sales Rep</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Representatives</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="michael">Michael Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="mt-4 w-full">Apply Filters</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Deal Size
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$45,250</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Cycle
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42 days</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>-8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28.4%</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+3.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Velocity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1.2M/month</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+15.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Lead</span>
                  <span className="text-muted-foreground">$73K • 2 deals</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Qualified</span>
                  <span className="text-muted-foreground">$195K • 2 deals</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Proposal</span>
                  <span className="text-muted-foreground">$250K • 1 deal</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: "65%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Negotiation</span>
                  <span className="text-muted-foreground">$180K • 1 deal</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-green-500" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Closed Won</span>
                  <span className="text-muted-foreground">$35K • 1 deal</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-sm">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-dashed border-primary" />
                  <span className="text-sm">Forecast</span>
                </div>
              </div>

              <div className="relative h-64 border-l border-b">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 -translate-x-full pr-2 text-xs text-muted-foreground">
                  $220k
                </div>
                <div className="absolute left-0 top-1/4 -translate-x-full pr-2 text-xs text-muted-foreground">
                  $165k
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-full pr-2 text-xs text-muted-foreground">
                  $110k
                </div>
                <div className="absolute left-0 bottom-0 -translate-x-full pr-2 text-xs text-muted-foreground">
                  $55k
                </div>

                {/* Simple line chart visualization */}
                <svg className="h-full w-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="4 4" />

                  {/* Actual line */}
                  <polyline
                    points="0,170 50,160 100,145 150,135 200,125 250,115 300,105 350,95 400,85"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                  />
                  
                  {/* Target line */}
                  <polyline
                    points="0,175 50,165 100,150 150,140 200,130 250,118 300,108 350,98 400,88"
                    fill="none"
                    stroke="hsl(var(--success))"
                    strokeWidth="2"
                  />

                  {/* Forecast line */}
                  <polyline
                    points="300,105 350,93 400,82"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />

                  {/* Data points */}
                  <circle cx="0" cy="170" r="4" fill="hsl(var(--primary))" />
                  <circle cx="100" cy="145" r="4" fill="hsl(var(--primary))" />
                  <circle cx="200" cy="125" r="4" fill="hsl(var(--primary))" />
                  <circle cx="300" cy="105" r="4" fill="hsl(var(--primary))" />
                  <circle cx="400" cy="85" r="4" fill="hsl(var(--primary))" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
