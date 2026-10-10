import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarClock, UserPlus, Clock, DoorOpen, Truck, Package, CheckCircle2, Bell } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { KpiCard } from "@/components/vms/KpiCard";
import { useVMS, vms, formatTime, formatDateTime, type Visitor, type Notification, type Department } from "@/lib/vms-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Sentinel VMS" }] }),
});

const chartColors = ["oklch(0.55 0.19 258)", "oklch(0.68 0.14 230)", "oklch(0.68 0.17 155)", "oklch(0.78 0.16 75)", "oklch(0.6 0.22 27)"];

function Dashboard() {
  const visitors = useVMS((s) => s.visitors);
  const vehicles = useVMS((s) => s.vehicles);
  const employees = useVMS((s) => s.employees);
  const notifications = useVMS((s) => s.notifications);
  const role = useVMS((s) => s.currentRole);
  const currentDept = useVMS((s) => s.currentDepartment);

  const today = new Date().toISOString().slice(0, 10);
  const todays = visitors.filter((v) => v.appointment_date === today);
  const kpis = {
    total: todays.length,
    appointment: todays.filter((v) => v.visitor_type === "Appointment").length,
    walkin: todays.filter((v) => v.visitor_type === "Walk-in").length,
    pending: visitors.filter((v) => v.approval_status === "Pending" || v.approval_status === "Escalated").length,
    inside: visitors.filter((v) => v.visit_status === "Checked-In").length,
    vehiclesInside: vehicles.filter((v) => !v.out_time).length,
    material: vehicles.filter((v) => v.with_material).length,
    completed: visitors.filter((v) => v.visit_status === "Checked-Out").length,
  };

  if (role === "Department") {
    return <DepartmentDashboard visitors={visitors} notifications={notifications} dept={currentDept} />;
  }

  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString([], { weekday: "short" }),
      visitors: Math.floor(20 + Math.random() * 60) + (i === 6 ? kpis.total : 0),
      appointments: Math.floor(10 + Math.random() * 40),
    };
  });

  const byDept = employees.reduce<Record<string, number>>((acc, e) => {
    const count = visitors.filter((v) => v.host_employee === e.id).length;
    acc[e.department] = (acc[e.department] || 0) + count;
    return acc;
  }, {});
  const deptData = Object.entries(byDept).map(([name, value]) => ({ name, value }));

  const approvalData = [
    { name: "Approved", value: visitors.filter((v) => v.approval_status === "Approved").length },
    { name: "Pending", value: visitors.filter((v) => v.approval_status === "Pending").length },
    { name: "Escalated", value: visitors.filter((v) => v.approval_status === "Escalated").length },
    { name: "Rejected", value: visitors.filter((v) => v.approval_status === "Rejected").length },
  ];

  const recent = [...visitors].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const pending = visitors.filter((v) => v.approval_status === "Pending" || v.approval_status === "Escalated").slice(0, 5);
  const vehicleRows = vehicles.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time visitor, approval and vehicle activity across your facility."
        actions={
          <>
            <Button asChild variant="outline"><Link to="/walk-in">+ Walk-in</Link></Button>
            <Button asChild><Link to="/appointments">+ Appointment</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Visitors Today" value={kpis.total} icon={Users} trend={12} tone="primary" />
        <KpiCard label="Appointments" value={kpis.appointment} icon={CalendarClock} trend={8} tone="info" />
        <KpiCard label="Walk-ins" value={kpis.walkin} icon={UserPlus} trend={-4} tone="warning" />
        <KpiCard label="Pending Approvals" value={kpis.pending} icon={Clock} tone="destructive" />
        <KpiCard label="Visitors Inside" value={kpis.inside} icon={DoorOpen} tone="success" />
        <KpiCard label="Vehicles Inside" value={kpis.vehiclesInside} icon={Truck} tone="info" />
        <KpiCard label="Material Entries" value={kpis.material} icon={Package} tone="warning" />
        <KpiCard label="Completed Visits" value={kpis.completed} icon={CheckCircle2} trend={5} tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card-elevated p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Daily Visitor Trend</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.19 258)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.19 258)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.14 230)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.68 0.14 230)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" />
                <XAxis dataKey="day" stroke="oklch(0.53 0.03 258)" fontSize={12} />
                <YAxis stroke="oklch(0.53 0.03 258)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 255)" }} />
                <Area type="monotone" dataKey="visitors" stroke="oklch(0.55 0.19 258)" strokeWidth={2} fill="url(#v)" />
                <Area type="monotone" dataKey="appointments" stroke="oklch(0.68 0.14 230)" strokeWidth={2} fill="url(#a)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-1">Approval Status</h3>
          <p className="text-xs text-muted-foreground mb-4">Current visitor pool</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={approvalData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {approvalData.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card-elevated p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Visitors</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/visitors">View all →</Link></Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="font-medium">{v.visitor_name}</div>
                    <div className="text-xs text-muted-foreground">{v.company}</div>
                  </TableCell>
                  <TableCell className="text-sm">{vms.employeeName(v.host_employee)}</TableCell>
                  <TableCell><StatusBadge status={v.visitor_type} /></TableCell>
                  <TableCell className="text-sm">{formatTime(v.check_in)}</TableCell>
                  <TableCell><StatusBadge status={v.visit_status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-1">Department-wise Visits</h3>
          <p className="text-xs text-muted-foreground mb-4">Today</p>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 255)" />
                <XAxis dataKey="name" stroke="oklch(0.53 0.03 258)" fontSize={11} />
                <YAxis stroke="oklch(0.53 0.03 258)" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 255)" }} />
                <Bar dataKey="value" fill="oklch(0.55 0.19 258)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pending Approvals</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/approvals">Manage →</Link></Button>
          </div>
          <div className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending approvals 🎉</p>}
            {pending.map((v) => {
              const mins = Math.floor((Date.now() - new Date(v.created_at).getTime()) / 60000);
              const pct = Math.min(100, (mins / 15) * 100);
              return (
                <div key={v.id} className="p-3 rounded-lg border border-border hover:bg-muted/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{v.visitor_name}</div>
                      <div className="text-xs text-muted-foreground">Host: {vms.employeeName(v.host_employee)}</div>
                    </div>
                    <StatusBadge status={v.approval_status} />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Escalation timer</span>
                      <span>{Math.max(0, 15 - mins)}m left</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Vehicle Entries</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/vehicles">View all →</Link></Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleRows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="font-medium">{v.vehicle_number}</div>
                    <div className="text-xs text-muted-foreground">{v.vehicle_type}</div>
                  </TableCell>
                  <TableCell className="text-sm">{v.driver_name}</TableCell>
                  <TableCell className="text-sm">{v.with_material ? v.material_name : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={v.out_time ? "Checked-Out" : "Checked-In"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function DepartmentDashboard({
  visitors, notifications, dept,
}: { visitors: Visitor[]; notifications: Notification[]; dept: Department }) {
  const pending = visitors.filter(
    (v) => v.department === dept && (v.approval_status === "Pending" || v.approval_status === "Escalated"),
  );
  const history = visitors
    .filter((v) => v.department === dept)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10);
  const notifs = notifications.slice(0, 8);

  return (
    <div>
      <PageHeader
        title={`Department Dashboard — ${dept}`}
        description="Pending approvals, notifications and recent visitor history for your department."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Pending Approvals</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/approvals">Manage →</Link></Button>
          </div>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending approvals for {dept}.</p>}
          <div className="space-y-2">
            {pending.map((v) => (
              <div key={v.id} className="p-3 rounded-[3px] border border-border flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.visitor_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {v.company} · Meet: {v.person_to_meet ?? vms.employeeName(v.host_employee)}
                  </div>
                </div>
                <StatusBadge status={v.approval_status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-1"><Bell className="h-4 w-4" /> Notifications</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/notifications">All →</Link></Button>
          </div>
          {notifs.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
          <div className="space-y-2">
            {notifs.map((n) => (
              <div key={n.id} className="p-3 rounded-[3px] border border-border">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm truncate">{n.title}</div>
                  <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-elevated p-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Visitor History — {dept}</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/walk-in-history">Full history →</Link></Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.visitor_name}</div>
                  <div className="text-xs text-muted-foreground">{v.company}</div>
                </TableCell>
                <TableCell className="text-sm max-w-[240px] truncate">{v.purpose}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.created_at)}</TableCell>
                <TableCell><StatusBadge status={v.approval_status} /></TableCell>
                <TableCell><StatusBadge status={v.visit_status} /></TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No history yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
