import { Link } from "wouter";
import { 
  useGetFeaturedArticles, 
  useListArticles, 
  useGetTrendingArticles 
} from "@workspace/api-client-react";
import { HeroArticle } from "@/components/ui/HeroArticle";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterWidget } from "@/components/NewsletterWidget";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye } from "lucide-react";

function TrendingSidebar() {
  const { data: trending, isLoading } = useGetTrendingArticles({ limit: 5 });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-primary px-4 py-3 flex items-center gap-2 text-primary-foreground">
        <TrendingUp className="h-5 w-5" />
        <h3 className="font-bold uppercase tracking-wider text-sm">Most Read</h3>
      </div>
      <div className="divide-y">
        {trending?.map((article, index) => (
          <Link key={article.id} href={`/news/${article.id}`}>
            <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <span className="text-2xl font-serif font-bold text-muted-foreground/30 group-hover:text-primary transition-colors">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter h-4 px-1">
                    {article.category}
                  </Badge>
                  <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:underline">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{article.viewCount} views</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading: isLoadingFeatured } = useGetFeaturedArticles();
  const { data: latest, isLoading: isLoadingLatest } = useListArticles({ limit: 12 });

  const heroArticle = featured?.[0] || latest?.[0];
  const otherFeatured = featured?.slice(1, 4) || latest?.slice(1, 4) || [];
  
  // Group remaining by category for the grid
  const techArticles = latest?.filter(a => a.category?.toLowerCase() === 'tech').slice(0, 3) || [];
  const worldArticles = latest?.filter(a => a.category?.toLowerCase() === 'world').slice(0, 3) || [];
  const businessArticles = latest?.filter(a => a.category?.toLowerCase() === 'business').slice(0, 3) || [];

  return (
    <PageShell>
      <main className="flex-1">
        {/* JUST IN Ticker */}
        {latest && latest.length > 0 && (
          <div className="bg-foreground text-background py-2 px-4 text-sm font-medium">
            <div className="container mx-auto flex items-center overflow-hidden whitespace-nowrap">
              <span className="font-bold tracking-widest uppercase mr-4 shrink-0 text-primary">JUST IN</span>
              <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-right-4">
                {latest.slice(0, 4).map((article, i) => (
                  <span key={article.id} className={`flex items-center ${i > 0 ? 'hidden md:flex' : ''}`}>
                    {i > 0 && <span className="mr-4 opacity-50">|</span>}
                    <Link href={`/news/${article.id}`} className="hover:underline truncate max-w-[200px] md:max-w-[300px]">
                      {article.title} <span className="opacity-50 font-normal ml-1">— {article.category}</span>
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {isLoadingFeatured ? (
          <Skeleton className="w-full h-[60vh]" />
        ) : heroArticle ? (
          <HeroArticle article={heroArticle} />
        ) : (
           <div className="w-full h-[60vh] flex items-center justify-center bg-muted">
             <p className="text-muted-foreground">No articles available.</p>
           </div>
        )}

        <div className="container mx-auto px-4 py-12">
          {/* Top Stories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-serif mb-6 flex items-center after:content-[''] after:flex-1 after:h-[1px] after:bg-border after:ml-4">
              <span className="bg-primary text-white px-3 py-1 text-sm uppercase tracking-wider mr-3">Top</span>
              Stories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isLoadingFeatured || isLoadingLatest ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="w-full aspect-video" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : otherFeatured.length > 0 ? (
                otherFeatured.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-3">No top stories right now.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
               {/* World News */}
               {worldArticles.length > 0 && (
                 <section className="mb-12">
                    <h2 className="text-xl font-bold font-serif mb-6 border-b-2 border-primary inline-block pb-1">World News</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {worldArticles.map((article, i) => (
                        <ArticleCard key={article.id} article={article} compact={i > 0} />
                      ))}
                    </div>
                 </section>
               )}

               {/* Tech News */}
               {techArticles.length > 0 && (
                 <section className="mb-12">
                    <h2 className="text-xl font-bold font-serif mb-6 border-b-2 border-primary inline-block pb-1">Technology</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {techArticles.map((article, i) => (
                        <ArticleCard key={article.id} article={article} compact={i > 0} />
                      ))}
                    </div>
                 </section>
               )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <TrendingSidebar />
              
              <NewsletterWidget />

              {/* Latest Feed - compact sidebar */}
              <div className="bg-muted/30 p-6 border rounded-sm">
                <h3 className="font-bold uppercase tracking-wider text-sm mb-6 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Latest Updates
                </h3>
                <div className="space-y-6 divide-y divide-border">
                  {latest?.slice(0, 5).map((article, i) => (
                    <div key={article.id} className={i > 0 ? "pt-6" : ""}>
                      <ArticleCard article={article} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
