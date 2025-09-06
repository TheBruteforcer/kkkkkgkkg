import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@/lib/auth";
import { registerSchema, type RegisterData } from "@shared/schema";
import Navigation from "@/components/navigation";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      grade: "",
      group: "",
    },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      const result = await register.mutateAsync(data);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً ${result.user.name}! يمكنك الآن الوصول إلى محتوى مرحلتك الدراسية`,
      });
      
      setLocation("/student-dashboard");
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
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
            <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسمك الكامل"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

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
                  placeholder="أدخل كلمة مرور قوية"
                  {...form.register("password")}
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>المرحلة الدراسية</Label>
                <Select onValueChange={(value) => form.setValue("grade", value)}>
                  <SelectTrigger data-testid="select-grade">
                    <SelectValue placeholder="اختر المرحلة الدراسية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade-1">الصف الأول الثانوي</SelectItem>
                    <SelectItem value="grade-2">الصف الثاني الثانوي</SelectItem>
                    <SelectItem value="grade-3">الصف الثالث الثانوي</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.grade && (
                  <p className="text-sm text-destructive">{form.formState.errors.grade.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>المجموعة</Label>
                <Select onValueChange={(value) => form.setValue("group", value)}>
                  <SelectTrigger data-testid="select-group">
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group-a">المجموعة أ</SelectItem>
                    <SelectItem value="group-b">المجموعة ب</SelectItem>
                    <SelectItem value="group-c">المجموعة ج</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.group && (
                  <p className="text-sm text-destructive">{form.formState.errors.group.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={register.isPending}
                data-testid="button-submit-register"
              >
                {register.isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">لديك حساب بالفعل؟ </span>
                <Button 
                  variant="link" 
                  className="text-sm p-0"
                  onClick={() => setLocation("/login")}
                  data-testid="link-login"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
