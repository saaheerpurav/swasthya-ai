import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/theme.dart';
import '../core/models/facility.dart';

class FacilityCard extends StatelessWidget {
  const FacilityCard({
    super.key,
    required this.facility,
    required this.onDirections,
    this.distanceKm,
  });

  final Facility facility;
  final VoidCallback onDirections;
  final double? distanceKm;

  @override
  Widget build(BuildContext context) {
    final distStr = distanceKm != null
        ? '~${distanceKm!.toStringAsFixed(1)} km'
        : (facility.distance > 0 ? '~${facility.distance.toStringAsFixed(1)} km' : '');
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: ListTile(
        title: Text(
          facility.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (facility.location.address != null) Text(facility.location.address!),
            const SizedBox(height: 4),
            Row(
              children: [
                if (distStr.isNotEmpty)
                  Chip(
                    label: Text(distStr, style: const TextStyle(fontSize: 12)),
                    padding: EdgeInsets.zero,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                const SizedBox(width: 8),
                Chip(
                  label: Text(
                    facility.facilityType,
                    style: const TextStyle(fontSize: 11),
                  ),
                  padding: EdgeInsets.zero,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ],
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (facility.phoneNumber != null)
              IconButton(
                icon: const Icon(Icons.call),
                onPressed: () => launchUrl(Uri.parse('tel:${facility.phoneNumber}')),
              ),
            IconButton(
              icon: const Icon(Icons.directions),
              onPressed: onDirections,
            ),
          ],
        ),
      ),
    );
  }
}
