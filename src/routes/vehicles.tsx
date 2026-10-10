import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, vms, formatDateTime, type VehicleMaterial } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Plus, LogOut, Package, X as XIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vehicles")({
  component: VehiclesPage,
  head: () => ({ meta: [{ title: "Vehicle Entry — Sentinel VMS" }] }),
});

function VehiclesPage() {
  const vehicles = useVMS((s) => s.vehicles);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle_number: "", driver_name: "", company: "", vehicle_type: "Delivery Van",
    with_material: false, material_name: "", quantity: "", invoice_number: "", gate_pass: "",
    remarks: "", security_name: "Guard - Ravi",
  });

  const submit = () => {
    if (!form.vehicle_number || !form.driver_name) { toast.error("Vehicle number & driver required"); return; }
    vms.addVehicle({ ...form, in_time: new Date().toISOString() });
    toast.success("Vehicle registered");
    setOpen(false);
    setForm({ ...form, vehicle_number: "", driver_name: "", company: "", material_name: "", quantity: "", invoice_number: "", gate_pass: "", remarks: "" });
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Entry"
        description="Log inbound and outbound vehicles with driver, material and gate-pass tracking."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Vehicle Entry</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Register Vehicle</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <F label="Vehicle Number" value={form.vehicle_number} onChange={(v) => setForm({ ...form, vehicle_number: v })} />
                <F label="Driver Name" value={form.driver_name} onChange={(v) => setForm({ ...form, driver_name: v })} />
                <F label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <div>
                  <Label className="mb-1.5 block text-xs">Vehicle Type</Label>
                  <Select value={form.vehicle_type} onValueChange={(v) => setForm({ ...form, vehicle_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Delivery Van", "Truck", "Sedan", "SUV", "Bike", "Container"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                  <Switch checked={form.with_material} onCheckedChange={(v) => setForm({ ...form, with_material: v })} />
                  <div>
                    <div className="text-sm font-medium">Vehicle carrying material</div>
                    <div className="text-xs text-muted-foreground">Enable to log material, invoice and gate pass.</div>
                  </div>
                </div>
                {form.with_material && (
                  <>
                    <F label="Material Name" value={form.material_name} onChange={(v) => setForm({ ...form, material_name: v })} />
                    <F label="Quantity" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
                    <F label="Invoice Number" value={form.invoice_number} onChange={(v) => setForm({ ...form, invoice_number: v })} />
                    <F label="Gate Pass" value={form.gate_pass} onChange={(v) => setForm({ ...form, gate_pass: v })} />
                  </>
                )}
                <div className="col-span-2"><F label="Remarks" value={form.remarks} onChange={(v) => setForm({ ...form, remarks: v })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Record Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Material IN</TableHead>
              <TableHead>Material OUT</TableHead>
              <TableHead>Invoice / Gate Pass</TableHead>
              <TableHead>In Time</TableHead>
              <TableHead>Out Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium font-mono">{v.vehicle_number}</div>
                  <div className="text-xs text-muted-foreground">{v.vehicle_type}</div>
                </TableCell>
                <TableCell>{v.driver_name}</TableCell>
                <TableCell>{v.company}</TableCell>
                <TableCell className="text-sm">{v.with_material ? `${v.material_name} (${v.quantity})` : "—"}</TableCell>
                <TableCell className="text-sm">
                  {v.out_time
                    ? v.out_with_material && v.out_materials && v.out_materials.length > 0
                      ? (
                        <div className="space-y-0.5">
                          {v.out_materials.map((m, i) => (
                            <div key={i} className="text-xs">
                              {m.material_name} — {m.quantity}{m.unit ? ` ${m.unit}` : ""}
                            </div>
                          ))}
                        </div>
                      )
                      : <span className="text-xs text-muted-foreground">No material out</span>
                    : "—"}
                </TableCell>
                <TableCell className="text-sm">{v.invoice_number || "—"} / {v.gate_pass || "—"}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.in_time)}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.out_time)}</TableCell>
                <TableCell><StatusBadge status={v.out_time ? "Checked-Out" : "Checked-In"} /></TableCell>
                <TableCell>
                  {!v.out_time && <CheckoutButton vehicleId={v.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CheckoutButton({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const [withMat, setWithMat] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [mats, setMats] = useState<VehicleMaterial[]>([{ material_name: "", quantity: "", unit: "pcs", remarks: "" }]);

  const addRow = () => setMats([...mats, { material_name: "", quantity: "", unit: "pcs", remarks: "" }]);
  const removeRow = (i: number) => setMats(mats.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<VehicleMaterial>) =>
    setMats(mats.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const submit = () => {
    if (withMat) {
      const valid = mats.filter((m) => m.material_name.trim() && m.quantity.trim());
      if (valid.length === 0) { toast.error("Add at least one material row"); return; }
      vms.checkOutVehicle(vehicleId, { with_material: true, materials: valid, remarks });
      toast.success("Vehicle checked out with material");
    } else {
      vms.checkOutVehicle(vehicleId, { with_material: false, remarks });
      toast.success("Vehicle checked out — no material out");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><LogOut className="h-4 w-4 mr-1" /> Out</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Vehicle Check-Out — Material Declaration
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
          <Switch checked={withMat} onCheckedChange={setWithMat} />
          <div>
            <div className="text-sm font-medium">Is the vehicle carrying any material OUT?</div>
            <div className="text-xs text-muted-foreground">
              {withMat ? "Capture each material with quantity and unit." : "Only incoming materials remained inside."}
            </div>
          </div>
        </div>

        {withMat && (
          <div className="space-y-2">
            {mats.map((m, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label className="mb-1 block text-[11px]">Material Name</Label>
                  <Input value={m.material_name} onChange={(e) => updateRow(i, { material_name: e.target.value })} className="h-8 text-[12px]" />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1 block text-[11px]">Quantity</Label>
                  <Input value={m.quantity} onChange={(e) => updateRow(i, { quantity: e.target.value })} className="h-8 text-[12px]" />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1 block text-[11px]">Unit</Label>
                  <Select value={m.unit ?? "pcs"} onValueChange={(v) => updateRow(i, { unit: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pcs", "box", "kg", "ltr", "mtr", "pkt"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label className="mb-1 block text-[11px]">Remarks</Label>
                  <Input value={m.remarks ?? ""} onChange={(e) => updateRow(i, { remarks: e.target.value })} className="h-8 text-[12px]" />
                </div>
                <div className="col-span-1">
                  {mats.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeRow(i)} className="h-8 w-8 p-0">
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3.5 w-3.5 mr-1" /> Add Material</Button>
          </div>
        )}

        <div>
          <Label className="mb-1 block text-[11px]">Overall Remarks</Label>
          <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-8 text-[12px]" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Confirm Check-Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
