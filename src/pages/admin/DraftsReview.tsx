import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, FlaskConical, Check, X } from "lucide-react";

type Draft = {
  id: string;
  material_name: string | null;
  general_material_id: string | null;
  source: string;
  status: string;
  model: string | null;
  generated_payload: Record<string, unknown> | null;
  reviewer_notes: string | null;
  created_at: string;
};

export default function DraftsReview() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_material_drafts")
      .select("*")
      .order("created_at", { ascending: false });
    setDrafts((data as unknown as Draft[]) || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const runAI = async () => {
    if (!query.trim()) return;
    setBusy("ai");
    const { error } = await supabase.functions.invoke("ai-draft-material", {
      body: { material_name: query.trim() },
    });
    setBusy(null);
    if (error) {
      toast({ title: "AI draft failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "AI draft created" });
    setQuery("");
    load();
  };

  const runPubChem = async () => {
    if (!query.trim()) return;
    setBusy("pubchem");
    const { error } = await supabase.functions.invoke("fetch-pubchem", {
      body: { query: query.trim() },
    });
    setBusy(null);
    if (error) {
      toast({ title: "PubChem import failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "PubChem draft created" });
    setQuery("");
    load();
  };

  const apply = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.rpc("apply_material_draft", { _draft_id: id });
    setBusy(null);
    if (error) {
      toast({ title: "Apply failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Applied to canonical material" });
    load();
  };

  const reject = async (id: string) => {
    setBusy(id);
    const { error } = await supabase
      .from("ai_material_drafts")
      .update({ status: "rejected", reviewed_by: (await supabase.auth.getUser()).data.user?.id })
      .eq("id", id);
    setBusy(null);
    if (error) {
      toast({ title: "Reject failed", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Material drafts</h1>
        <p className="text-muted-foreground mt-1">
          Generate proposals from Lovable AI or PubChem, review, then apply to the live database.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New draft</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Material name (e.g. polylactic acid, alumina, PET)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={runAI} disabled={!!busy}>
            {busy === "ai" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Draft with AI
          </Button>
          <Button variant="outline" onClick={runPubChem} disabled={!!busy}>
            {busy === "pubchem" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4 mr-2" />
            )}
            Import PubChem
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No drafts yet.</p>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <Card key={d.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {d.material_name ?? "(unnamed)"}{" "}
                      <span className="text-xs text-muted-foreground">
                        · {new Date(d.created_at).toLocaleString()}
                      </span>
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline">{d.source}</Badge>
                      <Badge
                        variant={d.status === "pending" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {d.status}
                      </Badge>
                      {d.model && <Badge variant="outline">{d.model}</Badge>}
                    </div>
                  </div>
                  {d.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => apply(d.id)}
                        disabled={busy === d.id}
                      >
                        <Check className="h-4 w-4 mr-1" /> Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(d.id)}
                        disabled={busy === d.id}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-72">
                  {JSON.stringify(d.generated_payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}