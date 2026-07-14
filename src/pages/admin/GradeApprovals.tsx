import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";

type Grade = {
  id: string;
  grade_name: string;
  description: string | null;
  country_of_production: string | null;
  status: string;
  verified_status: string;
  reviewer_notes: string | null;
  created_at: string;
  companies: { company_name: string } | null;
  general_materials: { name: string } | null;
};

export default function GradeApprovals() {
  const [rows, setRows] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("supplier_material_grades")
      .select(
        "id, grade_name, description, country_of_production, status, verified_status, reviewer_notes, created_at, companies(company_name), general_materials(name)"
      )
      .in("status", ["pending", "draft"])
      .order("created_at", { ascending: false });
    setRows((data as unknown as Grade[]) || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string, verified?: string) => {
    setBusy(id);
    const patch: Record<string, unknown> = { status, reviewer_notes: notes[id] ?? null };
    if (verified) patch.verified_status = verified;
    const { error } = await supabase.from("supplier_material_grades").update(patch).eq("id", id);
    setBusy(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Grade ${status}` });
    load();
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Grade approvals</h1>
        <p className="text-muted-foreground mt-1">
          Producer-submitted supplier grades awaiting review.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending grades.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((g) => (
            <Card key={g.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {g.grade_name}{" "}
                      <span className="text-xs text-muted-foreground">
                        · {g.companies?.company_name} · {g.general_materials?.name}
                      </span>
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {g.status}
                      </Badge>
                      {g.country_of_production && (
                        <Badge variant="outline">{g.country_of_production}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {g.description && (
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                )}
                <Textarea
                  placeholder="Reviewer notes (optional)"
                  value={notes[g.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [g.id]: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => update(g.id, "approved", "verified")}
                    disabled={busy === g.id}
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve & verify
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => update(g.id, "approved")}
                    disabled={busy === g.id}
                  >
                    Approve (unverified)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update(g.id, "rejected")}
                    disabled={busy === g.id}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}