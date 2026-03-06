import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Theme colors — warm, Indian-friendly health palette
const Color primaryGreen = Color(0xFF1B5E20);      // deeper health green
const Color primaryGreenLight = Color(0xFF43A047);
const Color saffronAccent = Color(0xFFFF9800);     // warm Indian accent
const Color accentBlue = Color(0xFF1565C0);
const Color emergencyRed = Color(0xFFD32F2F);
const Color warningOrange = Color(0xFFE65100);
const Color warningYellow = Color(0xFFF9A825);
const Color backgroundWhite = Color(0xFFF5F5F0);   // warm off-white
const Color cardWhite = Color(0xFFFFFFFF);
const Color textPrimary = Color(0xFF1A1A1A);
const Color textSecondary = Color(0xFF5D5D5D);
const Color textMuted = Color(0xFF9E9E9E);

ThemeData get appTheme {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryGreen,
      primary: primaryGreen,
      secondary: primaryGreenLight,
      error: emergencyRed,
      surface: cardWhite,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: textPrimary,
      onError: Colors.white,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: backgroundWhite,
    fontFamily: GoogleFonts.notoSans().fontFamily ?? 'sans-serif',
    textTheme: GoogleFonts.notoSansTextTheme().copyWith(
      titleLarge: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: -0.3),
      titleMedium: const TextStyle(fontWeight: FontWeight.w600),
      bodyLarge: const TextStyle(fontSize: 16, height: 1.4),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: CardTheme(
      color: cardWhite,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
  );
}
