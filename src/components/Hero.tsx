import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Minus } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  material: string;
  supplier: string;
  co2: string;
  recycled: string;
  epd: boolean;
  properties: {
    physical: Record<string, string>;
    supplier: Record<string, string>;
    sustainability: Record<string, string>;
    certifications: { label: string; detail: string }[];
  };
};

const sampleRows: Row[] = [
  {
    material: "Mycelium composite",
    supplier: "Ecovative",
    co2: "0.42",
    recycled: "—",
    epd: true,
    properties: {
      physical: {
        Density: "180 kg/m³",
        "Compressive strength": "0.32 MPa",
        "Young's modulus": "18 MPa",
        "Thermal conductivity": "0.04 W/m·K",
        "Processing temp": "28 °C (grown)",
      },
      supplier: {
        Name: "Ecovative",
        Location: "Green Island, NY, USA",
        "Lead time": "4–6 weeks",
        MOQ: "50 panels",
        Form: "Moulded panels & blocks",
        Datasheet: "ecovative-mycocomposite.pdf",
      },
      sustainability: {
        "CO₂e (cradle-to-gate)": "0.42 kg/kg",
        "Recycled content": "—",
        "Biogenic carbon": "0.91 kg/kg stored",
        "End-of-life": "Home compostable",
        "Water use": "1.8 L/kg",
      },
      certifications: [
        { label: "EPD", detail: "EPD International · EN 15804+A2" },
        { label: "USDA Biobased", detail: "100% biobased content" },
        { label: "Cradle to Cradle", detail: "Bronze · v4.0" },
      ],
    },
  },
  {
    material: "rPET pellet",
    supplier: "Indorama",
    co2: "1.35",
    recycled: "98%",
    epd: true,
    properties: {
      physical: {
        Density: "1340 kg/m³",
        "Tensile strength": "55 MPa",
        "Young's modulus": "2.8 GPa",
        "Thermal conductivity": "0.24 W/m·K",
        "Melt temp": "245–260 °C",
      },
      supplier: {
        Name: "Indorama Ventures",
        Location: "Rotterdam, NL",
        "Lead time": "2–3 weeks",
        MOQ: "1 t",
        Form: "Pellets (IV 0.80 dL/g)",
        Datasheet: "indorama-deja-rpet.pdf",
      },
      sustainability: {
        "CO₂e (cradle-to-gate)": "1.35 kg/kg",
        "Recycled content": "98% post-consumer",
        "Biogenic carbon": "—",
        "End-of-life": "Mechanically recyclable",
        "Water use": "6.4 L/kg",
      },
      certifications: [
        { label: "EPD", detail: "EPD Norge · EN 15804+A2" },
        { label: "ISCC PLUS", detail: "Chain of custody verified" },
        { label: "ISO 14001", detail: "Environmental management" },
      ],
    },
  },
  {
    material: "Hemp fibre board",
    supplier: "Hempitecture",
    co2: "0.68",
    recycled: "—",
    epd: false,
    properties: {
      physical: {
        Density: "40 kg/m³",
        "Tensile strength": "0.08 MPa",
        "Young's modulus": "—",
        "Thermal conductivity": "0.038 W/m·K",
        "Service temp": "−40 to 120 °C",
      },
      supplier: {
        Name: "Hempitecture",
        Location: "Jerome, ID, USA",
        "Lead time": "5–7 weeks",
        MOQ: "20 boards",
        Form: "Batt insulation panels",
        Datasheet: "hempitecture-hempwool.pdf",
      },
      sustainability: {
        "CO₂e (cradle-to-gate)": "0.68 kg/kg",
        "Recycled content": "—",
        "Biogenic carbon": "1.62 kg/kg stored",
        "End-of-life": "Compostable / reusable",
        "Water use": "2.1 L/kg",
      },
      certifications: [
        { label: "Declare", detail: "Red List Free" },
        { label: "USDA Biobased", detail: "92% biobased content" },
      ],
    },
  },
  {
    material: "Geopolymer concrete",
    supplier: "Wagners CFT",
    co2: "0.21",
    recycled: "60%",
    epd: true,
    properties: {
      physical: {
        Density: "2400 kg/m³",
        "Compressive strength": "60 MPa (28 d)",
        "Young's modulus": "30 GPa",
        "Thermal conductivity": "1.4 W/m·K",
        "Service temp": "Up to 800 °C",
      },
      supplier: {
        Name: "Wagners CFT",
        Location: "Toowoomba, QLD, Australia",
        "Lead time": "Project-based",
        MOQ: "10 m³",
        Form: "Ready-mix · precast",
        Datasheet: "wagners-efc-concrete.pdf",
      },
      sustainability: {
        "CO₂e (cradle-to-gate)": "0.21 kg/kg",
        "Recycled content": "60% (slag + fly ash)",
        "Biogenic carbon": "—",
        "End-of-life": "Crushable aggregate",
        "Water use": "0.18 L/kg",
      },
      certifications: [
        { label: "EPD", detail: "EPD Australasia · EN 15804+A2" },
        { label: "ISO 14001", detail: "Environmental management" },
        { label: "Global GreenTag", detail: "GreenRate Level A" },
      ],
    },
  },
];

