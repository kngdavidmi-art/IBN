import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { 
  useGetArticle, 
  getGetArticleQueryKey, 
  useListArticles, 
  useGetArticleComments, 
  usePostComment,
  getGetArticleCommentsQueryKey
} from "@workspace/api-client-react";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Twitter, Link2, Share2, Bookmark, BookmarkCheck, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readingTime } from "@/lib/readingTime";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { NewsletterWidget } from "@/components/NewsletterWidget";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function CommentForm({ articleId }: { articleId: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const postCommentMutation = usePostComment();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    try {
      await postCommentMutation.mutateAsync({
        id: articleId,
        data: { name, email: email || undefined, content }
      });
      toast.success("Your comment is awaiting moderation");
      setName("");
      setEmail("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: getGetArticleCommentsQueryKey(articleId) });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit comment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-6 rounded-lg border">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" /> Leave a Comment
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="comment-name">Name*</Label>
          <Input 
            id="comment-name"
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment-email">Email (Optional)</Label>
          <Input 
            id="comment-email"
            type="email" 
            placeholder="your@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment-content">Comment*</Label>
        <Textarea 
          id="comment-content"
          placeholder="What are your thoughts?" 
          value={content} 
          onChange={(e) => setContent(e.target.value.slice(0, 2000))} 
          required 
          className="min-h-[120px]"
        />
        <div className="text-right text-xs text-muted-foreground">
          {content.length}/2000 characters
        </div>
      </div>
      <Button type="submit" disabled={postCommentMutation.isPending} className="w-full md:w-auto">
        {postCommentMutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Post Comment</>
        )}
      </Button>
    </form>
  );
}

function ArticleComments({ articleId }: { articleId: number }) {
  const { data: comments, isLoading } = useGetArticleComments(articleId);

  if (isLoading) return <Skeleton className="h-32 w-full mt-8" />;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold font-serif">Comments ({comments?.length || 0})</h2>
      </div>

      <div className="space-y-6">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{comment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No comments yet. Be the first!</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <CommentForm articleId={articleId} />
      </div>
    </div>
  );
}

function RelatedArticles({ category, currentArticleId }: { category: string, currentArticleId: number }) {
  const { data: articles, isLoading } = useListArticles({ category, limit: 4 });
  
  if (isLoading) return null;
  const filtered = articles?.filter(a => a.id !== currentArticleId).slice(0, 3) || [];
  if (filtered.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-12">
      <h2 className="text-xl font-bold font-serif mb-6 border-b-2 border-primary inline-block pb-1">
        More from {category}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0", 10);
  
  const { data: article, isLoading, error } = useGetArticle(articleId, { 
    query: { 
      enabled: !!articleId,
      queryKey: getGetArticleQueryKey(articleId) 
    } 
  });

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | IBN News`;
      
      const meta = {
        'og:title': article.title,
        'og:description': article.subtitle || article.content.slice(0, 160),
        'og:image': article.imageUrl ? (article.imageUrl.startsWith('/objects') ? `/api/storage${article.imageUrl}` : article.imageUrl) : '',
        'og:type': 'article',
        'og:url': window.location.href,
        'twitter:card': 'summary_large_image',
        'twitter:title': article.title,
        'twitter:description': article.subtitle || article.content.slice(0, 160),
        'twitter:image': article.imageUrl ? (article.imageUrl.startsWith('/objects') ? `/api/storage${article.imageUrl}` : article.imageUrl) : '',
      };

      Object.entries(meta).forEach(([name, content]) => {
        let el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (name.startsWith('og:')) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      });
    }
  }, [article]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell>
      <div className="fixed top-0 left-0 z-[100] h-1 bg-primary transition-all" style={{ width: `${progress}%` }} />
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
                    <div className="font-bold text-sm">
                      By <Link href={`/author/${encodeURIComponent(article.author)}`} className="hover:underline text-primary">{article.author}</Link>
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      Published {format(new Date(article.publishedAt), 'h:mm a • MMM d, yyyy')} • {readingTime(article.content)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => isBookmarked(article.id) ? removeBookmark(article.id) : addBookmark(article.id)}
                    title={isBookmarked(article.id) ? "Remove Bookmark" : "Save Article"}
                  >
                    {isBookmarked(article.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary fill-current" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy Link">
                    <Link2 className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
                  </Button>
                  {'share' in navigator && (
                    <Button variant="ghost" size="icon" onClick={() => navigator.share({ title: article.title, url: window.location.href })}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
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
                  src={article.imageUrl.startsWith('/objects') ? `/api/storage${article.imageUrl}` : article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-auto object-cover max-h-[70vh]"
                />
              </div>
            ) : null}

            <div className="container mx-auto px-4 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed mb-12">
                    {/* Simple splitting by newlines for paragraphs since we don't have markdown rendering */}
                    {article.content.split('\n').map((paragraph, i) => (
                      paragraph.trim() ? <p key={i} className="mb-6 text-lg">{paragraph}</p> : null
                    ))}
                  </div>

                  <ArticleComments articleId={article.id} />
                </div>

                <div className="lg:col-span-4">
                  <div className="sticky top-24 space-y-8">
                    <NewsletterWidget />
                  </div>
                </div>
              </div>
            </div>

            {article.category && (
              <div className="container mx-auto px-4 max-w-4xl">
                <RelatedArticles category={article.category} currentArticleId={article.id} />
              </div>
            )}
          </article>
        )}
      </main>
    </PageShell>
  );
}
