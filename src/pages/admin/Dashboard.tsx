import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, Database, Factory, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RecentSignup {
  id: string;
  full_name: string;
  email: string;
  interest_area: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [countRes, recentRes] = await Promise.all([
          supabase.from("waitlist_signups").select("id", { count: "exact", head: true }),
          supabase
            .from("waitlist_signups")
            .select("id, full_name, email, interest_area, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
        setWaitlistCount(countRes.count || 0);
        setRecentSignups((recentRes.data as RecentSignup[]) || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Manage the general materials database, taxonomy, and supplier layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waitlist Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waitlistCount}</div>
            <Link to="/admin/waitlist">
              <Button variant="link" size="sm" className="px-0 mt-2">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <QuickCard title="Materials" icon={Database} href="/admin/materials" />
        <QuickCard title="Taxonomy" icon={Tags} href="/admin/categories" />
        <QuickCard title="Suppliers" icon={Factory} href="/admin/companies" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <div className="space-y-4">
              {recentSignups.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.email}
                      {s.interest_area ? ` · ${s.interest_area}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickCard({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: typeof Users;
  href: string;
}) {
  return (
    <Link to={href}>
      <Card className="h-full hover:border-primary transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Manage records →</p>
        </CardContent>
      </Card>
    </Link>
  );
}