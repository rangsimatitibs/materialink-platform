import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

type Row = {
  id: string;
  status: string;
  application: string | null;
  quantity: string | null;
  timeline: string | null;
  message: string | null;
  created_at: string;
  supplier_material_grades: { grade_name: string; general_material_id: string } | null;
  companies: { company_name: string } | null;
};

export default function MyRequests() {
  const { user, isPremium } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("introduction_requests")
        .select(
          "id, status, application, quantity, timeline, message, created_at, supplier_material_grades(grade_name, general_material_id), companies(company_name)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data as unknown as Row[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to platform
          </Link>
          <div>
            <h1 className="font-display text-4xl tracking-tight">My introduction requests</h1>
            <p className="text-muted-foreground mt-2">
              Track your outreach to suppliers.
            </p>
          </div>

          {!isPremium ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Supplier introductions require an industrial premium account.
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-sm text-muted-foreground">No requests yet.</p>
                <Link to="/app/search">
                  <Button variant="outline">Browse materials</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <Card key={r.id}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {r.supplier_material_grades?.grade_name ?? "Grade"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.companies?.company_name ?? ""} ·{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {r.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                      {r.application && <div>App: {r.application}</div>}
                      {r.quantity && <div>Qty: {r.quantity}</div>}
                      {r.timeline && <div>Timeline: {r.timeline}</div>}
                    </div>
                    {r.message && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line pt-1">
                        {r.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}