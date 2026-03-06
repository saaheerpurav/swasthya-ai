// Web: use HTML <img> to avoid CORS (Flutter canvas cannot read cross-origin pixels).
import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;

Widget buildWebSafeNetworkImage({
  required String imageUrl,
  required BoxFit fit,
  Widget Function(BuildContext, String)? placeholder,
  Widget Function(BuildContext, String, dynamic)? errorWidget,
  Map<String, String>? httpHeaders,
}) {
  return _WebSafeImage(imageUrl: imageUrl, fit: fit);
}

class _WebSafeImage extends StatefulWidget {
  const _WebSafeImage({required this.imageUrl, required this.fit});

  final String imageUrl;
  final BoxFit fit;

  @override
  State<_WebSafeImage> createState() => _WebSafeImageState();
}

class _WebSafeImageState extends State<_WebSafeImage> {
  static String _cssObjectFit(BoxFit fit) {
    switch (fit) {
      case BoxFit.contain:
        return 'contain';
      case BoxFit.cover:
        return 'cover';
      case BoxFit.fill:
        return 'fill';
      case BoxFit.fitWidth:
        return 'scale-down';
      case BoxFit.fitHeight:
        return 'scale-down';
      case BoxFit.none:
        return 'none';
      case BoxFit.scaleDown:
        return 'scale-down';
    }
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView.fromTagName(
      tagName: 'img',
      onElementCreated: (element) {
        final img = element as web.HTMLImageElement;
        img.src = widget.imageUrl;
        img.style.objectFit = _cssObjectFit(widget.fit);
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
      },
    );
  }
}
