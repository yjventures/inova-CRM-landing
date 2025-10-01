import { Plus, Upload, Filter, Mail, Phone, Edit, MoreVertical, Search, Linkedin, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const contacts = [
  { name: "Sarah Johnson", company: "Acme Corporation", status: "active", lastContact: "over 2 years ago", initials: "SJ" },
  { name: "Michael Chen", company: "Globex Industries", status: "active", lastContact: "over 2 years ago", initials: "MC" },
  { name: "Jessica Martinez", company: "Soylent Corp", status: "active", lastContact: "over 2 years ago", initials: "JM" },
  { name: "Robert Williams", company: "Initech", status: "inactive", lastContact: "over 2 years ago", initials: "RW" },
  { name: "Emily Taylor", company: "Umbrella Corporation", status: "active", lastContact: "over 2 years ago", initials: "ET" },
  { name: "David Kim", company: "Wayne Enterprises", status: "active", lastContact: "over 2 years ago", initials: "DK" },
  { name: "Amanda Garcia", company: "Stark Industries", status: "active", lastContact: "over 2 years ago", initials: "AG" },
];

export default function Contacts() {
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
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Checkbox />
              <span className="text-sm text-muted-foreground">8 contacts</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Contacts</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <Checkbox />
                  <Avatar>
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contact.name}</span>
                      {contact.status === "active" && (
                        <div className="h-2 w-2 rounded-full bg-success" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contact.company}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contact.lastContact}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
                    <h2 className="text-2xl font-bold">Sarah Johnson</h2>
                    <p className="text-muted-foreground">
                      Chief Technology Officer • Acme Corporation
                    </p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="secondary">enterprise</Badge>
                      <Badge variant="secondary">tech</Badge>
                      <Badge variant="secondary">decision-maker</Badge>
                    </div>
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
                          <div className="mt-1 text-primary">
                            sarah.johnson@acmecorp.com
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>Phone</span>
                          </div>
                          <div className="mt-1">+1 (555) 123-4567</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div className="mt-1">Acme Corporation</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">Position</div>
                          <div className="mt-1">Chief Technology Officer</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">
                            Last Contacted
                          </div>
                          <div className="mt-1">Jun 15, 2023</div>
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
