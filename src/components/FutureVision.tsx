const steps = [
  { label: "Discover", note: "Search verified materials" },
  { label: "Compare", note: "Side-by-side suppliers" },
  { label: "Assess", note: "Environmental impact" },
  { label: "Simulate", note: "Test alternatives" },
  { label: "Report", note: "Decision-ready output" },
  { label: "EPD Ready", note: "Feed straight into EPD/LCA", highlight: true },
];

const FutureVision = () => {
  return (
    <section className="relative bg-background py-28 lg:py-36 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Future vision
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-balance text-foreground">
            From material discovery to{" "}
            <em className="italic text-primary font-normal">
              environmental product declarations.
            </em>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <ol className="relative">
            {steps.map((s, i) => (
              <li key={s.label} className="relative pl-14 pb-8 last:pb-0">
                {/* connector */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] top-10 bottom-0 w-px bg-border"
                  />
                )}
                {/* node */}
                <span
                  className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums border ${
                    s.highlight
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`rounded-xl border px-5 py-4 transition-smooth ${
                    s.highlight
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border"
                  }`}
                >
                  <p className="font-display text-xl text-foreground leading-tight">
                    {s.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="font-display italic text-xl md:text-2xl text-foreground/80 text-center mt-16 max-w-xl mx-auto leading-relaxed">
            "The fastest way to understand the environmental consequences of a material decision."
          </p>
        </div>
      </div>
    </section>
  );
};

export default FutureVision;