import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, QuizAttempt } from "@shared/schema";
import { useCurrentUser } from "@/lib/auth";

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser?.user) {
      setLocation("/login");
    }
  }, [currentUser, setLocation]);

  const { data: quizData, isLoading: quizLoading } = useQuery<{ quiz: Quiz }>({
    queryKey: ["/api/quizzes", id],
    enabled: !!id && !!currentUser?.user,
  });

  const { data: attemptsData } = useQuery<{ attempts: QuizAttempt[] }>({
    queryKey: [`/api/quiz-attempts?quizId=${id}`],
    enabled: !!id && !!currentUser?.user,
  });

  const startQuizMutation = useMutation({
    mutationFn: async () => {
      console.log("=== STARTING QUIZ ATTEMPT CREATION ===");
      const attemptNumber = (attemptsData?.attempts?.length || 0) + 1;
      const payload = {
        quizId: id,
        answers: {} as Record<string, string>,
        totalQuestions: Array.isArray(quizData?.quiz.questions)
          ? Math.max(0, quizData.quiz.questions.length)
          : 0,
        attemptNumber: Math.max(1, attemptNumber),
      };
      console.log("Quiz attempt payload:", payload);
      console.log("Current user session:", currentUser?.user);

      try {
        const response = await apiRequest(
          "POST",
          "/api/quiz-attempts",
          payload,
        );
        const result = await response.json();
        console.log("Quiz attempt creation successful:", result);
        return result;
      } catch (error) {
        console.error("Quiz attempt creation failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Quiz attempt creation successful:", data);
      console.log("Setting attempt ID:", data.attempt.id);
      console.log("User who created attempt:", data.attempt.userId);
      console.log("Current session user:", currentUser?.user?.id);
      setAttemptId(data.attempt.id);
      setTimeRemaining((quizData?.quiz.duration || 0) * 60); // Convert to seconds
    },
    onError: (error) => {
      console.error("Quiz attempt mutation error:", error);
      toast({
        title: "خطأ في بدء الاختبار",
        description:
          error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error("No attempt ID");

      console.log("=== QUIZ SUBMISSION DEBUG ===");
      console.log("Attempt ID:", attemptId);
      console.log("Current User:", currentUser);
      console.log("Current User ID:", currentUser?.user?.id);
      console.log("Answers:", answers);

      // Check session consistency
      console.log(
        "Session check - User ID from context:",
        currentUser?.user?.id,
      );

      // Refresh session before submission to ensure it's valid
      try {
        console.log("Refreshing session...");
        const sessionResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!sessionResponse.ok) {
          throw new Error("Session invalid - redirecting to login");
        }
        const sessionData = await sessionResponse.json();
        console.log("Session refresh result:", sessionData);

        if (
          !sessionData.user ||
          sessionData.user.id !== currentUser?.user?.id
        ) {
          console.error("Session user mismatch after refresh:", {
            sessionUser: sessionData.user?.id,
            contextUser: currentUser?.user?.id,
          });
          throw new Error("Session mismatch detected");
        }
      } catch (sessionError) {
        console.error("Session validation failed:", sessionError);
        toast({
          title: "انتهت جلسة العمل",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive",
        });
        setLocation("/login");
        return;
      }

      // Debug: Check if attempt exists before submitting
      try {
        console.log("Checking if attempt exists...");
        const debugResponse = await fetch(
          `/api/quiz-attempts/${attemptId}/debug`,
          {
            credentials: "include",
          },
        );
        const debugData = await debugResponse.json();
        console.log("Debug endpoint response:", debugData);
        console.log("SESSION MISMATCH DETECTED:", {
          sessionUserId: debugData.sessionUserId,
          currentUserId: currentUser?.user?.id,
          attemptUserId: debugData.attemptUserId,
          sessionMatch: debugData.sessionUserId === currentUser?.user?.id,
          attemptMatch: debugData.attemptUserId === currentUser?.user?.id,
        });
      } catch (debugError) {
        console.error("Debug endpoint failed:", debugError);
      }

      // Calculate score
      const questions = Array.isArray(quizData?.quiz.questions)
        ? quizData.quiz.questions
        : [];
      let score = 0;

      questions.forEach((question: any, index: number) => {
        const questionId = `q${index}`;
        const userAnswer = answers[questionId];
        const correctAnswer = question.correctAnswer;

        console.log(`Question ${index}:`, {
          type: question.type,
          userAnswer,
          correctAnswer,
          match: userAnswer === correctAnswer,
        });

        // For true/false questions, handle Arabic text comparison
        if (question.type === "true-false") {
          if (userAnswer === correctAnswer) {
            score++;
          }
        } else {
          // For multiple choice, compare letters (a, b, c, d)
          if (userAnswer === correctAnswer) {
            score++;
          }
        }
      });

      const payload = {
        answers,
        score,
        completedAt: new Date().toISOString(),
      };

      console.log("Final score:", score);
      console.log("Submission payload:", payload);
      console.log("Request URL:", `/api/quiz-attempts/${attemptId}`);

      try {
        const response = await apiRequest(
          "PUT",
          `/api/quiz-attempts/${attemptId}`,
          payload,
        );

        console.log("Quiz submission successful");
        return response.json();
      } catch (error) {
        console.error("Quiz submission failed:", error);
        // Re-throw the error to be handled by the mutation's onError
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "تم تسليم الاختبار بنجاح",
        description: "يمكنك مراجعة نتيجتك في لوحة التحكم",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      setLocation("/student-dashboard");
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev <= 1) {
          // Auto-submit when time runs out
          submitQuizMutation.mutate();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitQuizMutation]);

  if (!currentUser?.user) {
    return <div>جاري التحميل...</div>;
  }

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (!quizData?.quiz) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">الاختبار غير موجود</p>
            <Button
              className="mt-4"
              onClick={() => setLocation("/student-dashboard")}
              data-testid="button-back-dashboard"
            >
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quiz = quizData.quiz;
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!attemptId) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground mb-6">{quiz.description}</p>
            )}

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">عدد الأسئلة</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">المدة</p>
                <p className="text-2xl font-bold">{quiz.duration} دقيقة</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  المحاولات المسموحة
                </p>
                <p className="text-2xl font-bold">{quiz.maxAttempts}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={() => startQuizMutation.mutate()}
                disabled={startQuizMutation.isPending}
                data-testid="button-start-quiz"
              >
                {startQuizMutation.isPending
                  ? "جاري البدء..."
                  : "ابدأ الاختبار"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/student-dashboard")}
                data-testid="button-cancel-quiz"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {quiz.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>
                    <i className="fas fa-question-circle ml-2"></i>
                    {questions.length} سؤال
                  </span>
                  {timeRemaining !== null && (
                    <span
                      className={
                        timeRemaining < 300 ? "text-destructive font-bold" : ""
                      }
                    >
                      <i className="fas fa-clock ml-2"></i>
                      {formatTime(timeRemaining)} متبقي
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => submitQuizMutation.mutate()}
                  disabled={submitQuizMutation.isPending}
                  data-testid="button-submit-quiz"
                >
                  تسليم الاختبار
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  السؤال {currentQuestionIndex + 1} من {questions.length}
                </span>
                <span>{answeredCount} تم الإجابة عليها</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {currentQuestionIndex + 1}
                  </div>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    {currentQuestion.type === "multiple-choice"
                      ? "اختيار من متعدد"
                      : "صح/خطأ"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={answers[`q${currentQuestionIndex}`] || ""}
                onValueChange={(value) => {
                  setAnswers((prev) => ({
                    ...prev,
                    [`q${currentQuestionIndex}`]: value,
                  }));
                }}
              >
                {currentQuestion.type === "true-false"
                  ? // Handle true/false questions with proper Arabic options
                    ["صح", "خطأ"].map((option: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-reverse space-x-2 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          data-testid={`radio-option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))
                  : // Handle multiple choice questions
                    currentQuestion.options?.map(
                      (option: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-reverse space-x-2 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <RadioGroupItem
                            value={String.fromCharCode(97 + index)}
                            id={`option-${index}`}
                            data-testid={`radio-option-${index}`}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ),
                    )}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
            data-testid="button-previous-question"
          >
            <i className="fas fa-arrow-right ml-2"></i>
            السؤال السابق
          </Button>

          <Button
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else {
                submitQuizMutation.mutate();
              }
            }}
            disabled={submitQuizMutation.isPending}
            data-testid="button-next-question"
          >
            {currentQuestionIndex === questions.length - 1
              ? "إنهاء الاختبار"
              : "السؤال التالي"}
            <i className="fas fa-arrow-left mr-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
