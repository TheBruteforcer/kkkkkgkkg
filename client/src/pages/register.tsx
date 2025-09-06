import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@/lib/auth";
import { registerSchema, type RegisterData } from "@shared/schema";
import Navigation from "@/components/navigation";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      grade: "",
      group: "",
    },
  });
  
  const selectedRole = form.watch("role");
  
  // Watch for admin role selection
  const handleRoleChange = (value: "student" | "admin") => {
    form.setValue("role", value);
    if (value === "admin") {
      setShowAdminCode(true);
    } else {
      setShowAdminCode(false);
      setAdminCode("");
    }
  };

  const onSubmit = async (data: RegisterData) => {
    console.log("Form submission started:", data);
    try {
      // Verify admin code if admin role selected
      if (data.role === "admin") {
        console.log("Admin role selected, checking code:", adminCode);
        if (adminCode !== "ADMIN2025") {
          console.log("Admin code validation failed:", adminCode);
          toast({
            title: "كود المدير غير صحيح",
            description: "يجب إدخال كود المدير الصحيح لإنشاء حساب إداري",
            variant: "destructive",
          });
          return;
        }
        console.log("Admin code validated successfully");
      }
      
      console.log("Sending registration request...");
      const result = await register.mutateAsync(data);
      console.log("Registration successful:", result);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً ${result.user.name}! ${data.role === 'admin' ? 'تم إنشاء حسابك الإداري بنجاح' : 'يمكنك الآن الوصول إلى محتوى مرحلتك الدراسية'}`,
      });
      
      const redirectUrl = data.role === "admin" ? "/secure-admin-control-panel" : "/student-dashboard";
      console.log("Redirecting to:", redirectUrl);
      setLocation(redirectUrl);
    } catch (error: any) {
      console.error("Registration error:", error);
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

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select 
                  onValueChange={(value) => {
                    handleRoleChange(value as "student" | "admin");
                    form.setValue("role", value as "student" | "admin");
                  }}
                  defaultValue="student"
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">👨‍🎓 طالب</SelectItem>
                    <SelectItem value="admin">🛡️ مدير النظام</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
                )}
              </div>
              
              {/* Admin Code Input - Only shown when admin is selected */}
              {showAdminCode && (
                <div className="space-y-2">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-sm text-blue-800">
                      🔐 استخدم كود المدير: <span className="font-mono bg-blue-100 px-2 py-1 rounded">ADMIN2025</span>
                    </AlertDescription>
                  </Alert>
                  <Label htmlFor="admin-code" className="text-blue-600 font-semibold">
                    كود المدير الخاص <span className="text-blue-500">*</span>
                  </Label>
                  <Input
                    id="admin-code"
                    type="password"
                    placeholder="أدخل كود المدير الخاص"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="border-blue-300 focus:border-blue-500"
                    data-testid="input-admin-code"
                  />
                  {selectedRole === "admin" && !adminCode && (
                    <p className="text-sm text-blue-600">كود المدير مطلوب لإنشاء حساب إداري</p>
                  )}
                </div>
              )}
              
              {/* Grade Selection - Only for students */}
              {selectedRole === "student" && (
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
              )}
              
              {/* Group Selection - Only for students */}
              {selectedRole === "student" && (
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
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={register.isPending || (selectedRole === "admin" && !adminCode)}
                data-testid="button-register"
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
