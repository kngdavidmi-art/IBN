import { Link } from "wouter";
import { useGetFeaturedArticles } from "@workspace/api-client-react";

export function BreakingTicker() {
  const { data: featured } = useGetFeaturedArticles();
  
  const breakingArticles = featured?.filter(a => a.isBreaking) || [];
  
  if (breakingArticles.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-9 bg-primary flex items-center overflow-hidden relative text-xs font-semibold text-white">
      <div className="absolute left-0 z-10 bg-primary h-full flex items-center px-4 font-bold tracking-widest uppercase">
        BREAKING
      </div>
      <div className="absolute left-0 z-10 bg-gradient-to-r from-primary to-transparent w-32 h-full pointer-events-none" />
      
      <div className="flex whitespace-nowrap ml-32 animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
        <span className="mx-4 text-white/50">▶</span>
        {breakingArticles.map((article, index) => (
          <span key={article.id} className="flex items-center">
            <Link href={`/news/${article.id}`} className="hover:underline">
              {article.title}
            </Link>
            {index < breakingArticles.length - 1 && (
              <span className="mx-4 text-white/50">•</span>
            )}
          </span>
        ))}
        {/* Duplicate for smooth looping */}
        <span className="mx-4 text-white/50">•</span>
        {breakingArticles.map((article, index) => (
          <span key={`${article.id}-dup`} className="flex items-center">
            <Link href={`/news/${article.id}`} className="hover:underline">
              {article.title}
            </Link>
            {index < breakingArticles.length - 1 && (
              <span className="mx-4 text-white/50">•</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}