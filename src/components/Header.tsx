import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-5">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="MateriaLink logo" className="h-8 w-auto" />
            <span className="font-display text-2xl tracking-tight text-foreground">MateriaLink</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">meta-database</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-foreground/80 hover:text-foreground transition-smooth">
              Home
            </Link>
            <Link to="/about" className="text-sm text-foreground/80 hover:text-foreground transition-smooth">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth" className="text-sm text-foreground/80 hover:text-foreground transition-smooth hidden sm:inline">
                Login
              </Link>
            )}
            <Link to="/demo">
              <Button size="sm" className="rounded-full px-5 bg-foreground text-background hover:bg-foreground/90">
                Book a demo
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
