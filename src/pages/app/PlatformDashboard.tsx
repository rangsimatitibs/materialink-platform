import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Search, BookMarked, GitCompare } from "lucide-react";

export default function PlatformDashboard() {
  const { user, role } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-4xl tracking-tight text-foreground mt-1">
              {user?.email}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Account: <span className="capitalize">{role ?? "free"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/app/search">
              <Card className="hover:border-primary transition-colors h-full">
                <CardHeader className="pb-3">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg mt-2">Search materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse the general materials database.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-60 h-full">
              <CardHeader className="pb-3">
                <BookMarked className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg mt-2">My library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon.</p>
              </CardContent>
            </Card>

            <Card className="opacity-60 h-full">
              <CardHeader className="pb-3">
                <GitCompare className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg mt-2">Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon.</p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Link to="/app/search">
              <Button size="lg" className="rounded-full">
                Start searching
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}