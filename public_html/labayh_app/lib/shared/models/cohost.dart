class CohostProfile {
  CohostProfile({
    required this.id,
    required this.name,
    required this.city,
    required this.avatarUrl,
    required this.skills,
    required this.rating,
  });

  final int id;
  final String name;
  final String city;
  final String avatarUrl;
  final List<String> skills;
  final double rating;

  factory CohostProfile.fromJson(Map<String, dynamic> json) {
    return CohostProfile(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? '') as String,
      city: (json['city'] ?? '') as String,
      avatarUrl: (json['avatar_url'] ?? '') as String,
      skills: List<String>.from(json['skills'] ?? const []),
      rating: (json['rating'] ?? 0).toDouble(),
    );
  }
}

class CohostSearchResult {
  CohostSearchResult({
    required this.title,
    required this.subtitle,
    required this.emptyTitle,
    required this.emptyBody,
    required this.notifyButtonLabel,
    required this.results,
  });

  final String title;
  final String subtitle;
  final String emptyTitle;
  final String emptyBody;
  final String notifyButtonLabel;
  final List<CohostProfile> results;

  factory CohostSearchResult.fromJson(Map<String, dynamic> json) {
    final items = (json['results'] ?? []) as List<dynamic>;
    return CohostSearchResult(
      title: (json['title'] ?? '') as String,
      subtitle: (json['subtitle'] ?? '') as String,
      emptyTitle: (json['empty_title'] ?? '') as String,
      emptyBody: (json['empty_body'] ?? '') as String,
      notifyButtonLabel: (json['notify_button_label'] ?? '') as String,
      results: items.map((e) => CohostProfile.fromJson(e)).toList(),
    );
  }
}
