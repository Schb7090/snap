import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Snap Track",
  slug: "snap-track",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "snaptrack",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.balazs.snaptrack",
    infoPlist: {
      NSCameraUsageDescription:
        "A nyugták fényképezéséhez hozzáférés szükséges a kamerához.",
      NSPhotoLibraryUsageDescription:
        "Nyugta képek kiválasztásához hozzáférés szükséges a galériához.",
    },
  },
  android: {
    package: "com.balazs.snaptrack",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ["CAMERA", "READ_MEDIA_IMAGES"],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" },
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "A nyugták fényképezéséhez hozzáférés szükséges a kamerához.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Nyugta képek kiválasztásához hozzáférés szükséges a galériához.",
      },
    ],
    "expo-secure-store",
    "expo-localization",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? null,
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? null,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? null,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? null,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? null,
      messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? null,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? null,
    },
  },
};

export default config;
