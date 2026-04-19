import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 bg-background">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
            A meta-database for sustainable materials
          </p>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] text-foreground mb-8">
            One library for the<br />
            <em className="italic text-primary">materials of tomorrow.</em>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-light">
            MateriaLink unifies bio-based, recycled, engineered and hybrid materials
            into a single, structured catalogue — built for researchers and industry alike.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="rounded-full px-7 h-12 bg-foreground text-background hover:bg-foreground/90">
                Book a demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link
              to="/platform/material-scouting"
              className="text-sm text-foreground/80 hover:text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-smooth px-2"
            >
              Explore the database →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 border-b border-border" />
    </section>
  );
};

export default Hero;
