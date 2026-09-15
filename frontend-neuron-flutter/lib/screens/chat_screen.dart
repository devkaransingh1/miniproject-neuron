import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  final bool isDarkMode;

  const ChatScreen({super.key, required this.isDarkMode});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<Map<String, dynamic>> messages = [
    {
      'isUser': false,
      'text': 'Hello! I am Neuron, your AI second brain. Ask me about your notes, documents, schedule, or brainstorm new ideas.',
      'time': 'Just now',
    },
    {
      'isUser': true,
      'text': 'Summarize what I worked on yesterday.',
      'time': 'Just now',
    },
    {
      'isUser': false,
      'text': 'Yesterday you had 2 classes, finished Leetcode problem #128, and updated the project slides for Neuron App!',
      'time': 'Just now',
    }
  ];

  final TextEditingController _messageController = TextEditingController();

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      messages.add({'isUser': true, 'text': text, 'time': 'Now'});
      _messageController.clear();
    });

    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          messages.add({
            'isUser': false,
            'text': 'Thinking... Analyzed your second brain knowledge base for "$text". Everything is synced and indexed.',
            'time': 'Now',
          });
        });
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final theme = Theme.of(context);
    final borderColor = isDark ? const Color(0xFF22272E) : const Color(0xFFE5E7EB);

    return Column(
      children: [
        // Messages list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              final isUser = msg['isUser'] as bool;

              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  constraints: const BoxConstraints(maxWidth: 600),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isUser
                        ? theme.primaryColor
                        : (isDark ? const Color(0xFF161B22) : Colors.white),
                    borderRadius: BorderRadius.circular(14),
                    border: isUser ? null : Border.all(color: borderColor),
                  ),
                  child: Column(
                    crossAxisAlignment:
                        isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    children: [
                      Text(
                        msg['text'] as String,
                        style: TextStyle(
                          fontSize: 13.5,
                          color: isUser
                              ? Colors.white
                              : (isDark ? Colors.white : Colors.black87),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        msg['time'] as String,
                        style: TextStyle(
                          fontSize: 10,
                          color: isUser
                              ? Colors.white70
                              : (isDark ? Colors.grey[500] : Colors.grey[400]),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Chat Input Box
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF10141B) : Colors.white,
            border: Border(top: BorderSide(color: borderColor)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Type a prompt or message to Neuron...',
                    hintStyle: TextStyle(
                      color: isDark ? Colors.grey[500] : Colors.grey[400],
                      fontSize: 13.5,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    filled: true,
                    fillColor: isDark ? const Color(0xFF161B22) : const Color(0xFFF3F4F6),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: borderColor),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: borderColor),
                    ),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 12),
              IconButton.filled(
                onPressed: _sendMessage,
                style: IconButton.styleFrom(backgroundColor: theme.primaryColor),
                icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
