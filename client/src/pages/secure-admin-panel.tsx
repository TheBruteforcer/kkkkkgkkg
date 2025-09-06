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

export default function SecureAdminPanel() {
  const queryClient = useQueryClient();
  const { data: materialsData } = useQuery<{ materials: Material[] }>({
    queryKey: ["/api/materials"],
    // ...other query options...
  });
  const { data: gradesData } = useQuery<{ grades: Grade[] }>({
    queryKey: ["/api/grades"],
  });
  const { data: groupsData } = useQuery<{ groups: Group[] }>({
    queryKey: ["/api/groups"],
  });

  // Example loading and error handling (adjust to your needs)
  if (!materialsData || !gradesData || !groupsData) {
    return <div>Loading...</div>;
  }

  const materials = materialsData.materials || [];
  const grades = gradesData.grades || [];
  const groups = groupsData.groups || [];

  return (
    <TabsContent value="content" className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          إدارة المحتوى التعليمي ({materials.length})
        </h3>
        <div className="flex gap-2">
          <QuizCreationDialog grades={grades} groups={groups} />
          <MaterialUploadDialog grades={grades} groups={groups} />
        </div>
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
  );
}