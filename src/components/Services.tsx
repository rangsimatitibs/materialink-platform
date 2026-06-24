import { Link } from "react-router-dom";
import { ArrowUpRight, Search, FlaskConical } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Material Scouting",
    description:
      "Search a curated catalogue of sustainable materials with rich properties, suppliers and provenance.",
    href: "/platform/material-scouting",
    icon: Search,
  },
  {
    number: "02",
    title: "Researcher's Tool",
    description:
      "Predict properties, browse lab recipes, and build personal material libraries with cited sources.",
    href: "/platform/researchers-tool",
    icon: FlaskConical,
  },
];

const Services = () => {
  return (
    <section className="relative bg-primary text-primary-foreground py-28 lg:py-36 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, hsl(var(--primary-glow) / 0.4) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-3xl mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-6">
            What we build
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.98] text-balance">
            Two precision tools{" "}
            <em className="italic text-primary-foreground/80">for serious work.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-primary-foreground/10 rounded-2xl overflow-hidden border border-primary-foreground/10">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="group relative bg-primary p-8 lg:p-10 opacity-60"
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/50">
                    Coming soon
                  </span>
                </div>

                <h3 className="font-display text-3xl lg:text-4xl mb-4 text-balance">
                  {s.title}
                </h3>
                <p className="text-base text-primary-foreground/70 leading-relaxed font-light text-pretty mb-8">
                  {s.description}
                </p>

                <span className="inline-flex items-center gap-2 text-sm text-primary-foreground/50">
                  Discover
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
