import '../../core/network/api_client.dart';
import '../models/experience.dart';

class ExperienceService {
  ExperienceService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ExperienceSummary>> fetchExperiences({int page = 1, int number = 12}) async {
    final res = await _apiClient.client.get('/experience/search', queryParameters: {
      'page': page,
      'number': number,
    });

    final data = res.data;
    if (data is Map<String, dynamic> && data['results'] is List) {
      return (data['results'] as List)
          .map((e) => ExperienceSummary.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }
}
