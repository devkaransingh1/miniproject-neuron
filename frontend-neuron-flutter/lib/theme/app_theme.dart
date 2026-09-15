import 'package:flutter/material.dart';

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: const Color(0xFFF8FAFC),
    cardColor: Colors.white,
    primaryColor: const Color(0xFF7C3AED),
    colorScheme: const ColorScheme.light(
      primary: Color(0xFF7C3AED),
      surface: Colors.white,
      onSurface: Color(0xFF1F2937),
      outline: Color(0xFFE2E8F0),
    ),
    fontFamily: 'Roboto',
  );

  static final ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF0B0F17),
    cardColor: const Color(0xFF151B26),
    primaryColor: const Color(0xFF8B5CF6),
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFF8B5CF6),
      surface: Color(0xFF151B26),
      onSurface: Color(0xFFF3F4F6),
      outline: Color(0xFF232B3A),
    ),
    fontFamily: 'Roboto',
  );
}
