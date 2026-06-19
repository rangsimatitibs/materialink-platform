import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WorkflowComparison from "@/components/WorkflowComparison";
import Platform from "@/components/Platform";
import Services from "@/components/Services";
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
              "Material Sustainability Intelligence — discover materials, compare suppliers, assess environmental impacts and feed decisions into LCA/EPD workflows.",
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
        <h1 className="sr-only">MateriaLink — sustainable materials meta-database for researchers and industry</h1>
        <Hero />
        <WorkflowComparison />
        <Platform />
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
