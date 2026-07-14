import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Factory, Building2 } from "lucide-react";

type Company = {
  id: string;
  company_name: string;
  country: string | null;
  verified_status: string;
  company_type: string;
};

type Grade = {
  id: string;
  grade_name: string;
  status: string;
  verified_status: string;
  description: string | null;
  country_of_production: string | null;
  general_material_id: string;
};

type Request = {
  id: string;
  status: string;
  application: string | null;
  quantity: string | null;
  timeline: string | null;
  message: string | null;
  created_at: string;
  supplier_grade_id: string;
  supplier_material_grades: { grade_name: string } | null;
};

const STATUSES = ["pending", "accepted", "declined", "completed"];

export default function ProducerDashboard() {
  const { user, isProducer } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      const cid = profile?.company_id ?? null;
      setCompanyId(cid);
      if (!cid) {
        setLoading(false);
        return;
      }
      const [{ data: c }, { data: g }, { data: r }] = await Promise.all([
        supabase.from("companies").select("*").eq("id", cid).maybeSingle(),
        supabase
          .from("supplier_material_grades")
          .select("*")
          .eq("company_id", cid)
          .order("created_at", { ascending: false }),
        supabase
          .from("introduction_requests")
          .select(
            "id, status, application, quantity, timeline, message, created_at, supplier_grade_id, supplier_material_grades(grade_name)"
          )
          .eq("company_id", cid)
          .order("created_at", { ascending: false }),
      ]);
      setCompany((c as unknown as Company) ?? null);
      setGrades((g as unknown as Grade[]) || []);
      setRequests((r as unknown as Request[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("introduction_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast({ title: "Status updated" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Producer console</h1>
            <p className="text-muted-foreground mt-2">
              Manage your listed grades and incoming buyer introductions.
            </p>
          </div>

          {!isProducer ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                This area is available to producer accounts only.
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : !companyId ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Your account is not linked to a company yet. Please contact the MateriaLink
                team to be associated with your producer profile.
              </CardContent>
            </Card>
          ) : (
            <>
              {company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {company.company_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {company.company_type}
                    </Badge>
                    {company.country && <Badge variant="outline">{company.country}</Badge>}
                    <Badge
                      variant={company.verified_status === "verified" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {company.verified_status}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-primary" />
                    Your grades ({grades.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {grades.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No grades submitted yet. Contact MateriaLink to add your first grade.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {grades.map((g) => (
                        <div key={g.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{g.grade_name}</p>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="capitalize">
                                {g.status}
                              </Badge>
                              {g.verified_status === "verified" && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                          </div>
                          {g.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {g.description}
                            </p>
                          )}
                          {g.country_of_production && (
                            <p className="text-xs text-muted-foreground">
                              {g.country_of_production}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Introduction requests ({requests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No buyer requests yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div key={r.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {r.supplier_material_grades?.grade_name ?? "Grade"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(r.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Select
                              value={r.status}
                              onValueChange={(v) => updateStatus(r.id, v)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                            {r.application && <div>App: {r.application}</div>}
                            {r.quantity && <div>Qty: {r.quantity}</div>}
                            {r.timeline && <div>Timeline: {r.timeline}</div>}
                          </div>
                          {r.message && (
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {r.message}
                            </p>
                          )}
                          {r.status === "pending" && (
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={() => updateStatus(r.id, "accepted")}>
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(r.id, "declined")}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}