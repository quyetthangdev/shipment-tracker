# 📦 Shipment Tracker

A **Shipment Tracker** application built with modern frontend tools and wrapped as an Android app for PDA devices:

- ⚡ Vite
- ⚛️ React + TypeScript
- 🎨 Tailwind CSS v3
- 🧩 shadcn/ui (Radix UI + Tailwind)
- 📱 CapacitorJS (Android APK support)

## 🚀 Features

- Track and manage shipments
- Scan product QR codes (via webcam or handheld scanner)
- Real-time shipment status
- Basic UI components powered by `shadcn/ui`
- **Android APK build support for PDA devices**

## 🛠️ Tech Stack

| Tool            | Purpose                        |
| --------------- | ------------------------------ |
| Vite            | Fast development/build tool    |
| React           | UI library                     |
| TypeScript      | Static type checking           |
| Tailwind CSS    | Utility-first CSS framework    |
| shadcn/ui       | Prebuilt UI components (Radix) |
| **CapacitorJS** | **Native Android wrapper**     |

## 📱 Android APK Build

This project is configured with **CapacitorJS** to build native Android APK files for PDA devices.

### Quick Start - Build APK

#### Windows (Easy Way)

Just double-click one of these batch files:

- `build-apk.bat` - Build debug APK (for testing)
- `build-apk-release.bat` - Build release APK (for production)
- `install-apk.bat` - Install APK to connected device

#### Command Line

```bash
# Build debug APK
npm run build && npx cap sync android && cd android && .\gradlew.bat assembleDebug

# Or use the npm script
npm run cap:build:android
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Install APK to PDA

```bash
# Connect PDA via USB, enable USB debugging, then:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Full Documentation

- 📖 **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- 📚 **[BUILD_APK.md](BUILD_APK.md)** - Complete build instructions
- 📋 **[CAPACITOR_SETUP_SUMMARY.md](CAPACITOR_SETUP_SUMMARY.md)** - Setup summary

### Requirements for Building

- Node.js & npm
- JDK 17+
- Android Studio
- Android SDK

See [BUILD_APK.md](BUILD_APK.md) for detailed setup instructions.
# react-native-shipment-tracker
