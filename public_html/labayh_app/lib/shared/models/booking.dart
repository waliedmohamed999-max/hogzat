class BookingItem {
  BookingItem({
    required this.id,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.total,
  });

  final int id;
  final String status;
  final String startDate;
  final String endDate;
  final double total;

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    return BookingItem(
      id: (json['ID'] ?? json['id'] ?? 0) as int,
      status: (json['status'] ?? '') as String,
      startDate: (json['startDate'] ?? json['start_date'] ?? '') as String,
      endDate: (json['endDate'] ?? json['end_date'] ?? '') as String,
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}
