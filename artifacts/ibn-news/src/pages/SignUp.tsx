import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: isCheckingAuth } = useGetMe({ query: { retry: false } });
  const signUpMutation = useSignUp();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" }
  });

  useEffect(() => {
    if (user && !isCheckingAuth) {
      setLocation("/admin");
    }
  }, [user, isCheckingAuth, setLocation]);

  const onSubmit = async (data: SignUpForm) => {
    signUpMutation.mutate({ data: { username: data.username, email: data.email, password: data.password } }, {
      onSuccess: () => {
        toast({ title: "Account created!", description: "You can now sign in with your credentials." });
        setLocation("/login");
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.error || error?.message || "An error occurred.";
        if (error?.response?.status === 409) {
          toast({ title: "Sign up failed", description: msg, variant: "destructive" });
        } else {
          toast({ title: "Sign up failed", description: msg, variant: "destructive" });
        }
      }
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="space-y-2 text-center pb-8 border-b">
          <div className="mx-auto bg-primary text-white w-16 h-16 flex items-center justify-center rounded-sm mb-4">
            <span className="font-serif text-3xl font-bold">IBN</span>
          </div>
          <CardTitle className="text-2xl font-serif">Request Editor Access</CardTitle>
          <CardDescription>
            Register a new editorial account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                autoComplete="username"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || signUpMutation.isPending}>
              {isSubmitting || signUpMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
              ) : (
                "Request Access"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col justify-center text-sm text-muted-foreground pt-4 border-t">
          <p>© {new Date().getFullYear()} IBN News Network. Secure System.</p>
          <div className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
