import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Minus } from "lucide-react";

const sampleRows = [
  {
    material: "Mycelium composite",
    supplier: "Ecovative",
    co2: "0.42",
    recycled: "—",
    epd: true,
  },
  {
    material: "rPET pellet",
    supplier: "Indorama",
    co2: "1.35",
    recycled: "98%",
    epd: true,
  },
  {
    material: "Hemp fibre board",
    supplier: "Hempitecture",
    co2: "0.68",
    recycled: "—",
    epd: false,
  },
  {
    material: "Geopolymer concrete",
    supplier: "Wagners CFT",
    co2: "0.21",
    recycled: "60%",
    epd: true,
  },
];

const Hero = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden bg-background">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-mesh)" }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 py-20 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full glass text-xs uppercase tracking-[0.2em] text-foreground/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Material Sustainability Intelligence
            </div>

            <h1 className="font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] text-foreground text-balance mb-8">
              Choose materials with{" "}
              <em className="italic font-normal text-primary">confidence.</em>
            </h1>

            <p className="font-display text-2xl md:text-3xl text-foreground/90 italic mb-6 text-pretty">
              Link between material selection and sustainability assessment.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light mb-10 text-pretty">
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
          <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
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
    </section>
  );
};

export default Hero;
