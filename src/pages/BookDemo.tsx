import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const demoSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  companyName: z.string().trim().max(100).optional(),
  role: z.enum(["researcher", "industry"], { required_error: "Please select a role" }),
  message: z.string().trim().max(1000).optional(),
});

const BookDemo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    role: "" as "researcher" | "industry" | "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      demoSchema.parse(formData);
      setIsSubmitting(true);

      const interest = `Demo request (${formData.role})${
        formData.message ? ` — ${formData.message}` : ""
      }`;

      const { error } = await supabase.from("waitlist_signups").insert([
        {
          email: formData.email,
          full_name: formData.fullName,
          company_name: formData.companyName || null,
          interest_area: interest,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already on the list",
            description: "We've already received a request from this email.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request received",
          description: "Thanks — we'll be in touch shortly.",
        });
        setFormData({ fullName: "", email: "", companyName: "", role: "", message: "" });
        setTimeout(() => navigate("/"), 1800);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Please check the form",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Intro */}
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
                Book a demo
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-foreground leading-[1.05] mb-6">
                Let's walk through<br />
                <em className="italic text-primary">the database together.</em>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed font-light max-w-md">
                Tell us a little about your work and we'll set up a 30-minute call
                tailored to your needs — research, sourcing, or both.
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      maxLength={100}
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      maxLength={255}
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Company / Institution
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    maxLength={100}
                    className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">I am a…</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v as "researcher" | "industry" })}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="researcher" id="role-researcher" />
                      <Label htmlFor="role-researcher" className="font-normal cursor-pointer">Researcher</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="industry" id="role-industry" />
                      <Label htmlFor="role-industry" className="font-normal cursor-pointer">Industry</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">
                    What would you like to explore? (optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    maxLength={1000}
                    rows={4}
                    className="border border-border rounded-sm focus-visible:ring-0 focus-visible:border-foreground bg-transparent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Sending…" : "Request a demo"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookDemo;
