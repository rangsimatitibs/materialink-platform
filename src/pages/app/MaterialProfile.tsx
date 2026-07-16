import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Atom,
  Leaf,
  Award,
  Factory,
  Lock,
  FileText,
  FlaskConical,
  Wrench,
  ShieldAlert,
  Database,
  Sparkles,
} from "lucide-react";
import SupplierGradesSection from "@/components/app/SupplierGradesSection";
import { useAuth } from "@/contexts/AuthContext";

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

function Formula({ formula }: { formula: string }) {
  // Split into runs of letters/parens vs digits so digits render as subscripts
  const parts = formula.split(/(\d+)/g);
  return (
    <span className="font-mono">
      {parts.map((p, i) =>
        /^\d+$/.test(p) ? (
          <sub key={i} className="text-[0.75em]">
            {p}
          </sub>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

type Group = "physical" | "mechanical" | "safety" | "other";
function groupOf(name: string): Group {
  const n = name.toLowerCase();
  if (
    /(tensile|modulus|elong|flex|impact|hardness|shear|compress|yield|strain|stress|toughness)/.test(
      n
    )
  )
    return "mechanical";
  if (
    /(toxic|flamm|hazard|voc|migration|food contact|ld50|carcinog|reach|hazmat)/.test(n)
  )
    return "safety";
  if (
    /(density|melt|glass transition|boil|viscosity|biodegrad|water|moisture|thermal|expansion|conductiv|refractive|solub|mass|logp)/.test(
      n
    )
  )
    return "physical";
  return "other";
}

function sustainabilityScore(s: {
  bio_based_content: number | null;
  recycled_content: number | null;
  lca_available: boolean | null;
  epd_available: boolean | null;
} | null) {
  if (!s) return null;
  const bio = s.bio_based_content ?? 0;
  const rec = s.recycled_content ?? 0;
  const doc = (s.lca_available ? 10 : 0) + (s.epd_available ? 10 : 0);
  const raw = Math.round(Math.min(100, bio * 0.5 + rec * 0.5 + doc));
  return raw > 0 ? raw : null;
}

export default function MaterialProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { isPremium } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<NamedLink[]>([]);
  const [regulations, setRegulations] = useState<NamedLink[]>([]);
  const [certifications, setCertifications] = useState<NamedLink[]>([]);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(true);
  const [gradeCount, setGradeCount] = useState(0);
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

      const { count } = await supabase
        .from("supplier_material_grades")
        .select("id", { count: "exact", head: true })
        .eq("general_material_id", m.id)
        .eq("status", "approved");
      setGradeCount(count ?? 0);

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
        <div className="max-w-5xl mx-auto space-y-6">
          <Link
            to="/app/search"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>

          <MaterialHeaderCard
            material={material}
            synonyms={synonyms}
            tags={tags}
            applications={applications}
            regulations={regulations}
            certifications={certifications}
            sustainabilityScore={sustainabilityScore(sustainability)}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails((v) => !v)}
            isPremium={!!isPremium}
          />

          <Tabs defaultValue="properties" className="space-y-4">
            <TabsList className="bg-transparent p-0 gap-2 h-auto">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border px-5 py-2"
              >
                Material Properties
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border px-5 py-2 gap-2"
                disabled={!isPremium}
              >
                <Factory className="h-4 w-4" />
                Find Suppliers ({gradeCount})
                {!isPremium && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-4">
              <MaterialPropertiesView
                material={material}
                properties={properties}
                sustainability={sustainability}
              />
            </TabsContent>

            <TabsContent value="suppliers" className="mt-4">
              {isPremium ? (
                <SupplierGradesSection generalMaterialId={material.id} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center space-y-2">
                    <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="font-medium">Supplier discovery is a premium feature</p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to see verified supplier grades and request introductions.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MaterialHeaderCard({
  material,
  synonyms,
  tags,
  applications,
  regulations,
  certifications,
  sustainabilityScore,
  showDetails,
  onToggleDetails,
  isPremium,
}: {
  material: Material;
  synonyms: string[];
  tags: string[];
  applications: NamedLink[];
  regulations: NamedLink[];
  certifications: NamedLink[];
  sustainabilityScore: number | null;
  showDetails: boolean;
  onToggleDetails: () => void;
  isPremium: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
                {material.name}
              </h1>
              <Badge className="rounded-full bg-orange-500/15 text-orange-600 border-transparent hover:bg-orange-500/20">
                Material
              </Badge>
            </div>
            {synonyms.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">Also known as:</span>{" "}
                {synonyms.join(", ")}
              </p>
            )}
            {material.chemical_formula && (
              <div className="inline-flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm">
                <Atom className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Formula:</span>{" "}
                <Formula formula={material.chemical_formula} />
              </div>
            )}
          </div>
          {sustainabilityScore !== null && (
            <div className="text-right shrink-0">
              <p className="text-sm text-muted-foreground">Sustainability</p>
              <p className="font-display text-4xl md:text-5xl text-primary font-semibold">
                {sustainabilityScore}%
              </p>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="space-y-4 pt-2">
            {tags.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="rounded-full border-primary/40 text-primary bg-primary/5 gap-1"
                    >
                      <Leaf className="h-3 w-3" /> {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Applications:</p>
                  <div className="flex flex-wrap gap-2">
                    {applications.map((a) => (
                      <Badge
                        key={a.id}
                        variant="secondary"
                        className="rounded-full bg-primary/10 text-primary hover:bg-primary/15"
                      >
                        {a.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(regulations.length > 0 || certifications.length > 0) && (
                <div>
                  <p className="font-medium text-sm mb-2">Regulations:</p>
                  <div className="flex flex-wrap gap-2">
                    {[...regulations, ...certifications].map((r) => (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className="rounded-full gap-1"
                      >
                        <Award className="h-3 w-3 text-primary" /> {r.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <Button
            variant={showDetails ? "default" : "outline"}
            onClick={onToggleDetails}
            className="w-full"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
          <Button variant="outline" disabled className="w-full gap-2 justify-between">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" /> Advanced Data Sheet
            </span>
            <Badge variant="secondary" className="rounded-full">
              {isPremium ? "Coming soon" : "Premium"}
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MaterialPropertiesView({
  material,
  properties,
  sustainability,
}: {
  material: Material;
  properties: Property[];
  sustainability: {
    bio_based_content: number | null;
    recycled_content: number | null;
    carbon_footprint_value: number | null;
    carbon_footprint_unit: string | null;
    lca_available: boolean | null;
    epd_available: boolean | null;
    notes: string | null;
  } | null;
}) {
  const physical = properties.filter((p) => groupOf(p.property_name) === "physical");
  const mechanical = properties.filter((p) => groupOf(p.property_name) === "mechanical");
  const safety = properties.filter((p) => groupOf(p.property_name) === "safety");
  const other = properties.filter((p) => groupOf(p.property_name) === "other");

  const hasDescription =
    !!material.short_description ||
    !!material.sustainability_summary ||
    !!material.end_of_life_summary;

  const defaultOpen = [
    hasDescription ? "description" : null,
    physical.length ? "physical" : null,
  ].filter(Boolean) as string[];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Material Properties</h2>
        </div>

        <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-3">
          {hasDescription && (
            <PropertyGroup id="description" icon={<FileText className="h-4 w-4 text-primary" />} title="Description" count={1}>
              <div className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  {material.data_confidence === "ai_generated" ? (
                    <SourceBadge kind="ai" />
                  ) : (
                    <SourceBadge kind="local" />
                  )}
                </div>
                {material.short_description && (
                  <p className="text-sm font-medium leading-relaxed">
                    {material.short_description}
                  </p>
                )}
                {material.sustainability_summary && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {material.sustainability_summary}
                  </p>
                )}
                {material.end_of_life_summary && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    <span className="font-medium text-foreground/80">End of life: </span>
                    {material.end_of_life_summary}
                  </p>
                )}
              </div>
            </PropertyGroup>
          )}

          {physical.length > 0 && (
            <PropertyGroup id="physical" icon={<FlaskConical className="h-4 w-4 text-primary" />} title="Physical Properties" count={physical.length}>
              <PropertyGrid items={physical} />
            </PropertyGroup>
          )}

          {mechanical.length > 0 && (
            <PropertyGroup id="mechanical" icon={<Wrench className="h-4 w-4 text-primary" />} title="Mechanical Properties" count={mechanical.length}>
              <PropertyGrid items={mechanical} />
            </PropertyGroup>
          )}

          {safety.length > 0 && (
            <PropertyGroup id="safety" icon={<ShieldAlert className="h-4 w-4 text-primary" />} title="Safety & Hazards" count={safety.length}>
              <PropertyGrid items={safety} />
            </PropertyGroup>
          )}

          {other.length > 0 && (
            <PropertyGroup id="other" icon={<Sparkles className="h-4 w-4 text-primary" />} title="Other Properties" count={other.length}>
              <PropertyGrid items={other} />
            </PropertyGroup>
          )}

          {sustainability && (
            <PropertyGroup id="sustainability" icon={<Leaf className="h-4 w-4 text-primary" />} title="Sustainability" count={
              [sustainability.bio_based_content, sustainability.recycled_content, sustainability.carbon_footprint_value].filter((v) => v !== null && v !== undefined).length
              + (sustainability.lca_available ? 1 : 0) + (sustainability.epd_available ? 1 : 0)
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sustainability.bio_based_content !== null && (
                  <PropertyCard name="Bio-based content" value={`${sustainability.bio_based_content}%`} source="local" />
                )}
                {sustainability.recycled_content !== null && (
                  <PropertyCard name="Recycled content" value={`${sustainability.recycled_content}%`} source="local" />
                )}
                {sustainability.carbon_footprint_value !== null && (
                  <PropertyCard
                    name="Carbon footprint"
                    value={`${sustainability.carbon_footprint_value} ${sustainability.carbon_footprint_unit ?? ""}`}
                    source="local"
                  />
                )}
                {sustainability.lca_available && (
                  <PropertyCard name="LCA" value="Available" source="local" />
                )}
                {sustainability.epd_available && (
                  <PropertyCard name="EPD" value="Available" source="local" />
                )}
              </div>
            </PropertyGroup>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function PropertyGroup({
  id,
  icon,
  title,
  count,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
            {icon}
          </span>
          <span className="font-semibold">{title}</span>
          <Badge className="rounded-full bg-orange-500/15 text-orange-600 border-transparent hover:bg-orange-500/20">
            {count}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

function PropertyGrid({ items }: { items: Property[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((p) => (
        <PropertyCard
          key={p.id}
          name={p.property_name}
          value={`${formatValue(p)}${p.unit ? " " + p.unit : ""}`}
          hint={p.test_standard ?? undefined}
          source={p.confidence_level === "ai_generated" ? "ai" : "local"}
        />
      ))}
    </div>
  );
}

function PropertyCard({
  name,
  value,
  hint,
  source,
}: {
  name: string;
  value: string;
  hint?: string;
  source: "local" | "ai";
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{name}</p>
        <SourceBadge kind={source} />
      </div>
      <p className="text-base font-semibold mt-2">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function SourceBadge({ kind }: { kind: "local" | "ai" }) {
  if (kind === "ai") {
    return (
      <Badge
        variant="outline"
        className="rounded-full gap-1 border-orange-400/40 text-orange-600 bg-orange-500/10"
      >
        <Sparkles className="h-3 w-3" /> AI Generated
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-full gap-1 border-primary/40 text-primary bg-primary/10"
    >
      <Database className="h-3 w-3" /> Local
    </Badge>
  );
}