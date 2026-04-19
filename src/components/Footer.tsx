import { Link } from "react-router-dom";
import { Linkedin, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer id="contact" className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="MateriaLink logo" className="h-10 w-auto" />
              <span className="font-display text-3xl text-foreground tracking-tight">MateriaLink</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs font-light">
              A meta-database for sustainable materials — built for researchers and industry.
            </p>
          </div>

          {/* Platform */}
          <div className="md:col-span-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/platform/material-scouting" className="text-foreground/80 hover:text-foreground transition-smooth">
                  Material Scouting
                </Link>
              </li>
              <li>
                <Link to="/platform/researchers-tool" className="text-foreground/80 hover:text-foreground transition-smooth">
                  Researcher's Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-foreground/80 hover:text-foreground transition-smooth">
                  About
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-foreground/80 hover:text-foreground transition-smooth">
                  Book a demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:Rangsimatiti.b.s@gmail.com"
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-smooth"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/materia-link/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-smooth"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MateriaLink. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Paris · London</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
