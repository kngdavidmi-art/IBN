import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetArticle, useCreateArticle, useUpdateArticle, getAdminGetArticleQueryKey, getAdminListArticlesQueryKey } from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const categories = ["World", "Tech", "Business", "Sports", "Entertainment", "Science", "Videos"];

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function AdminPostForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const articleId = parseInt(id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingArticle, isLoading: isLoadingArticle } = useAdminGetArticle(articleId, {
    query: {
      enabled: isEditing && !!articleId,
      queryKey: getAdminGetArticleQueryKey(articleId)
    }
  });

  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      category: "",
      content: "",
      author: "",
      imageUrl: "",
      videoUrl: "",
      isFeatured: false,
      isBreaking: false
    }
  });

  const initializedRef = useRef<number | null>(null);

  useEffect(() => {
    if (isEditing && existingArticle && initializedRef.current !== articleId) {
      initializedRef.current = articleId;
      reset({
        title: existingArticle.title,
        subtitle: existingArticle.subtitle || "",
        category: existingArticle.category,
        content: existingArticle.content,
        author: existingArticle.author,
        imageUrl: existingArticle.imageUrl || "",
        videoUrl: existingArticle.videoUrl || "",
        isFeatured: existingArticle.isFeatured,
        isBreaking: existingArticle.isBreaking
      });
    }
  }, [isEditing, existingArticle, articleId, reset]);

  const onSubmit = async (data: ArticleFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: articleId, data });
        toast({ title: "Article updated successfully" });
        queryClient.invalidateQueries({ queryKey: getAdminGetArticleQueryKey(articleId) });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Article created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
      setLocation("/admin/posts");
    } catch (error: any) {
      toast({ 
        title: "Error saving article", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || isSubmitting;

  if (isEditing && isLoadingArticle) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/posts" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
        </Link>
        <h1 className="text-3xl font-bold font-serif text-slate-900">
          {isEditing ? "Edit Article" : "Create New Article"}
        </h1>
      </div>

      <div className="bg-white border rounded-md shadow-sm p-6 md:p-8 max-w-5xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-lg font-bold border-b pb-2">Basic Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Headline <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  className={`text-lg font-serif ${errors.title ? "border-destructive" : ""}`}
                  placeholder="e.g. Global Markets Rally as Tech Sector Surges" 
                  {...register("title")} 
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="subtitle">Subtitle / Summary</Label>
                <Input 
                  id="subtitle" 
                  placeholder="A brief summary that appears below the headline" 
                  {...register("subtitle")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select 
                  onValueChange={(value) => setValue("category", value)} 
                  value={watch("category") || ""}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author <span className="text-destructive">*</span></Label>
                <Input 
                  id="author" 
                  placeholder="Journalist Name" 
                  {...register("author")} 
                  className={errors.author ? "border-destructive" : ""}
                />
                {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold border-b pb-2">Content</h2>
            
            <div className="space-y-2">
              <Label htmlFor="content">Article Body <span className="text-destructive">*</span></Label>
              <Textarea 
                id="content" 
                placeholder="Write the full article content here..." 
                className={`min-h-[300px] font-serif leading-relaxed ${errors.content ? "border-destructive" : ""}`}
                {...register("content")} 
              />
              <p className="text-xs text-slate-500">Use double line breaks to create paragraphs.</p>
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold border-b pb-2">Media & Placement</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Featured Image URL</Label>
                <Input 
                  id="imageUrl" 
                  placeholder="https://example.com/image.jpg" 
                  {...register("imageUrl")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                <Input 
                  id="videoUrl" 
                  placeholder="YouTube or Vimeo embed URL" 
                  {...register("videoUrl")} 
                />
                <p className="text-xs text-slate-500">Will replace image on article page if provided</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-md border flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured" className="text-base font-medium">Featured Story</Label>
                  <p className="text-sm text-slate-500">Show in the top carousel on the homepage</p>
                </div>
                <Switch 
                  id="isFeatured" 
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
              </div>

              <div className="bg-red-50 p-4 rounded-md border border-red-100 flex items-center justify-between">
                <div>
                  <Label htmlFor="isBreaking" className="text-base font-medium text-red-900">Breaking News</Label>
                  <p className="text-sm text-red-700">Display with red urgent styling across the site</p>
                </div>
                <Switch 
                  id="isBreaking" 
                  checked={watch("isBreaking")}
                  onCheckedChange={(checked) => setValue("isBreaking", checked)}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/posts">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800">
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Article</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
