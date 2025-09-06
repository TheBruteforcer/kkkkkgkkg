import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Material, Grade, Group } from "@shared/schema";

interface MaterialFormData {
  title: string;
  description: string;
  type: "whiteboard" | "video" | "document";
  url: string;
  grade: string;
  group: string;
  subject: string;
}

interface MaterialUploadDialogProps {
  grades: Grade[];
  groups: Group[];
}

export default function MaterialUploadDialog({ grades, groups }: MaterialUploadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("whiteboard");
  
  const [formData, setFormData] = useState<MaterialFormData>({
    title: "",
    description: "",
    type: "whiteboard",
    url: "",
    grade: "",
    group: "",
    subject: ""
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data: MaterialFormData) => apiRequest("POST", "/api/materials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم رفع المادة التعليمية بنجاح" });
      setIsOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ في رفع المادة التعليمية", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "whiteboard",
      url: "",
      grade: "",
      group: "",
      subject: ""
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFormData(prev => ({
      ...prev,
      type: value as "whiteboard" | "video" | "document"
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "يرجى إدخال عنوان المادة", variant: "destructive" });
      return;
    }

    if (!formData.url.trim()) {
      toast({ title: "يرجى إدخال رابط المادة", variant: "destructive" });
      return;
    }

    if (!formData.grade || !formData.group) {
      toast({ title: "يرجى اختيار المرحلة والمجموعة", variant: "destructive" });
      return;
    }

    if (!formData.subject.trim()) {
      toast({ title: "يرجى إدخال المادة الدراسية", variant: "destructive" });
      return;
    }

    // Validate URL format
    if (formData.type === "video" && !formData.url.includes("youtube.com") && !formData.url.includes("youtu.be")) {
      toast({ title: "يرجى إدخال رابط يوتيوب صحيح", variant: "destructive" });
      return;
    }

    createMaterialMutation.mutate(formData);
  };

  const getPlaceholderText = () => {
    switch (formData.type) {
      case "whiteboard":
        return "https://example.com/whiteboard-image.jpg";
      case "video":
        return "https://www.youtube.com/watch?v=...";
      case "document":
        return "https://example.com/document.pdf";
      default:
        return "https://example.com/file";
    }
  };

  const getTypeDescription = () => {
    switch (formData.type) {
      case "whiteboard":
        return "صور السبورة مع الشرح والتمارين";
      case "video":
        return "فيديوهات حل الواجبات والشرح";
      case "document":
        return "ملفات PDF ووثائق تعليمية";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-upload-material">
          <i className="fas fa-upload ml-2"></i>
          رفع مادة تعليمية
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">رفع مادة تعليمية جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Material Type Selection */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">نوع المادة التعليمية</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-600">
                  <TabsTrigger value="whiteboard" className="data-[state=active]:bg-slate-500">
                    <i className="fas fa-chalkboard ml-2"></i>
                    صور السبورة
                  </TabsTrigger>
                  <TabsTrigger value="video" className="data-[state=active]:bg-slate-500">
                    <i className="fas fa-play-circle ml-2"></i>
                    فيديوهات الحل
                  </TabsTrigger>
                  <TabsTrigger value="document" className="data-[state=active]:bg-slate-500">
                    <i className="fas fa-file-pdf ml-2"></i>
                    المستندات
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="whiteboard" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fas fa-chalkboard text-blue-400 text-xl"></i>
                        <h4 className="font-semibold text-blue-400">صور السبورة</h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        ارفع صور واضحة للسبورة تحتوي على الشرح والتمارين المحلولة
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whiteboard-title" className="text-slate-300">عنوان الصورة</Label>
                        <Input
                          id="whiteboard-title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="مثال: شرح درس الجبر - التمرين الأول"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-whiteboard-title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whiteboard-description" className="text-slate-300">وصف الصورة</Label>
                        <Textarea
                          id="whiteboard-description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="وصف مفصل لما تحتويه الصورة من شرح وتمارين..."
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={3}
                          data-testid="textarea-whiteboard-description"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whiteboard-url" className="text-slate-300">رابط الصورة</Label>
                        <Input
                          id="whiteboard-url"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                          placeholder={getPlaceholderText()}
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-whiteboard-url"
                        />
                        <p className="text-xs text-slate-400">
                          يمكنك رفع الصورة على Google Drive أو أي خدمة تخزين سحابي أخرى
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="video" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fas fa-play-circle text-red-400 text-xl"></i>
                        <h4 className="font-semibold text-red-400">فيديوهات حل الواجبات</h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        ارفع فيديوهات شرح حل الواجبات والتمارين على يوتيوب
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-title" className="text-slate-300">عنوان الفيديو</Label>
                        <Input
                          id="video-title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="مثال: حل واجب الرياضيات - الدرس الثالث"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-video-title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="video-description" className="text-slate-300">وصف الفيديو</Label>
                        <Textarea
                          id="video-description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="وصف مفصل لمحتوى الفيديو وما يحتويه من شرح وحلول..."
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={3}
                          data-testid="textarea-video-description"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="video-url" className="text-slate-300">رابط يوتيوب</Label>
                        <Input
                          id="video-url"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-video-url"
                        />
                        <p className="text-xs text-slate-400">
                          يجب أن يكون الرابط من يوتيوب فقط
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="document" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <i className="fas fa-file-pdf text-green-400 text-xl"></i>
                        <h4 className="font-semibold text-green-400">المستندات التعليمية</h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        ارفع ملفات PDF ووثائق تعليمية إضافية
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-title" className="text-slate-300">عنوان المستند</Label>
                        <Input
                          id="document-title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="مثال: ملخص قواعد اللغة العربية"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-document-title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="document-description" className="text-slate-300">وصف المستند</Label>
                        <Textarea
                          id="document-description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="وصف مفصل لمحتوى المستند..."
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={3}
                          data-testid="textarea-document-description"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="document-url" className="text-slate-300">رابط المستند</Label>
                        <Input
                          id="document-url"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://example.com/document.pdf"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-document-url"
                        />
                        <p className="text-xs text-slate-400">
                          يمكنك رفع الملف على Google Drive أو أي خدمة تخزين سحابي أخرى
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Material Classification */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">تصنيف المادة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material-subject" className="text-slate-300">المادة الدراسية</Label>
                  <Input
                    id="material-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="مثال: الرياضيات، اللغة العربية، العلوم"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-material-subject"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material-grade" className="text-slate-300">المرحلة الدراسية</Label>
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
                  <Label htmlFor="material-group" className="text-slate-300">المجموعة</Label>
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
              </div>
              
              <div className="bg-slate-600/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-info-circle text-blue-400"></i>
                  <span className="text-blue-400 font-medium">معلومات التصنيف</span>
                </div>
                <p className="text-slate-300 text-sm">
                  سيتم عرض هذه المادة للطلاب في المرحلة والمجموعة المحددة فقط
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.title && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">معاينة المادة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-slate-300">
                      {formData.type === "whiteboard" ? "صور السبورة" : 
                       formData.type === "video" ? "فيديوهات الحل" : "المستندات"}
                    </Badge>
                    <span className="text-white font-medium">{formData.title}</span>
                  </div>
                  
                  {formData.description && (
                    <p className="text-slate-300 text-sm">{formData.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-slate-300">
                      {grades.find(g => g.code === formData.grade)?.name || formData.grade}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300">
                      {groups.find(g => g.code === formData.group)?.name || formData.group}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300">
                      {formData.subject}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={createMaterialMutation.isPending || !formData.title || !formData.url || !formData.grade || !formData.group || !formData.subject}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-submit-material"
          >
            {createMaterialMutation.isPending ? "جاري الرفع..." : "رفع المادة"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-slate-500 text-slate-300"
            data-testid="button-cancel-material"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
