import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Upload } from "lucide-react";

type Props = {
  company: {
    id: string;
    company_name: string;
    country: string | null;
    website: string | null;
    description: string | null;
    sustainability_focus: string | null;
    logo_url: string | null;
  };
  onUpdated: () => void;
};

export default function EditCompanyDialog({ company, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    company_name: company.company_name ?? "",
    country: company.country ?? "",
    website: company.website ?? "",
    description: company.description ?? "",
    sustainability_focus: company.sustainability_focus ?? "",
    logo_url: company.logo_url ?? "",
  });

  const handleLogo = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${company.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("company-logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = await supabase.storage.from("company-logos").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) setForm((f) => ({ ...f, logo_url: data.signedUrl }));
    setUploading(false);
  };

  const submit = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("update_own_company", {
      _company_id: company.id,
      _company_name: form.company_name,
      _country: form.country || null,
      _website: form.website || null,
      _description: form.description || null,
      _sustainability_focus: form.sustainability_focus || null,
      _logo_url: form.logo_url || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Company updated" });
    setOpen(false);
    onUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4 mr-1" /> Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit company profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Company name</Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Sustainability focus</Label>
            <Textarea
              value={form.sustainability_focus}
              onChange={(e) => setForm({ ...form, sustainability_focus: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="Logo preview"
                  className="h-12 w-12 rounded object-contain border"
                />
              )}
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer border rounded-md px-3 py-2 hover:bg-muted">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{uploading ? "Uploading…" : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogo(f);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}