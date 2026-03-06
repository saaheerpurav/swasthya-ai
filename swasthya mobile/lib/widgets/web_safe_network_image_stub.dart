// Stub: use CachedNetworkImage on mobile (no CORS).
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

/// Network image that works on all platforms. On web, use [WebSafeNetworkImageWeb].
Widget buildWebSafeNetworkImage({
  required String imageUrl,
  required BoxFit fit,
  Widget Function(BuildContext, String)? placeholder,
  Widget Function(BuildContext, String, dynamic)? errorWidget,
  Map<String, String>? httpHeaders,
}) {
  return CachedNetworkImage(
    imageUrl: imageUrl,
    fit: fit,
    placeholder: placeholder != null ? (c, u) => placeholder(c, u) : null,
    errorWidget: errorWidget != null ? (c, u, e) => errorWidget(c, u, e) : null,
    httpHeaders: httpHeaders,
  );
}
