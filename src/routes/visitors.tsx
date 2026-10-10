import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, vms, formatDateTime, DEPARTMENTS, type Visitor } from "@/lib/vms-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Eye, LogIn, LogOut, QrCode, Pencil, Trash2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export const Route = createFileRoute("/visitors")({
  component: VisitorsPage,
  head: () => ({ meta: [{ title: "Visitors — Sentinel VMS" }] }),
});

function VisitorsPage() {
  const visitors = useVMS((s) => s.visitors);
  const role = useVMS((s) => s.currentRole);
  const isAdmin = role === "Admin";
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [editing, setEditing] = useState<Visitor | null>(null);

  const filtered = visitors.filter((v) => {
    if (type !== "all" && v.visitor_type !== type) return false;
    if (status !== "all" && v.visit_status !== status) return false;
    if (q && !`${v.visitor_name} ${v.company} ${v.mobile}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Visitors" description="Full visitor history across appointments and walk-ins." />

      <div className="card-elevated p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, company, mobile..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Appointment">Appointment</SelectItem>
            <SelectItem value="Walk-in">Walk-in</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Checked-In">Checked-In</SelectItem>
            <SelectItem value="Checked-Out">Checked-Out</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Visit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.visitor_name}</div>
                  <div className="text-xs text-muted-foreground">{v.company} • {v.mobile}</div>
                </TableCell>
                <TableCell><StatusBadge status={v.visitor_type} /></TableCell>
                <TableCell className="text-sm">{vms.employeeName(v.host_employee)}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{v.purpose}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.check_in)}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.check_out)}</TableCell>
                <TableCell><StatusBadge status={v.approval_status} /></TableCell>
                <TableCell><StatusBadge status={v.visit_status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setSelected(v)}><Eye className="h-4 w-4" /></Button>
                    {v.approval_status === "Approved" && !v.check_in && (
                      <Button size="icon" variant="ghost" onClick={() => vms.checkIn(v.id)} title="Check in"><LogIn className="h-4 w-4 text-success" /></Button>
                    )}
                    {v.check_in && !v.check_out && (
                      <Button size="icon" variant="ghost" onClick={() => vms.checkOut(v.id)} title="Check out"><LogOut className="h-4 w-4 text-destructive" /></Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => setEditing(v)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => {
                          if (confirm(`Delete visitor ${v.visitor_name}?`)) {
                            vms.deleteVisitor(v.id);
                            toast.success("Visitor deleted");
                          }
                        }} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No visitors found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" /> Visitor Pass — {selected.visitor_name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <Field label="Company" value={selected.company} />
                  <Field label="Mobile" value={selected.mobile} />
                  <Field label="Email" value={selected.email} />
                  <Field label="Purpose" value={selected.purpose} />
                  <Field label="Host" value={vms.employeeName(selected.host_employee)} />
                  <Field label="Department" value={vms.employeeDept(selected.host_employee)} />
                  <Field label="Scheduled" value={`${selected.appointment_date} @ ${selected.appointment_time}`} />
                  <div className="flex gap-2 pt-2">
                    <StatusBadge status={selected.visitor_type} />
                    <StatusBadge status={selected.approval_status} />
                    <StatusBadge status={selected.visit_status} />
                  </div>
                </div>
                <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    <QRCode value={`VMS-PASS:${selected.id}:${selected.visitor_name}`} size={160} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-xs text-muted-foreground">Pass ID</div>
                    <div className="font-mono text-sm font-semibold">{selected.id.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog — Admin only */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" /> Edit Visitor
                </DialogTitle>
              </DialogHeader>
              <EditVisitorForm
                visitor={editing}
                onSave={(patch) => {
                  vms.updateVisitor(editing.id, patch);
                  toast.success("Visitor updated");
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditVisitorForm({ visitor, onSave, onCancel }: { visitor: Visitor; onSave: (p: Partial<Visitor>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    visitor_name: visitor.visitor_name,
    company: visitor.company,
    mobile: visitor.mobile,
    purpose: visitor.purpose,
    person_to_meet: visitor.person_to_meet ?? "",
    department: visitor.department ?? "",
    materials: visitor.materials ?? "",
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <F label="Visitor Name" value={form.visitor_name} onChange={(v) => setForm({ ...form, visitor_name: v })} />
        <F label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
        <F label="Contact" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
        <F label="Person to Meet" value={form.person_to_meet} onChange={(v) => setForm({ ...form, person_to_meet: v })} />
        <div>
          <Label className="mb-1.5 block text-xs">Department</Label>
          <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <F label="Materials" value={form.materials} onChange={(v) => setForm({ ...form, materials: v })} />
        <div className="col-span-2">
          <F label="Purpose" value={form.purpose} onChange={(v) => setForm({ ...form, purpose: v })} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </DialogFooter>
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-border/60">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
