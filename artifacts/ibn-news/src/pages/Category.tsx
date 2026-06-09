import { useParams } from "wouter";
import { useListArticles } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Category() {
  const { name } = useParams<{ name: string }>();
  const categoryName = name || "all";
  const displayTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  const { data: articles, isLoading } = useListArticles({ category: displayTitle });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-muted py-12 mb-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              {displayTitle} News
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
              The latest updates, deep analysis, and breaking news in {displayTitle.toLowerCase()} from around the globe.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 mb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 border rounded-sm">
              <h3 className="text-2xl font-serif font-bold mb-2">No articles found</h3>
              <p className="text-muted-foreground">We couldn't find any articles in the {displayTitle} category right now.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
