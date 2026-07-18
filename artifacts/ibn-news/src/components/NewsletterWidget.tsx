import { useState } from "react";
import { useSubscribe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const subscribeMutation = useSubscribe();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await subscribeMutation.mutateAsync({
        data: { email, name: name || undefined }
      });
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
      setName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe. Please try again.");
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
      <div className="h-2 bg-primary w-full" />
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="font-serif text-2xl">Stay Informed</CardTitle>
        <CardDescription>
          Get the latest news delivered to your inbox every morning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Your Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted/50"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full font-bold" 
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing...</>
            ) : (
              "Subscribe Now"
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
