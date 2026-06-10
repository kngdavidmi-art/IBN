import { useGetArticlesSummary, useGetMe, useGetPendingCount } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Zap, Star, LayoutGrid, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetArticlesSummary();
  const { data: user } = useGetMe();
  const { data: pendingData } = useGetPendingCount();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 w-full mt-6" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of editorial content and activity.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/posts/new">Create New Post</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Published across all categories</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Breaking News</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.breaking || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Currently active breaking alerts</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Featured Stories</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.featured || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Highlighted on homepage</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Categories Active</CardTitle>
            <LayoutGrid className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.byCategory?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Active content sections</p>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card className="shadow-sm border border-amber-200 bg-amber-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">{pendingData?.count || 0}</div>
              <p className="text-xs text-amber-600 mt-1">
                {pendingData?.count ? (
                  <Link href="/admin/posts" className="hover:underline font-medium">
                    Review now →
                  </Link>
                ) : "No articles awaiting review"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {pendingData?.count ? pendingData.count > 0 && user?.role === "admin" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">{pendingData.count} article{pendingData.count !== 1 ? "s" : ""} waiting for your approval</p>
              <p className="text-sm text-amber-600">Review and publish them from the Posts page.</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0">
            <Link href="/admin/posts">Review Posts</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="font-serif">Articles by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.byCategory?.map((cat) => (
                <div key={cat.category} className="flex items-center">
                  <div className="w-full flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{cat.category}</span>
                      <span className="text-slate-500">{cat.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-800 rounded-full" 
                        style={{ width: `${Math.max(5, (cat.count / (summary.total || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!summary?.byCategory || summary.byCategory.length === 0) && (
                <p className="text-sm text-slate-500 italic text-center py-4">No categories with articles found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
