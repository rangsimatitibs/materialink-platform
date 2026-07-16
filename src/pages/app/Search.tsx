import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search as SearchIcon, ArrowRight, SlidersHorizontal, X, Check } from "lucide-react";

type Material = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  data_confidence: string | null;
  chemical_formula: string | null;
  category_id: string | null;
  material_categories: { name: string } | null;
};

type Category = { id: string; name: string };

const CONFIDENCE_OPTIONS = [
  "high",
  "medium",
  "low",
  "verified",
  "estimated",
  "ai_generated",
];

const SORT_OPTIONS: Record<string, { label: string; column: string; asc: boolean }> = {
  "name-asc": { label: "Name (A → Z)", column: "name", asc: true },
  "name-desc": { label: "Name (Z → A)", column: "name", asc: false },
  "updated-desc": { label: "Recently updated", column: "updated_at", asc: false },
  "confidence-desc": { label: "Confidence", column: "data_confidence", asc: true },
};

function confidenceStyle(level: string): React.CSSProperties {
  const l = level.toLowerCase();
  if (l.startsWith("high") || l === "verified") {
    return {
      backgroundColor: "hsl(var(--tag-sustainability) / 0.15)",
      color: "hsl(var(--tag-sustainability))",
      borderColor: "hsl(var(--tag-sustainability) / 0.25)",
    };
  }
  if (l.startsWith("medium") || l === "estimated") {
    return {
      backgroundColor: "hsl(var(--tag-regulation) / 0.15)",
      color: "hsl(var(--tag-regulation))",
      borderColor: "hsl(var(--tag-regulation) / 0.25)",
    };
  }
  return {
    backgroundColor: "hsl(var(--muted))",
    color: "hsl(var(--muted-foreground))",
    borderColor: "transparent",
  };
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const selectedCats = useMemo(
    () => (params.get("cat") ? params.get("cat")!.split(",").filter(Boolean) : []),
    [params]
  );
  const selectedConf = useMemo(
    () => (params.get("conf") ? params.get("conf")!.split(",").filter(Boolean) : []),
    [params]
  );
  const sort = params.get("sort") ?? "name-asc";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const perPage = Math.max(1, parseInt(params.get("per") ?? "24", 10) || 24);

  const [inputQ, setInputQ] = useState(q);
  useEffect(() => setInputQ(q), [q]);
  const debouncedQ = useDebounced(inputQ, 300);
  useEffect(() => {
    if (debouncedQ === q) return;
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set("q", debouncedQ);
    else next.delete("q");
    next.delete("page");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("material_categories")
        .select("id, name")
        .order("name");
      setCategories((data as Category[]) || []);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const sortCfg = SORT_OPTIONS[sort] ?? SORT_OPTIONS["name-asc"];
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("general_materials")
        .select(
          "id, name, slug, short_description, data_confidence, chemical_formula, category_id, material_categories(name)",
          { count: "exact" }
        )
        .eq("status", "published");

      if (q.trim()) {
        const s = q.trim().replace(/[%_]/g, "");
        query = query.or(
          `name.ilike.%${s}%,chemical_formula.ilike.%${s}%,short_description.ilike.%${s}%`
        );
      }
      if (selectedCats.length) query = query.in("category_id", selectedCats);
      if (selectedConf.length) query = query.in("data_confidence", selectedConf);

      const { data, count, error } = await query
        .order(sortCfg.column, { ascending: sortCfg.asc })
        .range(from, to);
      if (cancelled) return;
      if (error) {
        console.error(error);
        setMaterials([]);
        setTotal(0);
      } else {
        setMaterials((data as unknown as Material[]) || []);
        setTotal(count ?? 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [q, selectedCats, selectedConf, sort, page, perPage]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const activeFilters = selectedCats.length + selectedConf.length + (q ? 1 : 0);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: false });
  };

  const toggleCat = (id: string) => {
    const set = new Set(selectedCats);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update({ cat: set.size ? Array.from(set).join(",") : null, page: null });
  };

  const toggleConf = (v: string) => {
    const set = new Set(selectedConf);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    update({ conf: set.size ? Array.from(set).join(",") : null, page: null });
  };

  const clearAll = () => {
    setInputQ("");
    setParams(new URLSearchParams(), { replace: false });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-foreground">
              Materials database
            </h1>
            <p className="text-muted-foreground mt-2">
              General material profiles with typical property ranges and sustainability notes.
            </p>
          </div>

          {/* Search + sort row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, formula, or description…"
                value={inputQ}
                onChange={(e) => setInputQ(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Select value={sort} onValueChange={(v) => update({ sort: v, page: null })}>
              <SelectTrigger className="md:w-56 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-card">
                  <SlidersHorizontal className="h-4 w-4" />
                  Confidence
                  {selectedConf.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
                      {selectedConf.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Filter…" />
                  <CommandList>
                    <CommandEmpty>No options</CommandEmpty>
                    <CommandGroup>
                      {CONFIDENCE_OPTIONS.map((c) => {
                        const active = selectedConf.includes(c);
                        return (
                          <CommandItem
                            key={c}
                            onSelect={() => toggleConf(c)}
                            className="capitalize"
                          >
                            <div
                              className={`mr-2 h-4 w-4 rounded-sm border flex items-center justify-center ${
                                active ? "bg-primary border-primary text-primary-foreground" : ""
                              }`}
                            >
                              {active && <Check className="h-3 w-3" />}
                            </div>
                            {c.replace("_", " ")}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => update({ cat: null, page: null })}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedCats.length === 0
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                All
              </button>
              {categories.map((c) => {
                const active = selectedCats.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active filters + count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div>
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : total === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="text-foreground font-medium">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)}
                  </span>{" "}
                  of <span className="text-foreground font-medium">{total.toLocaleString()}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </Button>
              )}
              <Select
                value={String(perPage)}
                onValueChange={(v) => update({ per: v, page: null })}
              >
                <SelectTrigger className="w-28 h-8 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 48, 96].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results list */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-card space-y-3">
              <p className="text-muted-foreground">
                No materials match your filters.
              </p>
              {activeFilters > 0 && (
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {materials.map((m) => (
                <Link
                  key={m.id}
                  to={`/app/materials/${m.slug}`}
                  className="group block border rounded-lg bg-card hover:border-primary hover:shadow-[var(--shadow-medium)] transition-all"
                >
                  <div className="p-4 md:p-5 flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-display text-xl leading-tight truncate">
                          {m.name}
                        </h3>
                        {m.material_categories?.name && (
                          <Badge
                            variant="outline"
                            className="rounded-full border font-medium"
                            style={{
                              backgroundColor: "hsl(var(--tag-application) / 0.14)",
                              color: "hsl(var(--tag-application))",
                              borderColor: "hsl(var(--tag-application) / 0.25)",
                            }}
                          >
                            {m.material_categories.name}
                          </Badge>
                        )}
                        {m.data_confidence && (
                          <Badge
                            className="capitalize rounded-full border font-medium"
                            style={confidenceStyle(m.data_confidence)}
                          >
                            {m.data_confidence.replace("_", " ")}
                          </Badge>
                        )}
                        {m.chemical_formula && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {m.chemical_formula}
                          </span>
                        )}
                      </div>
                      {m.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {m.short_description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) update({ page: String(page - 1) });
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {getPageWindow(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          update({ page: p === 1 ? null : String(p) });
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) update({ page: String(page + 1) });
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function getPageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
