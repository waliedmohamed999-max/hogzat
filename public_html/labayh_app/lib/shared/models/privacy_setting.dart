class PrivacySetting {
  PrivacySetting({
    required this.key,
    required this.title,
    required this.description,
    required this.enabled,
    required this.section,
  });

  final String key;
  final String title;
  final String description;
  final bool enabled;
  final String section;

  PrivacySetting copyWith({bool? enabled}) {
    return PrivacySetting(
      key: key,
      title: title,
      description: description,
      enabled: enabled ?? this.enabled,
      section: section,
    );
  }

  factory PrivacySetting.fromJson(Map<String, dynamic> json) {
    return PrivacySetting(
      key: (json['key'] ?? '') as String,
      title: (json['title'] ?? '') as String,
      description: (json['description'] ?? '') as String,
      enabled: (json['enabled'] ?? false) as bool,
      section: (json['section'] ?? '') as String,
    );
  }
}

class PrivacyActionItem {
  PrivacyActionItem({
    required this.key,
    required this.title,
  });

  final String key;
  final String title;

  factory PrivacyActionItem.fromJson(Map<String, dynamic> json) {
    return PrivacyActionItem(
      key: (json['key'] ?? '') as String,
      title: (json['title'] ?? '') as String,
    );
  }
}

class PrivacySettingsPayload {
  PrivacySettingsPayload({
    required this.title,
    required this.subtitle,
    required this.settings,
    required this.actions,
  });

  final String title;
  final String subtitle;
  final List<PrivacySetting> settings;
  final List<PrivacyActionItem> actions;

  factory PrivacySettingsPayload.fromJson(Map<String, dynamic> json) {
    final settings = (json['settings'] ?? []) as List<dynamic>;
    final actions = (json['actions'] ?? []) as List<dynamic>;
    return PrivacySettingsPayload(
      title: (json['title'] ?? '') as String,
      subtitle: (json['subtitle'] ?? '') as String,
      settings: settings.map((e) => PrivacySetting.fromJson(e)).toList(),
      actions: actions.map((e) => PrivacyActionItem.fromJson(e)).toList(),
    );
  }
}
