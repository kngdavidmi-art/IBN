import { Link } from "wouter";
import { format } from "date-fns";
import type { Article } from "@workspace/api-client-react";

export function HeroArticle({ article }: { article: Article }) {
  return (
    <Link href={`/news/${article.id}`}>
      <div className="group relative w-full h-[60vh] min-h-[400px] overflow-hidden cursor-pointer bg-black">
        {article.imageUrl ? (
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
            <span className="font-serif text-6xl font-bold opacity-10 text-white">IBN</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl">
          {article.isBreaking && (
            <div className="inline-block bg-primary text-white text-sm md:text-base font-bold px-3 py-1 uppercase tracking-wider mb-4 animate-pulse">
              Breaking News
            </div>
          )}
          {!article.isBreaking && article.category && (
            <div className="inline-block bg-primary text-white text-sm font-bold px-3 py-1 uppercase tracking-wider mb-4">
              {article.category}
            </div>
          )}
          
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 group-hover:text-gray-200 transition-colors">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-gray-300 text-lg md:text-xl hidden md:block mb-4 max-w-3xl leading-relaxed">
              {article.subtitle}
            </p>
          )}
          
          <div className="flex items-center text-gray-400 text-sm font-medium uppercase tracking-wider">
            <span className="text-white">{article.author}</span>
            <span className="mx-3">•</span>
            <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
