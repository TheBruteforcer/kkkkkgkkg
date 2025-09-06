import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { useCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import QuizCreationDialog from "@/components/quiz-creation-dialog";
import MaterialUploadDialog from "@/components/material-upload-dialog";
import type { Material, Quiz, QuizAttempt, User, Grade, Group } from "@shared/schema";

interface AdminStats {
  stats: {
    totalStudents: number;
    totalMaterials: number;
    activeQuizzes: number;
    completedAttempts: number;
    averageScore: number;
    materialBreakdown: {
      whiteboard: number;
      video: number;
      document: number;
    };
    gradeDistribution: Record<string, number>;
    groupDistribution: Record<string, number>;
  };
  recentActivity: {
    materials: Material[];
    quizzes: Quiz[];
    attempts: QuizAttempt[];
  };
}

export default function SecureAdminPanel() {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Security state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  
  // Form states
  const [gradeForm, setGradeForm] = useState({ name: "", code: "", description: "" });
  const [groupForm, setGroupForm] = useState({ name: "", code: "", description: "" });
  const [materialForm, setMaterialForm] = useState({
    title: "", type: "whiteboard", url: "", description: "", grade: "", group: "", subject: ""
  });
  
  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!currentUser?.user) {
      setLocation("/login");
    } else if (currentUser.user.role !== "admin") {
      setLocation("/");
    } else {
      // Show verification dialog for admin
      setShowVerification(true);
    }
  }, [currentUser, setLocation]);

  // Admin stats query
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  // Users query
  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  const { data: materialsData } = useQuery<{ materials: Material[] }>({
    queryKey: ["/api/materials"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  const { data: quizzesData } = useQuery<{ quizzes: Quiz[] }>({
    queryKey: ["/api/quizzes"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  const { data: gradesData } = useQuery<{ grades: Grade[] }>({
    queryKey: ["/api/grades"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  const { data: groupsData } = useQuery<{ groups: Group[] }>({
    queryKey: ["/api/groups"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin" && isVerified,
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: (password: string) => apiRequest("/api/admin/verify", "POST", { password }),
    onSuccess: () => {
      setIsVerified(true);
      setShowVerification(false);
      toast({ title: "تم تأكيد هوية المدير بنجاح" });
    },
    onError: () => {
      toast({ title: "كلمة مرور المدير غير صحيحة", variant: "destructive" });
    }
  });

  // CRUD mutations
  const createGradeMutation = useMutation({
    mutationFn: (data: typeof gradeForm) => apiRequest("/api/grades", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      setGradeForm({ name: "", code: "", description: "" });
      toast({ title: "تم إضافة المرحلة الدراسية بنجاح" });
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: typeof groupForm) => apiRequest("/api/groups", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setGroupForm({ name: "", code: "", description: "" });
      toast({ title: "تم إضافة المجموعة بنجاح" });
    }
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data: typeof materialForm) => apiRequest("/api/materials", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setMaterialForm({
        title: "", type: "whiteboard", url: "", description: "", grade: "", group: "", subject: ""
      });
      toast({ title: "تم إضافة المادة التعليمية بنجاح" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest(`/api/users/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم حذف المستخدم بنجاح" });
    }
  });

  if (!currentUser?.user || currentUser.user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">غير مصرح لك بالوصول</h1>
        <Button onClick={() => setLocation("/")} data-testid="button-go-home">
          العودة للرئيسية
        </Button>
      </div>
    </div>;
  }

  const stats = adminStats?.stats;
  const users = usersData?.users || [];
  const materials = materialsData?.materials || [];
  const quizzes = quizzesData?.quizzes || [];
  const grades = gradesData?.grades || [];
  const groups = groupsData?.groups || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-[425px]" data-testid="dialog-admin-verification">
          <DialogHeader>
            <DialogTitle className="text-center text-red-500">🔒 تأكيد هوية المدير</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-sm text-muted-foreground">
              يرجى إدخال كلمة مرور المدير للوصول إلى لوحة التحكم المتقدمة
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">كلمة مرور المدير</Label>
              <Input
                id="admin-password"
                type="password"
                value={verificationPassword}
                onChange={(e) => setVerificationPassword(e.target.value)}
                placeholder="أدخل كلمة مرور المدير"
                data-testid="input-admin-password"
              />
            </div>
            <Button 
              onClick={() => verifyMutation.mutate(verificationPassword)}
              disabled={!verificationPassword || verifyMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700"
              data-testid="button-verify-admin"
            >
              {verifyMutation.isPending ? "جاري التحقق..." : "تأكيد الهوية"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Admin Panel */}
      {isVerified && (
        <>
          <Navigation />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Admin Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🛡️ لوحة التحكم المتقدمة
                </h1>
                <p className="text-slate-300">
                  مرحباً {currentUser.user.name} - النظام الإداري الشامل
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="destructive" className="text-sm">
                  مدير النظام
                </Badge>
                <Badge variant="outline" className="text-sm text-white">
                  محمي بكلمة سر
                </Badge>
              </div>
            </div>

            {/* Stats Dashboard */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">إجمالي الطلاب</p>
                        <p className="text-2xl font-bold text-white" data-testid="text-total-students">
                          {stats.totalStudents}
                        </p>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <i className="fas fa-users text-blue-400 text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">الاختبارات النشطة</p>
                        <p className="text-2xl font-bold text-white" data-testid="text-active-quizzes">
                          {stats.activeQuizzes}
                        </p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg">
                        <i className="fas fa-clipboard-list text-green-400 text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">المواد المرفوعة</p>
                        <p className="text-2xl font-bold text-white" data-testid="text-total-materials">
                          {stats.totalMaterials}
                        </p>
                      </div>
                      <div className="bg-purple-500/20 p-3 rounded-lg">
                        <i className="fas fa-file-alt text-purple-400 text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">متوسط الأداء</p>
                        <p className="text-2xl font-bold text-white" data-testid="text-average-performance">
                          {stats.averageScore}%
                        </p>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg">
                        <i className="fas fa-chart-bar text-orange-400 text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Advanced Management Tabs */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-7 bg-slate-700">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600">
                      📊 الإحصائيات
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-slate-600">
                      👥 إدارة المستخدمين
                    </TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-slate-600">
                      📚 إدارة المحتوى
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="data-[state=active]:bg-slate-600">
                      📝 إدارة الاختبارات
                    </TabsTrigger>
                    <TabsTrigger value="grades" className="data-[state=active]:bg-slate-600">
                      🎓 المراحل الدراسية
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="data-[state=active]:bg-slate-600">
                      👨‍👩‍👧‍👦 المجموعات
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-600">
                      📈 التحليلات المتقدمة
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="space-y-6 mt-6">
                    {stats && (
                      <div className="grid lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardHeader>
                            <CardTitle className="text-white">توزيع المواد التعليمية</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-500/20 p-2 rounded">
                                    <i className="fas fa-chalkboard text-blue-400"></i>
                                  </div>
                                  <span className="text-slate-200">صور السبورة</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                  {stats.materialBreakdown.whiteboard}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="bg-red-500/20 p-2 rounded">
                                    <i className="fas fa-play-circle text-red-400"></i>
                                  </div>
                                  <span className="text-slate-200">فيديوهات</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                  {stats.materialBreakdown.video}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="bg-green-500/20 p-2 rounded">
                                    <i className="fas fa-file-pdf text-green-400"></i>
                                  </div>
                                  <span className="text-slate-200">مستندات</span>
                                </div>
                                <span className="text-lg font-bold text-white">
                                  {stats.materialBreakdown.document}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardHeader>
                            <CardTitle className="text-white">توزيع الطلاب</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-slate-300 font-semibold mb-2">حسب المرحلة:</h4>
                                <div className="space-y-2">
                                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                                    <div key={grade} className="flex justify-between items-center">
                                      <span className="text-slate-200">{grade}</span>
                                      <Badge variant="outline" className="text-white">
                                        {count} طالب
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-slate-300 font-semibold mb-2">حسب المجموعة:</h4>
                                <div className="space-y-2">
                                  {Object.entries(stats.groupDistribution).map(([group, count]) => (
                                    <div key={group} className="flex justify-between items-center">
                                      <span className="text-slate-200">{group}</span>
                                      <Badge variant="outline" className="text-white">
                                        {count} طالب
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  {/* Users Management Tab */}
                  <TabsContent value="users" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        إدارة المستخدمين ({users.length})
                      </h3>
                      <Button className="bg-green-600 hover:bg-green-700" data-testid="button-add-user">
                        <i className="fas fa-user-plus ml-2"></i>
                        إضافة مستخدم جديد
                      </Button>
                    </div>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-600">
                              <TableHead className="text-slate-300">الاسم</TableHead>
                              <TableHead className="text-slate-300">البريد الإلكتروني</TableHead>
                              <TableHead className="text-slate-300">الدور</TableHead>
                              <TableHead className="text-slate-300">المرحلة</TableHead>
                              <TableHead className="text-slate-300">المجموعة</TableHead>
                              <TableHead className="text-slate-300">تاريخ التسجيل</TableHead>
                              <TableHead className="text-slate-300">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id} className="border-slate-600">
                                <TableCell className="text-white font-medium">{user.name}</TableCell>
                                <TableCell className="text-slate-300">{user.email}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={user.role === "admin" ? "destructive" : "default"}
                                    className={user.role === "admin" ? "bg-red-600" : "bg-blue-600"}
                                  >
                                    {user.role === "admin" ? "مدير" : "طالب"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-300">{user.grade || "-"}</TableCell>
                                <TableCell className="text-slate-300">{user.group || "-"}</TableCell>
                                <TableCell className="text-slate-300">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar') : "-"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-slate-500 text-slate-300"
                                      data-testid={`button-edit-user-${user.id}`}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                    {user.role !== "admin" && (
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => {
                                          if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
                                            deleteUserMutation.mutate(user.id);
                                          }
                                        }}
                                        disabled={deleteUserMutation.isPending}
                                        data-testid={`button-delete-user-${user.id}`}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Content Management Tab */}
                  <TabsContent value="content" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        إدارة المحتوى التعليمي ({materials.length})
                      </h3>
                      <div className="flex gap-2">
                        <QuizCreationDialog grades={grades} groups={groups} />
                        <MaterialUploadDialog grades={grades} groups={groups} />
                    </div>
                    
                    <div className="grid gap-4">
                      {materials.map((material) => (
                        <Card key={material.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{material.title}</h4>
                                <p className="text-sm text-slate-400">{material.subject}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-slate-300">
                                    {material.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-slate-300">
                                    {material.grade}
                                  </Badge>
                                  <Badge variant="outline" className="text-slate-300">
                                    {material.group}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-500 text-slate-300"
                                  data-testid={`button-edit-material-${material.id}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  data-testid={`button-delete-material-${material.id}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Quiz Management Tab */}
                  <TabsContent value="quizzes" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        إدارة الاختبارات ({quizzes.length})
                      </h3>
                      <QuizCreationDialog grades={grades} groups={groups} />
                    </div>
                    
                    <div className="grid gap-4">
                      {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{quiz.title}</h4>
                                <p className="text-sm text-slate-400">{quiz.subject}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-slate-300">
                                    {quiz.grade}
                                  </Badge>
                                  <Badge variant="outline" className="text-slate-300">
                                    {quiz.group}
                                  </Badge>
                                  <Badge variant="outline" className="text-slate-300">
                                    {quiz.duration} دقيقة
                                  </Badge>
                                  <Badge variant={quiz.isActive ? "default" : "destructive"} className={quiz.isActive ? "bg-green-600" : ""}>
                                    {quiz.isActive ? "نشط" : "غير نشط"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  ينتهي: {new Date(quiz.deadline).toLocaleDateString('ar')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-500 text-slate-300"
                                  data-testid={`button-edit-quiz-${quiz.id}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  data-testid={`button-delete-quiz-${quiz.id}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {quizzes.length === 0 && (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">📝</div>
                          <h4 className="text-lg font-semibold text-white mb-2">لا توجد اختبارات حالياً</h4>
                          <p className="text-slate-400 mb-4">ابدأ بإنشاء اختبار جديد للطلاب</p>
                          <QuizCreationDialog grades={grades} groups={groups} />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Grades Tab */}
                  <TabsContent value="grades" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        المراحل الدراسية ({grades.length})
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-yellow-600 hover:bg-yellow-700" data-testid="button-add-grade">
                            <i className="fas fa-plus ml-2"></i>
                            إضافة مرحلة جديدة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">إضافة مرحلة دراسية جديدة</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="grade-name" className="text-slate-300">اسم المرحلة</Label>
                              <Input
                                id="grade-name"
                                value={gradeForm.name}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="مثال: الصف الأول الإعدادي"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="input-grade-name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="grade-code" className="text-slate-300">كود المرحلة</Label>
                              <Input
                                id="grade-code"
                                value={gradeForm.code}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="مثال: grade-1"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="input-grade-code"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="grade-description" className="text-slate-300">الوصف</Label>
                              <Textarea
                                id="grade-description"
                                value={gradeForm.description}
                                onChange={(e) => setGradeForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="وصف المرحلة الدراسية"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="textarea-grade-description"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={() => createGradeMutation.mutate(gradeForm)}
                            disabled={!gradeForm.name || !gradeForm.code || createGradeMutation.isPending}
                            className="bg-yellow-600 hover:bg-yellow-700"
                            data-testid="button-create-grade"
                          >
                            {createGradeMutation.isPending ? "جاري الإضافة..." : "إضافة المرحلة"}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid gap-3">
                      {grades.map((grade) => (
                        <Card key={grade.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{grade.name}</h4>
                                <p className="text-sm text-slate-400">كود: {grade.code}</p>
                                {grade.description && (
                                  <p className="text-sm text-slate-400 mt-1">{grade.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-500 text-slate-300"
                                  data-testid={`button-edit-grade-${grade.id}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  data-testid={`button-delete-grade-${grade.id}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Groups Tab */}
                  <TabsContent value="groups" className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        المجموعات ({groups.length})
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-add-group">
                            <i className="fas fa-plus ml-2"></i>
                            إضافة مجموعة جديدة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">إضافة مجموعة جديدة</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="group-name" className="text-slate-300">اسم المجموعة</Label>
                              <Input
                                id="group-name"
                                value={groupForm.name}
                                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="مثال: المجموعة أ"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="input-group-name"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="group-code" className="text-slate-300">كود المجموعة</Label>
                              <Input
                                id="group-code"
                                value={groupForm.code}
                                onChange={(e) => setGroupForm(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="مثال: group-a"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="input-group-code"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="group-description" className="text-slate-300">الوصف</Label>
                              <Textarea
                                id="group-description"
                                value={groupForm.description}
                                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="وصف المجموعة"
                                className="bg-slate-700 border-slate-600 text-white"
                                data-testid="textarea-group-description"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={() => createGroupMutation.mutate(groupForm)}
                            disabled={!groupForm.name || !groupForm.code || createGroupMutation.isPending}
                            className="bg-cyan-600 hover:bg-cyan-700"
                            data-testid="button-create-group"
                          >
                            {createGroupMutation.isPending ? "جاري الإضافة..." : "إضافة المجموعة"}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid gap-3">
                      {groups.map((group) => (
                        <Card key={group.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{group.name}</h4>
                                <p className="text-sm text-slate-400">كود: {group.code}</p>
                                {group.description && (
                                  <p className="text-sm text-slate-400 mt-1">{group.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-slate-500 text-slate-300"
                                  data-testid={`button-edit-group-${group.id}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  data-testid={`button-delete-group-${group.id}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="space-y-6 mt-6">
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-2xl font-bold text-white mb-4">التحليلات المتقدمة</h3>
                      <p className="text-slate-400 mb-6">
                        ستتوفر هنا تحليلات شاملة لأداء الطلاب والاختبارات والمحتوى التعليمي
                      </p>
                      <Badge variant="outline" className="text-slate-300">
                        قريباً - Advanced Analytics
                      </Badge>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}