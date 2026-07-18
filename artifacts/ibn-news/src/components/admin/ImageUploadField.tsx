import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Link2, X } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ImageUploadField({ value, onChange, error }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const requestRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!requestRes.ok) throw new Error("Failed to request upload URL");
      
      const { uploadURL, objectPath } = await requestRes.json();
      setUploadProgress(30);

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");
      setUploadProgress(100);

      onChange(objectPath);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const imageUrl = value 
    ? (value.startsWith("/objects") ? `/api/storage${value}` : value)
    : "";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Featured Image</Label>
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onChange("")}
            className="h-8 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
      </div>

      <Tabs defaultValue={value?.startsWith("/objects") || !value ? "upload" : "url"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4 pt-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
              isUploading ? "bg-muted/50" : "hover:bg-muted/30"
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Drag and drop or click to upload
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleFileChange}
                />
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Select Image
                  </label>
                </Button>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://example.com/image.jpg"
                value={value?.startsWith("/objects") ? "" : value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {imageUrl && (
        <div className="relative mt-4 rounded-lg overflow-hidden border">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-medium">Preview</p>
          </div>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
