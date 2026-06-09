import { Link } from "wouter";
import { format } from "date-fns";
import type { Article } from "@workspace/api-client-react";
import { readingTime } from "@/lib/readingTime";
import { relativeTime } from "@/lib/relativeTime";

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <Link href={`/news/${article.id}`}>
      <div className="group cursor-pointer flex flex-col h-full">
        {!compact && (
          <div className="relative aspect-video mb-3 overflow-hidden rounded-sm bg-muted">
            {article.imageUrl ? (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="font-serif text-2xl font-bold opacity-20">IBN</span>
              </div>
            )}
            {article.isBreaking && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                Breaking
              </div>
            )}
            {!article.isBreaking && article.category && (
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                {article.category}
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          {compact && article.category && (
             <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
               {article.category}
             </span>
          )}
          <h3 className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors ${compact ? 'text-lg leading-snug' : 'text-xl leading-tight'} mb-2`}>
            {article.title}
          </h3>
          {!compact && article.subtitle && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {article.subtitle}
            </p>
          )}
          <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <span>{article.author}</span>
            <span className="mx-2">•</span>
            <span>
              {(() => {
                const pubDate = new Date(article.publishedAt);
                const isRecent = Date.now() - pubDate.getTime() < 7 * 24 * 60 * 60 * 1000;
                return isRecent ? relativeTime(pubDate) : format(pubDate, 'MMM d, yyyy');
              })()}
            </span>
            <span className="mx-2">•</span>
            <span>{readingTime(article.content)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
