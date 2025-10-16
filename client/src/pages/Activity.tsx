import { Plus, Download, Search, Mail, Phone, Calendar, FileText, CheckSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const activities = [
  {
    type: "email",
    title: "Follow-up Email Sent",
    priority: "high",
    value: "$45,000",
    from: "Sarah Johnson",
    to: "Michael Rodriguez",
    company: "TechCorp Solutions",
    description: "Hi Sarah, Thank you for taking the time to discuss your company's CRM needs yesterday. I wanted to follow up on our conversation about implementing S...",
    channel: "Gmail",
    time: "2h ago",
    avatars: ["SJ", "MR"],
  },
  {
    type: "call",
    title: "Discovery Call Completed",
    priority: "medium",
    value: "$42,000",
    from: "David Chen",
    to: "Jennifer Walsh",
    company: "InnovateTech",
    description: "Conducted comprehensive discovery call with David Chen from InnovateTech. Key discussion points: • Current CRM pain points: Manual data entry, lack o...",
    channel: "Twilio",
    duration: "45 minutes",
    time: "4h ago",
    avatars: ["DC", "JW"],
  },
];

export default function Activity() {
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Timeline
          </Button>
          <Button>
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
              <RadioGroup defaultValue="all">
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
                  <RadioGroupItem value="deals" id="deals" />
                  <Label htmlFor="deals" className="flex items-center gap-2 font-normal">
                    <FileText className="h-4 w-4" />
                    Deal Updates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tasks" id="tasks" />
                  <Label htmlFor="tasks" className="flex items-center gap-2 font-normal">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="font-medium">Date Range</div>
              <RadioGroup defaultValue="all-time">
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
              <div className="font-medium">Communication Channel</div>
              <RadioGroup defaultValue="all-channels">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-channels" id="all-channels" />
                  <Label htmlFor="all-channels" className="font-normal">All Channels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gmail" id="gmail" />
                  <Label htmlFor="gmail" className="font-normal">Gmail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone" className="font-normal">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calendar" id="calendar" />
                  <Label htmlFor="calendar" className="font-normal">Calendar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="font-normal">System</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

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
            Showing 6 of 6 activities
          </div>

          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div
                      className={`flex w-16 flex-col items-center justify-center ${
                        activity.type === "email"
                          ? "bg-primary/10"
                          : "bg-success/10"
                      }`}
                    >
                      {activity.type === "email" ? (
                        <Mail className="h-8 w-8 text-primary" />
                      ) : (
                        <Phone className="h-8 w-8 text-success" />
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {activity.title}
                            </h3>
                            <Badge
                              variant={
                                activity.priority === "high"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {activity.priority}
                            </Badge>
                            <Badge variant="outline" className="text-success">
                              {activity.value}
                            </Badge>
                          </div>

                          <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {activity.channel}
                            </span>
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
    </div>
  );
}
