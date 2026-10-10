import { useSyncExternalStore } from "react";

// ---------- Types ----------
export type Role = "Admin" | "Security" | "HR" | "Department";

export const DEPARTMENTS = [
  "IT-Admin",
  "HR",
  "Accounts",
  "Stores and Logistics",
  "Purchase",
  "Production",
  "PPC",
  "NPD",
  "Quality",
  "Maintenance",
  "Security",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  mobile: string;
  reporting_manager: string;
  alternate_approver: string;
  status: "Active" | "Inactive";
}

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Escalated";
export type VisitStatus = "Scheduled" | "Checked-In" | "Checked-Out" | "Cancelled";
export type VisitorType = "Appointment" | "Walk-in";

export interface Visitor {
  id: string;
  visitor_type: VisitorType;
  visitor_name: string;
  company: string;
  mobile: string;
  email: string;
  purpose: string;
  person_to_meet?: string;
  materials?: string;
  photo?: string;
  id_proof?: string;
  host_employee: string; // employee id
  appointment_date: string;
  appointment_time: string;
  check_in?: string;
  check_out?: string;
  approval_status: ApprovalStatus;
  visit_status: VisitStatus;
  remarks?: string;
  department?: string; // assigned department
  created_at: string;
}

export interface Approval {
  id: string;
  visitor_id: string;
  current_approver: string;
  approval_level: 1 | 2;
  request_time: string;
  approved_time?: string;
  status: ApprovalStatus;
  escalation_after: number; // minutes
}

export interface VehicleMaterial {
  material_name: string;
  quantity: string;
  unit?: string;
  remarks?: string;
}

export interface Vehicle {
  id: string;
  visitor_id?: string;
  vehicle_number: string;
  driver_name: string;
  company: string;
  vehicle_type: string;
  with_material: boolean;
  material_name?: string;
  quantity?: string;
  invoice_number?: string;
  gate_pass?: string;
  remarks?: string;
  in_time: string;
  out_time?: string;
  security_name: string;
  // Vehicle OUT material tracking
  out_with_material?: boolean;
  out_materials?: VehicleMaterial[];
  out_remarks?: string;
}

export interface Notification {
  id: string;
  receiver: string;
  title: string;
  message: string;
  status: "Unread" | "Read";
  created_at: string;
}

export interface WalkInHistoryEntry {
  id: string;
  visitor_id: string;
  visitor_name: string;
  contact: string;
  company: string;
  purpose: string;
  person_to_meet: string;
  department: Department;
  materials: string;
  check_in?: string;
  check_out?: string;
  registered_by: string;
  approval_status: ApprovalStatus;
  created_at: string;
}

// ---------- Seed ----------
const now = new Date();
const iso = (d: Date) => d.toISOString();
const todayStr = now.toISOString().slice(0, 10);

