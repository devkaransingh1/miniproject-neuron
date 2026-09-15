import 'package:flutter/material.dart';

class GlowingBrainIcon extends StatelessWidget {
  final double size;

  const GlowingBrainIcon({super.key, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
            blurRadius: 18,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Icon(
        Icons.psychology_alt_outlined,
        size: size,
        color: const Color(0xFFA78BFA),
      ),
    );
  }
}

class AppHeaderBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final TextEditingController? searchController;
  final ValueChanged<String>? onSearch;
  final VoidCallback? onNotificationsClick;

  const AppHeaderBar({
    super.key,
    required this.title,
    required this.isDarkMode,
    required this.onToggleTheme,
    this.searchController,
    this.onSearch,
    this.onNotificationsClick,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final isDark = isDarkMode;
    final borderColor = isDark ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0D1117) : Colors.white,
        border: Border(bottom: BorderSide(color: borderColor)),
      ),
      child: Row(
        children: [
          if (searchController != null)
            Expanded(
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF161B22) : const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: borderColor),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Row(
                  children: [
                    Icon(
                      Icons.search,
                      size: 18,
                      color: isDark ? Colors.grey[400] : Colors.grey[500],
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: searchController,
                        style: const TextStyle(fontSize: 13),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Search or ask Neuron anything...',
                          hintStyle: TextStyle(
                            color: isDark ? Colors.grey[500] : Colors.grey[400],
                            fontSize: 13,
                          ),
                          isDense: true,
                        ),
                        onSubmitted: onSearch,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF22272E) : const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '⌘ K',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          const SizedBox(width: 16),
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, size: 20),
            color: isDark ? Colors.grey[300] : Colors.grey[700],
            tooltip: 'Notifications',
            onPressed: onNotificationsClick ?? () {},
          ),
          IconButton(
            icon: Icon(
              isDark ? Icons.mode_night_outlined : Icons.wb_sunny_outlined,
              size: 20,
            ),
            color: isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C3AED),
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onPressed: onToggleTheme,
          ),
        ],
      ),
    );
  }
}
