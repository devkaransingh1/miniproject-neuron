import 'package:flutter/material.dart';

class ReflectionScreen extends StatelessWidget {
  final bool isDarkMode;

  const ReflectionScreen({super.key, required this.isDarkMode});

  @override
  Widget build(BuildContext context) {
    final borderColor = isDarkMode ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Daily & Weekly Reflection',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'AI-assisted retrospectives to understand your focus, habits and growth',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: isDarkMode ? const Color(0xFF161B22) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: Color(0xFFA78BFA), size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'AI Insights this Week',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? Colors.white : Colors.black87,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  '• You spent 68% of your study hours on Data Structures and Operating Systems.\n'
                  '• Peak productivity window was 09:00 AM - 12:30 PM with zero interruptions.\n'
                  '• Recommendation: Block 30 minutes tomorrow for review before your midterm exam.',
                  style: TextStyle(
                    fontSize: 13.5,
                    height: 1.6,
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[800],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
