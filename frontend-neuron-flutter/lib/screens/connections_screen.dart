import 'package:flutter/material.dart';

class ConnectionsScreen extends StatelessWidget {
  final bool isDarkMode;

  const ConnectionsScreen({super.key, required this.isDarkMode});

  static final List<Map<String, dynamic>> integrations = [
    {
      'name': 'Google Drive',
      'category': 'Cloud Storage',
      'icon': Icons.drive_folder_upload,
      'color': Color(0xFF34A853),
      'connected': true,
      'count': '1,420 files synced',
    },
    {
      'name': 'Gmail',
      'category': 'Email & Communications',
      'icon': Icons.mail,
      'color': Color(0xFFEA4335),
      'connected': true,
      'count': 'Daily digest active',
    },
    {
      'name': 'GitHub',
      'category': 'Developer Repositories',
      'icon': Icons.code,
      'color': Color(0xFF6B7280),
      'connected': true,
      'count': '18 repos connected',
    },
    {
      'name': 'Notion',
      'category': 'Notes & Workspaces',
      'icon': Icons.note_alt,
      'color': Color(0xFF3B82F6),
      'connected': true,
      'count': '3 workspaces',
    },
    {
      'name': 'Slack',
      'category': 'Team Chat',
      'icon': Icons.chat,
      'color': Color(0xFFE01E5A),
      'connected': false,
      'count': 'Not connected',
    },
    {
      'name': 'Spotify',
      'category': 'Focus Audio',
      'icon': Icons.headphones,
      'color': Color(0xFF1DB954),
      'connected': false,
      'count': 'Not connected',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final borderColor = isDarkMode ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Connected Integrations',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Connect apps to empower Neuron to synthesize your knowledge and context.',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: integrations.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.7,
            ),
            itemBuilder: (context, index) {
              final item = integrations[index];
              final isConnected = item['connected'] as bool;

              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: (item['color'] as Color).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 20),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isConnected
                                ? Colors.green.withValues(alpha: 0.15)
                                : (isDarkMode ? const Color(0xFF22272E) : const Color(0xFFF3F4F6)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            isConnected ? 'Connected' : 'Connect',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isConnected
                                  ? Colors.greenAccent[400]
                                  : (isDarkMode ? Colors.grey[400] : Colors.grey[600]),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['name'] as String,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isDarkMode ? Colors.white : Colors.black87,
                          ),
                        ),
                        Text(
                          item['count'] as String,
                          style: TextStyle(
                            fontSize: 11,
                            color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
