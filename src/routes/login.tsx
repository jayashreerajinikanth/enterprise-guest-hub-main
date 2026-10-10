import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import { vms } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login — VMS" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = vms.login(username, password);
    if (!res.ok) {
      setError(res.error ?? "Login failed");
      return;
    }
    setError(null);
    toast.success("Signed in");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-[3px] shadow-sm">
        <div className="sap-toolbar h-8 flex items-center px-3 gap-2 text-[12px] font-semibold">
          <ShieldCheck className="h-4 w-4 text-[#0A6ED1]" />
          <span>VMS Logon</span>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#2C3E50]">Sign In</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Enter your credentials to access the system
            </div>
          </div>

          <div>
            <Label className="text-[11px]">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / hr / security / dept"
              autoFocus
              className="h-8 rounded-[3px] text-[12px]"
            />
          </div>
          <div>
            <Label className="text-[11px]">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-8 rounded-[3px] text-[12px]"
            />
          </div>

          {error && (
            <div className="text-[11px] text-[#BB0000] bg-[#BB0000]/10 border border-[#BB0000]/30 px-2 py-1 rounded-[2px]">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-8 rounded-[3px] bg-[#0A6ED1] hover:bg-[#095fb8] text-[12px]">
            <LogIn className="h-3.5 w-3.5 mr-1.5" /> Log On
          </Button>

          <div className="text-[10px] text-muted-foreground border-t pt-3 space-y-0.5">
            <div className="font-semibold text-foreground">Demo credentials:</div>
            <div>admin / admin123 &nbsp;·&nbsp; hr / hr123</div>
            <div>security / security123 &nbsp;·&nbsp; dept / dept123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
