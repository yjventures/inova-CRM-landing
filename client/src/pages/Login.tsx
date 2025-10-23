import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { post } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch (_) {
      // no-op: copying is a convenience, not critical
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await post<any>("/auth/login", { email, password });
      const access = res?.data?.tokens?.accessToken;
      const refresh = res?.data?.tokens?.refreshToken;
      if (!access) throw new Error("Login failed");
      setAccessToken(access, refresh);
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || err?.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
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

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : null}
          </form>

          <Alert className="mt-6 border-info/20 bg-info/10">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-xs">
              <div className="font-semibold text-foreground">Team Inova Demo Credentials</div>
              <div className="mt-1 space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="mr-1">Sales Rep:</strong>
                  <button type="button" onClick={() => copyText("sales.rep@inova.ai")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy email">sales.rep@inova.ai</button>
                  <span>/</span>
                  <button type="button" onClick={() => copyText("SalesRep123!")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy password">SalesRep123!</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="mr-1">Manager:</strong>
                  <button type="button" onClick={() => copyText("manager@inova.ai")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy email">manager@inova.ai</button>
                  <span>/</span>
                  <button type="button" onClick={() => copyText("Manager456!")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy password">Manager456!</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="mr-1">Director:</strong>
                  <button type="button" onClick={() => copyText("director@inova.ai")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy email">director@inova.ai</button>
                  <span>/</span>
                  <button type="button" onClick={() => copyText("Director789!")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy password">Director789!</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="mr-1">Admin:</strong>
                  <button type="button" onClick={() => copyText("admin@inova.ai")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy email">admin@inova.ai</button>
                  <span>/</span>
                  <button type="button" onClick={() => copyText("InovaAdmin2025!")} className="rounded bg-muted px-2 py-0.5 hover:bg-muted/80" title="Copy password">InovaAdmin2025!</button>
                </div>
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
