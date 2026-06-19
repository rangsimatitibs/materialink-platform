import { Search, Scale, CheckCircle2 } from "lucide-react";

const cards = [
  {
    icon: Search,
    title: "Discover",
    body: "Find innovative and sustainable materials from verified suppliers.",
  },
  {
    icon: Scale,
    title: "Evaluate",
    body: "Compare environmental impacts, technical properties, and sustainability metrics.",
  },
  {
    icon: CheckCircle2,
    title: "Decide",
    body: "Generate decision-ready insights and feed directly into LCA and EPD workflows.",
  },
];

const WhyMaterialink = () => {
  return (
    <section className="relative bg-background py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Why MateriaLink?
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-balance text-foreground">
            Three steps from search to{" "}
            <em className="italic text-primary font-normal">sustainable decision.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:shadow-large transition-smooth"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground tabular-nums">
                  0{i + 1} / 03
                </span>
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMaterialink;