import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";

type Material = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  data_confidence: string | null;
  chemical_formula: string | null;
};

export default function Search() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("general_materials")
        .select("id, name, slug, short_description, data_confidence, chemical_formula")
        .eq("status", "published")
        .order("name", { ascending: true });
      setMaterials((data as Material[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return materials;
    const s = q.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        (m.short_description ?? "").toLowerCase().includes(s) ||
        (m.chemical_formula ?? "").toLowerCase().includes(s)
    );
  }, [materials, q]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-foreground">
              Materials database
            </h1>
            <p className="text-muted-foreground mt-2">
              General material profiles with typical property ranges and sustainability notes.
            </p>
          </div>

          <Input
            placeholder="Search by name, description, or formula…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xl"
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border rounded-lg">
              {materials.length === 0
                ? "No materials in the database yet."
                : "No matches for your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((m) => (
                <Link key={m.id} to={`/app/materials/${m.slug}`}>
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-xl">{m.name}</CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                      {m.chemical_formula && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {m.chemical_formula}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {m.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {m.short_description}
                        </p>
                      )}
                      {m.data_confidence && (
                        <Badge variant="secondary" className="capitalize">
                          {m.data_confidence.replace("_", " ")}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}