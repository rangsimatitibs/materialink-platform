import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import SupplierGradesSection from "@/components/app/SupplierGradesSection";

type Material = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  chemical_formula: string | null;
  chemical_structure_url: string | null;
  sustainability_summary: string | null;
  end_of_life_summary: string | null;
  production_scale_maturity: string | null;
  data_confidence: string | null;
  category_id: string | null;
};

type Property = {
  id: string;
  property_name: string;
  value_min: number | null;
  value_max: number | null;
  exact_value: number | null;
  unit: string | null;
  test_standard: string | null;
  confidence_level: string | null;
};

type NamedLink = { id: string; name: string };

function formatValue(p: Property) {
  if (p.exact_value !== null) return `${p.exact_value}`;
  if (p.value_min !== null && p.value_max !== null) return `${p.value_min} – ${p.value_max}`;
  if (p.value_min !== null) return `≥ ${p.value_min}`;
  if (p.value_max !== null) return `≤ ${p.value_max}`;
  return "—";
}

export default function MaterialProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<NamedLink[]>([]);
  const [regulations, setRegulations] = useState<NamedLink[]>([]);
  const [certifications, setCertifications] = useState<NamedLink[]>([]);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sustainability, setSustainability] = useState<{
    bio_based_content: number | null;
    recycled_content: number | null;
    carbon_footprint_value: number | null;
    carbon_footprint_unit: string | null;
    lca_available: boolean | null;
    epd_available: boolean | null;
    notes: string | null;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: m } = await supabase
        .from("general_materials")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!m) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setMaterial(m as Material);

      const [props, apps, regs, certs, syns, tgs, sust] = await Promise.all([
        supabase
          .from("material_properties")
          .select("*")
          .eq("owner_type", "general_material")
          .eq("owner_id", m.id),
        supabase
          .from("material_applications")
          .select("application_id, applications(id, name)")
          .eq("owner_type", "general_material")
          .eq("owner_id", m.id),
        supabase
          .from("material_regulations")
          .select("regulation_id, regulations(id, name)")
          .eq("owner_type", "general_material")
          .eq("owner_id", m.id),
        supabase
          .from("material_certifications")
          .select("certification_id, certifications(id, name)")
          .eq("owner_type", "general_material")
          .eq("owner_id", m.id),
        supabase
          .from("general_material_synonyms")
          .select("synonym")
          .eq("material_id", m.id),
        supabase
          .from("general_material_tags")
          .select("tag")
          .eq("material_id", m.id),
        supabase
          .from("sustainability_indicators")
          .select("*")
          .eq("owner_type", "general_material")
          .eq("owner_id", m.id)
          .maybeSingle(),
      ]);

      setProperties((props.data as Property[]) || []);
      setApplications(
        ((apps.data as { applications: NamedLink }[]) || [])
          .map((r) => r.applications)
          .filter(Boolean)
      );
      setRegulations(
        ((regs.data as { regulations: NamedLink }[]) || [])
          .map((r) => r.regulations)
          .filter(Boolean)
      );
      setCertifications(
        ((certs.data as { certifications: NamedLink }[]) || [])
          .map((r) => r.certifications)
          .filter(Boolean)
      );
      setSynonyms(((syns.data as { synonym: string }[]) || []).map((r) => r.synonym));
      setTags(((tgs.data as { tag: string }[]) || []).map((r) => r.tag));
      setSustainability((sust.data as typeof sustainability) ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !material) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="font-display text-3xl">Material not found</h1>
            <p className="text-muted-foreground">This material may be unpublished or removed.</p>
            <Link to="/app/search">
              <Button variant="outline">Back to search</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <Link
            to="/app/search"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>

          <header className="space-y-3">
            <h1 className="font-display text-4xl tracking-tight text-foreground">
              {material.name}
            </h1>
            {material.chemical_formula && (
              <p className="font-mono text-muted-foreground">{material.chemical_formula}</p>
            )}
            {material.short_description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {material.short_description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {material.data_confidence && (
                <Badge variant="secondary" className="capitalize">
                  {material.data_confidence.replace("_", " ")} confidence
                </Badge>
              )}
              {tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
            {synonyms.length > 0 && (
              <p className="text-xs text-muted-foreground pt-2">
                Also known as: {synonyms.join(", ")}
              </p>
            )}
          </header>

          {properties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Typical properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-baseline justify-between gap-4 border-b pb-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.property_name}</p>
                        {p.test_standard && (
                          <p className="text-xs text-muted-foreground">{p.test_standard}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {formatValue(p)} {p.unit ?? ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Common applications</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {applications.map((a) => (
                  <Badge key={a.id} variant="secondary">
                    {a.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {(material.sustainability_summary || sustainability) && (
            <Card>
              <CardHeader>
                <CardTitle>Sustainability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {material.sustainability_summary && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {material.sustainability_summary}
                  </p>
                )}
                {sustainability && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    {sustainability.bio_based_content !== null && (
                      <Metric label="Bio-based" value={`${sustainability.bio_based_content}%`} />
                    )}
                    {sustainability.recycled_content !== null && (
                      <Metric label="Recycled" value={`${sustainability.recycled_content}%`} />
                    )}
                    {sustainability.carbon_footprint_value !== null && (
                      <Metric
                        label="Carbon footprint"
                        value={`${sustainability.carbon_footprint_value} ${sustainability.carbon_footprint_unit ?? ""}`}
                      />
                    )}
                    {sustainability.lca_available && <Metric label="LCA" value="Available" />}
                    {sustainability.epd_available && <Metric label="EPD" value="Available" />}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {material.end_of_life_summary && (
            <Card>
              <CardHeader>
                <CardTitle>End of life</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {material.end_of_life_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {(regulations.length > 0 || certifications.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {regulations.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Regulations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {regulations.map((r) => (
                        <Badge key={r.id} variant="outline">
                          {r.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {certifications.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((c) => (
                        <Badge key={c.id} variant="outline">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}