import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, vms, formatDateTime } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
  head: () => ({ meta: [{ title: "Pending Approvals — Sentinel VMS" }] }),
});

function ApprovalsPage() {
  const visitors = useVMS((s) => s.visitors);
  const role = useVMS((s) => s.currentRole);
  const currentDept = useVMS((s) => s.currentDepartment);

  const pending = visitors.filter((v) => {
    const isOpen = v.approval_status === "Pending" || v.approval_status === "Escalated";
    if (!isOpen) return false;
    if (role === "Admin") return true;
    if (role === "HR") return v.approval_status === "Escalated";
    if (role === "Department") return v.approval_status === "Pending" && v.department === currentDept;
    return false; // Security cannot access this page
  });

  const heading =
    role === "HR" ? "Escalated Approvals (HR)" :
    role === "Department" ? `Pending Approvals — ${currentDept}` :
    "Pending Approvals";

  const description =
    role === "HR" ? "Requests escalated to HR after 15 minutes of inactivity." :
    role === "Department" ? `Requests assigned to the ${currentDept} department.` :
    "Approve visitor requests. Auto-escalation triggers after 15 minutes of inactivity.";

  if (role === "Security") {
    return (
      <div>
        <PageHeader title="Access Restricted" />
        <div className="card-elevated p-12 text-center text-sm text-muted-foreground">
          Security role cannot view approvals. Please switch role.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={heading} description={description} />

      {pending.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-success/15 text-success grid place-items-center mx-auto mb-3"><Check className="h-7 w-7" /></div>
          <div className="font-semibold">All caught up</div>
          <p className="text-sm text-muted-foreground mt-1">No visitor requests are awaiting your approval right now.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pending.map((v) => {
          const mins = Math.floor((Date.now() - new Date(v.created_at).getTime()) / 60000);
          const pct = Math.min(100, (mins / 15) * 100);
          const overdue = mins >= 15;
          return (
            <div key={v.id} className="card-elevated p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg truncate">{v.visitor_name}</h3>
                    <StatusBadge status={v.visitor_type} />
                    <StatusBadge status={v.approval_status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{v.company} • {v.mobile}</p>
                </div>
                {overdue && <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0" />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Row label="Person to Meet" value={v.person_to_meet ?? vms.employeeName(v.host_employee)} />
                <Row label="Department" value={v.department ?? "—"} />
                <Row label="Purpose" value={v.purpose} />
                <Row label="Materials" value={v.materials || "—"} />
                <Row label="Requested" value={formatDateTime(v.created_at)} />
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Approval SLA (15 min)</span>
                  <span className={overdue ? "text-destructive font-semibold" : ""}>
                    {overdue ? `Overdue by ${mins - 15}m` : `${15 - mins}m remaining`}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={() => { vms.approveVisitor(v.id); toast.success(`Approved ${v.visitor_name}`); }} className="flex-1"><Check className="h-4 w-4 mr-1" /> Approve</Button>
                <Button variant="outline" onClick={() => { vms.rejectVisitor(v.id); toast.error(`Rejected ${v.visitor_name}`); }} className="flex-1"><X className="h-4 w-4 mr-1" /> Reject</Button>
                {role === "Admin" && v.approval_status !== "Escalated" && (
                  <Button variant="ghost" onClick={() => { vms.escalateToHR(v.id); toast.warning("Escalated to HR"); }}>
                    <ArrowRightCircle className="h-4 w-4 mr-1" /> Escalate to HR
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
