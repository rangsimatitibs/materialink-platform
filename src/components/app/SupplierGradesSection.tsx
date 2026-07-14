import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { BadgeCheck, Factory, Loader2 } from "lucide-react";

type Grade = {
  id: string;
  grade_name: string;
  description: string | null;
  country_of_production: string | null;
  production_scale: string | null;
  availability_type: string | null;
  moq: string | null;
  uniqueness: string | null;
  verified_status: string;
  company_id: string;
  companies: {
    id: string;
    company_name: string;
    country: string | null;
    verified_status: string;
  } | null;
};

export default function SupplierGradesSection({ generalMaterialId }: { generalMaterialId: string }) {
  const { user, isPremium } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Grade | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ application: "", quantity: "", timeline: "", message: "" });

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("supplier_material_grades")
        .select(
          "id, grade_name, description, country_of_production, production_scale, availability_type, moq, uniqueness, verified_status, company_id, companies(id, company_name, country, verified_status)"
        )
        .eq("general_material_id", generalMaterialId)
        .eq("status", "approved");
      setGrades((data as unknown as Grade[]) || []);
      setLoading(false);
    })();
  }, [generalMaterialId, isPremium]);

  if (!isPremium) return null;

  const submit = async () => {
    if (!selected || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("introduction_requests").insert({
      user_id: user.id,
      supplier_grade_id: selected.id,
      company_id: selected.company_id,
      application: form.application || null,
      quantity: form.quantity || null,
      timeline: form.timeline || null,
      message: form.message || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Introduction requested", description: "The supplier will be notified." });
    setSelected(null);
    setForm({ application: "", quantity: "", timeline: "", message: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-primary" />
          Supplier grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading suppliers…
          </div>
        ) : grades.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approved supplier grades listed for this material yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grades.map((g) => (
              <div key={g.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{g.grade_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.companies?.company_name ?? "Supplier"}
                    </p>
                  </div>
                  {g.verified_status === "verified" && (
                    <Badge variant="secondary" className="gap-1">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>
                {g.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{g.description}</p>
                )}
                <div className="flex flex-wrap gap-1 pt-1">
                  {g.country_of_production && (
                    <Badge variant="outline">{g.country_of_production}</Badge>
                  )}
                  {g.production_scale && <Badge variant="outline">{g.production_scale}</Badge>}
                  {g.availability_type && <Badge variant="outline">{g.availability_type}</Badge>}
                </div>
                <div className="pt-2">
                  <Dialog
                    open={selected?.id === g.id}
                    onOpenChange={(o) => setSelected(o ? g : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Request introduction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request introduction — {g.grade_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="application">Application</Label>
                          <Input
                            id="application"
                            value={form.application}
                            onChange={(e) => setForm({ ...form, application: e.target.value })}
                            placeholder="e.g. injection-molded housings"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              value={form.quantity}
                              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                              placeholder="e.g. 5 t / month"
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeline">Timeline</Label>
                            <Input
                              id="timeline"
                              value={form.timeline}
                              onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                              placeholder="e.g. Q3 2026"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelected(null)}>
                          Cancel
                        </Button>
                        <Button onClick={submit} disabled={submitting}>
                          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Send request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}