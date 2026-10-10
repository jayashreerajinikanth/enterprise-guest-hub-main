import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, formatDateTime } from "@/lib/vms-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/walk-in-history")({
  component: WalkInHistoryPage,
  head: () => ({ meta: [{ title: "Walk-in History — Sentinel VMS" }] }),
});

function WalkInHistoryPage() {
  const history = useVMS((s) => s.walkInHistory);
  return (
    <div>
      <PageHeader
        title="Walk-in History"
        description="Complete log of walk-in visitors registered by Security."
      />
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Person to Meet</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Registered By</TableHead>
              <TableHead>Approval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h.id}>
                <TableCell>
                  <div className="font-medium">{h.visitor_name}</div>
                  <div className="text-xs text-muted-foreground">{h.company}</div>
                </TableCell>
                <TableCell className="text-sm">{h.contact}</TableCell>
                <TableCell className="text-sm">{h.person_to_meet}</TableCell>
                <TableCell className="text-sm">{h.department}</TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">{h.materials || "—"}</TableCell>
                <TableCell className="text-sm">{formatDateTime(h.check_in)}</TableCell>
                <TableCell className="text-sm">{formatDateTime(h.check_out)}</TableCell>
                <TableCell className="text-sm">{h.registered_by}</TableCell>
                <TableCell><StatusBadge status={h.approval_status} /></TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No walk-in history yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