const seedEmployees: Employee[] = [
  { id: "e1", employee_id: "EMP-001", name: "Rahul Iyer", department: "IT-Admin", designation: "IT Manager", email: "rahul@acme.com", mobile: "+91 98100 12345", reporting_manager: "e1", alternate_approver: "e2", status: "Active" },
  { id: "e2", employee_id: "EMP-002", name: "Sara Khan", department: "HR", designation: "HR Manager", email: "sara@acme.com", mobile: "+91 98100 22345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e3", employee_id: "EMP-003", name: "Meera Patel", department: "Accounts", designation: "Finance Lead", email: "meera@acme.com", mobile: "+91 98100 32345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e4", employee_id: "EMP-004", name: "Vikram Singh", department: "Stores and Logistics", designation: "Stores Head", email: "vikram@acme.com", mobile: "+91 98100 42345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e5", employee_id: "EMP-005", name: "Arjun Mehta", department: "Purchase", designation: "Purchase Manager", email: "arjun@acme.com", mobile: "+91 98100 52345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e6", employee_id: "EMP-006", name: "Priya Sharma", department: "Production", designation: "Production Head", email: "priya@acme.com", mobile: "+91 98100 62345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e7", employee_id: "EMP-007", name: "Anil Kumar", department: "PPC", designation: "PPC Lead", email: "anil@acme.com", mobile: "+91 98100 72345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e8", employee_id: "EMP-008", name: "Ananya Rao", department: "NPD", designation: "NPD Manager", email: "ananya@acme.com", mobile: "+91 98100 82345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e9", employee_id: "EMP-009", name: "David Fernandes", department: "Quality", designation: "QA Manager", email: "david@acme.com", mobile: "+91 98100 92345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e10", employee_id: "EMP-010", name: "Suresh Rao", department: "Maintenance", designation: "Maintenance Head", email: "suresh@acme.com", mobile: "+91 98101 02345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
  { id: "e11", employee_id: "EMP-011", name: "Ravi Guard", department: "Security", designation: "Security Supervisor", email: "ravi@acme.com", mobile: "+91 98101 12345", reporting_manager: "e2", alternate_approver: "e2", status: "Active" },
];

const seedVisitors: Visitor[] = [
  { id: "v1", visitor_type: "Appointment", visitor_name: "Michael Chen", company: "Globex Corp", mobile: "+1 415 555 0132", email: "m.chen@globex.com", purpose: "Quarterly Review", person_to_meet: "Rahul Iyer", host_employee: "e1", appointment_date: todayStr, appointment_time: "10:00", check_in: iso(new Date(now.getTime() - 45 * 60000)), approval_status: "Approved", visit_status: "Checked-In", department: "IT-Admin", created_at: iso(new Date(now.getTime() - 2 * 3600000)) },
  { id: "v2", visitor_type: "Walk-in", visitor_name: "Neha Kapoor", company: "Freelance", mobile: "+91 99100 11122", email: "neha@design.co", purpose: "Portfolio Discussion", person_to_meet: "Ananya Rao", host_employee: "e8", appointment_date: todayStr, appointment_time: "11:30", check_in: iso(new Date(now.getTime() - 20 * 60000)), approval_status: "Approved", visit_status: "Checked-In", department: "NPD", created_at: iso(new Date(now.getTime() - 25 * 60000)) },
  { id: "v3", visitor_type: "Appointment", visitor_name: "David Kim", company: "Initech", mobile: "+1 202 555 0177", email: "d.kim@initech.io", purpose: "Vendor Onboarding", person_to_meet: "Arjun Mehta", materials: "Sample kits x2", host_employee: "e5", appointment_date: todayStr, appointment_time: "14:00", approval_status: "Pending", visit_status: "Scheduled", department: "Purchase", created_at: iso(new Date(now.getTime() - 10 * 60000)) },
  { id: "v4", visitor_type: "Appointment", visitor_name: "Elena Rossi", company: "Umbrella Ltd", mobile: "+39 06 5555 0199", email: "e.rossi@umbrella.eu", purpose: "Maintenance Audit", person_to_meet: "Suresh Rao", host_employee: "e10", appointment_date: todayStr, appointment_time: "15:30", approval_status: "Pending", visit_status: "Scheduled", department: "Maintenance", created_at: iso(new Date(now.getTime() - 5 * 60000)) },
  { id: "v5", visitor_type: "Walk-in", visitor_name: "Jonathan Wu", company: "Wu Consulting", mobile: "+65 8123 4567", email: "j.wu@wuco.sg", purpose: "Interview", person_to_meet: "Sara Khan", host_employee: "e2", appointment_date: todayStr, appointment_time: "09:00", check_in: iso(new Date(now.getTime() - 180 * 60000)), check_out: iso(new Date(now.getTime() - 90 * 60000)), approval_status: "Approved", visit_status: "Checked-Out", department: "HR", created_at: iso(new Date(now.getTime() - 200 * 60000)) },
  { id: "v6", visitor_type: "Appointment", visitor_name: "Fatima Al-Zahra", company: "Nova Bank", mobile: "+971 50 555 0122", email: "fatima@novabank.ae", purpose: "Quality Audit", person_to_meet: "David Fernandes", host_employee: "e9", appointment_date: todayStr, appointment_time: "16:00", approval_status: "Escalated", visit_status: "Scheduled", department: "Quality", created_at: iso(new Date(now.getTime() - 30 * 60000)) },
];

const seedVehicles: Vehicle[] = [
  { id: "vh1", vehicle_number: "MH12 AB 4521", driver_name: "Ramesh Yadav", company: "BlueDart", vehicle_type: "Delivery Van", with_material: true, material_name: "Office Supplies", quantity: "12 boxes", invoice_number: "INV-8891", gate_pass: "GP-2201", in_time: iso(new Date(now.getTime() - 55 * 60000)), security_name: "Guard - Ravi" },
  { id: "vh2", vehicle_number: "DL8C XY 9987", driver_name: "Suresh Kumar", company: "Amazon Logistics", vehicle_type: "Truck", with_material: true, material_name: "Server Racks", quantity: "3 units", invoice_number: "INV-7712", gate_pass: "GP-2202", in_time: iso(new Date(now.getTime() - 130 * 60000)), out_time: iso(new Date(now.getTime() - 40 * 60000)), security_name: "Guard - Manoj" },
  { id: "vh3", vehicle_number: "KA05 CD 1122", driver_name: "Anil Nair", company: "Ola Cabs", vehicle_type: "Sedan", with_material: false, in_time: iso(new Date(now.getTime() - 10 * 60000)), security_name: "Guard - Ravi" },
];

const seedNotifications: Notification[] = [
  { id: "n1", receiver: "e5", title: "New Visitor Request", message: "David Kim from Initech is awaiting Purchase approval.", status: "Unread", created_at: iso(new Date(now.getTime() - 8 * 60000)) },
  { id: "n2", receiver: "e2", title: "Escalation Alert", message: "Fatima Al-Zahra request escalated to HR.", status: "Unread", created_at: iso(new Date(now.getTime() - 3 * 60000)) },
  { id: "n3", receiver: "e8", title: "Visitor Checked-In", message: "Neha Kapoor has arrived at the reception.", status: "Read", created_at: iso(new Date(now.getTime() - 20 * 60000)) },
];

const seedWalkInHistory: WalkInHistoryEntry[] = [
  { id: "wh1", visitor_id: "v2", visitor_name: "Neha Kapoor", contact: "+91 99100 11122", company: "Freelance", purpose: "Portfolio Discussion", person_to_meet: "Ananya Rao", department: "NPD", materials: "Laptop bag", check_in: iso(new Date(now.getTime() - 20 * 60000)), registered_by: "Ravi Guard", approval_status: "Approved", created_at: iso(new Date(now.getTime() - 25 * 60000)) },
  { id: "wh2", visitor_id: "v5", visitor_name: "Jonathan Wu", contact: "+65 8123 4567", company: "Wu Consulting", purpose: "Interview", person_to_meet: "Sara Khan", department: "HR", materials: "", check_in: iso(new Date(now.getTime() - 180 * 60000)), check_out: iso(new Date(now.getTime() - 90 * 60000)), registered_by: "Ravi Guard", approval_status: "Approved", created_at: iso(new Date(now.getTime() - 200 * 60000)) },
];

// ---------- Store ----------
interface State {
  employees: Employee[];
  visitors: Visitor[];
  vehicles: Vehicle[];
  notifications: Notification[];
  walkInHistory: WalkInHistoryEntry[];
  currentRole: Role;
  loginRole: Role; // actual role from login, used to gate the role switcher (Admin only)
  currentUserId: string;
  currentUsername: string;
  currentDepartment: Department; // used when role = Department
  isAuthenticated: boolean;
}

let state: State = {
  employees: seedEmployees,
  visitors: seedVisitors,
  vehicles: seedVehicles,
  notifications: seedNotifications,
  walkInHistory: seedWalkInHistory,
  currentRole: "Admin",
  loginRole: "Admin",
  currentUserId: "e1",
  currentUsername: "",
  currentDepartment: "Purchase",
  isAuthenticated: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useVMS<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const vms = {
  get state() { return state; },
  setRole(role: Role) { state = { ...state, currentRole: role }; emit(); },
  login(username: string, password: string): { ok: boolean; error?: string } {
    const u = username.trim().toLowerCase();
    const creds: Record<string, { role: Role; password: string; dept?: Department; userId?: string }> = {
      admin: { role: "Admin", password: "admin123", userId: "e1" },
      hr: { role: "HR", password: "hr123", userId: "e2" },
      security: { role: "Security", password: "security123", userId: "e11" },
      dept: { role: "Department", password: "dept123", dept: "Purchase", userId: "e5" },
    };
    const match = creds[u];
    if (!match || match.password !== password) return { ok: false, error: "Invalid username or password" };
    state = {
      ...state,
      isAuthenticated: true,
      currentRole: match.role,
      loginRole: match.role,
      currentUsername: u,
      currentUserId: match.userId ?? state.currentUserId,
      currentDepartment: match.dept ?? state.currentDepartment,
    };
    emit();
    return { ok: true };
  },
  logout() {
    state = { ...state, isAuthenticated: false, currentUsername: "" };
    emit();
  },
  // Admin-only preview: switch acting role (and optional department) without changing loginRole
  setPreviewRole(role: Role, dept?: Department) {
    if (state.loginRole !== "Admin") return;
    state = {
      ...state,
      currentRole: role,
      currentDepartment: dept ?? state.currentDepartment,
    };
    emit();
  },
  setDepartment(d: Department) { state = { ...state, currentDepartment: d }; emit(); },
  addVisitor(v: Omit<Visitor, "id" | "created_at">) {
    const visitor: Visitor = { ...v, id: `v${Date.now()}`, created_at: new Date().toISOString() };
    state = { ...state, visitors: [visitor, ...state.visitors] };
    this.addNotification({ receiver: v.host_employee, title: "New Visitor Request", message: `${v.visitor_name} from ${v.company} is awaiting approval.` });
    emit();
    return visitor;
  },
  addWalkIn(input: {
    visitor_name: string; contact: string; company: string; purpose: string;
    person_to_meet: string; department: Department; materials: string;
    check_in?: string; check_out?: string;
  }) {
    // find a host employee in the assigned department (fallback to any)
    const host = state.employees.find((e) => e.department === input.department) ?? state.employees[0];
    const nowIso = new Date().toISOString();
    const visitor: Visitor = {
      id: `v${Date.now()}`,
      visitor_type: "Walk-in",
      visitor_name: input.visitor_name,
      company: input.company,
      mobile: input.contact,
      email: "",
      purpose: input.purpose,
      person_to_meet: input.person_to_meet,
      materials: input.materials,
      host_employee: host.id,
      appointment_date: nowIso.slice(0, 10),
      appointment_time: nowIso.slice(11, 16),
      check_in: input.check_in,
      check_out: input.check_out,
      approval_status: "Pending",
      visit_status: input.check_in ? "Checked-In" : "Scheduled",
      department: input.department,
      created_at: nowIso,
    };
    const history: WalkInHistoryEntry = {
      id: `wh${Date.now()}`,
      visitor_id: visitor.id,
      visitor_name: input.visitor_name,
      contact: input.contact,
      company: input.company,
      purpose: input.purpose,
      person_to_meet: input.person_to_meet,
      department: input.department,
      materials: input.materials,
      check_in: input.check_in,
      check_out: input.check_out,
      registered_by: "Ravi Guard",
      approval_status: "Pending",
      created_at: nowIso,
    };
    state = {
      ...state,
      visitors: [visitor, ...state.visitors],
      walkInHistory: [history, ...state.walkInHistory],
    };
    this.addNotification({
      receiver: host.id,
      title: `Approval Requested — ${input.department}`,
      message: `${input.visitor_name} (${input.company}) awaiting ${input.department} approval.`,
    });
    emit();
    return visitor;
  },
  updateVisitor(id: string, patch: Partial<Visitor>) {
    state = { ...state, visitors: state.visitors.map((v) => (v.id === id ? { ...v, ...patch } : v)) };
    // sync walk-in history status if present
    if (patch.approval_status) {
      state = {
        ...state,
        walkInHistory: state.walkInHistory.map((h) =>
          h.visitor_id === id ? { ...h, approval_status: patch.approval_status! } : h,
        ),
      };
    }
    emit();
  },
  deleteVisitor(id: string) {
    state = {
      ...state,
      visitors: state.visitors.filter((v) => v.id !== id),
      walkInHistory: state.walkInHistory.filter((h) => h.visitor_id !== id),
    };
    emit();
  },
  approveVisitor(id: string) {
    this.updateVisitor(id, { approval_status: "Approved" });
  },
  rejectVisitor(id: string) {
    this.updateVisitor(id, { approval_status: "Rejected", visit_status: "Cancelled" });
  },
  escalateToHR(id: string) {
    this.updateVisitor(id, { approval_status: "Escalated" });
    const v = state.visitors.find((x) => x.id === id);
    const hr = state.employees.find((e) => e.department === "HR");
    if (v && hr) {
      this.addNotification({
        receiver: hr.id,
        title: "Escalated to HR",
        message: `${v.visitor_name} awaiting HR approval (originally ${v.department}).`,
      });
    }
  },
  checkIn(id: string) {
    this.updateVisitor(id, { check_in: new Date().toISOString(), visit_status: "Checked-In" });
  },
  checkOut(id: string) {
    this.updateVisitor(id, { check_out: new Date().toISOString(), visit_status: "Checked-Out" });
  },
  addVehicle(v: Omit<Vehicle, "id">) {
    state = { ...state, vehicles: [{ ...v, id: `vh${Date.now()}` }, ...state.vehicles] };
    emit();
  },
  checkOutVehicle(id: string, out?: { with_material: boolean; materials?: VehicleMaterial[]; remarks?: string }) {
    state = {
      ...state,
      vehicles: state.vehicles.map((v) =>
        v.id === id
          ? {
              ...v,
              out_time: new Date().toISOString(),
              out_with_material: out?.with_material ?? false,
              out_materials: out?.with_material ? out?.materials ?? [] : [],
              out_remarks: out?.remarks,
            }
          : v,
      ),
    };
    emit();
  },
  addNotification(n: Omit<Notification, "id" | "created_at" | "status">) {
    const notif: Notification = { ...n, id: `n${Date.now()}`, status: "Unread", created_at: new Date().toISOString() };
    state = { ...state, notifications: [notif, ...state.notifications] };
    emit();
  },
  markNotificationRead(id: string) {
    state = { ...state, notifications: state.notifications.map((n) => (n.id === id ? { ...n, status: "Read" } : n)) };
    emit();
  },
  markAllRead() {
    state = { ...state, notifications: state.notifications.map((n) => ({ ...n, status: "Read" as const })) };
    emit();
  },
  addEmployee(e: Omit<Employee, "id">) {
    state = { ...state, employees: [{ ...e, id: `e${Date.now()}` }, ...state.employees] };
    emit();
  },
  employeeName(id: string) {
    return state.employees.find((e) => e.id === id)?.name ?? "—";
  },
  employeeDept(id: string) {
    return state.employees.find((e) => e.id === id)?.department ?? "—";
  },
};

export function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// ---------- Role-based access helpers ----------
export const NAV_ACCESS: Record<Role, string[]> = {
  Admin: ["/", "/visitors", "/appointments", "/walk-in", "/walk-in-history", "/approvals", "/vehicles", "/employees", "/reports", "/notifications", "/settings"],
  Security: ["/", "/walk-in", "/walk-in-history", "/visitors", "/vehicles", "/notifications"],
  HR: ["/", "/visitors", "/appointments", "/walk-in-history", "/approvals", "/vehicles", "/employees", "/reports", "/notifications"],
  Department: ["/", "/approvals", "/walk-in-history", "/notifications"],
};

export function canAccess(role: Role, path: string): boolean {
  return NAV_ACCESS[role].includes(path);
}
