class ExperienceSummary {
  ExperienceSummary({
    required this.id,
    required this.title,
    required this.city,
    required this.priceFrom,
    required this.rating,
    required this.thumb,
  });

  final int id;
  final String title;
  final String city;
  final double priceFrom;
  final double rating;
  final String thumb;

  factory ExperienceSummary.fromJson(Map<String, dynamic> json) {
    return ExperienceSummary(
      id: (json['post_id'] ?? json['id'] ?? 0) as int,
      title: (json['post_title'] ?? json['title'] ?? '') as String,
      city: (json['location_city'] ?? json['city'] ?? '') as String,
      priceFrom: (json['base_price'] ?? json['price_from'] ?? 0).toDouble(),
      rating: (json['rating'] ?? 0).toDouble(),
      thumb: (json['thumbnail_url'] ?? json['thumb'] ?? '') as String,
    );
  }
}
