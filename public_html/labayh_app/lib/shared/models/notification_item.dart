class NotificationItem {
  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
  });

  final int id;
  final String title;
  final String body;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: (json['ID'] ?? json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      body: (json['message'] ?? json['body'] ?? '') as String,
    );
  }
}
