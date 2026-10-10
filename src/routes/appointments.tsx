import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, vms } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarClock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPage,
  head: () => ({ meta: [{ title: "Appointments — Sentinel VMS" }] }),
});

function AppointmentsPage() {
  const visitors = useVMS((s) => s.visitors);
  const employees = useVMS((s) => s.employees);
  const appts = visitors.filter((v) => v.visitor_type === "Appointment");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    visitor_name: "", company: "", mobile: "", email: "", purpose: "",
    host_employee: employees[0]?.id ?? "", appointment_date: new Date().toISOString().slice(0, 10),
    appointment_time: "10:00",
  });

  const submit = () => {
    if (!form.visitor_name || !form.host_employee) {
      toast.error("Visitor name and host are required.");
      return;
    }
    vms.addVisitor({
      ...form,
      visitor_type: "Appointment",
      approval_status: "Pending",
      visit_status: "Scheduled",
      department: vms.employeeDept(form.host_employee),
    });
    toast.success("Appointment created", { description: `Approval request sent to ${vms.employeeName(form.host_employee)}.` });
    setOpen(false);
    setForm({ ...form, visitor_name: "", company: "", mobile: "", email: "", purpose: "" });
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Schedule visitors ahead of time and trigger the approval workflow."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /> Schedule Appointment</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Visitor Name" value={form.visitor_name} onChange={(v) => setForm({ ...form, visitor_name: v })} />
                <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field label="Mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <div className="col-span-2">
                  <Label className="mb-1.5 block text-xs">Purpose</Label>
                  <Textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Host</Label>
                  <Select value={form.host_employee} onValueChange={(v) => setForm({ ...form, host_employee: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.department}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Date" type="date" value={form.appointment_date} onChange={(v) => setForm({ ...form, appointment_date: v })} />
                <Field label="Time" type="time" value={form.appointment_time} onChange={(v) => setForm({ ...form, appointment_time: v })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Send for Approval</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appts.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.visitor_name}</div>
                  <div className="text-xs text-muted-foreground">{v.company}</div>
                </TableCell>
                <TableCell>{vms.employeeName(v.host_employee)}</TableCell>
                <TableCell>{vms.employeeDept(v.host_employee)}</TableCell>
                <TableCell>{v.appointment_date}</TableCell>
                <TableCell>{v.appointment_time}</TableCell>
                <TableCell className="max-w-[220px] truncate text-sm">{v.purpose}</TableCell>
                <TableCell><StatusBadge status={v.approval_status} /></TableCell>
                <TableCell><StatusBadge status={v.visit_status} /></TableCell>
              </TableRow>
            ))}
            {appts.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No appointments yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
