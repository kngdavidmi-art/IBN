import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0", 10);
  
  const { data: article, isLoading, error } = useGetArticle(articleId, { 
    query: { 
      enabled: !!articleId,
      queryKey: getGetArticleQueryKey(articleId) 
    } 
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {isLoading ? (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="w-full aspect-video mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : error || !article ? (
          <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
            <h1 className="text-4xl font-serif font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">We couldn't find the article you're looking for. It may have been removed or the URL might be incorrect.</p>
            <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Homepage
            </Link>
          </div>
        ) : (
          <article className="pb-16">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="mb-6">
                <Link href={`/category/${article.category?.toLowerCase()}`} className="text-primary font-bold uppercase tracking-wider text-sm hover:underline">
                  {article.category}
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-foreground mb-6">
                {article.title}
              </h1>
              
              {article.subtitle && (
                <p className="text-xl md:text-2xl text-muted-foreground font-serif leading-relaxed mb-8">
                  {article.subtitle}
                </p>
              )}
              
              <div className="flex items-center justify-between py-4 border-y mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground mr-3">
                    {article.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">By {article.author}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      Published {format(new Date(article.publishedAt), 'h:mm a • MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {article.videoUrl ? (
              <div className="w-full max-w-6xl mx-auto px-4 mb-12">
                <div className="aspect-video w-full bg-black">
                  <iframe 
                    src={article.videoUrl} 
                    className="w-full h-full" 
                    allowFullScreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
              </div>
            ) : article.imageUrl ? (
              <div className="w-full max-w-5xl mx-auto px-4 mb-12">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-auto object-cover max-h-[70vh]"
                />
              </div>
            ) : null}

            <div className="container mx-auto px-4 max-w-3xl">
              <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed">
                {/* Simple splitting by newlines for paragraphs since we don't have markdown rendering */}
                {article.content.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i} className="mb-6 text-lg">{paragraph}</p> : null
                ))}
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
