// Uses HTML <img> on web (avoids CORS). Uses CachedNetworkImage on mobile.
import 'package:flutter/material.dart';

import 'web_safe_network_image_stub.dart'
    if (dart.library.html) 'web_safe_network_image_web.dart' as impl;

/// Network image that loads on both web (no CORS) and mobile.
Widget buildWebSafeNetworkImage({
  required String imageUrl,
  required BoxFit fit,
  Widget Function(BuildContext, String)? placeholder,
  Widget Function(BuildContext, String, dynamic)? errorWidget,
  Map<String, String>? httpHeaders,
}) {
  return impl.buildWebSafeNetworkImage(
    imageUrl: imageUrl,
    fit: fit,
    placeholder: placeholder,
    errorWidget: errorWidget,
    httpHeaders: httpHeaders,
  );
}
