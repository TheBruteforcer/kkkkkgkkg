import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quiz, QuizAttempt } from "@shared/schema";
import { formatDistanceToNow, isPast } from "date-fns";
import { ar } from "date-fns/locale";

interface QuizCardProps {
  quiz: Quiz;
  attempt?: QuizAttempt;
  onStartQuiz: () => void;
}

export default function QuizCard({ quiz, attempt, onStartQuiz }: QuizCardProps) {
  const isExpired = isPast(new Date(quiz.deadline));
  const isCompleted = !!attempt?.completedAt;
  
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-500/10 text-green-500">
          مكتمل
        </Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge variant="destructive">
          منتهي الصلاحية
        </Badge>
      );
    }
    return (
      <Badge className="bg-accent/10 text-accent">
        متاح الآن
      </Badge>
    );
  };

  const getActionButton = () => {
    if (isCompleted) {
      return (
        <Button variant="outline" size="sm" data-testid={`button-view-result-${quiz.id}`}>
          عرض النتيجة
        </Button>
      );
    }
    if (isExpired) {
      return (
        <Button variant="outline" size="sm" disabled>
          انتهت المهلة
        </Button>
      );
    }
    return (
      <Button 
        onClick={onStartQuiz}
        size="sm"
        data-testid={`button-start-quiz-${quiz.id}`}
      >
        ابدأ الاختبار
      </Button>
    );
  };

  const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  const timeUntilDeadline = formatDistanceToNow(new Date(quiz.deadline), { 
    addSuffix: true, 
    locale: ar 
  });

  return (
    <Card className="hover:shadow-lg transition-all" data-testid={`card-quiz-${quiz.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg mb-2" data-testid={`text-quiz-title-${quiz.id}`}>
              {quiz.title}
            </h3>
            
            {quiz.description && (
              <p className="text-muted-foreground mb-3">{quiz.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                <i className="fas fa-question-circle ml-2"></i>
                {questionsCount} سؤال
              </span>
              <span>
                <i className="fas fa-clock ml-2"></i>
                {quiz.duration} دقيقة
              </span>
              <span>
                <i className="fas fa-calendar ml-2"></i>
                {isExpired ? "انتهى" : `ينتهي ${timeUntilDeadline}`}
              </span>
              <span>
                <i className="fas fa-redo ml-2"></i>
                {quiz.maxAttempts} محاولة كحد أقصى
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              {getStatusBadge()}
              {isCompleted && attempt?.score !== null && (
                <div className="text-sm text-muted-foreground mt-1">
                  الدرجة: <span className="font-bold" data-testid={`text-quiz-score-${quiz.id}`}>
                    {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                  </span>
                </div>
              )}
            </div>
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
