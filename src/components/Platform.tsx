import catBiobased from "@/assets/cat-biobased.jpg";
import catRecycled from "@/assets/cat-recycled.jpg";
import catEngineered from "@/assets/cat-engineered.jpg";
import catHybrid from "@/assets/cat-hybrid.jpg";

const categories = [
  {
    id: "01",
    name: "Bio-based & Renewable",
    examples: "mycelium · algae · bacterial cellulose · agri-residues",
    image: catBiobased,
    alt: "Macro photograph of mycelium and natural plant fibers",
  },
  {
    id: "02",
    name: "Recycled & Circular",
    examples: "post-consumer · post-industrial · upcycled composites",
    image: catRecycled,
    alt: "Translucent recycled plastic and glass fragments in teal tones",
  },
  {
    id: "03",
    name: "Engineered Sustainable",
    examples: "bioplastics · geopolymers · green concrete · low-C alloys",
    image: catEngineered,
    alt: "Engineered geopolymer and bioplastic composite blocks",
  },
  {
    id: "04",
    name: "Hybrid & Composite",
    examples: "bio-composites · natural-fibre reinforced · mineral-bio",
    image: catHybrid,
    alt: "Iridescent hybrid bio-composite with crystalline minerals",
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
    <section className="relative bg-background py-28 lg:py-36 border-t border-border overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{ background: "var(--gradient-mesh)" }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="max-w-3xl mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Inside the meta-database
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.98] text-balance">
            Four categories.{" "}
            <em className="italic text-primary">One coherent model.</em>
          </h2>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl font-light text-pretty">
            Every material is described through the same five facets —
            so research insights and industrial sourcing draw from a single source of truth.
          </p>
        </div>

        {/* Category grid with rich illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-24">
          {categories.map((c, i) => (
            <article
              key={c.id}
              className="group relative aspect-[4/5] md:aspect-[5/4] rounded-2xl overflow-hidden shadow-medium hover:shadow-xl transition-smooth"
            >
              <img
                src={c.image}
                alt={c.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-[transform] duration-700 ease-out"
              />
              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10 rounded-2xl" />

              {/* Number */}
              <span className="absolute top-6 left-6 text-xs uppercase tracking-[0.25em] text-primary-foreground/80 tabular-nums">
                {c.id} / 04
              </span>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-primary-foreground">
                <h3 className="font-display text-3xl lg:text-4xl leading-tight mb-2 text-balance">
                  {c.name}
                </h3>
                <p className="text-sm text-primary-foreground/80 font-light">
                  {c.examples}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Shared facets */}
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Shared facets — every material, the same lens
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {facets.map((f) => (
              <div key={f.label} className="bg-card p-5 hover:bg-muted/50 transition-smooth">
                <p className="font-display text-lg text-foreground mb-1">{f.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
