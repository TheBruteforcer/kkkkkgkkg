import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from "@/components/auth-guard";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import StudentDashboard from "@/pages/student-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import SecureAdminPanel from "@/pages/secure-admin-panel";
import QuizPage from "@/pages/quiz";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/student-dashboard">
        <AuthGuard requireAuth>
          <StudentDashboard />
        </AuthGuard>
      </Route>
      <Route path="/admin-dashboard">
        <AuthGuard requireAuth requireAdmin>
          <AdminDashboard />
        </AuthGuard>
      </Route>
      <Route path="/secure-admin-control-panel">
        <AuthGuard requireAuth requireAdmin>
          <SecureAdminPanel />
        </AuthGuard>
      </Route>
      <Route path="/quiz/:id">
        <AuthGuard requireAuth>
          <QuizPage />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
