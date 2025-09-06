import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useCurrentUser } from "@/lib/auth";
import { loginSchema, type LoginData } from "@shared/schema";
import Navigation from "@/components/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const { data: currentUser } = useCurrentUser();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser?.user) {
      if (currentUser.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/student-dashboard");
      }
    }
  }, [currentUser, setLocation]);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const result = await login.mutateAsync(data);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${result.user.name}`,
      });
      
      if (result.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/student-dashboard");
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...form.register("email")}
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-reverse space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">تذكرني</Label>
                </div>
                <Button variant="link" className="text-sm p-0">
                  نسيت كلمة المرور؟
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={login.isPending}
                data-testid="button-submit-login"
              >
                {login.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">ليس لديك حساب؟ </span>
                <Button 
                  variant="link" 
                  className="text-sm p-0"
                  onClick={() => setLocation("/register")}
                  data-testid="link-register"
                >
                  إنشاء حساب جديد
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
