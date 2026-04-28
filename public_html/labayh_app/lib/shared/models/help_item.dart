class HelpItem {
  HelpItem({
    required this.id,
    required this.title,
    required this.icon,
    required this.routeKey,
  });

  final int id;
  final String title;
  final String icon;
  final String routeKey;

  factory HelpItem.fromJson(Map<String, dynamic> json) {
    return HelpItem(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
      routeKey: (json['route_key'] ?? '') as String,
    );
  }
}
