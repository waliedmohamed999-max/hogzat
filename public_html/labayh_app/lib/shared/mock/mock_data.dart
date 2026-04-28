import '../models/booking.dart';
import '../models/notification_item.dart';
import '../models/property.dart';

const bool useMockData = true;

final List<PropertySummary> mockProperties = [
  PropertySummary(
    id: 1,
    title: 'شقة فاخرة بإطلالة بحرية',
    priceFrom: 943,
    rating: 5.0,
    thumb:
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    city: 'دبي',
  ),
  PropertySummary(
    id: 2,
    title: 'فيلا بحديقة خاصة',
    priceFrom: 1698,
    rating: 4.93,
    thumb:
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80',
    city: 'دبي',
  ),
  PropertySummary(
    id: 3,
    title: 'شقة مودرن في وسط المدينة',
    priceFrom: 341,
    rating: 4.96,
    thumb:
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
    city: 'جدة',
  ),
  PropertySummary(
    id: 4,
    title: 'استراحة مع مسبح خاص',
    priceFrom: 780,
    rating: 4.91,
    thumb:
        'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=900&q=80',
    city: 'الرياض',
  ),
  PropertySummary(
    id: 5,
    title: 'بيت تراثي بإطلالة جبلية',
    priceFrom: 520,
    rating: 4.88,
    thumb:
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80',
    city: 'الطائف',
  ),
  PropertySummary(
    id: 6,
    title: 'شاليه على البحر',
    priceFrom: 620,
    rating: 4.95,
    thumb:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    city: 'ينبع',
  ),
];

final List<BookingItem> mockBookings = [
  BookingItem(
    id: 1001,
    status: 'مؤكد',
    startDate: '2025-02-12',
    endDate: '2025-02-14',
    total: 1890,
  ),
  BookingItem(
    id: 1002,
    status: 'بانتظار الدفع',
    startDate: '2025-03-01',
    endDate: '2025-03-03',
    total: 980,
  ),
];

final List<NotificationItem> mockNotifications = [
  NotificationItem(id: 1, title: 'تأكيد الحجز', body: 'تم تأكيد حجزك بنجاح.'),
  NotificationItem(id: 2, title: 'تذكير', body: 'موعد وصولك غداً، لا تنسَ تفاصيل الرحلة.'),
  NotificationItem(id: 3, title: 'عرض جديد', body: 'خصم 10% على الحجوزات الأسبوعية هذا الشهر.'),
];
