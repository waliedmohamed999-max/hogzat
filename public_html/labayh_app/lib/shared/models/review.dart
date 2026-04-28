class ReviewItem {
  ReviewItem({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.rating,
    required this.body,
    required this.dateLabel,
  });

  final int id;
  final String authorName;
  final String authorAvatar;
  final double rating;
  final String body;
  final String dateLabel;

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    return ReviewItem(
      id: (json['id'] ?? 0) as int,
      authorName: (json['author_name'] ?? '') as String,
      authorAvatar: (json['author_avatar'] ?? '') as String,
      rating: (json['rating'] ?? 0).toDouble(),
      body: (json['comment'] ?? '') as String,
      dateLabel: (json['date_label'] ?? '') as String,
    );
  }
}
