import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useSearchArticles, getSearchArticlesQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["All", "World", "Tech", "Business", "Sports", "Entertainment", "Science", "Videos"];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("q") || "";
    }
    return "";
  });

  const [category, setCategory] = useState("All");

  const debouncedQuery = useDebounce(query, 350);

  const params = {
    ...(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}),
    ...(category !== "All" ? { category } : {}),
    limit: 30,
  };

  const isActive = debouncedQuery.trim().length > 0 || category !== "All";

  const { data, isLoading, isFetching } = useSearchArticles(params, {
    query: {
      enabled: isActive,
      queryKey: getSearchArticlesQueryKey(params),
    },
  });

  const handleClear = useCallback(() => {
    setQuery("");
    setCategory("All");
  }, []);

  const results = data?.results ?? [];
  const total = data?.total ?? 0;
  const showResults = isActive && !isLoading;
  const showSkeleton = isActive && (isLoading || isFetching);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Search Header */}
        <div className="border-b bg-muted/40">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-6">Search IBN</h1>
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search articles, topics, people…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base border-border focus-visible:ring-primary"
                autoFocus
              />
              {(query || category !== "All") && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    category === cat
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {!isActive && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-xl font-serif text-muted-foreground">
                Type a keyword or choose a category to find articles
              </p>
            </div>
          )}

          {showSkeleton && (
            <div>
              <div className="h-5 w-40 mb-6 rounded bg-muted animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="w-full aspect-video rounded" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResults && !isFetching && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {total === 0 ? (
                  <>No results found{debouncedQuery ? ` for "${debouncedQuery}"` : ""}{category !== "All" ? ` in ${category}` : ""}</>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{total}</span>{" "}
                    {total === 1 ? "article" : "articles"} found
                    {debouncedQuery ? <> for <span className="font-semibold text-foreground">"{debouncedQuery}"</span></> : ""}
                    {category !== "All" ? <> in <span className="font-semibold text-foreground">{category}</span></> : ""}
                  </>
                )}
              </p>

              {total === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    Try a different keyword or browse by category.
                  </p>
                  <Button variant="outline" onClick={handleClear}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
