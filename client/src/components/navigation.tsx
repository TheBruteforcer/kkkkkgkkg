import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="bg-primary p-2 rounded-lg">
              <i className="fas fa-graduation-cap text-primary-foreground text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مستر محمد السيد</h1>
              <p className="text-sm text-muted-foreground">منصة التعليم الرقمية</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-4">
            {currentUser?.user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  مرحباً، {currentUser.user.name}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentUser.user.role === "admin") {
                      setLocation("/admin-dashboard");
                    } else {
                      setLocation("/student-dashboard");
                    }
                  }}
                  data-testid="button-dashboard"
                >
                  لوحة التحكم
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setLocation("/login")}
                  data-testid="button-login"
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation("/register")}
                  data-testid="button-register"
                >
                  إنشاء حساب
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
