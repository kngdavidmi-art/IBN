import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListArticles, useDeleteArticle, getAdminListArticlesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPosts() {
  const { data: articles, isLoading } = useAdminListArticles();
  const deleteMutation = useDeleteArticle();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Article deleted" });
        queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Manage Posts</h1>
          <p className="text-slate-500 mt-1">Create, edit, and manage editorial content.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/posts/new">Create New Post</Link>
        </Button>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="p-4 space-y-4">
             {Array(5).fill(0).map((_, i) => (
               <Skeleton key={i} className="h-12 w-full" />
             ))}
           </div>
        ) : !articles || articles.length === 0 ? (
           <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No articles yet</h3>
              <p className="text-slate-500 mt-1 mb-6">Get started by creating your first piece of content.</p>
              <Button asChild variant="outline">
                <Link href="/admin/posts/new">Create Article</Link>
              </Button>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[400px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="line-clamp-1" title={article.title}>{article.title}</div>
                      <div className="text-xs text-slate-500 font-normal line-clamp-1 mt-1">
                        By {article.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase tracking-wider text-[10px] rounded-sm">
                        {article.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {article.isBreaking && (
                          <Badge className="bg-primary text-white text-[10px] rounded-sm uppercase tracking-wider">Breaking</Badge>
                        )}
                        {article.isFeatured && (
                          <Badge variant="secondary" className="text-[10px] rounded-sm uppercase tracking-wider bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>
                        )}
                        {!article.isBreaking && !article.isFeatured && (
                          <span className="text-xs text-slate-500">Standard</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                          <a href={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" title="View live">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Link href={`/admin/posts/${article.id}/edit`} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Ensure FileText icon is imported
import { FileText } from "lucide-react";
