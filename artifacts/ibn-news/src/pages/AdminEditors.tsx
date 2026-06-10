import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetMe, useListEditors, useCreateEditor, useUpdateEditor, useDeleteEditor, getListEditorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit, Trash2, Loader2, Users, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const APPROVED_ADMIN_EMAILS = ["kngdavidmi@gmail.com", "blessingta2020@gmail.com"];

const createEditorSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateEditorForm = z.infer<typeof createEditorSchema>;

export default function AdminEditors() {
  const { data: user } = useGetMe();
  const { data: editors, isLoading } = useListEditors();
  const createEditorMutation = useCreateEditor();
  const updateEditorMutation = useUpdateEditor();
  const deleteEditorMutation = useDeleteEditor();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPassword, setEditPassword] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateEditorForm>({
    resolver: zodResolver(createEditorSchema),
    defaultValues: { username: "", email: "", password: "" }
  });

  if (user?.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif mb-2">Access Restricted</h2>
          <p className="text-slate-500">Only administrators can manage team members.</p>
        </div>
      </AdminLayout>
    );
  }

  const onSubmit = async (data: CreateEditorForm) => {
    createEditorMutation.mutate({ data: { username: data.username, email: data.email, password: data.password } }, {
      onSuccess: (created) => {
        const roleLabel = (created as any).role === "admin" ? "Administrator" : "Editor";
        toast({ title: "Team member added", description: `${data.username} joined as ${roleLabel}.` });
        reset();
        queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || err?.message || "Failed to add team member";
        toast({ title: "Failed to add", description: msg, variant: "destructive" });
      }
    });
  };

  const handleEditClick = (editor: any) => {
    setEditingId(editor.id);
    setEditPassword("");
  };

  const handleUpdate = async (id: number) => {
    if (!editPassword) {
      toast({ title: "Enter a new password", variant: "destructive" });
      return;
    }
    updateEditorMutation.mutate({ id, data: { password: editPassword } }, {
      onSuccess: () => {
        toast({ title: "Password updated" });
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || err?.message || "Update failed";
        toast({ title: "Update failed", description: msg, variant: "destructive" });
      }
    });
  };

  const handleDelete = (editor: any) => {
    if (window.confirm(`Remove ${editor.username} from the team?`)) {
      deleteEditorMutation.mutate({ id: editor.id }, {
        onSuccess: () => {
          toast({ title: "Team member removed" });
          queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error || err?.message || "Delete failed";
          toast({ title: "Delete failed", description: msg, variant: "destructive" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Manage Team</h1>
        <p className="text-slate-500 mt-1">Add, update, or remove editorial staff.</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Admin rights are email-controlled.</span>{" "}
          Only <code className="bg-blue-100 px-1 rounded">kngdavidmi@gmail.com</code> and{" "}
          <code className="bg-blue-100 px-1 rounded">blessingta2020@gmail.com</code> receive administrator privileges. All other accounts are created as editors.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            {editors && <Badge variant="secondary">{editors.length}</Badge>}
          </div>

          <Card className="border border-slate-200">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editors?.map((editor) => (
                    <TableRow key={editor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {editor.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold leading-tight">{editor.username}</p>
                            {editor.email && (
                              <p className="text-xs text-slate-400 leading-tight mt-0.5">{editor.email}</p>
                            )}
                          </div>
                        </div>
                        {editingId === editor.id && (
                          <div className="mt-4 p-4 border rounded-md bg-slate-50 flex flex-col gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">New Password</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                autoComplete="new-password"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                              <Button size="sm" onClick={() => handleUpdate(editor.id)} disabled={updateEditorMutation.isPending}>
                                {updateEditorMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editor.role === "admin" ? (
                          <Badge className="bg-primary text-white gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">Editor</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {editor.lastLoginAt ? format(new Date(editor.lastLoginAt), "MMM d, yyyy") : "Never"}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {format(new Date(editor.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(editor)} className="text-slate-400 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(editor)}
                            disabled={user?.id === editor.id}
                            className="text-slate-400 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {editors?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">No team members yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        <div className="w-full lg:w-2/5">
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg">Add Team Member</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-500 mb-4">
                Role is assigned automatically based on email address.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    placeholder="johndoe"
                    autoComplete="off"
                    {...register("username")}
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-email">Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="off"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  {/* Hint if they type an admin email */}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isSubmitting || createEditorMutation.isPending}>
                  {isSubmitting || createEditorMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 mt-4 bg-slate-50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800 mb-1">Approved Admin Emails</p>
                  {APPROVED_ADMIN_EMAILS.map((email) => (
                    <p key={email} className="text-xs font-mono text-slate-500">{email}</p>
                  ))}
                  <p className="text-xs text-slate-400 mt-2">Accounts registered with these emails automatically receive full administrator privileges.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
