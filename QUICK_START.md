# Hướng dẫn nhanh Build APK

## 🚀 Lệnh nhanh nhất để build APK Debug

```bash
npm run build && npx cap sync android && cd android && .\gradlew.bat assembleDebug
```

File APK sẽ có tại: `android/app/build/outputs/apk/debug/app-debug.apk`

## 📱 Cài APK lên PDA qua USB

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Workflow thông thường

### 1. Sau khi sửa code web

```bash
npm run cap:sync:android
```

### 2. Build APK mới

```bash
cd android
.\gradlew.bat assembleDebug
```

### 3. Cài lên thiết bị

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

(Tham số `-r` để reinstall nếu app đã có)

## 🛠️ NPM Scripts có sẵn

| Lệnh                        | Mô tả                             |
| --------------------------- | --------------------------------- |
| `npm run cap:sync`          | Build web + sync tất cả platforms |
| `npm run cap:sync:android`  | Build web + sync chỉ Android      |
| `npm run cap:open:android`  | Mở project trong Android Studio   |
| `npm run cap:run:android`   | Build + sync + chạy trên thiết bị |
| `npm run cap:build:android` | Build + sync + copy assets        |

## 📝 Lưu ý

- **APK Debug**: Chỉ dùng để test, không nên deploy
- **APK Release**: Cần ký bằng keystore để deploy production
- Xem chi tiết trong file `BUILD_APK.md`

## ⚡ One-liner copy APK sang Desktop

```bash
copy android\app\build\outputs\apk\debug\app-debug.apk %USERPROFILE%\Desktop\shipment-tracker.apk
```

## 🔍 Kiểm tra devices đã kết nối

```bash
adb devices
```

## 📦 Cài đặt lần đầu (chỉ chạy 1 lần)

Đã hoàn tất! Project đã sẵn sàng để build APK.

Yêu cầu:

- ✅ Capacitor đã cài đặt
- ✅ Android platform đã thêm
- ✅ Scripts đã setup
- ✅ Config đã tối ưu

**Cần cài thêm:**

- ⬜ Android Studio
- ⬜ JDK 17+
- ⬜ Android SDK

Xem chi tiết cài đặt trong `BUILD_APK.md`
