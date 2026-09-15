import 'package:flutter/material.dart';

class TasksScreen extends StatefulWidget {
  final bool isDarkMode;

  const TasksScreen({super.key, required this.isDarkMode});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  final List<Map<String, dynamic>> tasks = [
    {'title': 'Complete Operating System Assignment 3', 'done': false, 'priority': 'High', 'due': 'Today'},
    {'title': 'Review Merge Request for Neuron App Web', 'done': true, 'priority': 'Medium', 'due': 'Yesterday'},
    {'title': 'Solve 3 Dynamic Programming problems on Leetcode', 'done': false, 'priority': 'High', 'due': 'Tomorrow'},
    {'title': 'Prepare presentation slides for second brain demo', 'done': false, 'priority': 'Medium', 'due': 'In 3 days'},
    {'title': 'Backup knowledge vault to cloud', 'done': true, 'priority': 'Low', 'due': 'Sep 05'},
  ];

  final TextEditingController _taskController = TextEditingController();

  void _addTask() {
    final text = _taskController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        tasks.insert(0, {
          'title': text,
          'done': false,
          'priority': 'Medium',
          'due': 'Upcoming',
        });
        _taskController.clear();
      });
    }
  }

  @override
  void dispose() {
    _taskController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final borderColor = isDark ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tasks & Action Items',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Organize, track, and complete your tasks with AI reminders',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Add Task Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF161B22) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _taskController,
                    style: const TextStyle(fontSize: 14),
                    decoration: const InputDecoration(
                      hintText: 'Add a new task and press Enter...',
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _addTask(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle, color: Color(0xFF8B5CF6)),
                  onPressed: _addTask,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Tasks List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index];
              final isDone = task['done'] as bool;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF161B22) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: borderColor),
                ),
                child: ListTile(
                  leading: Checkbox(
                    value: isDone,
                    activeColor: theme.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    onChanged: (val) {
                      setState(() {
                        task['done'] = val ?? false;
                      });
                    },
                  ),
                  title: Text(
                    task['title'] as String,
                    style: TextStyle(
                      fontSize: 13.5,
                      decoration: isDone ? TextDecoration.lineThrough : null,
                      color: isDone
                          ? (isDark ? Colors.grey[600] : Colors.grey[400])
                          : (isDark ? Colors.white : Colors.black87),
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF22272E) : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      task['due'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
