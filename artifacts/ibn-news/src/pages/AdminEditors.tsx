import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetMe, useListEditors, useCreateEditor, useUpdateEditor, useDeleteEditor, getListEditorsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit, Trash2, Loader2, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const createEditorSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "editor"])
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
  const [editRole, setEditRole] = useState<"admin" | "editor">("editor");

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<CreateEditorForm>({
    resolver: zodResolver(createEditorSchema),
    defaultValues: { username: "", password: "", role: "editor" }
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
    createEditorMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Team member added" });
        reset();
        queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Failed to add team member", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleEditClick = (editor: any) => {
    setEditingId(editor.id);
    setEditRole(editor.role);
    setEditPassword("");
  };

  const handleUpdate = async (id: number) => {
    const data: any = {};
    if (editPassword) data.password = editPassword;
    if (editRole) data.role = editRole;

    updateEditorMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({ title: "Editor updated" });
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (editor: any) => {
    if (window.confirm(`Remove ${editor.username} from the team?`)) {
      deleteEditorMutation.mutate({ id: editor.id }, {
        onSuccess: () => {
          toast({ title: "Editor removed" });
          queryClient.invalidateQueries({ queryKey: getListEditorsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Manage Team</h1>
          <p className="text-slate-500 mt-1">Add, update, or remove editorial staff.</p>
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
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editors?.map((editor) => (
                    <TableRow key={editor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {editor.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{editor.username}</span>
                        </div>
                        {editingId === editor.id && (
                          <div className="mt-4 p-4 border rounded-md bg-slate-50 flex flex-col gap-4">
                            <div className="space-y-2">
                              <Label>New Password (Optional)</Label>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={editPassword} 
                                onChange={(e) => setEditPassword(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select value={editRole} onValueChange={(val: any) => setEditRole(val)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
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
                        {editor.role === 'admin' ? (
                          <Badge className="bg-primary text-white">Admin</Badge>
                        ) : (
                          <Badge variant="outline">Editor</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {editor.lastLoginAt ? format(new Date(editor.lastLoginAt), 'MMM d, yyyy') : "Never"}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(editor.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(editor)} className="text-slate-500 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(editor)} 
                            disabled={user?.id === editor.id} 
                            className="text-slate-500 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {editors?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">No team members found.</TableCell>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input 
                    id="new-username" 
                    placeholder="johndoe" 
                    {...register("username")} 
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="••••••••" 
                    {...register("password")} 
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isSubmitting || createEditorMutation.isPending}>
                  {isSubmitting || createEditorMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
