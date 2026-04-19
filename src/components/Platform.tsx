const categories = [
  {
    id: "01",
    name: "Bio-based & Renewable",
    examples: "mycelium · algae · bacterial cellulose · agri-residues",
  },
  {
    id: "02",
    name: "Recycled & Circular",
    examples: "post-consumer · post-industrial · upcycled composites",
  },
  {
    id: "03",
    name: "Engineered Sustainable",
    examples: "bioplastics · geopolymers · green concrete · low-C alloys",
  },
  {
    id: "04",
    name: "Hybrid & Composite",
    examples: "bio-composites · natural-fibre reinforced · mineral-bio",
  },
];

const facets = [
  { label: "Identity", note: "name · synonyms · TRL" },
  { label: "Properties", note: "mechanical · thermal · chemical" },
  { label: "Sourcing", note: "suppliers · MOQ · certifications" },
  { label: "Sustainability", note: "LCA · CO₂e · end-of-life" },
  { label: "Provenance", note: "citations · lab recipes · contributors" },
];

const Platform = () => {
  return (
    <section className="bg-background py-28 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Inside the meta-database
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-[1.05] mb-6">
              Four categories.<br />
              <em className="italic text-primary">One coherent model.</em>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-light max-w-md">
              Every material is described through the same five facets, so research
              insights and industrial sourcing draw from a single source of truth.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <div className="divide-y divide-border border-t border-border">
              {categories.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-4 py-6 items-baseline">
                  <div className="col-span-2 text-sm tabular-nums text-muted-foreground">{c.id}</div>
                  <div className="col-span-10 md:col-span-5 font-display text-2xl text-foreground">
                    {c.name}
                  </div>
                  <div className="col-span-12 md:col-span-5 text-sm text-muted-foreground font-light">
                    {c.examples}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Shared facets
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {facets.map((f) => (
                  <div key={f.label} className="text-sm">
                    <span className="text-foreground">{f.label}</span>
                    <span className="text-muted-foreground"> — {f.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
