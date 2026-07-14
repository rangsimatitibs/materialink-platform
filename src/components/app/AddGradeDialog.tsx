import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

type MaterialOption = { id: string; name: string };

export default function AddGradeDialog({
  companyId,
  onCreated,
}: {
  companyId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [form, setForm] = useState({
    general_material_id: "",
    grade_name: "",
    description: "",
    country_of_production: "",
    production_scale: "",
    availability_type: "",
    moq: "",
    uniqueness: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("general_materials")
        .select("id, name")
        .eq("status", "published")
        .order("name");
      setMaterials((data as MaterialOption[]) || []);
    })();
  }, [open]);

  const submit = async () => {
    if (!form.general_material_id || !form.grade_name) {
      toast({ title: "Material and grade name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("supplier_material_grades").insert({
      company_id: companyId,
      general_material_id: form.general_material_id,
      grade_name: form.grade_name,
      description: form.description || null,
      country_of_production: form.country_of_production || null,
      production_scale: form.production_scale || null,
      availability_type: form.availability_type || null,
      moq: form.moq || null,
      uniqueness: form.uniqueness || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not submit grade", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Grade submitted for review" });
    setForm({
      general_material_id: "",
      grade_name: "",
      description: "",
      country_of_production: "",
      production_scale: "",
      availability_type: "",
      moq: "",
      uniqueness: "",
    });
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" /> Add grade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a new grade</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Material</Label>
            <Select
              value={form.general_material_id}
              onValueChange={(v) => setForm({ ...form, general_material_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Grade name</Label>
            <Input
              value={form.grade_name}
              onChange={(e) => setForm({ ...form, grade_name: e.target.value })}
              placeholder="e.g. Ecovio F 2224"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Country of production</Label>
              <Input
                value={form.country_of_production}
                onChange={(e) => setForm({ ...form, country_of_production: e.target.value })}
              />
            </div>
            <div>
              <Label>Production scale</Label>
              <Input
                value={form.production_scale}
                onChange={(e) => setForm({ ...form, production_scale: e.target.value })}
                placeholder="pilot / industrial"
              />
            </div>
            <div>
              <Label>Availability</Label>
              <Input
                value={form.availability_type}
                onChange={(e) => setForm({ ...form, availability_type: e.target.value })}
                placeholder="on-demand / stock"
              />
            </div>
            <div>
              <Label>MOQ</Label>
              <Input
                value={form.moq}
                onChange={(e) => setForm({ ...form, moq: e.target.value })}
                placeholder="e.g. 1 t"
              />
            </div>
          </div>
          <div>
            <Label>Uniqueness</Label>
            <Textarea
              value={form.uniqueness}
              onChange={(e) => setForm({ ...form, uniqueness: e.target.value })}
              rows={2}
              placeholder="What sets this grade apart?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}