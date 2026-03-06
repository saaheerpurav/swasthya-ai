import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/providers/auth_provider.dart';
import '../features/onboarding/welcome_screen.dart';
import '../features/onboarding/language_select_screen.dart';
import '../features/onboarding/phone_input_screen.dart';
import '../features/onboarding/otp_verify_screen.dart';
import '../features/home/home_screen.dart';
import '../features/chat/chat_screen.dart';
import '../features/chat/voice_input_screen.dart';
import '../features/symptom_checker/symptom_checker_screen.dart';
import '../features/vaccination/vaccination_screen.dart';
import '../features/vaccination/add_vaccination_screen.dart';
import '../features/education/education_screen.dart';
import '../features/education/topic_detail_screen.dart';
import '../features/education/quiz_screen.dart';
import '../features/hospitals/hospitals_screen.dart';
import '../features/alerts/alerts_screen.dart';
import '../features/profile/profile_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null && authState.valueOrNull!.isNotEmpty;
      final isOnboarding = state.matchedLocation.startsWith('/onboarding');

      if (!isLoggedIn && !isOnboarding) {
        return '/onboarding/welcome';
      }
      if (isLoggedIn && state.matchedLocation == '/') {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        redirect: (_, __) => '/home',
      ),
      GoRoute(
        path: '/onboarding/welcome',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/onboarding/language',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const LanguageSelectScreen(),
      ),
      GoRoute(
        path: '/onboarding/phone',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const PhoneInputScreen(),
      ),
      GoRoute(
        path: '/onboarding/otp',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => OtpVerifyScreen(
          phoneNumber: state.extra as String,
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                pageBuilder: (_, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const HomeScreen(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                pageBuilder: (_, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const ChatScreen(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/vaccination',
                pageBuilder: (_, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const VaccinationScreen(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/education',
                pageBuilder: (_, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const EducationScreen(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/hospitals',
                pageBuilder: (_, state) => NoTransitionPage(
                  key: state.pageKey,
                  child: const HospitalsScreen(),
                ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/chat/voice',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const VoiceInputScreen(),
      ),
      GoRoute(
        path: '/vaccination/add',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const AddVaccinationScreen(),
      ),
      GoRoute(
        path: '/education/quiz',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const QuizScreen(),
      ),
      GoRoute(
        path: '/education/:topicId',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final topicId = state.pathParameters['topicId']!;
          return TopicDetailScreen(topicId: topicId);
        },
      ),
      GoRoute(
        path: '/symptom-checker',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const SymptomCheckerScreen(),
      ),
      GoRoute(
        path: '/alerts',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const AlertsScreen(),
      ),
      GoRoute(
        path: '/profile',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const ProfileScreen(),
      ),
    ],
  );
});

class _NavItem extends StatelessWidget {
  const _NavItem({required this.index, required this.current, required this.icon, required this.label, required this.onTap});

  final int index;
  final int current;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isSelected = index == current;
    final color = isSelected ? Theme.of(context).colorScheme.primary : Colors.grey;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 26, color: color),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500, color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ScaffoldWithNavBar extends StatelessWidget {
  const ScaffoldWithNavBar({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static int _indexFromPath(String path) {
    if (path.startsWith('/home')) return 0;
    if (path.startsWith('/chat')) return 1;
    if (path.startsWith('/vaccination')) return 2;
    if (path.startsWith('/education')) return 3;
    if (path.startsWith('/hospitals')) return 4;
    return 0;
  }

  static const _paths = ['/home', '/chat', '/vaccination', '/education', '/hospitals'];

  @override
  Widget build(BuildContext context) {
    final path = GoRouterState.of(context).matchedLocation;
    final index = _indexFromPath(path);
    if (navigationShell.currentIndex != index) {
      WidgetsBinding.instance.addPostFrameCallback((_) => navigationShell.goBranch(index));
    }
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(index: 0, current: index, icon: Icons.home_rounded, label: 'Home', onTap: () { context.go(_paths[0]); navigationShell.goBranch(0); }),
                _NavItem(index: 1, current: index, icon: Icons.chat_bubble_rounded, label: 'Chat', onTap: () { context.go(_paths[1]); navigationShell.goBranch(1); }),
                _NavItem(index: 2, current: index, icon: Icons.vaccines_rounded, label: 'Vaccine', onTap: () { context.go(_paths[2]); navigationShell.goBranch(2); }),
                _NavItem(index: 3, current: index, icon: Icons.menu_book_rounded, label: 'Learn', onTap: () { context.go(_paths[3]); navigationShell.goBranch(3); }),
                _NavItem(index: 4, current: index, icon: Icons.local_hospital_rounded, label: 'Hospitals', onTap: () { context.go(_paths[4]); navigationShell.goBranch(4); }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
