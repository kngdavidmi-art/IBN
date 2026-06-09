import { useGetFeaturedArticles, useListArticles } from "@workspace/api-client-react";
import { HeroArticle } from "@/components/ui/HeroArticle";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
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

            <div className="lg:col-span-4 space-y-12">
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

      <Footer />
    </div>
  );
}
