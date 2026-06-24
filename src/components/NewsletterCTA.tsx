import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowRight } from "lucide-react";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist_signups").insert([
        {
          email: email.trim(),
          interest_area: "newsletter",
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're on the list",
          description: "We'll let you know when new features drop.",
        });
        setEmail("");
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-primary text-primary-foreground py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 70% 100%, hsl(var(--primary-glow) / 0.4) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="container mx-auto px-6 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center mx-auto mb-6">
            <Mail className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-4">
            Stay in the loop
          </p>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.02] text-balance mb-4">
            Get notified when we launch.
          </h2>
          <p className="text-base text-primary-foreground/70 font-light max-w-md mx-auto mb-10">
            Material Scouting and the Researcher's Tool are coming soon. Be the first to know.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-full px-5 focus-visible:ring-primary-foreground/30"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-full px-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
            >
              {isSubmitting ? "Subscribing…" : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
