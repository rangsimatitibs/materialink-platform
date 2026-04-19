import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroMaterial from "@/assets/hero-material.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Cinematic mesh gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-mesh)" }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 py-20 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full glass text-xs uppercase tracking-[0.2em] text-foreground/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              The sustainable materials meta-database
            </div>

            <h1 className="font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] text-foreground text-balance mb-8">
              The materials of{" "}
              <em className="italic font-normal text-primary">tomorrow,</em>{" "}
              indexed today.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light mb-10 text-pretty">
              MateriaLink unifies bio-based, recycled, engineered and hybrid materials
              into one structured catalogue — properties, suppliers and provenance,
              all in one place.
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
                to="/platform/material-scouting"
                className="text-sm text-foreground/80 hover:text-foreground underline underline-offset-[6px] decoration-foreground/20 hover:decoration-accent transition-smooth px-2"
              >
                Explore the database →
              </Link>
            </div>
          </div>

          {/* Right: cinematic material illustration */}
          <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroMaterial}
                alt="Microscopic view of sustainable bio-material with crystalline mycelium fibers"
                className="w-full h-full object-cover scale-105 animate-float-slow"
                width={1024}
                height={1280}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10 rounded-2xl" />
            </div>

            {/* Floating data card */}
            <div className="absolute -bottom-6 -left-6 lg:-left-10 glass rounded-xl px-5 py-4 shadow-large max-w-[220px] animate-float-slow" style={{ animationDelay: "1s" }}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Sample · Bio-based</p>
              <p className="font-display text-lg text-foreground leading-tight">Mycelium composite</p>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>TRL 7</span>
                <span>·</span>
                <span>CO₂e ↓ 68%</span>
              </div>
            </div>

            {/* Top floating tag */}
            <div className="hidden md:block absolute -top-4 -right-4 glass rounded-full px-4 py-2 shadow-medium text-xs text-foreground/80">
              <span className="text-accent">●</span> 4 categories · 5 facets
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 border-b border-border" />
    </section>
  );
};

export default Hero;
