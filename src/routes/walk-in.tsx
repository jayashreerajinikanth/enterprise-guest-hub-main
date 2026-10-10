import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, StatusBadge } from "@/components/vms/Shell";
import { useVMS, vms, formatTime, DEPARTMENTS, type Department, type Visitor } from "@/lib/vms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, IdCard, UserPlus, Plus, Send, QrCode, Download, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/walk-in")({
  component: WalkInPage,
  head: () => ({ meta: [{ title: "Walk-in Visitors — Sentinel VMS" }] }),
});

function WalkInPage() {
  const visitors = useVMS((s) => s.visitors);
  const role = useVMS((s) => s.currentRole);
  const walkins = visitors.filter((v) => v.visitor_type === "Walk-in");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [qrVisitor, setQrVisitor] = useState<Visitor | null>(null);
  const [form, setForm] = useState({
    visitor_name: "", contact: "", company: "", purpose: "",
    person_to_meet: "", department: "Purchase" as Department, materials: "",
    check_in: true, check_out: false,
  });

  const canRegister = role === "Admin" || role === "Security";

  const reset = () => {
    setForm({ visitor_name: "", contact: "", company: "", purpose: "", person_to_meet: "", department: "Purchase", materials: "", check_in: true, check_out: false });
    setStep(1);
  };

  const submit = () => {
    if (!form.visitor_name || !form.contact || !form.person_to_meet) {
      toast.error("Name, contact and person to meet are required.");
      return;
    }
    const nowIso = new Date().toISOString();
    const visitor = vms.addWalkIn({
      visitor_name: form.visitor_name,
      contact: form.contact,
      company: form.company,
      purpose: form.purpose,
      person_to_meet: form.person_to_meet,
      department: form.department,
      materials: form.materials,
      check_in: form.check_in ? nowIso : undefined,
      check_out: form.check_out ? nowIso : undefined,
    });
    toast.success("Walk-in registered", { description: `Approval request sent to ${form.department}.` });
    setOpen(false);
    reset();
    setQrVisitor(visitor);
  };

  const steps = ["Visitor Details", "Photo & ID", "Assignment"];

  return (
    <div>
      <PageHeader
        title="Walk-in Visitors"
        description="Register unscheduled visitors with photo, ID and instant approval routing."
        actions={
          canRegister ? (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Register Walk-in</Button></DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Walk-in Registration</DialogTitle></DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                  {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`h-7 w-7 grid place-items-center rounded-full text-xs font-semibold ${step > i + 1 ? "bg-success text-success-foreground" : step === i + 1 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                      <div className={`text-xs font-medium ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                      {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-border" />}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    <F label="Visitor Name *" value={form.visitor_name} onChange={(v) => setForm({ ...form, visitor_name: v })} />
                    <F label="Contact *" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
                    <F label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                    <F label="Person to Meet *" value={form.person_to_meet} onChange={(v) => setForm({ ...form, person_to_meet: v })} />
                    <div>
                      <Label className="mb-1.5 block text-xs">Department *</Label>
                      <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v as Department })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <F label="Purpose" value={form.purpose} onChange={(v) => setForm({ ...form, purpose: v })} />
                    <div className="col-span-2">
                      <Label className="mb-1.5 block text-xs">Materials / Items Carried</Label>
                      <Textarea rows={2} value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-panel rounded-xl p-6 text-center">
                      <Camera className="h-12 w-12 text-primary mx-auto mb-3" />
                      <div className="font-semibold text-sm">Visitor Photo</div>
                      <Button size="sm" className="mt-3" onClick={() => toast.success("Photo captured")}>Capture</Button>
                    </div>
                    <div className="glass-panel rounded-xl p-6 text-center">
                      <IdCard className="h-12 w-12 text-primary mx-auto mb-3" />
                      <div className="font-semibold text-sm">ID Proof</div>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.success("ID uploaded")}>Choose File</Button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="glass-panel rounded-xl p-4 text-sm space-y-1">
                    <div><span className="text-muted-foreground">Visitor:</span> <span className="font-medium">{form.visitor_name || "—"}</span></div>
                    <div><span className="text-muted-foreground">Contact:</span> {form.contact || "—"}</div>
                    <div><span className="text-muted-foreground">Person to Meet:</span> {form.person_to_meet || "—"}</div>
                    <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{form.department}</span></div>
                    <div><span className="text-muted-foreground">Materials:</span> {form.materials || "—"}</div>
                    <div><span className="text-muted-foreground">Check-in now:</span> {form.check_in ? "Yes" : "No"}</div>
                    <p className="text-[11px] text-muted-foreground pt-2">Submitting will save to Walk-in History and send an approval request to the {form.department} department.</p>
                  </div>
                )}

                <DialogFooter>
                  {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
                  {step < 3 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
                  {step === 3 && <Button onClick={submit}><Send className="h-4 w-4 mr-1" /> Send Approval</Button>}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Person to Meet</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {walkins.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.visitor_name}</div>
                  <div className="text-xs text-muted-foreground">{v.company} • {v.mobile}</div>
                </TableCell>
                <TableCell className="text-sm">{v.person_to_meet ?? vms.employeeName(v.host_employee)}</TableCell>
                <TableCell className="text-sm">{v.department ?? "—"}</TableCell>
                <TableCell className="text-sm max-w-[220px] truncate">{v.purpose}</TableCell>
                <TableCell className="text-sm">{formatTime(v.created_at)}</TableCell>
                <TableCell><StatusBadge status={v.approval_status} /></TableCell>
                <TableCell><StatusBadge status={v.visit_status} /></TableCell>
              </TableRow>
            ))}
            {walkins.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No walk-ins yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <QRDialog visitor={qrVisitor} onClose={() => setQrVisitor(null)} />
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

function QRDialog({ visitor, onClose }: { visitor: Visitor | null; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visitor) { setDataUrl(""); return; }
    const payload = JSON.stringify({
      id: visitor.id,
      name: visitor.visitor_name,
      company: visitor.company,
      dept: visitor.department,
      host: visitor.person_to_meet,
      ts: visitor.created_at,
    });
    QRCode.toDataURL(payload, { width: 320, margin: 1, errorCorrectionLevel: "M" })
      .then(setDataUrl)
      .catch(() => toast.error("QR generation failed"));
  }, [visitor]);

  if (!visitor) return null;

  const COMPANY_NAME = "Sentinel Enterprises";
  const visitDate = new Date(visitor.created_at);
  const checkInTime = visitor.check_in ? new Date(visitor.check_in) : visitDate;
  const fmtDate = visitDate.toLocaleDateString();
  const fmtCheckIn = checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const downloadImage = async () => {
    if (!dataUrl) return;
    const img = new Image();
    img.src = dataUrl;
    await new Promise((r) => { img.onload = () => r(null); });
    const canvas = document.createElement("canvas");
    const size = 360;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 20, 10, size - 40, size - 40);
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(visitor.visitor_name, size / 2, size + 10);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText(`Visitor ID: ${visitor.id}`, size / 2, size + 32);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `visitor-pass-${visitor.id}.png`;
    a.click();
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a5" });
    doc.setFillColor(10, 110, 209);
    doc.rect(0, 0, 148, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(COMPANY_NAME, 74, 8, { align: "center" });
    doc.setFontSize(10);
    doc.text("Visitor Pass", 74, 14, { align: "center" });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    let y = 28;
    const row = (k: string, v: string) => {
      doc.setFont("helvetica", "bold"); doc.text(k, 15, y);
      doc.setFont("helvetica", "normal"); doc.text(v, 55, y);
      y += 7;
    };
    row("Visitor Name:", visitor.visitor_name);
    row("Visitor ID:", String(visitor.id));
    row("Person to Meet:", visitor.person_to_meet || "-");
    row("Department:", visitor.department || "-");
    row("Visit Date:", fmtDate);
    row("Check-In Time:", fmtCheckIn);

    if (dataUrl) doc.addImage(dataUrl, "PNG", 44, y + 4, 60, 60);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Present this pass at the department for approval.", 74, y + 72, { align: "center" });
    doc.save(`visitor-pass-${visitor.id}.pdf`);
  };

  const printQR = () => {
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) return;
    w.document.write(`
      <html><head><title>Visitor Pass — ${visitor.visitor_name}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body{font-family:Arial,sans-serif;color:#2C3E50;margin:0;padding:24px;}
        .pass{max-width:520px;margin:0 auto;border:2px solid #0A6ED1;border-radius:6px;overflow:hidden;}
        .hdr{background:#0A6ED1;color:#fff;padding:14px;text-align:center;}
        .hdr h1{margin:0;font-size:20px;} .hdr p{margin:4px 0 0;font-size:12px;opacity:.9;}
        .body{padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .row{font-size:13px;} .row b{display:block;font-size:11px;color:#666;text-transform:uppercase;margin-bottom:2px;}
        .qr{grid-column:1/-1;text-align:center;padding-top:10px;border-top:1px dashed #ccc;}
        .qr img{width:220px;height:220px;} .qr .id{font-family:monospace;font-size:11px;color:#666;margin-top:6px;}
        .foot{background:#F5F7FA;padding:8px;text-align:center;font-size:10px;color:#666;}
        @media print { .pass{border-color:#000;} }
      </style></head>
      <body>
        <div class="pass">
          <div class="hdr"><h1>${COMPANY_NAME}</h1><p>Visitor Pass</p></div>
          <div class="body">
            <div class="row"><b>Visitor Name</b>${visitor.visitor_name}</div>
            <div class="row"><b>Visitor ID</b>${visitor.id}</div>
            <div class="row"><b>Person to Meet</b>${visitor.person_to_meet || "-"}</div>
            <div class="row"><b>Department</b>${visitor.department || "-"}</div>
            <div class="row"><b>Visit Date</b>${fmtDate}</div>
            <div class="row"><b>Check-In Time</b>${fmtCheckIn}</div>
            <div class="qr">
              <img src="${dataUrl}" />
              <div class="id">ID: ${visitor.id}</div>
            </div>
          </div>
          <div class="foot">Present this pass at the department for approval.</div>
        </div>
        <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),400);}<\/script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <Dialog open={!!visitor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" /> Visitor QR Generated
          </DialogTitle>
        </DialogHeader>
        <div ref={cardRef} className="border border-border rounded-[3px] p-4 text-center bg-white">
          <div className="text-[13px] font-bold text-[#2C3E50]">{visitor.visitor_name}</div>
          <div className="text-[11px] text-muted-foreground">
            {visitor.company || "—"} · Dept: <span className="font-semibold text-[#0A6ED1]">{visitor.department}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mb-3">Meeting: {visitor.person_to_meet}</div>
          {dataUrl ? (
            <img src={dataUrl} alt="Visitor QR" className="mx-auto w-56 h-56" />
          ) : (
            <div className="w-56 h-56 mx-auto bg-muted animate-pulse rounded" />
          )}
          <div className="mt-2 text-[10px] text-muted-foreground font-mono">ID: {visitor.id}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Show this QR to the {visitor.department} department for approval.
          </div>
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadImage} disabled={!dataUrl}>
            <Download className="h-4 w-4 mr-1" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!dataUrl}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={printQR} disabled={!dataUrl}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
