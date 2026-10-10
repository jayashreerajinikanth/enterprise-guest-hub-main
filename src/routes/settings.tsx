import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/vms/Shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Sentinel VMS" }] }),
});

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Organization, approval, notification and security preferences." />

      <Tabs defaultValue="org">
        <TabsList className="mb-4">
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="approval">Approval Flow</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security & Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-semibold">Company Profile</h3>
            <Field label="Company Name" defaultValue="Acme Corporation" />
            <Field label="Registered Address" defaultValue="12 Corporate Park, Bengaluru" />
            <Field label="Support Email" defaultValue="reception@acme.com" />
            <Button onClick={() => toast.success("Company profile updated")}>Save</Button>
          </div>
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-semibold">Branding</h3>
            <Field label="Primary Color" defaultValue="#2563EB" />
            <Field label="Welcome Message" defaultValue="Welcome to Acme HQ" />
            <Toggle label="Show company logo on visitor pass" defaultChecked />
            <Button onClick={() => toast.success("Branding saved")}>Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-semibold">Approval Rules</h3>
            <Field label="Auto-escalation timeout (minutes)" defaultValue="15" />
            <Toggle label="Require photo before check-in" defaultChecked />
            <Toggle label="Require ID proof for walk-ins" defaultChecked />
            <Toggle label="Allow alternate approver override" defaultChecked />
            <Button onClick={() => toast.success("Approval rules saved")}>Save</Button>
          </div>
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-semibold">Visitor Pass</h3>
            <Toggle label="Generate QR code" defaultChecked />
            <Toggle label="Auto-print at reception" />
            <Toggle label="Email pass to visitor" defaultChecked />
            <Button onClick={() => toast.success("Pass settings saved")}>Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="notif" className="card-elevated p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold">Notification Channels</h3>
          <Toggle label="Email notifications" defaultChecked />
          <Toggle label="SMS notifications" defaultChecked />
          <Toggle label="WhatsApp notifications" />
          <Toggle label="In-app real-time alerts" defaultChecked />
          <Toggle label="Escalation alerts to Managers" defaultChecked />
          <Button onClick={() => toast.success("Notification preferences saved")}>Save</Button>
        </TabsContent>

        <TabsContent value="security" className="card-elevated p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold">Access Control</h3>
          <Toggle label="Enable SSO (SAML/OIDC)" />
          <Toggle label="Two-factor authentication for Admins" defaultChecked />
          <Toggle label="Audit log retention (365 days)" defaultChecked />
          <Toggle label="Role-based access (RBAC)" defaultChecked />
          <Button onClick={() => toast.success("Security settings saved")}>Save</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
