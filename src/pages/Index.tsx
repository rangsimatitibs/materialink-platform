import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyMaterialink from "@/components/WhyMaterialink";
import WorkflowComparison from "@/components/WorkflowComparison";
import SupplierMoat from "@/components/SupplierMoat";
import FutureVision from "@/components/FutureVision";
import NewsletterCTA from "@/components/NewsletterCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Page-level structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MateriaLink",
            url: "https://materialink.ai",
            description:
              "Choose materials with confidence. The link between material selection and sustainability assessment — discover materials, compare suppliers, assess environmental impacts and feed decisions into LCA/EPD workflows.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://materialink.ai/platform/material-scouting?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <Header />
      <main>
        <h1 className="sr-only">MateriaLink — choose materials with confidence. Link between material selection and sustainability assessment.</h1>
        <Hero />
        <WhyMaterialink />
        <WorkflowComparison />
        <SupplierMoat />
        <FutureVision />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
