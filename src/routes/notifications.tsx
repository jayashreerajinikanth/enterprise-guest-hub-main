import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/vms/Shell";
import { useVMS, vms, formatDateTime } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — Sentinel VMS" }] }),
});

function NotificationsPage() {
  const notifs = useVMS((s) => s.notifications);
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Real-time alerts for approvals, escalations, check-ins and audit events."
        actions={<Button variant="outline" onClick={() => vms.markAllRead()}><CheckCheck className="h-4 w-4 mr-1" /> Mark all as read</Button>}
      />
      <div className="card-elevated divide-y divide-border">
        {notifs.length === 0 && <div className="p-12 text-center text-muted-foreground">No notifications</div>}
        {notifs.map((n) => (
          <div key={n.id} className={`p-4 flex items-start gap-4 hover:bg-muted/40 transition ${n.status === "Unread" ? "bg-primary/[0.03]" : ""}`}>
            <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${n.status === "Unread" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm">{n.title}</div>
                {n.status === "Unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              <div className="text-xs text-muted-foreground mt-1">To: {vms.employeeName(n.receiver)} • {formatDateTime(n.created_at)}</div>
            </div>
            {n.status === "Unread" && (
              <Button size="sm" variant="ghost" onClick={() => vms.markNotificationRead(n.id)}>Mark read</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