const Hero = () => {
  const [active, setActive] = useState<Row | null>(null);

  return (
    <section className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden bg-background">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-mesh)" }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 py-20 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full glass text-xs uppercase tracking-[0.2em] text-foreground/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Material Sustainability Intelligence
            </div>

            <h1 className="font-display text-[clamp(2.25rem,5.5vw,5rem)] leading-[1.0] text-foreground text-balance mb-6">
              Choose materials with{" "}
              <em className="italic font-normal text-primary">confidence.</em>
            </h1>

            <p className="font-display text-xl md:text-2xl text-foreground/90 italic mb-5 text-pretty">
              Link between material selection and sustainability assessment.
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-light mb-8 text-pretty">
              Discover materials, compare suppliers, assess environmental impacts,
              simulate alternatives and generate decision reports that feed directly
              into your LCA and EPD workflows.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link to="/demo">
                <Button
                  size="lg"
                  className="group rounded-full px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-large hover:shadow-glow transition-smooth text-base"
                >
                  Book a demo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-smooth" />
                </Button>
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium text-foreground/80 hover:text-foreground underline underline-offset-[6px] decoration-foreground/20 hover:decoration-accent transition-smooth px-2"
              >
                Get early access →
              </Link>
            </div>
          </div>

          {/* Right: mock interface */}
          <div className="lg:col-span-6 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-large">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  materialink.ai · materials
                </p>
                <span className="w-10" />
              </div>

              {/* Table */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display text-lg text-foreground">Materials</p>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {sampleRows.length} results
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr className="text-left">
                        <th className="px-3 py-2.5 font-medium">Material</th>
                        <th className="px-3 py-2.5 font-medium">Supplier</th>
                        <th className="px-3 py-2.5 font-medium whitespace-nowrap">CO₂e (kg/kg)</th>
                        <th className="px-3 py-2.5 font-medium">Recycled</th>
                        <th className="px-3 py-2.5 font-medium">EPD</th>
                        <th className="px-3 py-2.5 font-medium text-right">Properties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sampleRows.map((r) => (
                        <tr key={r.material} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-3 font-medium text-foreground">{r.material}</td>
                          <td className="px-3 py-3 text-muted-foreground">{r.supplier}</td>
                          <td className="px-3 py-3 tabular-nums text-foreground">{r.co2}</td>
                          <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.recycled}</td>
                          <td className="px-3 py-3">
                            {r.epd ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                <Check className="w-3 h-3" /> EPD
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
                                <Minus className="w-3 h-3" /> —
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setActive(r)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-border text-[10px] font-medium text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-colors"
                            >
                              View <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Sample · primary supplier data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-b border-border" />

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader className="text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {active.supplier}
                </p>
                <SheetTitle className="font-display text-2xl">
                  {active.material}
                </SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-foreground/80 text-[10px] font-semibold">
                    CO₂e {active.co2} kg/kg
                  </span>
                  {active.recycled !== "—" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-foreground/80 text-[10px] font-semibold">
                      Recycled {active.recycled}
                    </span>
                  )}
                  {active.epd && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      <Check className="w-3 h-3" /> EPD
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="physical" className="mt-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="physical">Physical</TabsTrigger>
                  <TabsTrigger value="supplier">Supplier</TabsTrigger>
                  <TabsTrigger value="sustainability">Sustain.</TabsTrigger>
                  <TabsTrigger value="certs">Certs</TabsTrigger>
                </TabsList>

                <TabsContent value="physical" className="mt-4">
                  <PropList data={active.properties.physical} />
                </TabsContent>
                <TabsContent value="supplier" className="mt-4">
                  <PropList data={active.properties.supplier} />
                </TabsContent>
                <TabsContent value="sustainability" className="mt-4">
                  <PropList data={active.properties.sustainability} />
                </TabsContent>
                <TabsContent value="certs" className="mt-4">
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {active.properties.certifications.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold whitespace-nowrap">
                          <Check className="w-3 h-3" /> {c.label}
                        </span>
                        <span className="text-xs text-muted-foreground text-right">
                          {c.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Primary supplier data · sample
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
};

const PropList = ({ data }: { data: Record<string, string> }) => (
  <dl className="divide-y divide-border rounded-lg border border-border">
    {Object.entries(data).map(([k, v]) => (
      <div key={k} className="flex items-start justify-between gap-4 px-4 py-3">
        <dt className="text-xs text-muted-foreground">{k}</dt>
        <dd className="text-xs font-medium text-foreground text-right tabular-nums">
          {v}
        </dd>
      </div>
    ))}
  </dl>
);

export default Hero;
