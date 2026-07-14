import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Users, Database, Tags, Link2, Factory, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ADMIN_NAV } from "./crudConfigs";

const SECTION_ICON: Record<string, typeof Users> = {
  Content: Database,
  Taxonomy: Tags,
  Links: Link2,
  Suppliers: Factory,
  System: Sparkles,
};

export default function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col max-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">MateriaLink</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
          {/* Dashboard */}
          <div>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </div>

          <Separator />

          {/* User Management Section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                User Management
              </span>
            </div>
            <div className="space-y-1">
              <Link
                to="/admin/waitlist"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === "/admin/waitlist"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Users className="h-5 w-5" />
                Waitlist Signups
              </Link>
            </div>
          </div>

          {ADMIN_NAV.map((group) => {
            const Icon = SECTION_ICON[group.section] ?? Database;
            return (
              <div key={group.section}>
                <div className="flex items-center gap-2 px-3 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.section}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const href = `/admin/${item.slug}`;
                    const isActive = location.pathname === href;
                    return (
                      <Link
                        key={item.slug}
                        to={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}