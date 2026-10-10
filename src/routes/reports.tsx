import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/vms/Shell";
import { useVMS, vms } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Sentinel VMS" }] }),
});

function ReportsPage() {
  const visitors = useVMS((s) => s.visitors);
  const vehicles = useVMS((s) => s.vehicles);
  const employees = useVMS((s) => s.employees);

  const exportPdf = () => toast.success("PDF export queued", { description: "Report will download shortly." });
  const exportXls = () => toast.success("Excel export queued");

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Filter, analyze and export visitor, vehicle and material movement history."
        actions={
          <>
            <Button variant="outline" onClick={exportXls}><FileSpreadsheet className="h-4 w-4 mr-1" /> Export Excel</Button>
            <Button onClick={exportPdf}><FileDown className="h-4 w-4 mr-1" /> Export PDF</Button>
          </>
        }
      />

      <Tabs defaultValue="visitor">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="visitor">Visitor</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="walkin">Walk-in</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="material">Material Movement</TabsTrigger>
          <TabsTrigger value="employee">Employee-wise</TabsTrigger>
          <TabsTrigger value="department">Department-wise</TabsTrigger>
        </TabsList>

        <TabsContent value="visitor">
          <ReportTable
            columns={["Visitor", "Company", "Type", "Host", "Date", "Approval", "Status"]}
            rows={visitors.map((v) => [v.visitor_name, v.company, v.visitor_type, vms.employeeName(v.host_employee), v.appointment_date, v.approval_status, v.visit_status])}
          />
        </TabsContent>
        <TabsContent value="appointment">
          <ReportTable
            columns={["Visitor", "Host", "Date", "Time", "Approval", "Status"]}
            rows={visitors.filter((v) => v.visitor_type === "Appointment").map((v) => [v.visitor_name, vms.employeeName(v.host_employee), v.appointment_date, v.appointment_time, v.approval_status, v.visit_status])}
          />
        </TabsContent>
        <TabsContent value="walkin">
          <ReportTable
            columns={["Visitor", "Host", "Date", "Approval", "Status"]}
            rows={visitors.filter((v) => v.visitor_type === "Walk-in").map((v) => [v.visitor_name, vms.employeeName(v.host_employee), v.appointment_date, v.approval_status, v.visit_status])}
          />
        </TabsContent>
        <TabsContent value="vehicle">
          <ReportTable
            columns={["Vehicle", "Driver", "Company", "Type", "In", "Out", "Security"]}
            rows={vehicles.map((v) => [v.vehicle_number, v.driver_name, v.company, v.vehicle_type, new Date(v.in_time).toLocaleString(), v.out_time ? new Date(v.out_time).toLocaleString() : "—", v.security_name])}
          />
        </TabsContent>
        <TabsContent value="material">
          <ReportTable
            columns={["Vehicle", "Material", "Quantity", "Invoice", "Gate Pass", "In", "Out"]}
            rows={vehicles.filter((v) => v.with_material).map((v) => [v.vehicle_number, v.material_name || "—", v.quantity || "—", v.invoice_number || "—", v.gate_pass || "—", new Date(v.in_time).toLocaleString(), v.out_time ? new Date(v.out_time).toLocaleString() : "—"])}
          />
        </TabsContent>
        <TabsContent value="employee">
          <ReportTable
            columns={["Employee", "Department", "Total Visitors", "Approved", "Pending"]}
            rows={employees.map((e) => {
              const list = visitors.filter((v) => v.host_employee === e.id);
              return [e.name, e.department, list.length, list.filter((v) => v.approval_status === "Approved").length, list.filter((v) => v.approval_status === "Pending" || v.approval_status === "Escalated").length];
            })}
          />
        </TabsContent>
        <TabsContent value="department">
          <ReportTable
            columns={["Department", "Total Visitors", "Checked-In", "Completed"]}
            rows={Array.from(new Set(employees.map((e) => e.department))).map((dept) => {
              const empIds = employees.filter((e) => e.department === dept).map((e) => e.id);
              const list = visitors.filter((v) => empIds.includes(v.host_employee));
              return [dept, list.length, list.filter((v) => v.visit_status === "Checked-In").length, list.filter((v) => v.visit_status === "Checked-Out").length];
            })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportTable({ columns, rows }: { columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="card-elevated overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>{columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>{r.map((c, j) => <TableCell key={j} className="text-sm">{c}</TableCell>)}</TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={columns.length} className="text-center text-muted-foreground py-10">No data</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
