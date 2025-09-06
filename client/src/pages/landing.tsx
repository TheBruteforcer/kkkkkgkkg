import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="gradient-bg py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center animate-fade-in">
          <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            منصة <span className="text-accent">GameNightBalancer</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
            سهّل تنظيم وتوزيع الألعاب بين الأصدقاء أو الطلاب مع منصة متكاملة وسهلة الاستخدام.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            onClick={() => setLocation("/register")}
            data-testid="button-start-journey"
          >
            ابدأ الآن
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-10 text-center">كيف تعمل المنصة؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.id} className="bg-card p-6 rounded-2xl shadow-md flex flex-col items-center animate-slide-up">
                <div className="w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl bg-primary/10 text-primary">
                  <i className={step.icon}></i>
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">مميزات المنصة</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              كل ما تحتاجه لتنظيم فعاليات الألعاب أو الدراسة بسهولة وفعالية
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

      {/* Call to Action */}
      <section className="py-12 bg-accent/10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-accent">جاهز لتجربة أفضل تنظيم؟</h2>
          <p className="mb-6 text-muted-foreground">سجّل الآن وابدأ بتنظيم فعالياتك بسهولة واحترافية.</p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            onClick={() => setLocation("/register")}
          >
            إنشاء حساب جديد
          </Button>
        </div>
      </section>
    </div>
  );
}

const howItWorks = [
  {
    id: 1,
    icon: "fas fa-user-plus",
    title: "سجّل حسابك",
    description: "ابدأ بإنشاء حساب جديد في ثوانٍ معدودة."
  },
  {
    id: 2,
    icon: "fas fa-list-ol",
    title: "أنشئ فعالية أو مجموعة",
    description: "أضف تفاصيل الفعالية أو المجموعة وحدد الألعاب أو المهام."
  },
  {
    id: 3,
    icon: "fas fa-balance-scale",
    title: "وزّع تلقائياً",
    description: "دع المنصة توزع الأدوار أو الألعاب تلقائياً بعدالة وسهولة."
  },
];

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
    icon: "fas fa-clipboard-check",
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    title: "تنظيم ذكي",
    description: "نظام توزيع متطور يضمن عدالة وفعالية في توزيع الألعاب أو المهام"
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
    description: "محرك بحث متطور للعثور على المحتوى أو الألعاب بسهولة وسرعة"
  }
];
