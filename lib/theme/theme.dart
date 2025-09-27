import "package:flutter/material.dart";

class MaterialTheme {
  final TextTheme textTheme;

  const MaterialTheme(this.textTheme);

  static ColorScheme lightScheme() {
    return const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xff485d92),
      surfaceTint: Color(0xff485d92),
      onPrimary: Color(0xffffffff),
      primaryContainer: Color(0xffdae2ff),
      onPrimaryContainer: Color(0xff2f4578),
      secondary: Color(0xff455e91),
      onSecondary: Color(0xffffffff),
      secondaryContainer: Color(0xffd9e2ff),
      onSecondaryContainer: Color(0xff2d4678),
      tertiary: Color(0xff7d4e7d),
      onTertiary: Color(0xffffffff),
      tertiaryContainer: Color(0xffffd6fa),
      onTertiaryContainer: Color(0xff633664),
      error: Color(0xff904a43),
      onError: Color(0xffffffff),
      errorContainer: Color(0xffffdad6),
      onErrorContainer: Color(0xff73332d),
      surface: Color(0xfffaf8ff),
      onSurface: Color(0xff1a1b21),
      onSurfaceVariant: Color(0xff44464f),
      outline: Color(0xff757780),
      outlineVariant: Color(0xffc5c6d0),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xff2f3036),
      inversePrimary: Color(0xffb1c5ff),
      primaryFixed: Color(0xffdae2ff),
      onPrimaryFixed: Color(0xff001946),
      primaryFixedDim: Color(0xffb1c5ff),
      onPrimaryFixedVariant: Color(0xff2f4578),
      secondaryFixed: Color(0xffd9e2ff),
      onSecondaryFixed: Color(0xff001a43),
      secondaryFixedDim: Color(0xffafc6ff),
      onSecondaryFixedVariant: Color(0xff2d4678),
      tertiaryFixed: Color(0xffffd6fa),
      onTertiaryFixed: Color(0xff320936),
      tertiaryFixedDim: Color(0xffedb4ea),
      onTertiaryFixedVariant: Color(0xff633664),
      surfaceDim: Color(0xffdad9e0),
      surfaceBright: Color(0xfffaf8ff),
      surfaceContainerLowest: Color(0xffffffff),
      surfaceContainerLow: Color(0xfff4f3fa),
      surfaceContainer: Color(0xffeeedf4),
      surfaceContainerHigh: Color(0xffe8e7ef),
      surfaceContainerHighest: Color(0xffe2e2e9),
    );
  }

  ThemeData light() {
    return theme(lightScheme());
  }

  static ColorScheme lightMediumContrastScheme() {
    return const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xff1d3466),
      surfaceTint: Color(0xff485d92),
      onPrimary: Color(0xffffffff),
      primaryContainer: Color(0xff576ca1),
      onPrimaryContainer: Color(0xffffffff),
      secondary: Color(0xff1a3566),
      onSecondary: Color(0xffffffff),
      secondaryContainer: Color(0xff546ca1),
      onSecondaryContainer: Color(0xffffffff),
      tertiary: Color(0xff502652),
      onTertiary: Color(0xffffffff),
      tertiaryContainer: Color(0xff8d5c8d),
      onTertiaryContainer: Color(0xffffffff),
      error: Color(0xff5e231e),
      onError: Color(0xffffffff),
      errorContainer: Color(0xffa25851),
      onErrorContainer: Color(0xffffffff),
      surface: Color(0xfffaf8ff),
      onSurface: Color(0xff0f1116),
      onSurfaceVariant: Color(0xff34363e),
      outline: Color(0xff50525a),
      outlineVariant: Color(0xff6b6d75),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xff2f3036),
      inversePrimary: Color(0xffb1c5ff),
      primaryFixed: Color(0xff576ca1),
      onPrimaryFixed: Color(0xffffffff),
      primaryFixedDim: Color(0xff3e5387),
      onPrimaryFixedVariant: Color(0xffffffff),
      secondaryFixed: Color(0xff546ca1),
      onSecondaryFixed: Color(0xffffffff),
      secondaryFixedDim: Color(0xff3b5487),
      onSecondaryFixedVariant: Color(0xffffffff),
      tertiaryFixed: Color(0xff8d5c8d),
      onTertiaryFixed: Color(0xffffffff),
      tertiaryFixedDim: Color(0xff724473),
      onTertiaryFixedVariant: Color(0xffffffff),
      surfaceDim: Color(0xffc6c6cd),
      surfaceBright: Color(0xfffaf8ff),
      surfaceContainerLowest: Color(0xffffffff),
      surfaceContainerLow: Color(0xfff4f3fa),
      surfaceContainer: Color(0xffe8e7ef),
      surfaceContainerHigh: Color(0xffdddce3),
      surfaceContainerHighest: Color(0xffd1d1d8),
    );
  }

  ThemeData lightMediumContrast() {
    return theme(lightMediumContrastScheme());
  }

  static ColorScheme lightHighContrastScheme() {
    return const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xff112a5c),
      surfaceTint: Color(0xff485d92),
      onPrimary: Color(0xffffffff),
      primaryContainer: Color(0xff32487b),
      onPrimaryContainer: Color(0xffffffff),
      secondary: Color(0xff0d2a5b),
      onSecondary: Color(0xffffffff),
      secondaryContainer: Color(0xff2f487a),
      onSecondaryContainer: Color(0xffffffff),
      tertiary: Color(0xff451b48),
      onTertiary: Color(0xffffffff),
      tertiaryContainer: Color(0xff663967),
      onTertiaryContainer: Color(0xffffffff),
      error: Color(0xff511a15),
      onError: Color(0xffffffff),
      errorContainer: Color(0xff763630),
      onErrorContainer: Color(0xffffffff),
      surface: Color(0xfffaf8ff),
      onSurface: Color(0xff000000),
      onSurfaceVariant: Color(0xff000000),
      outline: Color(0xff2a2c33),
      outlineVariant: Color(0xff474951),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xff2f3036),
      inversePrimary: Color(0xffb1c5ff),
      primaryFixed: Color(0xff32487b),
      onPrimaryFixed: Color(0xffffffff),
      primaryFixedDim: Color(0xff193163),
      onPrimaryFixedVariant: Color(0xffffffff),
      secondaryFixed: Color(0xff2f487a),
      onSecondaryFixed: Color(0xffffffff),
      secondaryFixedDim: Color(0xff163162),
      onSecondaryFixedVariant: Color(0xffffffff),
      tertiaryFixed: Color(0xff663967),
      onTertiaryFixed: Color(0xffffffff),
      tertiaryFixedDim: Color(0xff4c224f),
      onTertiaryFixedVariant: Color(0xffffffff),
      surfaceDim: Color(0xffb8b8bf),
      surfaceBright: Color(0xfffaf8ff),
      surfaceContainerLowest: Color(0xffffffff),
      surfaceContainerLow: Color(0xfff1f0f7),
      surfaceContainer: Color(0xffe2e2e9),
      surfaceContainerHigh: Color(0xffd4d4db),
      surfaceContainerHighest: Color(0xffc6c6cd),
    );
  }

  ThemeData lightHighContrast() {
    return theme(lightHighContrastScheme());
  }

  static ColorScheme darkScheme() {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xffb1c5ff),
      surfaceTint: Color(0xffb1c5ff),
      onPrimary: Color(0xff162e60),
      primaryContainer: Color(0xff2f4578),
      onPrimaryContainer: Color(0xffdae2ff),
      secondary: Color(0xffafc6ff),
      onSecondary: Color(0xff132f60),
      secondaryContainer: Color(0xff2d4678),
      onSecondaryContainer: Color(0xffd9e2ff),
      tertiary: Color(0xffedb4ea),
      onTertiary: Color(0xff4a204c),
      tertiaryContainer: Color(0xff633664),
      onTertiaryContainer: Color(0xffffd6fa),
      error: Color(0xffffb4ab),
      onError: Color(0xff561e19),
      errorContainer: Color(0xff73332d),
      onErrorContainer: Color(0xffffdad6),
      surface: Color(0xff121318),
      onSurface: Color(0xffe2e2e9),
      onSurfaceVariant: Color(0xffc5c6d0),
      outline: Color(0xff8f9099),
      outlineVariant: Color(0xff44464f),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xffe2e2e9),
      inversePrimary: Color(0xff485d92),
      primaryFixed: Color(0xffdae2ff),
      onPrimaryFixed: Color(0xff001946),
      primaryFixedDim: Color(0xffb1c5ff),
      onPrimaryFixedVariant: Color(0xff2f4578),
      secondaryFixed: Color(0xffd9e2ff),
      onSecondaryFixed: Color(0xff001a43),
      secondaryFixedDim: Color(0xffafc6ff),
      onSecondaryFixedVariant: Color(0xff2d4678),
      tertiaryFixed: Color(0xffffd6fa),
      onTertiaryFixed: Color(0xff320936),
      tertiaryFixedDim: Color(0xffedb4ea),
      onTertiaryFixedVariant: Color(0xff633664),
      surfaceDim: Color(0xff121318),
      surfaceBright: Color(0xff38393f),
      surfaceContainerLowest: Color(0xff0d0e13),
      surfaceContainerLow: Color(0xff1a1b21),
      surfaceContainer: Color(0xff1e1f25),
      surfaceContainerHigh: Color(0xff282a2f),
      surfaceContainerHighest: Color(0xff33343a),
    );
  }

  ThemeData dark() {
    return theme(darkScheme());
  }

  static ColorScheme darkMediumContrastScheme() {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xffd1dcff),
      surfaceTint: Color(0xffb1c5ff),
      onPrimary: Color(0xff072355),
      primaryContainer: Color(0xff7a90c8),
      onPrimaryContainer: Color(0xff000000),
      secondary: Color(0xffcfdcff),
      onSecondary: Color(0xff032355),
      secondaryContainer: Color(0xff7890c7),
      onSecondaryContainer: Color(0xff000000),
      tertiary: Color(0xffffcdfb),
      onTertiary: Color(0xff3e1441),
      tertiaryContainer: Color(0xffb47fb2),
      onTertiaryContainer: Color(0xff000000),
      error: Color(0xffffd2cc),
      onError: Color(0xff48130f),
      errorContainer: Color(0xffcc7b72),
      onErrorContainer: Color(0xff000000),
      surface: Color(0xff121318),
      onSurface: Color(0xffffffff),
      onSurfaceVariant: Color(0xffdbdce6),
      outline: Color(0xffb0b1bb),
      outlineVariant: Color(0xff8e9099),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xffe2e2e9),
      inversePrimary: Color(0xff304679),
      primaryFixed: Color(0xffdae2ff),
      onPrimaryFixed: Color(0xff000f31),
      primaryFixedDim: Color(0xffb1c5ff),
      onPrimaryFixedVariant: Color(0xff1d3466),
      secondaryFixed: Color(0xffd9e2ff),
      onSecondaryFixed: Color(0xff00102f),
      secondaryFixedDim: Color(0xffafc6ff),
      onSecondaryFixedVariant: Color(0xff1a3566),
      tertiaryFixed: Color(0xffffd6fa),
      onTertiaryFixed: Color(0xff25002a),
      tertiaryFixedDim: Color(0xffedb4ea),
      onTertiaryFixedVariant: Color(0xff502652),
      surfaceDim: Color(0xff121318),
      surfaceBright: Color(0xff43444a),
      surfaceContainerLowest: Color(0xff06070c),
      surfaceContainerLow: Color(0xff1c1d23),
      surfaceContainer: Color(0xff26282d),
      surfaceContainerHigh: Color(0xff313238),
      surfaceContainerHighest: Color(0xff3c3d43),
    );
  }

  ThemeData darkMediumContrast() {
    return theme(darkMediumContrastScheme());
  }

  static ColorScheme darkHighContrastScheme() {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xffedefff),
      surfaceTint: Color(0xffb1c5ff),
      onPrimary: Color(0xff000000),
      primaryContainer: Color(0xffacc2fd),
      onPrimaryContainer: Color(0xff000925),
      secondary: Color(0xffecefff),
      onSecondary: Color(0xff000000),
      secondaryContainer: Color(0xffaac2fc),
      onSecondaryContainer: Color(0xff000a23),
      tertiary: Color(0xffffeafa),
      onTertiary: Color(0xff000000),
      tertiaryContainer: Color(0xffe9b0e6),
      onTertiaryContainer: Color(0xff1b001f),
      error: Color(0xffffece9),
      onError: Color(0xff000000),
      errorContainer: Color(0xffffaea5),
      onErrorContainer: Color(0xff220001),
      surface: Color(0xff121318),
      onSurface: Color(0xffffffff),
      onSurfaceVariant: Color(0xffffffff),
      outline: Color(0xffefeffa),
      outlineVariant: Color(0xffc1c2cc),
      shadow: Color(0xff000000),
      scrim: Color(0xff000000),
      inverseSurface: Color(0xffe2e2e9),
      inversePrimary: Color(0xff304679),
      primaryFixed: Color(0xffdae2ff),
      onPrimaryFixed: Color(0xff000000),
      primaryFixedDim: Color(0xffb1c5ff),
      onPrimaryFixedVariant: Color(0xff000f31),
      secondaryFixed: Color(0xffd9e2ff),
      onSecondaryFixed: Color(0xff000000),
      secondaryFixedDim: Color(0xffafc6ff),
      onSecondaryFixedVariant: Color(0xff00102f),
      tertiaryFixed: Color(0xffffd6fa),
      onTertiaryFixed: Color(0xff000000),
      tertiaryFixedDim: Color(0xffedb4ea),
      onTertiaryFixedVariant: Color(0xff25002a),
      surfaceDim: Color(0xff121318),
      surfaceBright: Color(0xff4f5056),
      surfaceContainerLowest: Color(0xff000000),
      surfaceContainerLow: Color(0xff1e1f25),
      surfaceContainer: Color(0xff2f3036),
      surfaceContainerHigh: Color(0xff3a3b41),
      surfaceContainerHighest: Color(0xff45464c),
    );
  }

  ThemeData darkHighContrast() {
    return theme(darkHighContrastScheme());
  }


  ThemeData theme(ColorScheme colorScheme) => ThemeData(
     useMaterial3: true,
     brightness: colorScheme.brightness,
     colorScheme: colorScheme,
     textTheme: textTheme.apply(
       bodyColor: colorScheme.onSurface,
       displayColor: colorScheme.onSurface,
     ),
     scaffoldBackgroundColor: colorScheme.surface,
     canvasColor: colorScheme.surface,
  );


  List<ExtendedColor> get extendedColors => [
  ];
}

class ExtendedColor {
  final Color seed, value;
  final ColorFamily light;
  final ColorFamily lightHighContrast;
  final ColorFamily lightMediumContrast;
  final ColorFamily dark;
  final ColorFamily darkHighContrast;
  final ColorFamily darkMediumContrast;

  const ExtendedColor({
    required this.seed,
    required this.value,
    required this.light,
    required this.lightHighContrast,
    required this.lightMediumContrast,
    required this.dark,
    required this.darkHighContrast,
    required this.darkMediumContrast,
  });
}

class ColorFamily {
  const ColorFamily({
    required this.color,
    required this.onColor,
    required this.colorContainer,
    required this.onColorContainer,
  });

  final Color color;
  final Color onColor;
  final Color colorContainer;
  final Color onColorContainer;
}