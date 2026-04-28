class ReferralOption {
  ReferralOption({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.rewardText,
    required this.icon,
    this.iconUrl,
  });

  final int id;
  final String title;
  final String subtitle;
  final String rewardText;
  final String icon;
  final String? iconUrl;

  factory ReferralOption.fromJson(Map<String, dynamic> json) {
    return ReferralOption(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      subtitle: (json['subtitle'] ?? '') as String,
      rewardText: (json['reward_text'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
      iconUrl: json['icon_url'] as String?,
    );
  }
}

class ReferralProgram {
  ReferralProgram({
    required this.headline,
    required this.subtitle,
    required this.buttonLabel,
    required this.termsText,
    required this.termsLinkLabel,
    required this.shareUrl,
    required this.options,
  });

  final String headline;
  final String subtitle;
  final String buttonLabel;
  final String termsText;
  final String termsLinkLabel;
  final String shareUrl;
  final List<ReferralOption> options;

  factory ReferralProgram.fromJson(Map<String, dynamic> json) {
    final items = (json['options'] ?? []) as List<dynamic>;
    return ReferralProgram(
      headline: (json['headline'] ?? '') as String,
      subtitle: (json['subtitle'] ?? '') as String,
      buttonLabel: (json['button_label'] ?? '') as String,
      termsText: (json['terms_text'] ?? '') as String,
      termsLinkLabel: (json['terms_link_label'] ?? '') as String,
      shareUrl: (json['share_url'] ?? '') as String,
      options: items.map((e) => ReferralOption.fromJson(e)).toList(),
    );
  }
}
