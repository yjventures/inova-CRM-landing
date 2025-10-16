import { Users, Lock, Link as LinkIcon, FileText, Mail, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsers } from "@/lib/hooks/users";

const settingsCategories = [
  {
    icon: Users,
    title: "User Management",
    description: "Manage users, roles and status",
    active: true,
  },
  {
    icon: Lock,
    title: "Permissions",
    description: "Role-based access control",
    active: false,
  },
  {
    icon: LinkIcon,
    title: "Integrations",
    description: "API connections and services",
    active: false,
  },
  {
    icon: FileText,
    title: "Custom Fields",
    description: "Field creation and configuration",
    active: false,
  },
  {
    icon: Mail,
    title: "Email Templates",
    description: "Template editor and management",
    active: false,
  },
  {
    icon: SettingsIcon,
    title: "System Configuration",
    description: "General system settings",
    active: false,
  },
];

export default function Settings() {
  const { data: users, isLoading, isError, refetch } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>Settings & Administration</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold">Settings & Administration</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Settings Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settingsCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Button
                  key={idx}
                  variant={category.active ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{category.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage users, roles, and permissions
                  </p>
                </div>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left">
                        <Checkbox />
                      </th>
                      <th className="pb-3 text-left font-medium">User</th>
                      <th className="pb-3 text-left font-medium">Role</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Last Login</th>
                      <th className="pb-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">Loading users...</td>
                      </tr>
                    )}
                    {isError && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-destructive">Failed to load. <Button variant="outline" size="sm" onClick={()=>refetch()}>Retry</Button></td>
                      </tr>
                    )}
                    {!isLoading && !isError && (!users || users.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No users found.</td>
                      </tr>
                    )}
                    {(users ?? []).map((user, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-4">
                          <Checkbox />
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {(user.fullName || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary">{user.role}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={
                              user.isActive
                                ? "bg-success text-success-foreground"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <SettingsIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
