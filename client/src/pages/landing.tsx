import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-bg py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
                مرحباً بك في منصة
                <span className="block text-accent">مستر محمد السيد</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                منصة تعليمية متطورة توفر لك أفضل تجربة تعلم تفاعلية مع محتوى عالي الجودة ومتابعة مستمرة لتقدمك الأكاديمي
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                  onClick={() => setLocation("/register")}
                  data-testid="button-start-journey"
                >
                  ابدأ رحلتك التعليمية
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 font-medium text-lg px-8 py-4 rounded-xl"
                  data-testid="button-learn-more"
                >
                  تعرف على المزيد
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-start animate-float">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600" 
                alt="Students collaborating on educational technology"
                className="rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">ميزات المنصة</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              تجربة تعليمية شاملة مصممة خصيصاً لتلبية احتياجات الطلاب العرب
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <i className={`${feature.icon} ${feature.iconColor} text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    id: 1,
    icon: "fas fa-chalkboard-teacher",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "شرح تفاعلي",
    description: "صور واضحة للسبورة مع فيديوهات شرح مفصلة لحل الواجبات والتمارين"
  },
  {
    id: 2,
    icon: "fas fa-quiz",
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    title: "اختبارات ذكية",
    description: "نظام اختبارات متطور مع تصحيح فوري وتقييم شامل للأداء"
  },
  {
    id: 3,
    icon: "fas fa-chart-line",
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
    title: "متابعة التقدم",
    description: "تقارير مفصلة عن الأداء مع رسوم بيانية لمتابعة التحسن"
  },
  {
    id: 4,
    icon: "fas fa-mobile-alt",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    title: "متوافق مع الجوال",
    description: "تصميم متجاوب يعمل بكفاءة على جميع الأجهزة والشاشات"
  },
  {
    id: 5,
    icon: "fas fa-shield-alt",
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
    title: "أمان عالي",
    description: "حماية متقدمة للبيانات مع نظام مصادقة آمن لضمان الخصوصية"
  },
  {
    id: 6,
    icon: "fas fa-search",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    title: "بحث ذكي",
    description: "محرك بحث متطور للعثور على المحتوى التعليمي بسهولة وسرعة"
  }
];
