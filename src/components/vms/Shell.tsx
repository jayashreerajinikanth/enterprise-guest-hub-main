import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, CalendarClock, UserPlus, CheckCircle2, Truck,
  FileBarChart, UserSquare2, Bell, Settings, Search, ShieldCheck, Menu, X,
  ChevronRight, ChevronDown, Folder, Star, Clock, LogOut,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useVMS, vms, canAccess, DEPARTMENTS, type Department } from "@/lib/vms-data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: typeof Users };

const favorites: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/approvals", label: "Pending Approvals", icon: CheckCircle2 },
  { to: "/walk-in", label: "Walk-in Entry", icon: UserPlus },
];

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Visitor Management",
    items: [
      { to: "/visitors", label: "Visitors", icon: Users },
      { to: "/appointments", label: "Appointments", icon: CalendarClock },
      { to: "/walk-in", label: "Walk-in", icon: UserPlus },
      { to: "/walk-in-history", label: "Walk-in History", icon: Clock },
      { to: "/approvals", label: "Pending Approvals", icon: CheckCircle2 },
    ],
  },
  {
    label: "Gate & Vehicle",
    items: [
      { to: "/vehicles", label: "Vehicle Entry", icon: Truck },
    ],
  },
  {
    label: "Master Data",
    items: [
      { to: "/employees", label: "Employees", icon: UserSquare2 },
    ],
  },
  {
    label: "Reports & Info",
    items: [
      { to: "/reports", label: "Reports", icon: FileBarChart },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useVMS((s) => s.currentRole);
  const loginRole = useVMS((s) => s.loginRole);
  const currentDept = useVMS((s) => s.currentDepartment);
  const username = useVMS((s) => s.currentUsername);
  const unread = useVMS((s) => s.notifications.filter((n) => n.status === "Unread").length);
  const [openMobile, setOpenMobile] = useState(false);
  const navigate = useNavigate();

  // Filter nav by role
  const visibleFavorites = favorites.filter((f) => canAccess(role, f.to));
  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.to)) }))
    .filter((g) => g.items.length > 0);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.label, true])),
  );
  const [favOpen, setFavOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Top SAP-style menu bar */}
      <div className="sap-toolbar h-8 flex items-center px-3 gap-4 text-[12px] text-foreground">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="h-4 w-4 text-[#0A6ED1]" />
          <span>VMS</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>PRD (1) 666</span>
          <span>{username || role.toLowerCase() + "01"}</span>
        </div>
      </div>

      {/* SAP-style action toolbar */}
      <div className="sap-toolbar h-10 flex items-center gap-1 px-3 border-b border-border">
        <button
          className="lg:hidden p-1.5 rounded hover:bg-muted"
          onClick={() => setOpenMobile((v) => !v)}
        >
          {openMobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="relative flex-1 max-w-md ml-2">
          <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Transaction / search…"
            className="h-7 pl-7 rounded-[3px] bg-white border-border text-[12px]"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {loginRole === "Admin" && (
            <RoleSwitcher role={role} dept={currentDept} />
          )}
          <Link
            to="/notifications"
            className="relative p-1.5 rounded hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-[#0A6ED1] text-white text-[10px] font-semibold">
                    {(username || role).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-[11px] font-semibold">{username || role}</div>
                  <div className="text-[10px] text-muted-foreground">{role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { vms.logout(); navigate({ to: "/login" }); }}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      <div className="flex flex-1 min-h-0">
        {/* SAP tree sidebar */}
        <aside
          className={`${openMobile ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 lg:top-0 left-0 z-40 h-screen lg:h-auto lg:self-stretch w-64 bg-sidebar border-r border-sidebar-border transition-transform flex flex-col`}
        >
          <div className="sap-panel-header flex items-center justify-between">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>
          <nav className="flex-1 overflow-y-auto py-1 text-[12px] font-normal">
            {/* Favorites group */}
            <TreeGroup
              label="Favorites"
              open={favOpen}
              onToggle={() => setFavOpen((v) => !v)}
              icon={Star}
              iconColor="text-[#F0AB00]"
            >
              {visibleFavorites.map((item) => (
                <TreeLeaf key={item.to} item={item} pathname={pathname} onClick={() => setOpenMobile(false)} favorite />
              ))}
            </TreeGroup>

            {/* SAP Menu */}
            <div className="mt-1">
              <div className="flex items-center gap-1 px-2 py-1 text-foreground">
                <ChevronDown className="h-3 w-3" />
                <Folder className="h-3.5 w-3.5 text-[#F0AB00]" />
                <span className="font-semibold">SAP Menu</span>
              </div>
              <div className="pl-3">
                {visibleGroups.map((g) => (
                  <TreeGroup
                    key={g.label}
                    label={g.label}
                    open={openGroups[g.label] ?? true}
                    onToggle={() => setOpenGroups((s) => ({ ...s, [g.label]: !(s[g.label] ?? true) }))}
                    icon={Folder}
                    iconColor="text-[#F0AB00]"
                  >
                    {g.items.map((item) => (
                      <TreeLeaf
                        key={item.to + item.label}
                        item={item}
                        pathname={pathname}
                        onClick={() => setOpenMobile(false)}
                        badge={item.to === "/notifications" && unread > 0 ? unread : undefined}
                      />
                    ))}
                  </TreeGroup>
                ))}
              </div>
            </div>
          </nav>
          <div className="border-t border-sidebar-border p-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#107E3E]" />
              System PRD · Client 100
            </div>
          </div>
        </aside>

        {openMobile && (
          <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpenMobile(false)} />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 p-3 lg:p-4">{children}</main>
      </div>

      {/* SAP-style status bar */}
      <div className="h-6 border-t border-border bg-[#EAEEF3] flex items-center px-3 text-[11px] text-muted-foreground gap-4">
        <span>Ready</span>
        <span className="ml-auto">PRD (1) 666 · {role} · INS</span>
      </div>
    </div>
  );
}


function TreeGroup({
  label, open, onToggle, icon: Icon, iconColor, children,
}: {
  label: string; open: boolean; onToggle: () => void;
  icon: typeof Folder; iconColor: string; children: ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1 px-2 py-1 hover:bg-sidebar-accent text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className="font-semibold text-[12px]">{label}</span>
      </button>
      {open && <div className="pl-4">{children}</div>}
    </div>
  );
}

function TreeLeaf({
  item, pathname, onClick, favorite, badge,
}: {
  item: NavItem; pathname: string; onClick: () => void; favorite?: boolean; badge?: number;
}) {
  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-1.5 pl-4 pr-2 py-[3px] text-[12px] border-l border-transparent ${
        active
          ? "bg-[#FFEB99] text-foreground border-l-[#0A6ED1]"
          : "hover:bg-sidebar-accent text-foreground/85"
      }`}
    >
      {favorite ? (
        <Star className="h-3 w-3 text-[#F0AB00] fill-[#F0AB00]" />
      ) : (
        <item.icon className="h-3 w-3 text-[#0A6ED1]" />
      )}
      <span className="truncate">{item.label}</span>
      {badge !== undefined && (
        <Badge className="ml-auto h-4 px-1 rounded-[2px] bg-[#BB0000] text-white text-[10px]">{badge}</Badge>
      )}
    </Link>
  );
}

function RoleSwitcher({ role, dept }: { role: "Admin" | "Security" | "HR" | "Department"; dept: Department }) {
  const label =
    role === "Admin" ? "Admin"
    : role === "Security" ? "Security"
    : role === "HR" ? "HR"
    : dept;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:inline-flex h-7 rounded-[3px] text-[11px]">
          Role: <span className="ml-1 font-semibold text-[#0A6ED1]">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Preview As (Admin)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => vms.setPreviewRole("Admin")}>Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => vms.setPreviewRole("Security")}>Security</DropdownMenuItem>
        <DropdownMenuItem onClick={() => vms.setPreviewRole("HR")}>HR</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground">Departments</DropdownMenuLabel>
        {DEPARTMENTS.filter((d) => d !== "HR" && d !== "Security").map((d) => (
          <DropdownMenuItem key={d} onClick={() => vms.setPreviewRole("Department", d)}>
            {d}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-3 bg-card border border-border rounded-[3px]">
      <div className="sap-panel-header flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-bold tracking-wide">{title}</div>
          {description && <div className="text-[11px] font-normal normal-case tracking-normal text-muted-foreground mt-0.5">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-1.5">{actions}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "bg-[#107E3E]/10 text-[#107E3E] border-[#107E3E]/40",
    Pending: "bg-[#F0AB00]/15 text-[#8a6300] border-[#F0AB00]/50",
    Rejected: "bg-[#BB0000]/10 text-[#BB0000] border-[#BB0000]/40",
    Escalated: "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/40",
    "Checked-In": "bg-[#107E3E]/10 text-[#107E3E] border-[#107E3E]/40",
    "Checked-Out": "bg-muted text-muted-foreground border-border",
    Scheduled: "bg-[#0A6ED1]/10 text-[#0A6ED1] border-[#0A6ED1]/40",
    Cancelled: "bg-[#BB0000]/10 text-[#BB0000] border-[#BB0000]/40",
    Active: "bg-[#107E3E]/10 text-[#107E3E] border-[#107E3E]/40",
    Inactive: "bg-muted text-muted-foreground border-border",
    Appointment: "bg-[#0A6ED1]/10 text-[#0A6ED1] border-[#0A6ED1]/40",
    "Walk-in": "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/40",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-semibold uppercase tracking-wide border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}
