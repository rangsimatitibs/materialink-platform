import { Check } from "lucide-react";

const benefits = [
  "More accurate assessments",
  "Better supplier transparency",
  "Faster EPD and LCA workflows",
  "Reduced dependence on generic assumptions",
];

const SupplierMoat = () => {
  return (
    <section className="relative bg-primary text-primary-foreground py-28 lg:py-36 overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 80% 0%, hsl(var(--primary-glow) / 0.5) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-6">
              The moat
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] text-balance">
              Powered by{" "}
              <em className="italic text-primary-foreground/85">primary supplier data.</em>
            </h2>
          </div>

          <div className="lg:col-span-6 lg:pt-4">
            <p className="text-lg text-primary-foreground/80 font-light leading-relaxed mb-10">
              Unlike traditional databases relying primarily on generic datasets,
              MateriaLink connects suppliers, materials, and environmental data in
              one platform.
            </p>

            <ul className="space-y-3 mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-base text-primary-foreground/90">
                  <span className="mt-1 w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <p className="text-xs text-primary-foreground/50 leading-relaxed border-t border-primary-foreground/10 pt-6 max-w-md">
              Reduces reliance on generic Ecoinvent-style assumptions by anchoring
              impact data to verified suppliers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplierMoat;