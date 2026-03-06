import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/alerts_provider.dart';
import '../../core/providers/news_provider.dart';
import '../../l10n/strings.dart';
import '../../l10n/l10n_provider.dart';
import '../../widgets/alert_card.dart';

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => ref.invalidate(alertsProvider));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(preferredLanguageProvider);
    final alertsAsync = ref.watch(alertsProvider);
    final newsAsync = ref.watch(newsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t('alerts', lang))),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(alertsProvider);
          ref.invalidate(newsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text('Active Alerts', style: Theme.of(context).textTheme.titleMedium),
            ),
            alertsAsync.when(
              data: (alerts) {
                if (alerts.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.all(24),
                    child: Center(child: Text(t('no_alerts', lang))),
                  );
                }
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: alerts.map((a) => AlertCard(alert: a)).toList(),
                );
              },
              loading: () => const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator())),
              error: (e, _) => Padding(padding: const EdgeInsets.all(24), child: Center(child: Text(e.toString()))),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text('Health News', style: Theme.of(context).textTheme.titleMedium),
            ),
            newsAsync.when(
              data: (articles) => Column(
                mainAxisSize: MainAxisSize.min,
                children: articles.map((a) => ListTile(
                      title: Text(a.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                      subtitle: Text('${a.source} • ${a.publishedAt.day}/${a.publishedAt.month}/${a.publishedAt.year}'),
                      onTap: () => launchUrl(Uri.parse(a.url)),
                    )).toList(),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text(e.toString())),
            ),
          ],
        ),
      ),
    );
  }
}
