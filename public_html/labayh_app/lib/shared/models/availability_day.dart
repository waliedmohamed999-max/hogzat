class AvailabilityDay {
  AvailabilityDay({
    required this.date,
    required this.available,
    required this.price,
  });

  final String date;
  final bool available;
  final double price;

  factory AvailabilityDay.fromJson(Map<String, dynamic> json) {
    return AvailabilityDay(
      date: (json['date'] ?? '') as String,
      available: (json['available'] ?? false) as bool,
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
