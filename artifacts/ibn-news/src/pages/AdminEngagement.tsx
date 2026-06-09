import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetEngagement, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Loader2 } from "lucide-react";

export default function AdminEngagement() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading } = useGetEngagement();

  if (user?.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif mb-2">Access Restricted</h2>
          <p className="text-slate-500">Only administrators can view engagement statistics.</p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const topCategory = stats?.viewsByCategory?.[0];
  const maxViews = stats?.viewsByCategory?.[0]?.views || 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Post Engagement</h1>
        <p className="text-slate-500 mt-1">Track how readers are engaging with your content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.totalViews?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Most Read Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 capitalize">
              {topCategory?.category || "None"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {topCategory?.views?.toLocaleString() || 0} views
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg">Most Read Articles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topArticles?.slice(0, 10).map((article, idx) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <span className={`
                          ${idx === 0 ? "text-amber-500 font-bold text-lg" : ""}
                          ${idx === 1 ? "text-slate-400 font-bold text-lg" : ""}
                          ${idx === 2 ? "text-amber-700 font-bold text-lg" : ""}
                          ${idx > 2 ? "text-slate-500" : ""}
                        `}>
                          #{idx + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a href={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary hover:underline line-clamp-1">
                          {article.title}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary capitalize">
                          {article.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {article.author}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 font-bold">
                          {article.viewCount.toLocaleString()}
                          <Eye className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!stats?.topArticles || stats.topArticles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">No articles viewed yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg">Views by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats?.viewsByCategory?.map((cat) => (
                <div key={cat.category} className="flex items-center gap-3 mb-4">
                  <span className="w-24 text-sm font-medium text-right capitalize truncate" title={cat.category}>
                    {cat.category}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-primary/80 rounded-sm transition-all" 
                      style={{ width: `${Math.max(2, (cat.views / maxViews) * 100)}%` }} 
                    />
                  </div>
                  <span className="w-16 text-sm text-right text-muted-foreground flex items-center justify-end gap-1">
                    {cat.views.toLocaleString()}
                    <Eye className="w-3 h-3" />
                  </span>
                </div>
              ))}
              {(!stats?.viewsByCategory || stats.viewsByCategory.length === 0) && (
                <p className="text-sm text-slate-500 italic text-center py-4">No categories with views found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
