import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Compass, Telescope } from "lucide-react";
import rangsimatiti from "@/assets/rangsimatiti.jpg";
import holgerPhoto from "@/assets/dr-holger-warth.jpg";

const About = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const teamMembers = [
    {
      name: "Rangsimatiti Binda Saichompoo",
      role: "Founder & CEO",
      shortBio: "A sustainability alchemist, driven by the urgency of plastic pollution.",
      fullBio:
        "Combining scientific insights in sustainable materials & biomass valorization with an entrepreneurial spirit, turning innovation into impact for a cleaner future.",
      email: "rangsimatiti.b.s@gmail.com",
      image: rangsimatiti,
    },
    {
      name: "Dr. Holger Warth",
      role: "Technology & Innovation Advisor",
      shortBio:
        "Chief Technology and Innovation Officer at medmix, brings strategic leadership and innovation expertise to MateriaLink.",
      fullBio:
        "With a proven track record in global R&D across multiple countries, he has successfully reduced product development cycles and increased launches. His previous executive roles at Aliaxis, Hoya Vision Care, and Evonik, managing budgets up to several hundred million dollars, position him as a key advisor for our technology roadmap and market expansion.",
      email: null,
      image: holgerPhoto,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-24">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
              About
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight text-foreground mb-8">
              A meta-database for the
              <span className="italic text-primary"> materials of tomorrow.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl leading-relaxed">
              MateriaLink unifies sustainable material data — properties, suppliers, provenance —
              into a single intelligent layer for researchers and industry.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="container mx-auto px-6 mb-32">
          <div className="grid md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            <article className="bg-background p-10 md:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Mission
                </p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight text-foreground mb-6">
                Make sustainable materials
                <span className="italic"> findable, comparable, sourceable.</span>
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                We aggregate fragmented material knowledge — academic, industrial, and
                regulatory — into one curated meta-database. Our mission is to remove the
                friction between discovery and adoption, so the next generation of materials
                can reach the people building with them.
              </p>
            </article>

            <article className="bg-background p-10 md:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Telescope className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Vision
                </p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight text-foreground mb-6">
                The connective tissue of the
                <span className="italic"> circular material economy.</span>
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed">
                A world where every product decision — from a research lab to a global supply
                chain — is informed by transparent, verifiable, and sustainable material data.
                MateriaLink is the standard layer connecting science, industry, and impact.
              </p>
            </article>
          </div>
        </section>

        {/* Team */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Team
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight text-foreground">
                The people behind MateriaLink
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer transition-all duration-500 hover:border-primary/40 hover:shadow-elegant"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="font-display text-6xl text-muted-foreground">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg text-background mb-0.5 leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-background/80 text-xs font-light">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      hoveredCard === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-foreground leading-relaxed font-light">
                        {member.shortBio}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        {member.fullBio}
                      </p>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-smooth"
                        >
                          <Mail size={14} />
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
