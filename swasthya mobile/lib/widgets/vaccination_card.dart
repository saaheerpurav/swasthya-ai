import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../core/models/vaccination.dart';

class VaccinationCard extends StatelessWidget {
  const VaccinationCard({super.key, required this.vaccine});

  final UpcomingVaccine vaccine;

  static Color _priorityColor(String priority) {
    switch (priority) {
      case 'high':
        return emergencyRed;
      case 'medium':
        return warningOrange;
      case 'low':
        return primaryGreen;
      default:
        return textMuted;
    }
  }

  static Color _dueDateColor(DateTime due) {
    final now = DateTime.now();
    final diff = due.difference(now).inDays;
    if (diff < 7) return emergencyRed;
    if (diff < 30) return warningOrange;
    return primaryGreen;
  }

  @override
  Widget build(BuildContext context) {
    DateTime? due;
    try {
      due = DateTime.parse(vaccine.dueDate);
    } catch (_) {}
    final dueColor = due != null ? _dueDateColor(due) : primaryGreen;
    final priorityColor = _priorityColor(vaccine.priority);

    return Card(
      margin: EdgeInsets.zero,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        alignment: Alignment.centerLeft,
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(
              width: 6,
              decoration: BoxDecoration(
                color: dueColor,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: primaryGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.vaccines_rounded, color: primaryGreen, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        vaccine.vaccineName,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: dueColor.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              vaccine.dueDate,
                              style: TextStyle(fontSize: 12, color: dueColor, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                            decoration: BoxDecoration(
                              color: priorityColor.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              vaccine.priority.toUpperCase(),
                              style: TextStyle(fontSize: 10, color: priorityColor, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ],
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
