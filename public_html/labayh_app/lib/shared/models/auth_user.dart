class AuthUser {
  AuthUser({
    required this.id,
    required this.name,
    required this.mobile,
  });

  final int id;
  final String name;
  final String mobile;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: (json['id'] ?? 0) as int,
      name: (json['name'] ?? '') as String,
      mobile: (json['mobile'] ?? '') as String,
    );
  }
}
