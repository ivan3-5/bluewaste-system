import "dart:io";

import "package:dio/dio.dart";
import "package:flutter/foundation.dart";
import "package:image/image.dart" as img;

import "../../../core/network/api_exception.dart";

const _maxUploadBytes = 4 * 1024 * 1024;

Future<MultipartFile> prepareUploadPhoto(
  String path, {
  bool allowGif = true,
}) async {
  final Uint8List bytes;
  try {
    bytes = await File(path).readAsBytes();
  } on FileSystemException {
    throw ApiException(
      "The photo is no longer available. Please select it again.",
    );
  }

  final decoder = img.findDecoderForData(bytes);
  final format = switch (decoder) {
    img.JpegDecoder() => (extension: "jpg", mime: "jpeg"),
    img.PngDecoder() => (extension: "png", mime: "png"),
    img.WebPDecoder() => (extension: "webp", mime: "webp"),
    img.GifDecoder() when allowGif => (extension: "gif", mime: "gif"),
    _ => null,
  };

  if (format != null && bytes.length <= _maxUploadBytes) {
    return MultipartFile.fromBytes(
      bytes,
      filename: "photo.${format.extension}",
      contentType: DioMediaType("image", format.mime),
    );
  }

  Uint8List? compressed;
  if (decoder != null) {
    try {
      compressed = await compute(_resizePhoto, bytes);
    } catch (_) {
      // The picker may have returned a file that cannot be decoded.
    }
  }
  if (compressed == null || compressed.length > _maxUploadBytes) {
    throw ApiException(
      "Could not prepare this photo. Try a smaller JPG, PNG, or WEBP.",
    );
  }
  return MultipartFile.fromBytes(
    compressed,
    filename: "photo.jpg",
    contentType: DioMediaType("image", "jpeg"),
  );
}

Uint8List? _resizePhoto(Uint8List bytes) {
  final decoded = img.decodeImage(bytes);
  if (decoded == null) return null;
  final upright = img.bakeOrientation(decoded);
  final resized = upright.width > 1600 || upright.height > 1600
      ? img.copyResize(
          upright,
          width: upright.width >= upright.height ? 1600 : null,
          height: upright.width < upright.height ? 1600 : null,
        )
      : upright;
  return img.encodeJpg(resized, quality: 82);
}
