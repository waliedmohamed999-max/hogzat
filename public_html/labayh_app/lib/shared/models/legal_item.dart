class LegalItem {
  LegalItem({
    required this.id,
    required this.title,
    required this.url,
    required this.icon,
  });

  final int id;
  final String title;
  final String url;
  final String icon;

  factory LegalItem.fromJson(Map<String, dynamic> json) {
    return LegalItem(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      url: (json['url'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
    );
  }
}
