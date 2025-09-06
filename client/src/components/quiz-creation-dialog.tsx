import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, Grade, Group } from "@shared/schema";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswer: string;
}

interface QuizFormData {
  title: string;
  description: string;
  grade: string;
  group: string;
  subject: string;
  duration: number;
  maxAttempts: number;
  deadline: string;
  isActive: boolean;
  questions: Question[];
}

interface QuizCreationDialogProps {
  grades: Grade[];
  groups: Group[];
}

export default function QuizCreationDialog({ grades, groups }: QuizCreationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    grade: "",
    group: "",
    subject: "",
    duration: 30,
    maxAttempts: 1,
    deadline: "",
    isActive: true,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: ""
  });

  const createQuizMutation = useMutation({
    mutationFn: (data: QuizFormData) => apiRequest("POST", "/api/quizzes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم إنشاء الاختبار بنجاح" });
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء الاختبار", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      grade: "",
      group: "",
      subject: "",
      duration: 30,
      maxAttempts: 1,
      deadline: "",
      isActive: true,
      questions: []
    });
    setCurrentQuestion({
      id: "",
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({ title: "يرجى إدخال نص السؤال", variant: "destructive" });
      return;
    }

    if (currentQuestion.type === "multiple-choice" && !currentQuestion.options.every(opt => opt.trim())) {
      toast({ title: "يرجى إدخال جميع الخيارات", variant: "destructive" });
      return;
    }

    if (!currentQuestion.correctAnswer) {
      toast({ title: "يرجى اختيار الإجابة الصحيحة", variant: "destructive" });
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      id: `q${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      id: "",
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "يرجى إدخال عنوان الاختبار", variant: "destructive" });
      return;
    }

    if (!formData.grade || !formData.group) {
      toast({ title: "يرجى اختيار المرحلة والمجموعة", variant: "destructive" });
      return;
    }

    if (!formData.deadline) {
      toast({ title: "يرجى تحديد موعد انتهاء الاختبار", variant: "destructive" });
      return;
    }

    if (formData.questions.length === 0) {
      toast({ title: "يرجى إضافة سؤال واحد على الأقل", variant: "destructive" });
      return;
    }

    createQuizMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-quiz">
          <i className="fas fa-plus-circle ml-2"></i>
          إنشاء اختبار جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">إنشاء اختبار جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Quiz Information */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">معلومات الاختبار الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title" className="text-slate-300">عنوان الاختبار</Label>
                  <Input
                    id="quiz-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان الاختبار"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-quiz-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-subject" className="text-slate-300">المادة الدراسية</Label>
                  <Input
                    id="quiz-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="مثال: الرياضيات"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-quiz-subject"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quiz-description" className="text-slate-300">وصف الاختبار</Label>
                <Textarea
                  id="quiz-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف الاختبار (اختياري)"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="textarea-quiz-description"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-grade" className="text-slate-300">المرحلة الدراسية</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.code}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiz-group" className="text-slate-300">المجموعة</Label>
                  <Select value={formData.group} onValueChange={(value) => setFormData(prev => ({ ...prev, group: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="اختر المجموعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.code}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiz-duration" className="text-slate-300">المدة (دقيقة)</Label>
                  <Input
                    id="quiz-duration"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-quiz-duration"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-max-attempts" className="text-slate-300">عدد المحاولات المسموحة</Label>
                  <Input
                    id="quiz-max-attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-quiz-max-attempts"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiz-deadline" className="text-slate-300">موعد انتهاء الاختبار</Label>
                  <Input
                    id="quiz-deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-quiz-deadline"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Management */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">إدارة الأسئلة ({formData.questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Question Form */}
              <div className="space-y-4 p-4 bg-slate-600/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="question-text" className="text-slate-300">نص السؤال</Label>
                  <Textarea
                    id="question-text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="أدخل نص السؤال هنا..."
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="textarea-question-text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-type" className="text-slate-300">نوع السؤال</Label>
                  <Select value={currentQuestion.type} onValueChange={(value: "multiple-choice" | "true-false") => setCurrentQuestion(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">اختيار من متعدد</SelectItem>
                      <SelectItem value="true-false">صح/خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentQuestion.type === "multiple-choice" && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">خيارات الإجابة</Label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-slate-300 w-8">{String.fromCharCode(97 + index)}.</span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`الخيار ${String.fromCharCode(97 + index)}`}
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid={`input-option-${index}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = String.fromCharCode(97 + index);
                            setCurrentQuestion(prev => ({ ...prev, correctAnswer: newOptions[index] }));
                          }}
                          className={currentQuestion.correctAnswer === String.fromCharCode(97 + index) ? "bg-green-600" : ""}
                          data-testid={`button-set-correct-${index}`}
                        >
                          ✓
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "true-false" && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">الإجابة الصحيحة</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={currentQuestion.correctAnswer === "true" ? "default" : "outline"}
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: "true" }))}
                        className={currentQuestion.correctAnswer === "true" ? "bg-green-600" : ""}
                        data-testid="button-correct-true"
                      >
                        صح
                      </Button>
                      <Button
                        variant={currentQuestion.correctAnswer === "false" ? "default" : "outline"}
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: "false" }))}
                        className={currentQuestion.correctAnswer === "false" ? "bg-green-600" : ""}
                        data-testid="button-correct-false"
                      >
                        خطأ
                      </Button>
                    </div>
                  </div>
                )}

                <Button onClick={addQuestion} className="w-full bg-green-600 hover:bg-green-700" data-testid="button-add-question">
                  <i className="fas fa-plus ml-2"></i>
                  إضافة السؤال
                </Button>
              </div>

              {/* Added Questions List */}
              {formData.questions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">الأسئلة المضافة</Label>
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-slate-300">
                            {index + 1}
                          </Badge>
                          <span className="text-white font-medium">{question.question}</span>
                          <Badge variant="outline" className="text-slate-300">
                            {question.type === "multiple-choice" ? "اختيار من متعدد" : "صح/خطأ"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        data-testid={`button-remove-question-${index}`}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={createQuizMutation.isPending || formData.questions.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-submit-quiz"
          >
            {createQuizMutation.isPending ? "جاري الإنشاء..." : "إنشاء الاختبار"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-slate-500 text-slate-300"
            data-testid="button-cancel-quiz"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
