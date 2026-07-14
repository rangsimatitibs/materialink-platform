import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "fk"
  | "fk-poly"
  | "json"
  | "date";

export type CrudField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  fkTable?: string;
  fkLabelKey?: string;
  fkSecondaryKey?: string;
  polyMap?: Record<string, { table: string; labelKey: string }>;
  dependsOn?: string;
  helpText?: string;
  hideInList?: boolean;
  defaultValue?: unknown;
};

export type CrudConfig = {
  table: string;
  title: string;
  singular: string;
  orderBy?: string;
  orderAsc?: boolean;
  listColumns: string[];
  fields: CrudField[];
};

type Row = Record<string, unknown>;

function emptyRow(fields: CrudField[]): Row {
  const r: Row = {};
  fields.forEach((f) => {
    if (f.defaultValue !== undefined) r[f.key] = f.defaultValue;
    else if (f.type === "boolean") r[f.key] = false;
    else r[f.key] = "";
  });
  return r;
}

function displayValue(f: CrudField, v: unknown, fkMaps: Record<string, Record<string, string>>) {
  if (v === null || v === undefined || v === "") return "—";
  if (f.type === "boolean") return v ? "Yes" : "No";
  if (f.type === "json") return <code className="text-xs">{JSON.stringify(v).slice(0, 60)}</code>;
  if (f.type === "fk") {
    const map = fkMaps[f.key] || {};
    return map[String(v)] || String(v).slice(0, 8);
  }
  if (f.type === "fk-poly") return String(v).slice(0, 8);
  const s = String(v);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

export default function CrudPage({ config }: { config: CrudConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fkOptions, setFkOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [fkMaps, setFkMaps] = useState<Record<string, Record<string, string>>>({});

  const fetchRows = async () => {
    setLoading(true);
    const q = supabase.from(config.table as never).select("*");
    if (config.orderBy) q.order(config.orderBy, { ascending: config.orderAsc ?? false });
    const { data, error } = await q;
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  // Pre-load fk options
  useEffect(() => {
    (async () => {
      const opts: Record<string, { value: string; label: string }[]> = {};
      const maps: Record<string, Record<string, string>> = {};
      for (const f of config.fields) {
        if (f.type === "fk" && f.fkTable && f.fkLabelKey) {
          const cols = ["id", f.fkLabelKey, f.fkSecondaryKey].filter(Boolean).join(",");
          const { data } = await supabase.from(f.fkTable as never).select(cols).limit(500);
          const list = ((data as Row[]) || []).map((r) => {
            const primary = String(r[f.fkLabelKey!] ?? "");
            const secondary = f.fkSecondaryKey ? String(r[f.fkSecondaryKey!] ?? "") : "";
            return {
              value: String(r.id),
              label: secondary ? `${primary} (${secondary})` : primary || String(r.id).slice(0, 8),
            };
          });
          opts[f.key] = list;
          maps[f.key] = Object.fromEntries(list.map((o) => [o.value, o.label]));
        }
        if (f.type === "fk-poly" && f.polyMap) {
          for (const [k, cfg] of Object.entries(f.polyMap)) {
            const key = `${f.key}::${k}`;
            const { data } = await supabase.from(cfg.table as never).select(`id, ${cfg.labelKey}`).limit(500);
            const list = ((data as Row[]) || []).map((r) => ({
              value: String(r.id),
              label: String(r[cfg.labelKey] ?? String(r.id).slice(0, 8)),
            }));
            opts[key] = list;
          }
        }
      }
      setFkOptions(opts);
      setFkMaps(maps);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => v && String(v).toLowerCase().includes(s))
    );
  }, [rows, search]);

  const openNew = () => {
    setEditing(emptyRow(config.fields));
    setDialogOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing({ ...row });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);

    // Normalize payload
    const payload: Row = {};
    for (const f of config.fields) {
      let v = editing[f.key];
      if (v === "" || v === undefined) {
        if (f.required) {
          toast({ title: `${f.label} is required`, variant: "destructive" });
          setSaving(false);
          return;
        }
        v = null;
      }
      if (v !== null) {
        if (f.type === "number") v = Number(v);
        if (f.type === "json") {
          try {
            v = typeof v === "string" ? JSON.parse(v) : v;
          } catch {
            toast({ title: `${f.label} must be valid JSON`, variant: "destructive" });
            setSaving(false);
            return;
          }
        }
      }
      payload[f.key] = v;
    }

    const isEdit = !!editing.id;
    const q = isEdit
      ? supabase.from(config.table as never).update(payload as never).eq("id", editing.id as string)
      : supabase.from(config.table as never).insert(payload as never);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? "Updated" : "Created" });
    setDialogOpen(false);
    setEditing(null);
    fetchRows();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(config.table as never).delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    fetchRows();
  };

  const renderField = (f: CrudField) => {
    if (!editing) return null;
    const value = editing[f.key];
    const setVal = (v: unknown) => setEditing({ ...editing, [f.key]: v });
    switch (f.type) {
      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => setVal(e.target.value)}
            rows={4}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => setVal(e.target.value)}
          />
        );
      case "boolean":
        return (
          <Switch checked={!!value} onCheckedChange={(c) => setVal(c)} />
        );
      case "date":
        return (
          <Input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => setVal(e.target.value)}
          />
        );
      case "select":
        return (
          <Select value={(value as string) ?? ""} onValueChange={setVal}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {f.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "fk":
        return (
          <Select value={(value as string) ?? ""} onValueChange={setVal}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(fkOptions[f.key] || []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "fk-poly": {
        const dep = f.dependsOn ? (editing[f.dependsOn] as string) : "";
        const list = fkOptions[`${f.key}::${dep}`] || [];
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={setVal}
            disabled={!dep}
          >
            <SelectTrigger>
              <SelectValue placeholder={dep ? "Select…" : "Choose type first"} />
            </SelectTrigger>
            <SelectContent>
              {list.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      case "json":
        return (
          <Textarea
            value={
              typeof value === "string"
                ? value
                : value
                ? JSON.stringify(value, null, 2)
                : ""
            }
            onChange={(e) => setVal(e.target.value)}
            rows={6}
            className="font-mono text-xs"
          />
        );
      default:
        return (
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => setVal(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> New {config.singular}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? `Edit ${config.singular}` : `New ${config.singular}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {config.fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label>
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {renderField(f)}
                  {f.helpText && (
                    <p className="text-xs text-muted-foreground">{f.helpText}</p>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Filter…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          {rows.length === 0 ? `No ${config.title.toLowerCase()} yet.` : "No matches."}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {config.listColumns.map((k) => {
                  const f = config.fields.find((x) => x.key === k);
                  return <TableHead key={k}>{f?.label ?? k}</TableHead>;
                })}
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id as string}>
                  {config.listColumns.map((k) => {
                    const f = config.fields.find((x) => x.key === k);
                    return (
                      <TableCell key={k} className="align-top">
                        {f ? (
                          displayValue(f, r[k], fkMaps)
                        ) : r[k] ? (
                          <Badge variant="secondary">{String(r[k])}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this {config.singular}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(r.id as string)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}