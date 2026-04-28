class PropertySummary {
  PropertySummary({
    required this.id,
    required this.title,
    required this.priceFrom,
    required this.rating,
    required this.thumb,
    required this.city,
  });

  final int id;
  final String title;
  final double priceFrom;
  final double rating;
  final String thumb;
  final String city;

  factory PropertySummary.fromJson(Map<String, dynamic> json) {
    return PropertySummary(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      priceFrom: (json['price_from'] ?? 0).toDouble(),
      rating: (json['rating'] ?? 0).toDouble(),
      thumb: (json['thumb'] ?? '') as String,
      city: (json['city'] ?? '') as String,
    );
  }
}

class PropertyAmenity {
  PropertyAmenity({
    required this.id,
    required this.name,
    required this.icon,
  });

  final int id;
  final String name;
  final String icon;

  factory PropertyAmenity.fromJson(Map<String, dynamic> json) {
    return PropertyAmenity(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
    );
  }
}

class SleepingArrangement {
  SleepingArrangement({
    required this.title,
    required this.bedsLabel,
    required this.imageUrl,
  });

  final String title;
  final String bedsLabel;
  final String imageUrl;

  factory SleepingArrangement.fromJson(Map<String, dynamic> json) {
    return SleepingArrangement(
      title: (json['title'] ?? '') as String,
      bedsLabel: (json['beds_label'] ?? '') as String,
      imageUrl: (json['image_url'] ?? '') as String,
    );
  }
}

class PropertyRuleItem {
  PropertyRuleItem({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final String icon;

  factory PropertyRuleItem.fromJson(Map<String, dynamic> json) {
    return PropertyRuleItem(
      title: (json['title'] ?? '') as String,
      value: (json['value'] ?? '') as String,
      icon: (json['icon'] ?? '') as String,
    );
  }
}

class CancellationPolicy {
  CancellationPolicy({
    required this.title,
    required this.summary,
    required this.details,
  });

  final String title;
  final String summary;
  final String details;

  factory CancellationPolicy.fromJson(Map<String, dynamic> json) {
    return CancellationPolicy(
      title: (json['title'] ?? '') as String,
      summary: (json['summary'] ?? '') as String,
      details: (json['details'] ?? '') as String,
    );
  }
}

class PropertyHost {
  PropertyHost({
    required this.id,
    required this.name,
    required this.avatarUrl,
    required this.isSuperhost,
    required this.hostingYears,
    required this.reviewsCount,
    required this.rating,
    required this.responseRate,
    required this.responseTimeLabel,
    required this.badgeLabel,
    required this.aboutTitle,
    required this.aboutBody,
    required this.locationLabel,
    required this.jobTitle,
    required this.messageButtonLabel,
  });

  final int id;
  final String name;
  final String avatarUrl;
  final bool isSuperhost;
  final int hostingYears;
  final int reviewsCount;
  final double rating;
  final int responseRate;
  final String responseTimeLabel;
  final String badgeLabel;
  final String aboutTitle;
  final String aboutBody;
  final String locationLabel;
  final String jobTitle;
  final String messageButtonLabel;

  factory PropertyHost.fromJson(Map<String, dynamic> json) {
    return PropertyHost(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? '') as String,
      avatarUrl: (json['avatar_url'] ?? '') as String,
      isSuperhost: (json['is_superhost'] ?? false) as bool,
      hostingYears: (json['hosting_years'] ?? 0) as int,
      reviewsCount: (json['reviews_count'] ?? 0) as int,
      rating: (json['rating'] ?? 0).toDouble(),
      responseRate: (json['response_rate'] ?? 0) as int,
      responseTimeLabel: (json['response_time_label'] ?? '') as String,
      badgeLabel: (json['badge_label'] ?? '') as String,
      aboutTitle: (json['about_title'] ?? '') as String,
      aboutBody: (json['about_body'] ?? '') as String,
      locationLabel: (json['location_label'] ?? '') as String,
      jobTitle: (json['job_title'] ?? '') as String,
      messageButtonLabel: (json['message_button_label'] ?? '') as String,
    );
  }
}

class PropertyPricing {
  PropertyPricing({
    required this.currency,
    required this.total,
    required this.nights,
    required this.startDate,
    required this.endDate,
    required this.dateRangeLabel,
    required this.freeCancellationLabel,
  });

  final String currency;
  final double total;
  final int nights;
  final String startDate;
  final String endDate;
  final String dateRangeLabel;
  final String freeCancellationLabel;

  factory PropertyPricing.fromJson(Map<String, dynamic> json) {
    return PropertyPricing(
      currency: (json['currency'] ?? '') as String,
      total: (json['total'] ?? 0).toDouble(),
      nights: (json['nights'] ?? 0) as int,
      startDate: (json['start_date'] ?? '') as String,
      endDate: (json['end_date'] ?? '') as String,
      dateRangeLabel: (json['date_range_label'] ?? '') as String,
      freeCancellationLabel: (json['free_cancellation_label'] ?? '') as String,
    );
  }
}

class PropertyReviewHighlight {
  PropertyReviewHighlight({
    required this.rating,
    required this.title,
    required this.body,
    required this.authorName,
    required this.authorAvatar,
    required this.dateLabel,
    required this.badgeLabel,
  });

