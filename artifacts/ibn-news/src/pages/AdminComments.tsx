import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { 
  useAdminListComments, 
  useApproveComment, 
  useRejectComment, 
  useDeleteComment 
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Check, X, Trash2, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminComments() {
  const [filter, setFilter] = useState("all");
  const { data: comments, isLoading, refetch } = useAdminListComments();
  const approveMutation = useApproveComment();
  const rejectMutation = useRejectComment();
  const deleteMutation = useDeleteComment();
  const queryClient = useQueryClient();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Comment approved");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Comment rejected");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Comment deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const filteredComments = comments?.filter(c => {
    if (filter === "all") return true;
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  }) || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Comments Moderation</h1>
        <p className="text-slate-500 mt-1">Review and manage reader comments.</p>
      </div>

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No comments found</h3>
            <p className="text-slate-500 mt-1">There are no comments matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="font-medium">{comment.name}</div>
                      <div className="text-xs text-slate-500">{comment.email || "No email"}</div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2" title={comment.content}>
                        {comment.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Link href={`/news/${comment.articleId}`} className="inline-flex items-center text-primary hover:underline text-sm">
                        View Article <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={comment.approved ? "default" : "secondary"}>
                        {comment.approved ? "approved" : "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!comment.approved && (
                          <>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(comment.id)} title="Approve">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleReject(comment.id)} title="Reject">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(comment.id)} className="bg-destructive text-white">Delete</AlertDialogAction>
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
