import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/vms/Shell";
import { useVMS, vms } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/employees")({
  component: EmployeesPage,
  head: () => ({ meta: [{ title: "Employees — Sentinel VMS" }] }),
});

function EmployeesPage() {
  const employees = useVMS((s) => s.employees);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", name: "", department: "Engineering", designation: "", email: "", mobile: "",
    reporting_manager: employees[0]?.id ?? "", alternate_approver: employees[0]?.id ?? "",
  });

  const filtered = employees.filter((e) => !q || `${e.name} ${e.email} ${e.department}`.toLowerCase().includes(q.toLowerCase()));

  const submit = () => {
    if (!form.name || !form.employee_id) { toast.error("Employee ID and name required"); return; }
    vms.addEmployee({ ...form, status: "Active" });
    toast.success("Employee added");
    setOpen(false);
  };

  const initials = (n: string) => n.split(" ").map((x) => x[0]).slice(0, 2).join("");

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Employees are potential hosts and approvers for visitor requests."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Employee</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} />
                <F label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <F label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
                <F label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} />
                <F label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <F label="Mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
                <div>
                  <Label className="mb-1.5 block text-xs">Reporting Manager</Label>
                  <Select value={form.reporting_manager} onValueChange={(v) => setForm({ ...form, reporting_manager: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Alternate Approver</Label>
                  <Select value={form.alternate_approver} onValueChange={(v) => setForm({ ...form, alternate_approver: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Add Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="card-elevated p-4 mb-4">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employees..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Reporting Manager</TableHead>
              <TableHead>Alternate Approver</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials(e.name)}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.employee_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.designation}</TableCell>
                <TableCell>
                  <div className="text-sm">{e.email}</div>
                  <div className="text-xs text-muted-foreground">{e.mobile}</div>
                </TableCell>
                <TableCell className="text-sm">{vms.employeeName(e.reporting_manager)}</TableCell>
                <TableCell className="text-sm">{vms.employeeName(e.alternate_approver)}</TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
