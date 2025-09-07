import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import MaterialCard from "@/components/material-card";
import QuizCard from "@/components/quiz-card";
import { useCurrentUser } from "@/lib/auth";
import type { Material, Quiz, QuizAttempt } from "@shared/schema";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: currentUser } = useCurrentUser();

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!currentUser?.user) {
      setLocation("/login");
    } else if (currentUser.user.role === "admin") {
      setLocation("/admin-dashboard");
    }
  }, [currentUser, setLocation]);

  const { data: materialsData } = useQuery<{ materials: Material[] }>({
    queryKey: ["/api/materials"],
    enabled: !!currentUser?.user,
  });

  const { data: quizzesData } = useQuery<{ quizzes: Quiz[] }>({
    queryKey: ["/api/quizzes"],
    enabled: !!currentUser?.user,
  });

  const { data: attemptsData } = useQuery<{ attempts: QuizAttempt[] }>({
    queryKey: ["/api/quiz-attempts"],
    enabled: !!currentUser?.user,
  });

  if (!currentUser?.user) {
    return <div>جاري التحميل...</div>;
  }

  const materials = materialsData?.materials || [];
  const quizzes = quizzesData?.quizzes || [];
  const attempts = attemptsData?.attempts || [];

  // Filter materials by search term
  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate materials by type
  const whiteboardImages = filteredMaterials.filter(m => m.type === "whiteboard");
  const videos = filteredMaterials.filter(m => m.type === "video");

  // Calculate stats
  const totalMaterials = materials.length;
  const completedQuizzes = attempts.filter(a => a.completedAt).length;
  const completedAttempts = attempts.filter(a => a.completedAt && a.score !== null);
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + ((a.score || 0) / (a.totalQuestions || 1)) * 100, 0) / completedAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-muted/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            مرحباً، {currentUser.user.name}
          </h1>
          <p className="text-muted-foreground">
            {getGradeName(currentUser.user.grade)} - {getGroupName(currentUser.user.group)}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="ابحث في المواد التعليمية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search"
            />
            <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المواد</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-materials">
                    {totalMaterials}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <i className="fas fa-book text-blue-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الاختبارات المكتملة</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-completed-quizzes">
                    {completedQuizzes}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <i className="fas fa-check-circle text-green-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الدرجات</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-average-score">
                    {averageScore}%
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <i className="fas fa-chart-line text-accent text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>المحتوى التعليمي</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="whiteboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="whiteboard" data-testid="tab-whiteboard">صور السبورة</TabsTrigger>
                <TabsTrigger value="videos" data-testid="tab-videos">فيديوهات الحل</TabsTrigger>
                <TabsTrigger value="quizzes" data-testid="tab-quizzes">الاختبارات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="whiteboard" className="mt-6">
                {whiteboardImages.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whiteboardImages.map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد صور سبورة متاحة حالياً
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="videos" className="mt-6">
                {videos.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {videos.map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد فيديوهات متاحة حالياً
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="quizzes" className="mt-6">
                {quizzes.length > 0 ? (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => {
                      const attempt = attempts.find(a => a.quizId === quiz.id && a.completedAt);
                      return (
                        <QuizCard 
                          key={quiz.id} 
                          quiz={quiz} 
                          attempt={attempt}
                          onStartQuiz={() => setLocation(`/quiz/${quiz.id}`)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد اختبارات متاحة حالياً
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGradeName(grade: string | null) {
  switch (grade) {
    case "grade-1": return "الصف الأول الإعدادي";
    case "grade-2": return "الصف الثاني الإعدادي";
    case "grade-3": return "الصف الثالث الإعدادي";
    default: return "غير محدد";
  }
}

function getGroupName(group: string | null) {
  switch (group) {
    case "group-a": return "المجموعة أ";
    case "group-b": return "المجموعة ب";
    case "group-c": return "المجموعة ج";
    default: return "غير محدد";
  }
}
