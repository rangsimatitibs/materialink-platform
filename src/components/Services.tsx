import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Material Scouting",
    description:
      "Search a curated catalogue of sustainable materials with rich properties, suppliers and provenance.",
    href: "/platform/material-scouting",
  },
  {
    number: "02",
    title: "Researcher's Tool",
    description:
      "Predict properties, browse lab recipes, and build personal material libraries with cited sources.",
    href: "/platform/researchers-tool",
  },
  {
    number: "03",
    title: "Process Optimization",
    description:
      "Tune bioprocessing parameters and benchmark scenarios to improve yield, time and energy.",
    href: "/platform/process-optimization",
  },
];

const Services = () => {
  return (
    <section className="bg-background py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">What we do</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">
            Three quiet tools<br />
            <em className="italic text-primary">for serious work.</em>
          </h2>
        </div>

        <div className="divide-y divide-border border-t border-border">
          {services.map((s) => (
            <Link
              key={s.number}
              to={s.href}
              className="group grid grid-cols-12 gap-6 py-10 items-start hover:bg-muted/40 transition-smooth -mx-6 px-6"
            >
              <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground tabular-nums pt-2">
                {s.number}
              </div>
              <div className="col-span-10 md:col-span-5">
                <h3 className="font-display text-3xl md:text-4xl text-foreground">{s.title}</h3>
              </div>
              <div className="col-span-12 md:col-span-5 text-base text-muted-foreground leading-relaxed font-light">
                {s.description}
              </div>
              <div className="hidden md:flex col-span-1 justify-end pt-2 text-foreground/60 group-hover:text-foreground transition-smooth">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
