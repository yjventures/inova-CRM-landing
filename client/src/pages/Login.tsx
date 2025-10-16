import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardContent className="pt-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary overflow-hidden">
              <img src="/inova-logo-white.png" alt="Team Inova" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold">Team Inova</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="h-auto p-0 text-sm text-primary">
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <Alert className="mt-6 border-info/20 bg-info/10">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-xs">
              <div className="font-semibold text-foreground">Team Inova Demo Credentials</div>
              <div className="mt-1 space-y-1 text-muted-foreground">
                <div><strong>Sales Rep:</strong> sales.rep@inova.ai / SalesRep123!</div>
                <div><strong>Manager:</strong> manager@inova.ai / Manager456!</div>
                <div><strong>Director:</strong> director@inova.ai / Director789!</div>
                <div><strong>Admin:</strong> admin@inova.ai / Admin2025!</div>
              </div>
            </AlertDescription>
          </Alert>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            © 2025 Inova AI Solution. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
