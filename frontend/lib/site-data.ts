import {
  BedDouble,
  Building2,
  Compass,
  Landmark,
  Mountain,
  Palmtree,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  WalletCards,
  Waves,
} from "lucide-react";

export const navItems = [
  { title: "الرئيسية", href: "/" },
  { title: "إقامات لبية", href: "/home-search-result" },
  { title: "تجارب مميزة", href: "/experience-search-result" },
  { title: "فعاليات ومؤتمرات", href: "/experience-search-result?category=events" },
  { title: "صفقات سريعة", href: "/home-search-result?featured=1" },
  { title: "المدونة", href: "/blog" },
  { title: "تواصل معنا", href: "/contact-us" },
];

export const categories = [
  { title: "شاليهات وفلل", icon: BedDouble, href: "/home-search-result" },
  { title: "منتجعات", icon: Palmtree, href: "/home-search-result?category=resorts" },
  { title: "تجارب سفر", icon: Compass, href: "/experience-search-result" },
  { title: "رحلات وأنشطة", icon: Mountain, href: "/experience-search-result?category=activities" },
  { title: "فعاليات ومؤتمرات", icon: Building2, href: "/experience-search-result?category=events" },
  { title: "جولات ثقافية", icon: Landmark, href: "/experience-search-result?category=culture" },
];

export const destinations = [
  {
    title: "فيلا بإطلالة هادئة",
    location: "الرياض، المملكة العربية السعودية",
    price: "1,850",
    rating: "4.9",
    href: "/home-search-result",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "شاليه عائلي متكامل",
    location: "جدة، واجهة بحرية ومرافق خاصة",
    price: "1,240",
    rating: "4.8",
    href: "/home-search-result",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "تجربة جبلية",
    location: "أبها، طبيعة ومناخ هادئ",
    price: "980",
    rating: "4.7",
    href: "/experience-search-result",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "منتجع خاص",
    location: "الطائف، إقامة فاخرة وخصوصية عالية",
    price: "1,620",
    rating: "4.8",
    href: "/home-search-result",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  },
];

export const featuredListings = [
  {
    title: "فيلا زجاجية بإطلالة بانورامية",
    location: "الرياض، المملكة العربية السعودية",
    price: "2,400",
    rating: "4.9",
    href: "/home-search-result",
    features: ["5 ضيوف", "3 غرف", "مسبح خاص"],
    image:
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "منتجع مائي بتجربة استرخاء خاصة",
    location: "الطائف، المملكة العربية السعودية",
    price: "1,900",
    rating: "4.8",
    href: "/home-search-result",
    features: ["4 ضيوف", "2 غرف", "جلسة خارجية"],
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "شاليه عائلي بإطلالة خضراء",
    location: "أبها، المملكة العربية السعودية",
    price: "1,350",
    rating: "4.7",
    href: "/home-search-result",
    features: ["6 ضيوف", "4 غرف", "مرافق عائلية"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
];

export const urgentDeals = [
  {
    title: "عرض نهاية الأسبوع",
    badge: "عرض محدود",
    discount: "خصم حتى 35%",
    href: "/home-search-result?featured=1",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "صفقة المنتجع الذهبي",
    badge: "الأكثر طلبا",
    discount: "خصم حتى 28%",
    href: "/home-search-result?featured=1",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  },
];

export const platformFeatures = [
  {
    title: "دفع آمن",
    description: "تجربة دفع واضحة مع جلسات مستخدم موحدة وحماية للبيانات في كل خطوة.",
    icon: WalletCards,
  },
  {
    title: "إعلانات موثقة",
    description: "الصور والأسعار والتوفر تظهر من بيانات النظام مع حالات نشر قابلة للإدارة.",
    icon: ShieldCheck,
  },
  {
    title: "بحث ذكي",
    description: "فلترة بالمدينة والتواريخ والضيوف والأسعار مع مسارات نتائج مستقرة.",
    icon: Sparkles,
  },
  {
    title: "تجربة متكاملة",
    description: "الواجهة ولوحة التحكم تعملان فوق نفس الربط لضمان اتساق البيانات.",
    icon: Waves,
  },
  {
    title: "عروض قابلة للتحكم",
    description: "العروض والتمييز والخصومات تظهر من إعدادات المنتج بدل عناصر منفصلة غير مرتبطة.",
    icon: TicketPercent,
  },
];