  final double rating;
  final String title;
  final String body;
  final String authorName;
  final String authorAvatar;
  final String dateLabel;
  final String badgeLabel;

  factory PropertyReviewHighlight.fromJson(Map<String, dynamic> json) {
    return PropertyReviewHighlight(
      rating: (json['rating'] ?? 0).toDouble(),
      title: (json['title'] ?? '') as String,
      body: (json['body'] ?? '') as String,
      authorName: (json['author_name'] ?? '') as String,
      authorAvatar: (json['author_avatar'] ?? '') as String,
      dateLabel: (json['date_label'] ?? '') as String,
      badgeLabel: (json['badge_label'] ?? '') as String,
    );
  }
}

class PropertyDetails {
  PropertyDetails({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.rules,
    required this.images,
    required this.amenities,
    required this.sleepingArrangements,
    required this.houseRules,
    required this.safetyItems,
    required this.cancellationPolicy,
    required this.lat,
    required this.lng,
    required this.address,
    required this.city,
    required this.country,
    required this.propertyTypeLabel,
    required this.mapImageUrl,
    required this.rating,
    required this.reviewCount,
    required this.guestFavoriteLabel,
    required this.guests,
    required this.bedrooms,
    required this.beds,
    required this.baths,
    required this.host,
    required this.pricing,
    required this.reviewHighlight,
  });

  final int id;
  final String title;
  final String subtitle;
  final String description;
  final String rules;
  final List<String> images;
  final List<PropertyAmenity> amenities;
  final List<SleepingArrangement> sleepingArrangements;
  final List<PropertyRuleItem> houseRules;
  final List<PropertyRuleItem> safetyItems;
  final CancellationPolicy cancellationPolicy;
  final double lat;
  final double lng;
  final String address;
  final String city;
  final String country;
  final String propertyTypeLabel;
  final String mapImageUrl;
  final double rating;
  final int reviewCount;
  final String guestFavoriteLabel;
  final int guests;
  final int bedrooms;
  final int beds;
  final double baths;
  final PropertyHost host;
  final PropertyPricing pricing;
  final PropertyReviewHighlight reviewHighlight;

  factory PropertyDetails.fromJson(Map<String, dynamic> json) {
    final location = (json['location'] ?? {}) as Map<String, dynamic>;
    final amenities = (json['amenities'] ?? []) as List<dynamic>;
    final sleeping = (json['sleeping_arrangements'] ?? []) as List<dynamic>;
    final houseRules = (json['house_rules'] ?? []) as List<dynamic>;
    final safety = (json['safety_items'] ?? []) as List<dynamic>;
    return PropertyDetails(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? '') as String,
      subtitle: (json['subtitle'] ?? '') as String,
      description: (json['description'] ?? '') as String,
      rules: (json['rules'] ?? '') as String,
      images: List<String>.from(json['images'] ?? const []),
      amenities: amenities.map((a) => PropertyAmenity.fromJson(a)).toList(),
      sleepingArrangements: sleeping.map((a) => SleepingArrangement.fromJson(a)).toList(),
      houseRules: houseRules.map((a) => PropertyRuleItem.fromJson(a)).toList(),
      safetyItems: safety.map((a) => PropertyRuleItem.fromJson(a)).toList(),
      cancellationPolicy:
          CancellationPolicy.fromJson((json['cancellation_policy'] ?? {}) as Map<String, dynamic>),
      lat: (location['lat'] ?? 0).toDouble(),
      lng: (location['lng'] ?? 0).toDouble(),
      address: (location['address'] ?? '') as String,
      city: (location['city'] ?? '') as String,
      country: (location['country'] ?? '') as String,
      propertyTypeLabel: (json['property_type_label'] ?? '') as String,
      mapImageUrl: (location['map_image_url'] ?? '') as String,
      rating: (json['rating'] ?? 0).toDouble(),
      reviewCount: (json['review_count'] ?? 0) as int,
      guestFavoriteLabel: (json['guest_favorite_label'] ?? '') as String,
      guests: (json['guests'] ?? 0) as int,
      bedrooms: (json['bedrooms'] ?? 0) as int,
      beds: (json['beds'] ?? 0) as int,
      baths: (json['baths'] ?? 0).toDouble(),
      host: PropertyHost.fromJson((json['host'] ?? {}) as Map<String, dynamic>),
      pricing: PropertyPricing.fromJson((json['pricing'] ?? {}) as Map<String, dynamic>),
      reviewHighlight:
          PropertyReviewHighlight.fromJson((json['review_highlight'] ?? {}) as Map<String, dynamic>),
    );
  }
}
