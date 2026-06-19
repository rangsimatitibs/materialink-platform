import { ArrowRight, Search, Building2, Leaf, FileCheck, Sparkles, Recycle, BadgeCheck } from "lucide-react";

const Step = ({
  icon: Icon,
  label,
  tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "muted" | "primary";
}) => (
  <div
    className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border min-w-[120px] text-center ${
      tone === "primary"
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card text-card-foreground border-border"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium leading-tight">{label}</span>
  </div>
);

const Arrow = () => (
  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
);

const WorkflowComparison = () => {
  return (
    <section className="relative bg-background py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Why MateriaLink
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-balance text-foreground">
            Skip the hand-offs.{" "}
            <em className="italic text-primary font-normal">
              Decide with impact data from the start.
            </em>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground font-light max-w-xl">
            Traditional material selection treats sustainability as a downstream
            audit. MateriaLink builds environmental intelligence directly into the
            search.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current workflow */}
          <div className="rounded-2xl border border-border bg-muted/30 p-8">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Today's workflow
              </p>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Fragmented
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Step icon={Search} label="Material search" />
              <Arrow />
              <Step icon={Building2} label="Supplier search" />
              <Arrow />
              <Step icon={Leaf} label="LCA consultant" />
              <Arrow />
              <Step icon={FileCheck} label="Report" />
            </div>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
              Weeks of back-and-forth across disconnected tools and external
              consultants before any environmental insight reaches the decision.
            </p>
          </div>

          {/* MateriaLink workflow */}
          <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-large relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-40 -z-0"
              style={{
                background:
                  "radial-gradient(ellipse at 100% 0%, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  MateriaLink
                </p>
                <span className="text-[10px] uppercase tracking-wider text-primary/70">
                  Unified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Step icon={Search} label="Material search" tone="primary" />
                <Arrow />
                <Step icon={Leaf} label="Environmental impact" tone="primary" />
                <Arrow />
                <Step icon={Sparkles} label="Decision" tone="primary" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Building2, label: "Suppliers" },
                  { icon: Leaf, label: "Carbon footprint" },
                  { icon: Recycle, label: "Recycled content" },
                  { icon: BadgeCheck, label: "EPD available" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
                One workspace to discover materials, compare suppliers, simulate
                alternatives and export decision reports that feed straight into
                LCA and EPD workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowComparison;