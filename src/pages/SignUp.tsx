import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  companyName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  interestArea: z.string().min(1, { message: "Please select an interest area" }),
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    companyName: "",
    phone: "",
    interestArea: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signupSchema.parse(formData);
      setIsSubmitting(true);

      const { error } = await supabase.from("waitlist_signups").insert([
        {
          email: formData.email,
          full_name: formData.fullName,
          company_name: formData.companyName || null,
          phone: formData.phone || null,
          interest_area: formData.interestArea,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already registered",
            description: "This email is already on our list.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Thanks",
          description: "You've been added to the list. We'll be in touch.",
        });
        setFormData({ email: "", fullName: "", companyName: "", phone: "", interestArea: "" });
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
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
                Request access
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-foreground leading-[1.05] mb-6">
                Join the<br />
                <em className="italic text-primary">early circle.</em>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed font-light max-w-md">
                Tell us a little about yourself and we'll let you know when access opens.
              </p>
            </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      maxLength={20}
                      className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestArea" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Primary interest
                  </Label>
                  <Select
                    value={formData.interestArea}
                    onValueChange={(value) => setFormData({ ...formData, interestArea: value })}
                    required
                  >
                    <SelectTrigger id="interestArea" className="border-0 border-b border-border rounded-none px-0 focus:ring-0 bg-transparent">
                      <SelectValue placeholder="Select an interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material-scouting">Material Scouting</SelectItem>
                      <SelectItem value="researchers-tool">Researcher's Tool</SelectItem>
                      
                      <SelectItem value="all-services">All of the above</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Sending…" : "Request access"}
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

export default SignUp;
