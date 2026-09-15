import 'package:flutter/material.dart';
import '../widgets/common_widgets.dart';

class LandingContentWidget extends StatelessWidget {
  final String userName;
  final bool isDarkMode;
  final TextEditingController promptController;
  final VoidCallback onSubmitPrompt;
  final void Function(String) onPromptSelect;
  final void Function(String) onNotification;

  const LandingContentWidget({
    super.key,
    required this.userName,
    required this.isDarkMode,
    required this.promptController,
    required this.onSubmitPrompt,
    required this.onPromptSelect,
    required this.onNotification,
  });

  static final List<Map<String, dynamic>> scheduleItems = [
    {
      'time': '09:00 AM',
      'title': 'Data Structures Class',
      'location': 'CS Building, Room 203',
      'accent': const Color(0xFF6366F1),
    },
    {
      'time': '11:00 AM',
      'title': 'Project Meeting',
      'location': 'Online (Google Meet)',
      'accent': const Color(0xFF3B82F6),
    },
    {
      'time': '02:00 PM',
      'title': 'Interview Preparation',
      'location': 'Personal Workspace',
      'accent': const Color(0xFFF97316),
    },
    {
      'time': '04:00 PM',
      'title': 'DSA Practice',
      'location': 'LeetCode 150',
      'accent': const Color(0xFF10B981),
    },
  ];

  static final List<Map<String, dynamic>> quickPrompts = [
    {
      'icon': Icons.calendar_today_rounded,
      'color': const Color(0xFF8B5CF6),
      'text': 'What did I work on last week?',
    },
    {
      'icon': Icons.mail_outline_rounded,
      'color': const Color(0xFFEF4444),
      'text': 'Summarize unread emails',
    },
    {
      'icon': Icons.description_outlined,
      'color': const Color(0xFF3B82F6),
      'text': 'Show my recent documents',
    },
    {
      'icon': Icons.event_note_rounded,
      'color': const Color(0xFF8B5CF6),
      'text': "What's on my schedule today?",
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = isDarkMode ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 28),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 12),
              const GlowingBrainIcon(size: 64),
              const SizedBox(height: 16),
              Text(
                'Good morning, $userName',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDarkMode ? Colors.white : const Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'How can I help you today?',
                style: TextStyle(
                  fontSize: 13,
                  color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              const SizedBox(height: 28),

              // Ask Neuron Input Box
              Container(
                decoration: BoxDecoration(
                  color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDarkMode ? 0.2 : 0.04),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: promptController,
                      maxLines: 3,
                      style: const TextStyle(fontSize: 14),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: 'Ask Neuron anything...',
                        hintStyle: TextStyle(
                          color: isDarkMode ? Colors.grey[500] : Colors.grey[400],
                          fontSize: 14,
                        ),
                      ),
                      onSubmitted: (_) => onSubmitPrompt(),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.attach_file_rounded, size: 20),
                          color: isDarkMode ? Colors.grey[400] : Colors.grey[500],
                          tooltip: 'Attach file',
                          onPressed: () => onNotification('Attach file clicked'),
                        ),
                        IconButton(
                          icon: const Icon(Icons.mic_none_rounded, size: 20),
                          color: isDarkMode ? Colors.grey[400] : Colors.grey[500],
                          tooltip: 'Voice input',
                          onPressed: () => onNotification('Listening via microphone...'),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: onSubmitPrompt,
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: theme.primaryColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.near_me_rounded,
                              size: 18,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Today's Schedule Card
              Container(
                decoration: BoxDecoration(
                  color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: (isDarkMode
                                        ? const Color(0xFF8B5CF6)
                                        : const Color(0xFFEDE9FE))
                                    .withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.calendar_month_outlined,
                                size: 18,
                                color: theme.primaryColor,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              "Today's Schedule",
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isDarkMode ? Colors.white : Colors.black87,
                              ),
                            ),
                          ],
                        ),
                        InkWell(
                          onTap: () => onNotification('Opening Calendar...'),
                          child: Row(
                            children: [
                              Text(
                                'View Calendar',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: theme.primaryColor,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                Icons.open_in_new,
                                size: 14,
                                color: theme.primaryColor,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: scheduleItems.map((item) {
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.only(left: 10),
                            decoration: BoxDecoration(
                              border: Border(
                                left: BorderSide(
                                  color: item['accent'] as Color,
                                  width: 2.5,
                                ),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['time'] as String,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item['title'] as String,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isDarkMode ? Colors.white : Colors.black87,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item['location'] as String,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isDarkMode ? Colors.grey[500] : Colors.grey[600],
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Quick Action Prompt Cards
              ...quickPrompts.map((item) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: borderColor),
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        size: 16,
                        color: item['color'] as Color,
                      ),
                    ),
                    title: Text(
                      item['text'] as String,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isDarkMode ? Colors.grey[200] : Colors.grey[800],
                      ),
                    ),
                    trailing: Icon(
                      Icons.arrow_forward,
                      size: 16,
                      color: isDarkMode ? Colors.grey[500] : Colors.grey[400],
                    ),
                    onTap: () => onPromptSelect(item['text'] as String),
                  ),
                );
              }),
              const SizedBox(height: 24),

              // Connected sources badges
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Neuron can search your connected sources',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDarkMode ? Colors.grey[400] : Colors.grey[500],
                    ),
                  ),
                  const SizedBox(width: 10),
                  _buildSourceBadge(Icons.drive_folder_upload, const Color(0xFF34A853), 'Google Drive'),
                  const SizedBox(width: 6),
                  _buildSourceBadge(Icons.mail, const Color(0xFFEA4335), 'Gmail'),
                  const SizedBox(width: 6),
                  _buildSourceBadge(Icons.code, const Color(0xFF6B7280), 'GitHub'),
                  const SizedBox(width: 6),
                  _buildSourceBadge(Icons.note_alt, const Color(0xFF3B82F6), 'Notion'),
                  const SizedBox(width: 6),
                  Text(
                    '+3',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSourceBadge(IconData icon, Color color, String tooltip) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: () => onNotification('Connected source: $tooltip'),
        borderRadius: BorderRadius.circular(4),
        child: Container(
          padding: const EdgeInsets.all(4),
          child: Icon(icon, size: 15, color: color),
        ),
      ),
    );
  }
}
