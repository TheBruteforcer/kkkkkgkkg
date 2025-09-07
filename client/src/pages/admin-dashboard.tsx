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
import Navigation from "@/components/navigation";
import { useCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import QuizCreationDialog from "@/components/quiz-creation-dialog";
import MaterialUploadDialog from "@/components/material-upload-dialog";
import type { Material, Quiz, QuizAttempt, User, Grade, Group } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [gradeForm, setGradeForm] = useState({ name: "", code: "", description: "" });
  const [groupForm, setGroupForm] = useState({ name: "", code: "", description: "" });
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!currentUser?.user) {
      setLocation("/login");
    } else if (currentUser.user.role !== "admin") {
      setLocation("/student-dashboard");
    }
  }, [currentUser, setLocation]);

  const { data: materialsData } = useQuery<{ materials: Material[] }>({
    queryKey: ["/api/materials"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin",
  });

  const { data: quizzesData } = useQuery<{ quizzes: Quiz[] }>({
    queryKey: ["/api/quizzes"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin",
  });

  const { data: gradesData } = useQuery<{ grades: Grade[] }>({
    queryKey: ["/api/grades"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin",
  });

  const { data: groupsData } = useQuery<{ groups: Group[] }>({
    queryKey: ["/api/groups"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin",
  });

  if (!currentUser?.user || currentUser.user.role !== "admin") {
    return <div>جاري التحميل...</div>;
  }

  const materials = materialsData?.materials || [];
  const quizzes = quizzesData?.quizzes || [];
  const grades = gradesData?.grades || [];
  const groups = groupsData?.groups || [];

  // Grade mutations
  const createGradeMutation = useMutation({
    mutationFn: (data: typeof gradeForm) => apiRequest("POST", "/api/grades", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      setGradeForm({ name: "", code: "", description: "" });
      toast({ title: "تم إضافة المرحلة الدراسية بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في إضافة المرحلة الدراسية", variant: "destructive" });
    }
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Grade>) => apiRequest("PUT", `/api/grades/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      setEditingGrade(null);
      toast({ title: "تم تحديث المرحلة الدراسية بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المرحلة الدراسية", variant: "destructive" });
    }
  });

  const deleteGradeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/grades/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({ title: "تم حذف المرحلة الدراسية بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المرحلة الدراسية", variant: "destructive" });
    }
  });

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: (data: typeof groupForm) => apiRequest("POST", "/api/groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setGroupForm({ name: "", code: "", description: "" });
      toast({ title: "تم إضافة المجموعة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في إضافة المجموعة", variant: "destructive" });
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Group>) => apiRequest("PUT", `/api/groups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setEditingGroup(null);
      toast({ title: "تم تحديث المجموعة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المجموعة", variant: "destructive" });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "تم حذف المجموعة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المجموعة", variant: "destructive" });
    }
  });

  // Calculate stats
  const totalMaterials = materials.length;
  const activeQuizzes = quizzes.filter(q => q.isActive && new Date(q.deadline) > new Date()).length;
  const whiteboardImages = materials.filter(m => m.type === "whiteboard").length;
  const videos = materials.filter(m => m.type === "video").length;

  // Get dynamic stats from API
  const { data: adminStats } = useQuery<{
    stats: {
      totalStudents: number;
      averageScore: number;
    };
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!currentUser?.user && currentUser.user.role === "admin",
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              لوحة تحكم المعلم
            </h1>
            <p className="text-muted-foreground">
              مرحباً {currentUser.user.name} - إدارة المحتوى والاختبارات
            </p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                    {adminStats?.stats.totalStudents || 0}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <i className="fas fa-users text-blue-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الاختبارات النشطة</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-active-quizzes">
                    {activeQuizzes}
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <i className="fas fa-clipboard-list text-accent text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المواد المرفوعة</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-materials">
                    {totalMaterials}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <i className="fas fa-file-alt text-green-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الأداء</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-average-performance">
                    {Math.round(adminStats?.stats.averageScore || 0)}%
                  </p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <i className="fas fa-chart-bar text-purple-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>توزيع المواد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <i className="fas fa-chalkboard text-blue-500"></i>
                    </div>
                    <span className="font-medium">صور السبورة</span>
                  </div>
                  <span className="text-lg font-bold" data-testid="text-whiteboard-count">
                    {whiteboardImages}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg">
                      <i className="fas fa-play-circle text-red-500"></i>
                    </div>
                    <span className="font-medium">فيديوهات الحل</span>
                  </div>
                  <span className="text-lg font-bold" data-testid="text-videos-count">
                    {videos}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الاختبارات الحديثة</CardTitle>
            </CardHeader>
            <CardContent>
              {quizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {quiz.grade} - {quiz.group}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-quiz-${quiz.id}`}>
                        عرض التفاصيل
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد اختبارات حالياً
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Groups and Grades Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>إدارة المجموعات والمراحل الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grades" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grades">المراحل الدراسية</TabsTrigger>
                <TabsTrigger value="groups">المجموعات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grades" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">المراحل الدراسية ({grades.length})</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-grade">
                        <i className="fas fa-plus ml-2"></i>
                        إضافة مرحلة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>إضافة مرحلة دراسية جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="grade-name">اسم المرحلة</Label>
                          <Input
                            id="grade-name"
                            value={gradeForm.name}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: الصف الأول الإعدادي"
                            data-testid="input-grade-name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="grade-code">كود المرحلة</Label>
                          <Input
                            id="grade-code"
                            value={gradeForm.code}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="مثال: grade-1"
                            data-testid="input-grade-code"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="grade-description">الوصف (اختياري)</Label>
                          <Textarea
                            id="grade-description"
                            value={gradeForm.description}
                            onChange={(e) => setGradeForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="وصف المرحلة الدراسية"
                            data-testid="textarea-grade-description"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => createGradeMutation.mutate(gradeForm)}
                          disabled={!gradeForm.name || !gradeForm.code || createGradeMutation.isPending}
                          data-testid="button-create-grade"
                        >
                          {createGradeMutation.isPending ? "جاري الإضافة..." : "إضافة المرحلة"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid gap-3">
                  {grades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{grade.name}</h4>
                        <p className="text-sm text-muted-foreground">كود: {grade.code}</p>
                        {grade.description && (
                          <p className="text-sm text-muted-foreground mt-1">{grade.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingGrade(grade)}
                          data-testid={`button-edit-grade-${grade.id}`}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذه المرحلة؟")) {
                              deleteGradeMutation.mutate(grade.id);
                            }
                          }}
                          disabled={deleteGradeMutation.isPending}
                          data-testid={`button-delete-grade-${grade.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {grades.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لا توجد مراحل دراسية حالياً
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="groups" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">المجموعات ({groups.length})</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-group">
                        <i className="fas fa-plus ml-2"></i>
                        إضافة مجموعة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>إضافة مجموعة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="group-name">اسم المجموعة</Label>
                          <Input
                            id="group-name"
                            value={groupForm.name}
                            onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="مثال: المجموعة أ"
                            data-testid="input-group-name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="group-code">كود المجموعة</Label>
                          <Input
                            id="group-code"
                            value={groupForm.code}
                            onChange={(e) => setGroupForm(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="مثال: group-a"
                            data-testid="input-group-code"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="group-description">الوصف (اختياري)</Label>
                          <Textarea
                            id="group-description"
                            value={groupForm.description}
                            onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="وصف المجموعة"
                            data-testid="textarea-group-description"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => createGroupMutation.mutate(groupForm)}
                          disabled={!groupForm.name || !groupForm.code || createGroupMutation.isPending}
                          data-testid="button-create-group"
                        >
                          {createGroupMutation.isPending ? "جاري الإضافة..." : "إضافة المجموعة"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid gap-3">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">كود: {group.code}</p>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingGroup(group)}
                          data-testid={`button-edit-group-${group.id}`}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذه المجموعة؟")) {
                              deleteGroupMutation.mutate(group.id);
                            }
                          }}
                          disabled={deleteGroupMutation.isPending}
                          data-testid={`button-delete-group-${group.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لا توجد مجموعات حالياً
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <QuizCreationDialog grades={grades} groups={groups} />
              
              <MaterialUploadDialog grades={grades} groups={groups} />
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-view-analytics">
                <i className="fas fa-chart-line text-xl"></i>
                عرض التحليلات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
