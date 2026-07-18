import { useParams } from "wouter";
import { useListArticles } from "@workspace/api-client-react";
import { PageShell } from "@/components/layout/PageShell";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

export default function AuthorPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || "");
  
  const { data: articles, isLoading } = useListArticles();

  const authorArticles = articles?.filter(a => a.author === decodedName) || [];

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-12 pb-8 border-b">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-10 h-10 md:w-12 h-12" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Author</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold">{decodedName}</h1>
            <p className="text-muted-foreground mt-2">Journalist at IBN News Portal</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : authorArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No articles found for this author.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
