import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../widgets/web_safe_network_image.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../core/providers/alerts_provider.dart';
import '../../core/providers/vaccination_provider.dart';
import '../../core/providers/news_provider.dart';

// Card images — Unsplash (health/medical). On web we use HTML <img> so CORS is not an issue.
const _kChatbotImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop';
const _kSymptomImage = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop';
const _kVaccineImage = 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop';
const _kHospitalImage = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop';
const _kNewsImage = 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=200&fit=crop';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(preferredLanguageProvider) ?? 'en';
    final alertsAsync = ref.watch(alertsProvider);
    final vaccinationAsync = ref.watch(vaccinationProfileProvider);
    final latestNewsAsync = ref.watch(latestNewsProvider);
    final latestNews = latestNewsAsync.valueOrNull;
    final upcomingList = vaccinationAsync.valueOrNull?.upcomingVaccines;
    final firstUpcomingName = (upcomingList != null && upcomingList.isNotEmpty)
        ? upcomingList.first.vaccineName
        : '';
    final alertsList = alertsAsync.valueOrNull;
    final firstAlertTitle = (alertsList != null && alertsList.isNotEmpty)
        ? alertsList.first.title
        : '';

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header: logo + app name + profile
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 8, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: primaryGreen.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(Icons.medical_services, color: primaryGreen, size: 28),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              t('app_name', lang),
                              style: (Theme.of(context).textTheme.titleLarge ?? const TextStyle()).copyWith(
                                fontWeight: FontWeight.w800,
                                color: primaryGreen,
                                fontSize: 22,
                              ),
                            ),
                            Text(
                              t('tagline', lang),
                              style: TextStyle(
                                fontSize: 12,
                                color: textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => context.push('/profile'),
                        borderRadius: BorderRadius.circular(24),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Icon(Icons.person_rounded, color: primaryGreen, size: 28),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Advisory banner — friendly, not alarming
            if (firstAlertTitle.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => context.push('/alerts'),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              warningYellow.withOpacity(0.4),
                              saffronAccent.withOpacity(0.2),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: warningYellow.withOpacity(0.5), width: 1),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info_rounded, color: warningOrange, size: 26),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                firstAlertTitle,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                  color: textPrimary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              t('view_all', lang),
                              style: const TextStyle(
                                color: primaryGreen,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            // Section title
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                child: Text(
                  t('what_do_you_need', lang),
                  style: (Theme.of(context).textTheme.titleMedium ?? const TextStyle()).copyWith(
                    color: textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            // Big, visual feature cards — use SliverGrid so layout has bounded height (fixes web)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.92,
                ),
                delegate: SliverChildListDelegate([
                  _HomeCard(
                    title: t('chatbot', lang),
                    subtitle: t('ask_anything', lang),
                    imageUrl: _kChatbotImage,
                    gradient: const [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF388E3C)],
                    icon: Icons.chat_bubble_rounded,
                    onTap: () => context.go('/chat'),
                  ),
                  _HomeCard(
                    title: t('symptom_checker', lang),
                    subtitle: t('check_symptoms', lang),
                    imageUrl: _kSymptomImage,
                    gradient: const [Color(0xFFE65100), Color(0xFFFF9800), Color(0xFFFFB74D)],
                    icon: Icons.search_rounded,
                    onTap: () => context.push('/symptom-checker'),
                  ),
                  _HomeCard(
                    title: t('vaccination', lang),
                    subtitle: t('stay_protected', lang),
                    imageUrl: _kVaccineImage,
                    gradient: const [Color(0xFF0D47A1), Color(0xFF1565C0), Color(0xFF42A5F5)],
                    icon: Icons.vaccines_rounded,
                    onTap: () => context.go('/vaccination'),
                  ),
                  _HomeCard(
                    title: t('hospitals', lang),
                    subtitle: t('find_nearby', lang),
                    imageUrl: _kHospitalImage,
                    gradient: const [Color(0xFFB71C1C), Color(0xFFD32F2F), Color(0xFFE57373)],
                    icon: Icons.local_hospital_rounded,
                    onTap: () => context.go('/hospitals'),
                  ),
                ]),
              ),
            ),
            // Vaccination reminder
            if (upcomingList != null && upcomingList.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: _InfoCard(
                    icon: Icons.vaccines_rounded,
                    iconColor: accentBlue,
                    title: t('upcoming_vaccines', lang),
                    subtitle: firstUpcomingName,
                    actionLabel: t('view_schedule', lang),
                    onTap: () => context.go('/vaccination'),
                  ),
                ),
              ),
            // News snippet
            if (latestNews != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                  child: _InfoCard(
                    icon: Icons.newspaper_rounded,
                    iconColor: primaryGreen,
                    title: latestNews.title,
                    subtitle: null,
                    actionLabel: t('view_all', lang),
                    onTap: () => context.push('/alerts'),
                    maxTitleLines: 2,
                    imageUrl: _kNewsImage,
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Material(
          elevation: 6,
          shadowColor: primaryGreen.withOpacity(0.4),
          borderRadius: BorderRadius.circular(28),
          color: primaryGreen,
          child: InkWell(
            onTap: () => context.push('/chat/voice'),
            borderRadius: BorderRadius.circular(28),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Colors.white24,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.mic_rounded, color: Colors.white, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Text(
                    t('talk_to_ai', lang),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Large, visual card with Unsplash image + gradient overlay — “oh yeah” look
class _HomeCard extends StatelessWidget {
  const _HomeCard({
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.gradient,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final String imageUrl;
  final List<Color> gradient;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: gradient.first.withOpacity(0.35),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Background image (web-safe: HTML img on web to avoid CORS)
                buildWebSafeNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: gradient,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Center(child: Icon(icon, color: Colors.white54, size: 48)),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: gradient,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Center(child: Icon(icon, color: Colors.white70, size: 48)),
                  ),
                  httpHeaders: const {'User-Agent': 'SwasthyaAI-HealthApp/1.0'},
                ),
                // Gradient overlay so text is readable
                DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.3),
                        gradient.first.withOpacity(0.92),
                      ],
                      stops: const [0.0, 0.4, 1.0],
                    ),
                  ),
                ),
                // Content
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          shadows: [Shadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 1))],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.95),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          shadows: const [Shadow(color: Colors.black26, blurRadius: 2, offset: Offset(0, 1))],
                        ),
                      ),
                    ],
                  ),
                ),
                // Small icon badge top-right
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.25),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    this.subtitle,
    required this.actionLabel,
    required this.onTap,
    this.maxTitleLines = 1,
    this.imageUrl,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final String actionLabel;
  final VoidCallback onTap;
  final int maxTitleLines;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 2,
      shadowColor: Colors.black26,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (imageUrl != null)
                  SizedBox(
                    width: 100,
                    height: 88,
                    child: buildWebSafeNetworkImage(
                      imageUrl: imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: iconColor.withOpacity(0.12),
                        child: Icon(icon, color: iconColor, size: 32),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: iconColor.withOpacity(0.12),
                        child: Icon(icon, color: iconColor, size: 32),
                      ),
                      httpHeaders: const {'User-Agent': 'SwasthyaAI-HealthApp/1.0'},
                    ),
                  ),
                Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      if (imageUrl == null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: iconColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(icon, color: iconColor, size: 26),
                        ),
                      if (imageUrl == null) const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                color: textPrimary,
                              ),
                              maxLines: maxTitleLines,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (subtitle != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                subtitle!,
                                style: TextStyle(fontSize: 13, color: textSecondary),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                      ),
                      Text(
                        actionLabel,
                        style: const TextStyle(
                          color: primaryGreen,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            ),
          ),
        ),
      ),
    );
  }
}
