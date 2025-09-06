import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { useCurrentUser } from "@/lib/auth";
import type { Material, Quiz, QuizAttempt, User } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();

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

  if (!currentUser?.user || currentUser.user.role !== "admin") {
    return <div>جاري التحميل...</div>;
  }

  const materials = materialsData?.materials || [];
  const quizzes = quizzesData?.quizzes || [];

  // Calculate stats
  const totalMaterials = materials.length;
  const activeQuizzes = quizzes.filter(q => q.isActive && new Date(q.deadline) > new Date()).length;
  const whiteboardImages = materials.filter(m => m.type === "whiteboard").length;
  const videos = materials.filter(m => m.type === "video").length;

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
          <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-content">
            <i className="fas fa-plus ml-2"></i>
            إضافة محتوى جديد
          </Button>
        </div>

        {/* Admin Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                    0
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
                    0%
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-create-quiz">
                <i className="fas fa-plus-circle text-xl"></i>
                إنشاء اختبار جديد
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-upload-material">
                <i className="fas fa-upload text-xl"></i>
                رفع مادة تعليمية
              </Button>
              
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
