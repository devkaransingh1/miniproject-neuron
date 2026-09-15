import 'package:flutter/material.dart';

class TimelineScreen extends StatelessWidget {
  final bool isDarkMode;

  const TimelineScreen({super.key, required this.isDarkMode});

  static final List<Map<String, dynamic>> timelineEvents = [
    {
      'time': '16:30',
      'title': 'Committed changes to Neuron Flutter repository',
      'desc': 'Refactored project into modular pages and unified routing.',
      'icon': Icons.commit,
      'color': Color(0xFF10B981),
    },
    {
      'time': '14:00',
      'title': 'Attended Computer Networks lecture',
      'desc': 'Recorded 45 min voice note and generated summarized points.',
      'icon': Icons.school,
      'color': Color(0xFF6366F1),
    },
    {
      'time': '11:15',
      'title': 'Synced Google Drive study files',
      'desc': '3 new PDF documents indexed into knowledge vault.',
      'icon': Icons.sync,
      'color': Color(0xFF3B82F6),
    },
    {
      'time': '09:00',
      'title': 'Morning planning session with Neuron',
      'desc': 'Reviewed schedule, prioritized 4 action items for today.',
      'icon': Icons.wb_sunny_outlined,
      'color': Color(0xFFF59E0B),
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
            'Activity Timeline',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Chronological feed of your daily learning, work, and milestones',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: timelineEvents.length,
            itemBuilder: (context, index) {
              final ev = timelineEvents[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (ev['color'] as Color).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(ev['icon'] as IconData, color: ev['color'] as Color, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                ev['title'] as String,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: isDarkMode ? Colors.white : Colors.black87,
                                ),
                              ),
                              Text(
                                ev['time'] as String,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isDarkMode ? Colors.grey[500] : Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            ev['desc'] as String,
                            style: TextStyle(
                              fontSize: 12.5,
                              color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
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
