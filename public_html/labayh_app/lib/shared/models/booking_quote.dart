class BookingQuote {
  BookingQuote({
    required this.nights,
    required this.subtotal,
    required this.fees,
    required this.tax,
    required this.discount,
    required this.total,
  });

  final int nights;
  final double subtotal;
  final double fees;
  final double tax;
  final double discount;
  final double total;

  factory BookingQuote.fromJson(Map<String, dynamic> json) {
    return BookingQuote(
      nights: (json['nights'] ?? 0) as int,
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      fees: (json['fees'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}
