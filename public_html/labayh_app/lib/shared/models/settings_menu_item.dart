class SettingsMenuItem {
  SettingsMenuItem({
    required this.id,
    required this.title,
    required this.icon,
    required this.routeKey,
    this.badge,
  });

  final int id;
  final String title;
  final String icon;
  final String routeKey;
  final String? badge;

  factory SettingsMenuItem.fromJson(Map<String, dynamic> json) {
    return SettingsMenuItem(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
      routeKey: (json['route_key'] ?? '') as String,
      badge: json['badge'] as String?,
    );
  }
}

class AccountSettingsPayload {
  AccountSettingsPayload({
    required this.title,
    required this.items,
    required this.footerLabel,
  });

  final String title;
  final List<SettingsMenuItem> items;
  final String footerLabel;

  factory AccountSettingsPayload.fromJson(Map<String, dynamic> json) {
    final items = (json['items'] ?? []) as List<dynamic>;
    return AccountSettingsPayload(
      title: (json['title'] ?? '') as String,
      items: items.map((e) => SettingsMenuItem.fromJson(e)).toList(),
      footerLabel: (json['footer_label'] ?? '') as String,
    );
  }
}
